"""Pytest adapter for executing Python test harnesses."""

import os
import re
import sys
from typing import List, Optional, Dict, Any
from .base import BaseAdapter
from ..models import TestExecutionResult, VerificationStatus, EvidenceTrace


class PytestAdapter(BaseAdapter):
    """Adapter for running Pytest test suites and extracting failure traces."""

    def name(self) -> str:
        return "pytest"

    def detect(self) -> bool:
        """Detect pytest configuration files or test directories."""
        indicators = [
            "pytest.ini",
            "setup.cfg",
            "pyproject.toml",
            "tests",
            "test",
        ]
        for ind in indicators:
            full_path = os.path.join(self.workspace_root, ind)
            if os.path.exists(full_path):
                return True
        return False

    def build_command(self, target_filter: Optional[str] = None) -> List[str]:
        """Build command to run pytest with concise output and failure details."""
        cmd = [sys.executable, "-m", "pytest", "-v"]
        if target_filter:
            cmd.extend(["-k", target_filter])
        return cmd

    def parse_output(self, evidence: EvidenceTrace) -> TestExecutionResult:
        """Parse pytest stdout and return codes into TestExecutionResult."""
        combined_output = f"{evidence.stdout}\n{evidence.stderr}"

        # Parse passed, failed, skipped counts from pytest summary line
        # e.g.: "=== 2 passed, 1 failed in 0.12s ==="
        passed = 0
        failed = 0
        skipped = 0

        pass_match = re.search(r"(\d+)\s+passed", combined_output)
        if pass_match:
            passed = int(pass_match.group(1))

        fail_match = re.search(r"(\d+)\s+failed", combined_output)
        if fail_match:
            failed = int(fail_match.group(1))

        skip_match = re.search(r"(\d+)\s+skipped", combined_output)
        if skip_match:
            skipped = int(skip_match.group(1))

        # Extract failure details
        failure_details: List[Dict[str, Any]] = []
        fail_blocks = re.findall(
            r"_{3,}\s+([^\n_]+)\s+_{3,}\n(.*?)(?=\n_{3,}|\n={3,}|\Z)",
            combined_output,
            re.DOTALL,
        )
        for test_name, trace in fail_blocks:
            failure_details.append(
                {
                    "test_name": test_name.strip(),
                    "trace": trace.strip(),
                }
            )

        # Determine verification status
        if evidence.exit_code == 0 and (passed > 0 or skipped > 0):
            status = VerificationStatus.VERIFIED_PASS
            err_msg = None
        elif evidence.exit_code != 0 and failed > 0:
            status = VerificationStatus.VERIFIED_FAILURE
            err_msg = f"{failed} test(s) failed."
        elif evidence.exit_code == 5:
            # Pytest exit code 5 = no tests collected
            status = VerificationStatus.UNSUPPORTED
            err_msg = "No tests were collected by pytest."
        else:
            status = VerificationStatus.CHECK_ERROR
            err_msg = f"Test execution terminated with exit code {evidence.exit_code}."

        return TestExecutionResult(
            adapter_name=self.name(),
            status=status,
            evidence=evidence,
            passed_count=passed,
            failed_count=failed,
            skipped_count=skipped,
            error_message=err_msg,
            failure_details=failure_details,
        )
