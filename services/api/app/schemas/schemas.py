"""Pydantic request and response schemas."""

import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class FindingResponse(BaseModel):
    id: str
    run_id: str
    invariant_id: Optional[str] = None
    title: str
    severity: str
    verification_status: str
    lifecycle_status: str = "unconfirmed"
    confidence: str = "HIGH"
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    expected_behavior: Optional[str] = ""
    actual_behavior: Optional[str] = ""
    reproduction_command: Optional[str] = None
    execution_trace: Optional[str] = None
    suggested_fix: Optional[str] = None
    reviewer_notes: Optional[str] = None
    ai_assisted: bool = False
    created_at: Optional[datetime.datetime] = None
    updated_at: Optional[datetime.datetime] = None

    model_config = {"from_attributes": True}


class VerificationRunResponse(BaseModel):
    id: str
    repository_id: str
    commit_sha: str
    branch: str
    event_type: str
    status: str
    summary: Optional[str] = ""
    duration_ms: int = 0
    is_async: bool = False
    plan_metadata: Optional[str] = None
    created_at: Optional[datetime.datetime] = None
    completed_at: Optional[datetime.datetime] = None
    findings: List[FindingResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class RepositoryResponse(BaseModel):
    id: str
    owner: str
    name: str
    full_name: str
    default_branch: str
    created_at: Optional[datetime.datetime] = None
    recent_runs: List[VerificationRunResponse] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class ManualTriggerRequest(BaseModel):
    workspace_path: str = "."
    spec_path: str = "INVARIANT.md"
    repository_id: Optional[str] = "local-repo"
    commit_sha: Optional[str] = "HEAD"
    branch: Optional[str] = "main"
    async_run: bool = False


class WebhookDeliveryResponse(BaseModel):
    status: str
    delivery_id: str
    run_id: Optional[str] = None
    message: str


class FindingStatusUpdateRequest(BaseModel):
    lifecycle_status: str
    reviewer_notes: Optional[str] = None


class RunComparisonResponse(BaseModel):
    base_run_id: str
    head_run_id: str
    new_regressions: List[FindingResponse] = Field(default_factory=list)
    resolved_findings: List[FindingResponse] = Field(default_factory=list)
    persistent_findings: List[FindingResponse] = Field(default_factory=list)
    total_regressions: int = 0
    total_resolved: int = 0
    total_persistent: int = 0
    summary: str


class SpecInvariantResponse(BaseModel):
    id: str
    title: str
    rule_statement: str
    formal_assertion: Optional[str] = None
    severity: str
    test_coverage_status: str  # "COVERED" or "UNTESTED_GAP"
    associated_tests: List[str] = Field(default_factory=list)
    suggested_test_sketch: Optional[str] = None


class SpecAnalysisResponse(BaseModel):
    spec_path: str
    spec_version: str
    target_system: str
    total_invariants: int
    tested_count: int
    untested_gap_count: int
    coverage_percentage: float
    invariants: List[SpecInvariantResponse] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)


class SpecificationResponse(BaseModel):
    spec_path: str
    spec_version: str
    target_system: str
    status: str
    verification_level: str
    invariants_count: int
    contracts_count: int
    edge_cases_count: int
    raw_content: str
