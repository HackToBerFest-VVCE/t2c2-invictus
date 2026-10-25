"""Data models for normalized verification findings and reports."""

from dataclasses import dataclass, field
from typing import List, Optional
from packages.verifier.models import VerificationStatus


@dataclass
class VerificationFinding:
    """Normalized finding representing a verification outcome."""
    finding_id: str
    title: str
    invariant_id: Optional[str]
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    status: VerificationStatus
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    expected_behavior: str = ""
    actual_behavior: str = ""
    reproduction_command: Optional[str] = None
    execution_trace: Optional[str] = None
    ai_assisted: bool = False


@dataclass
class VerificationReport:
    """Consolidated verification report across an entire commit or pull request."""
    run_id: str
    status: VerificationStatus
    timestamp: str
    duration_ms: int
    invariants_evaluated: int
    findings: List[VerificationFinding] = field(default_factory=list)
    summary: str = ""
    passed_count: int = 0
    failed_count: int = 0
    hypothesis_count: int = 0
