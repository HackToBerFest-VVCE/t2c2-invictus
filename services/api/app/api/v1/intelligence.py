"""FastAPI Router for Invariant Verification Intelligence Engine (VIE).

Provides endpoints for evaluating AI-detected bug hypotheses against INVARIANT.md
and empirical test evidence using the 5-tier classification taxonomy.
"""

from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from packages.verifier.intelligence_engine import (
    VerificationIntelligenceEngine,
    ClassificationStatus,
    SuspectedIssue,
    VerifiedClassificationResult,
)

router = APIRouter(prefix="/v1/intelligence", tags=["Verification Intelligence Engine (VIE)"])


class EvaluateIssueRequest(BaseModel):
    """Payload for submitting a suspected defect to the Verification Intelligence Engine."""

    issue_id: str = Field(..., description="Unique identifier for the suspected issue")
    title: str = Field(..., description="Summary title of the suspected bug")
    description: str = Field(..., description="Detailed description of postulated defect")
    target_file: str = Field(..., description="Source code file where failure is suspected")
    affected_lines: str = Field(default="", description="Line numbers or range")
    diff_patch: Optional[str] = Field(default=None, description="Unified git diff or PR patch")
    candidate_test_command: Optional[str] = Field(
        default=None,
        description="Optional targeted command to run for reproduction (e.g. pytest)",
    )
    workspace_path: str = Field(default=".", description="Workspace root directory")
    spec_path: str = Field(default="INVARIANT.md", description="Path to INVARIANT.md specification")
    detection_source: str = Field(
        default="ai_reviewer",
        description="Source of finding (e.g. copilot, sonarqube, semgrep, gpt-4o)",
    )
    severity: str = Field(default="HIGH", description="Initial severity rating")
    rule_hint: Optional[str] = Field(
        default=None, description="Optional hinted invariant ID (e.g. INV-01)"
    )


class TaxonomyDefinition(BaseModel):
    status: str
    description: str
    evidentiary_criteria: List[str]
    suggested_action: str


@router.get("/taxonomy", response_model=List[TaxonomyDefinition])
def get_classification_taxonomy() -> List[TaxonomyDefinition]:
    """Return the official 5-tier verification status taxonomy and evidentiary criteria."""
    return [
        TaxonomyDefinition(
            status=ClassificationStatus.REPRODUCED.value,
            description=(
                "The suspected failure was conclusively reproduced in an isolated "
                "sandbox under documented conditions."
            ),
            evidentiary_criteria=[
                "Clean compilation",
                "Dynamic test executed in sandbox",
                "Concrete assertion failure or crash trace recorded",
                "Non-zero exit code",
            ],
            suggested_action="BLOCK_PR",
        ),
        TaxonomyDefinition(
            status=ClassificationStatus.STRONGLY_SUPPORTED.value,
            description=(
                "Multiple static and semantic signals corroborate the finding, though "
                "dynamic reproduction was unavailable."
            ),
            evidentiary_criteria=[
                "Explicit INVARIANT.md rule or contract violation",
                "Confirmed AST test gap in affected component",
                "Deterministic static analysis pattern match",
            ],
            suggested_action="WARN_REVIEWER",
        ),
        TaxonomyDefinition(
            status=ClassificationStatus.POTENTIAL.value,
            description=(
                "The issue is logically plausible based on AI code analysis, but "
                "lacks dynamic reproduction or corroborating static proof."
            ),
            evidentiary_criteria=[
                "AI model postulated edge scenario",
                "Synthesized test has not yet been executed",
                "No concrete runtime evidence",
            ],
            suggested_action="ADVISORY_NOTICE",
        ),
        TaxonomyDefinition(
            status=ClassificationStatus.INCONCLUSIVE.value,
            description=(
                "The verification check could not establish validity due to "
                "environmental, infrastructure, or tooling errors."
            ),
            evidentiary_criteria=[
                "Runner timed out (> 60s/300s)",
                "OOM killer terminated process",
                "Missing test dependencies or syntax error in test harness",
            ],
            suggested_action="FIX_HARNESS",
        ),
        TaxonomyDefinition(
            status=ClassificationStatus.FALSE_POSITIVE.value,
            description=(
                "Empirical evidence establishes that the reported finding is invalid "
                "or cannot manifest."
            ),
            evidentiary_criteria=[
                "Targeted reproduction test executed cleanly with exit code 0",
                "All invariant assertions held true under boundary values",
                "Inspection proved invariant is already guarded upstream",
            ],
            suggested_action="DISMISS_FALSE_POSITIVE",
        ),

    ]


@router.post("/evaluate")
def evaluate_suspected_issue(request: EvaluateIssueRequest) -> Dict[str, Any]:
    """Evaluate an AI-detected issue against INVARIANT.md and empirical test evidence."""
    engine = VerificationIntelligenceEngine(
        workspace_root=request.workspace_path,
        spec_path=request.spec_path,
    )

    issue = SuspectedIssue(
        issue_id=request.issue_id,
        title=request.title,
        description=request.description,
        target_file=request.target_file,
        affected_lines=request.affected_lines,
        diff_patch=request.diff_patch,
        candidate_test_command=request.candidate_test_command,
        detection_source=request.detection_source,
        severity=request.severity,
        rule_hint=request.rule_hint,
    )

    try:
        res: VerifiedClassificationResult = engine.evaluate_issue(issue)
        return {
            "finding_id": res.finding_id,
            "issue_id": res.issue_id,
            "title": res.title,
            "classification": res.classification.value,
            "severity": res.severity,
            "confidence_score": res.confidence_score,
            "matched_invariant_id": res.matched_invariant_id,
            "reasoning": res.reasoning,
            "affected_code": res.affected_code,
            "evidence": {
                "matched_invariants": res.evidence.matched_invariants,
                "has_test_gap": res.evidence.has_test_gap,
                "reproduction_command": res.evidence.reproduction_command,
                "exit_code": res.evidence.exit_code,
                "execution_trace": res.evidence.execution_trace,
                "test_duration_ms": res.evidence.test_duration_ms,
                "test_integrity": res.evidence.test_integrity,
            },
            "suggested_action": res.suggested_action,
            "suggested_patch": res.suggested_patch,
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Verification Intelligence Engine evaluation failed: {str(e)}",
        )
