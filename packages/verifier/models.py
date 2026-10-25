"""Models for test execution and verification evidence."""

from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional, Dict, Any


class VerificationStatus(str, Enum):
    """Formal 6-tier verification status taxonomy."""

    VERIFIED_PASS = "VERIFIED_PASS"
    VERIFIED_FAILURE = "VERIFIED_FAILURE"
    STATIC_WARNING = "STATIC_WARNING"
    AI_HYPOTHESIS = "AI_HYPOTHESIS"
    CHECK_ERROR = "CHECK_ERROR"
    UNSUPPORTED = "UNSUPPORTED"


@dataclass
class EvidenceTrace:
    """Concrete empirical execution evidence."""

    exit_code: int
    stdout: str
    stderr: str
    reproduction_command: str
    stack_trace: Optional[str] = None
    duration_ms: int = 0
    environment_info: Dict[str, str] = field(default_factory=dict)


@dataclass
class TestExecutionResult:
    """Raw result of running a test suite or verification harness."""

    __test__ = False
    adapter_name: str
    status: VerificationStatus
    evidence: EvidenceTrace
    passed_count: int = 0
    failed_count: int = 0
    skipped_count: int = 0
    error_message: Optional[str] = None
    failure_details: List[Dict[str, Any]] = field(default_factory=list)
