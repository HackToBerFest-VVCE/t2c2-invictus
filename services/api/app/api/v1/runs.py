"""REST API endpoints for verification runs, findings lifecycle, comparisons, and exports."""

import uuid
import datetime
from typing import List, Optional
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    BackgroundTasks,
    Response,
    status,
)
from sqlalchemy.orm import Session

from ...core.database import get_db, SessionLocal
from ...models.models import VerificationRunDB, RepositoryDB, FindingDB
from ...schemas.schemas import (
    VerificationRunResponse,
    ManualTriggerRequest,
    RepositoryResponse,
    FindingResponse,
    FindingStatusUpdateRequest,
    RunComparisonResponse,
)
from ...services.verification_service import VerificationService
from packages.report_engine.models import VerificationReport, VerificationFinding
from packages.verifier.models import VerificationStatus
from packages.report_engine.generators import (
    MarkdownReportGenerator,
    JSONReportGenerator,
    GitHubIssueDraftGenerator,
)

router = APIRouter(prefix="/v1", tags=["Verification Runs"])


def _run_verification_async(
    workspace_path: str,
    spec_path: str,
    repository_id: str,
    commit_sha: str,
    branch: str,
    event_type: str,
    run_id: str,
) -> None:
    """Background worker task for asynchronous verification."""
    with SessionLocal() as db:
        svc = VerificationService(db=db)
        svc.execute_verification(
            workspace_path=workspace_path,
            spec_path=spec_path,
            repository_id=repository_id,
            commit_sha=commit_sha,
            branch=branch,
            event_type=event_type,
            run_id=run_id,
            is_async=True,
        )


def _reconstruct_report_from_db(run: VerificationRunDB) -> VerificationReport:
    """Build a VerificationReport object from a database verification run and its findings."""
    try:
        report_status = VerificationStatus(run.status)
    except Exception:
        report_status = VerificationStatus.CHECK_ERROR

    findings: List[VerificationFinding] = []
    passed = 0
    failed = 0
    hypotheses = 0

    for f in run.findings:
        try:
            f_status = VerificationStatus(f.verification_status)
        except Exception:
            f_status = VerificationStatus.CHECK_ERROR

        if f_status == VerificationStatus.VERIFIED_PASS:
            passed += 1
        elif f_status == VerificationStatus.VERIFIED_FAILURE:
            failed += 1
        elif f_status == VerificationStatus.AI_HYPOTHESIS:
            hypotheses += 1

        findings.append(
            VerificationFinding(
                finding_id=f.id,
                title=f.title,
                invariant_id=f.invariant_id,
                severity=f.severity,
                status=f_status,
                file_path=f.file_path,
                line_number=f.line_number,
                expected_behavior=f.expected_behavior or "",
                actual_behavior=f.actual_behavior or "",
                reproduction_command=f.reproduction_command,
                execution_trace=f.execution_trace,
                ai_assisted=f.ai_assisted,
            )
        )

    return VerificationReport(
        run_id=run.id,
        status=report_status,
        timestamp=run.created_at.isoformat() if run.created_at else "",
        duration_ms=run.duration_ms,
        invariants_evaluated=len(findings),
        findings=findings,
        summary=run.summary or "",
        passed_count=passed,
        failed_count=failed,
        hypothesis_count=hypotheses,
    )


@router.get("/repositories", response_model=List[RepositoryResponse])
def list_repositories(db: Session = Depends(get_db)) -> List[RepositoryResponse]:
    """List all connected repositories and their recent runs."""
    repos = db.query(RepositoryDB).all()
    results = []
    for r in repos:
        recent_runs = (
            db.query(VerificationRunDB)
            .filter_by(repository_id=r.id)
            .order_by(VerificationRunDB.created_at.desc())
            .limit(5)
            .all()
        )
        r_resp = RepositoryResponse.model_validate(r)
        r_resp.recent_runs = [
            VerificationRunResponse.model_validate(run) for run in recent_runs
        ]
        results.append(r_resp)
    return results


