"""REST API endpoints for specification management and test-gap analysis."""

import os
from fastapi import APIRouter, HTTPException, Query
from packages.spec_engine.parser import SpecParser
from ...schemas.schemas import SpecificationResponse, SpecAnalysisResponse
from ...services.test_gap_analyzer import TestGapAnalyzer

router = APIRouter(prefix="/v1", tags=["Specifications"])


def _resolve_spec_path(spec_path: str, workspace_path: str) -> str:
    """Resolve specification path robustly."""
    if os.path.isabs(spec_path) and os.path.exists(spec_path):
        return spec_path
    if os.path.exists(spec_path):
        return spec_path
    joined = os.path.join(workspace_path, spec_path)
    if os.path.exists(joined):
        return joined
    if os.path.basename(spec_path) == "INVARIANT.md":
        fallback = os.path.join(workspace_path, "INVARIANT.md")
        if os.path.exists(fallback):
            return fallback
    return joined


@router.get("/specs", response_model=SpecificationResponse)
def get_specification(
    spec_path: str = Query("INVARIANT.md", description="Path to INVARIANT.md"),
    workspace_path: str = Query(".", description="Path to workspace root"),
) -> SpecificationResponse:
    """Retrieve parsed specification metadata and raw content."""
    full_path = _resolve_spec_path(spec_path, workspace_path)
    if not os.path.exists(full_path):
        raise HTTPException(
            status_code=404,
            detail=f"Specification file '{spec_path}' not found at '{workspace_path}'.",
        )

    parser = SpecParser()
    spec = parser.parse_file(full_path)

    return SpecificationResponse(
        spec_path=spec_path,
        spec_version=spec.metadata.spec_version,
        target_system=spec.metadata.target_system,
        status=spec.metadata.status,
        verification_level=spec.metadata.verification_level,
        invariants_count=len(spec.invariants),
        contracts_count=len(spec.contracts),
        edge_cases_count=len(spec.edge_cases),
        raw_content=spec.raw_content,
    )


@router.get("/specs/analyze", response_model=SpecAnalysisResponse)
def analyze_specification_coverage(
    spec_path: str = Query("INVARIANT.md", description="Path to INVARIANT.md"),
    workspace_path: str = Query(".", description="Path to workspace root"),
) -> SpecAnalysisResponse:
    """Perform test-gap analysis cross-referencing INVARIANT.md against workspace test suites."""
    full_path = _resolve_spec_path(spec_path, workspace_path)
    if not os.path.exists(full_path):
        raise HTTPException(
            status_code=404,
            detail=f"Specification file '{spec_path}' not found at '{workspace_path}'.",
        )

    parser = SpecParser()
    spec = parser.parse_file(full_path)

    analyzer = TestGapAnalyzer(workspace_path=workspace_path)
    return analyzer.analyze(spec=spec, spec_path=spec_path)
