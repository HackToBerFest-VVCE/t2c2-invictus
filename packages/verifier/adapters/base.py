"""Base adapter interface for framework test execution."""

from abc import ABC, abstractmethod
from typing import List, Optional
from ..models import TestExecutionResult, EvidenceTrace


class BaseAdapter(ABC):
    """Abstract base class for all test and verification framework adapters."""

    def __init__(self, workspace_root: str) -> None:
        self.workspace_root = workspace_root

    @abstractmethod
    def name(self) -> str:
        """Identifier for this adapter (e.g., 'pytest', 'npm')."""
        pass

    @abstractmethod
    def detect(self) -> bool:
        """Return True if this adapter detects its framework in the workspace."""
        pass

    @abstractmethod
    def build_command(self, target_filter: Optional[str] = None) -> List[str]:
        """Construct the execution command array."""
        pass

    @abstractmethod
    def parse_output(self, evidence: EvidenceTrace) -> TestExecutionResult:
        """Parse raw process execution evidence into a structured TestExecutionResult."""
        pass