@router.get("/runs", response_model=List[VerificationRunResponse])
def list_runs(
    limit: int = 50,
    repository_id: Optional[str] = None,
    db: Session = Depends(get_db),
) -> List[VerificationRunResponse]:
    """Retrieve list of verification runs."""
    query = db.query(VerificationRunDB)
    if repository_id:
        query = query.filter_by(repository_id=repository_id)
    runs = query.order_by(VerificationRunDB.created_at.desc()).limit(limit).all()
    return [VerificationRunResponse.model_validate(r) for r in runs]


@router.get("/runs/compare", response_model=RunComparisonResponse)
def compare_runs(
    base_run_id: str = Query(..., description="Base (previous) verification run ID"),
    head_run_id: str = Query(..., description="Head (current) verification run ID"),
    db: Session = Depends(get_db),
) -> RunComparisonResponse:
    """Compare findings between base and head verification runs to detect regressions and fixes."""
    base_run = db.query(VerificationRunDB).filter_by(id=base_run_id).first()
    if not base_run:
        raise HTTPException(
            status_code=404, detail=f"Base run '{base_run_id}' not found."
        )

    head_run = db.query(VerificationRunDB).filter_by(id=head_run_id).first()
    if not head_run:
        raise HTTPException(
            status_code=404, detail=f"Head run '{head_run_id}' not found."
        )

    failing_statuses = {"VERIFIED_FAILURE", "CHECK_ERROR"}

    base_failing_map = {
        (f.invariant_id or f.title): f
        for f in base_run.findings
        if f.verification_status in failing_statuses
    }

    head_failing_map = {
        (f.invariant_id or f.title): f
        for f in head_run.findings
        if f.verification_status in failing_statuses
    }

    # 1. Regressions: failing in head, not failing in base
    new_regressions_db = [
        f for key, f in head_failing_map.items() if key not in base_failing_map
    ]

    # 2. Resolved: failing in base, not failing in head
    resolved_findings_db = [
        f for key, f in base_failing_map.items() if key not in head_failing_map
    ]

    # 3. Persistent: failing in both base and head
    persistent_findings_db = [
        f for key, f in head_failing_map.items() if key in base_failing_map
    ]

    regressions = [FindingResponse.model_validate(f) for f in new_regressions_db]
    resolved = [FindingResponse.model_validate(f) for f in resolved_findings_db]
    persistent = [FindingResponse.model_validate(f) for f in persistent_findings_db]

    summary = (
        f"Compared base '{base_run_id}' ({base_run.status}) to "
        f"head '{head_run_id}' ({head_run.status}): "
        f"{len(regressions)} new regression(s), {len(resolved)} resolved issue(s), "
        f"{len(persistent)} persistent failure(s)."
    )

    return RunComparisonResponse(
        base_run_id=base_run_id,
        head_run_id=head_run_id,
        new_regressions=regressions,
        resolved_findings=resolved,
        persistent_findings=persistent,
        total_regressions=len(regressions),
        total_resolved=len(resolved),
        total_persistent=len(persistent),
        summary=summary,
    )


