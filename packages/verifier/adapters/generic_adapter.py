"""Generic test command execution adapter."""

import shlex
from typing import List, Optional
from .base import BaseAdapter
from ..models import TestExecutionResult, VerificationStatus, EvidenceTrace


class GenericTestAdapter(BaseAdapter):
    """Adapter for executing custom user-configured test commands."""

    def __init__(self, workspace_root: str, command: str = "npm test") -> None:
        super().__init__(workspace_root)
        self.command = command

    def name(self) -> str:
        return "generic"

    def detect(self) -> bool:
        return True

    def build_command(self, target_filter: Optional[str] = None) -> List[str]:
        cmd = shlex.split(self.command)
        if target_filter:
            cmd.append(target_filter)
        return cmd

    def parse_output(self, evidence: EvidenceTrace) -> TestExecutionResult:
        if evidence.exit_code == 0:
            status = VerificationStatus.VERIFIED_PASS
            err = None
        else:
            status = VerificationStatus.VERIFIED_FAILURE
            err = f"Command failed with exit code {evidence.exit_code}"

        return TestExecutionResult(
            adapter_name=self.name(),
            status=status,
            evidence=evidence,
            error_message=err,
        )
