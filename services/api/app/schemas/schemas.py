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
    file_path: Optional[str] = None
    line_number: Optional[int] = None
    expected_behavior: Optional[str] = ""
    actual_behavior: Optional[str] = ""
    reproduction_command: Optional[str] = None
    execution_trace: Optional[str] = None
    ai_assisted: bool = False
    created_at: Optional[datetime.datetime] = None

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
    created_at: Optional[datetime.datetime] = None
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


class WebhookDeliveryResponse(BaseModel):
    status: str
    delivery_id: str
    run_id: Optional[str] = None
    message: str