@router.get("/runs/{run_id}", response_model=VerificationRunResponse)
def get_run(run_id: str, db: Session = Depends(get_db)) -> VerificationRunResponse:
    """Retrieve a specific verification run along with its findings."""
    run = db.query(VerificationRunDB).filter_by(id=run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")
    return VerificationRunResponse.model_validate(run)


@router.post("/runs/trigger", response_model=VerificationRunResponse)
def trigger_run(
    request: ManualTriggerRequest,
    background_tasks: BackgroundTasks,
    response: Response,
    db: Session = Depends(get_db),
) -> VerificationRunResponse:
    """Trigger a verification run synchronously or dispatch as an async background task."""
    repo_id = request.repository_id or "local-repo"
    commit_sha = request.commit_sha or "HEAD"
    branch = request.branch or "main"

    # Async background task execution
    if request.async_run:
        run_id = f"run_{uuid.uuid4().hex[:12]}"

        # Ensure repository exists
        repo = db.query(RepositoryDB).filter_by(id=repo_id).first()
        if not repo:
            repo = RepositoryDB(
                id=repo_id,
                owner="local",
                name=repo_id,
                full_name=f"local/{repo_id}",
                default_branch=branch,
            )
            db.add(repo)
            db.commit()

        run_db = VerificationRunDB(
            id=run_id,
            repository_id=repo_id,
            commit_sha=commit_sha,
            branch=branch,
            event_type="manual",
            status="IN_PROGRESS",
            summary="Verification queued and executing in background...",
            duration_ms=0,
            is_async=True,
            created_at=datetime.datetime.utcnow(),
        )
        db.add(run_db)
        db.commit()
        db.refresh(run_db)

        background_tasks.add_task(
            _run_verification_async,
            workspace_path=request.workspace_path,
            spec_path=request.spec_path,
            repository_id=repo_id,
            commit_sha=commit_sha,
            branch=branch,
            event_type="manual",
            run_id=run_id,
        )

        response.status_code = status.HTTP_202_ACCEPTED
        return VerificationRunResponse.model_validate(run_db)

    # Synchronous execution
    svc = VerificationService(db=db)
    report = svc.execute_verification(
        workspace_path=request.workspace_path,
        spec_path=request.spec_path,
        repository_id=repo_id,
        commit_sha=commit_sha,
        branch=branch,
        event_type="manual",
    )

    run_db = db.query(VerificationRunDB).filter_by(id=report.run_id).first()
    return VerificationRunResponse.model_validate(run_db)


@router.patch("/findings/{finding_id}/status", response_model=FindingResponse)
def update_finding_status(
    finding_id: str,
    update_req: FindingStatusUpdateRequest,
    db: Session = Depends(get_db),
) -> FindingResponse:
    """Update finding lifecycle status (unconfirmed, confirmed, resolved, dismissed)."""
    valid_statuses = {"unconfirmed", "confirmed", "resolved", "dismissed"}
    normalized_status = update_req.lifecycle_status.strip().lower()

    if normalized_status not in valid_statuses:
        allowed = sorted(valid_statuses)
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid lifecycle status '{update_req.lifecycle_status}'. "
                f"Must be one of: {allowed}"
            ),
        )

    finding = db.query(FindingDB).filter_by(id=finding_id).first()
    if not finding:
        raise HTTPException(
            status_code=404, detail=f"Finding '{finding_id}' not found."
        )

    finding.lifecycle_status = normalized_status
    if update_req.reviewer_notes is not None:
        finding.reviewer_notes = update_req.reviewer_notes
    finding.updated_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(finding)
    return FindingResponse.model_validate(finding)


@router.get("/runs/{run_id}/export/markdown")
def export_run_markdown(
    run_id: str,
    db: Session = Depends(get_db),
) -> Response:
    """Export verification report as downloadable GitHub-Flavored Markdown."""
    run = db.query(VerificationRunDB).filter_by(id=run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")

    report = _reconstruct_report_from_db(run)
    generator = MarkdownReportGenerator()
    content = generator.generate(report)

    return Response(
        content=content,
        media_type="text/markdown",
        headers={
            "Content-Disposition": f'attachment; filename="invariant-report-{run_id}.md"'
        },
    )


@router.get("/runs/{run_id}/export/json")
def export_run_json(
    run_id: str,
    db: Session = Depends(get_db),
) -> Response:
    """Export verification report as downloadable JSON."""
    run = db.query(VerificationRunDB).filter_by(id=run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")

    report = _reconstruct_report_from_db(run)
    generator = JSONReportGenerator()
    content = generator.generate(report)

    return Response(
        content=content,
        media_type="application/json",
        headers={
            "Content-Disposition": f'attachment; filename="invariant-report-{run_id}.json"'
        },
    )


@router.get("/runs/{run_id}/export/github-issue")
def export_run_github_issue(
    run_id: str,
    db: Session = Depends(get_db),
) -> Response:
    """Export pre-filled GitHub Issue draft for verified failures."""
    run = db.query(VerificationRunDB).filter_by(id=run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")

    report = _reconstruct_report_from_db(run)
    generator = GitHubIssueDraftGenerator()
    content = generator.generate(report)

    if not content:
        content = (
            f"# No Verified Failures in Run {run_id}\n\n"
            "All verified checks passed without invariant violations."
        )

    return Response(
        content=content,
        media_type="text/markdown",
        headers={
            "Content-Disposition": f'attachment; filename="invariant-issue-draft-{run_id}.md"'
        },
    )
