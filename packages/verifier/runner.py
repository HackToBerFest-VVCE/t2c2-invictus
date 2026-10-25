"""Isolated process execution runner with resource boundaries and secret scrubbing."""

import os
import subprocess
import time
from typing import List, Optional, Dict
from .models import EvidenceTrace, TestExecutionResult, VerificationStatus
from .adapters.base import BaseAdapter
from .adapters.pytest_adapter import PytestAdapter


class IsolatedRunner:
    """Executes verification routines inside an isolated, scrubbed subprocess environment."""

    SENSITIVE_ENV_PREFIXES = (
        "GITHUB_TOKEN",
        "GITHUB_APP",
        "GITHUB_PRIVATE",
        "AI_API",
        "OPENAI",
        "ANTHROPIC",
        "AWS_",
        "SECRET",
        "PASSWORD",
        "PRIVATE_KEY",
    )

    def __init__(
        self,
        workspace_root: str,
        timeout_seconds: int = 300,
        custom_env: Optional[Dict[str, str]] = None,
    ) -> None:
        self.workspace_root = os.path.abspath(workspace_root)
        self.timeout_seconds = timeout_seconds
        self.custom_env = custom_env or {}

    def get_scrubbed_env(self) -> Dict[str, str]:
        """Return a sanitized copy of the system environment with secrets removed."""
        clean_env = {}
        for key, value in os.environ.items():
            is_sensitive = any(
                key.upper().startswith(p) or p in key.upper()
                for p in self.SENSITIVE_ENV_PREFIXES
            )
            if not is_sensitive:
                clean_env[key] = value

        # Ensure PYTHONPATH includes the workspace root for local imports
        pythonpath = clean_env.get("PYTHONPATH", "")
        clean_env["PYTHONPATH"] = (
            f"{self.workspace_root}{os.pathsep}{pythonpath}"
            if pythonpath
            else self.workspace_root
        )

        clean_env.update(self.custom_env)
        return clean_env

    def run_adapter(
        self, adapter: BaseAdapter, target_filter: Optional[str] = None
    ) -> TestExecutionResult:
        """Execute a detected adapter and return the parsed result."""
        cmd = adapter.build_command(target_filter)
        evidence = self.execute_command(cmd)
        return adapter.parse_output(evidence)

    def execute_command(self, cmd: List[str]) -> EvidenceTrace:
        """Run a command with hard timeout, stdout/stderr capture, and clean environment."""
        start_time = time.time()
        reproduction_cmd = " ".join(cmd)
        clean_env = self.get_scrubbed_env()

        try:
            process = subprocess.Popen(
                cmd,
                cwd=self.workspace_root,
                env=clean_env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )

            try:
                stdout, stderr = process.communicate(timeout=self.timeout_seconds)
                exit_code = process.returncode
            except subprocess.TimeoutExpired:
                process.kill()
                stdout, stderr = process.communicate()
                exit_code = 124  # Standard timeout exit code
                stderr = f"Execution timed out after {self.timeout_seconds} seconds.\n{stderr}"

        except Exception as exc:
            duration_ms = int((time.time() - start_time) * 1000)
            return EvidenceTrace(
                exit_code=1,
                stdout="",
                stderr=f"Runner execution failed: {str(exc)}",
                reproduction_command=reproduction_cmd,
                duration_ms=duration_ms,
            )

        duration_ms = int((time.time() - start_time) * 1000)
        return EvidenceTrace(
            exit_code=exit_code,
            stdout=stdout or "",
            stderr=stderr or "",
            reproduction_command=reproduction_cmd,
            duration_ms=duration_ms,
        )

    def auto_verify(self) -> TestExecutionResult:
        """Auto-detect available test adapters and execute verification."""
        pytest_adapter = PytestAdapter(self.workspace_root)
        if pytest_adapter.detect():
            return self.run_adapter(pytest_adapter)

        # Fallback if no test harness detected
        return TestExecutionResult(
            adapter_name="none",
            status=VerificationStatus.UNSUPPORTED,
            evidence=EvidenceTrace(
                exit_code=0,
                stdout="",
                stderr="No supported test runner detected in workspace.",
                reproduction_command="",
            ),
            error_message="No supported test harness detected.",
        )
