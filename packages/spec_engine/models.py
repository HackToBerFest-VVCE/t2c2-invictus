"""Data models for Invariant specifications."""

from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any


@dataclass
class SpecMetadata:
    """Metadata extracted from the specification frontmatter or headers."""
    spec_version: str = "1.0.0"
    target_system: str = "Unknown System"
    status: str = "Active"
    verification_level: str = "Standard"
    extra: Dict[str, Any] = field(default_factory=dict)


@dataclass
class InvariantRule:
    """Represents a discrete invariant rule defined in the specification."""
    id: str
    title: str
    rule_statement: str
    formal_assertion: Optional[str] = None
    applies_to: Optional[str] = None
    severity: str = "HIGH"  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    raw_text: str = ""


@dataclass
class APIContract:
    """Represents an API contract definition."""
    name: str
    endpoint: Optional[str] = None
    pre_conditions: List[str] = field(default_factory=list)
    post_conditions: List[str] = field(default_factory=list)
    failure_modes: List[str] = field(default_factory=list)


@dataclass
class EdgeCase:
    """Represents a declared boundary or edge-case scenario."""
    id: str
    title: str
    description: str
    scenario_type: str = "Boundary"  # Boundary, Concurrency, FaultInjection


@dataclass
class FailureMode:
    """Represents an expected error handling scenario."""
    trigger: str
    expected_status: str
    error_code: str
    expected_mutation: str = "None"


@dataclass
class InvariantSpec:
    """Complete parsed Invariant specification."""
    metadata: SpecMetadata
    project_overview: str = ""
    invariants: List[InvariantRule] = field(default_factory=list)
    contracts: List[APIContract] = field(default_factory=list)
    edge_cases: List[EdgeCase] = field(default_factory=list)
    failure_modes: List[FailureMode] = field(default_factory=list)
    verification_expectations: List[str] = field(default_factory=list)
    raw_content: str = ""
    warnings: List[str] = field(default_factory=list)
