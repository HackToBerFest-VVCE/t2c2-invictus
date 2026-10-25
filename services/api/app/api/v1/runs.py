"""REST API endpoints for verification runs and reports."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ...core.database import get_db
from ...models.models import VerificationRunDB, RepositoryDB
from ...schemas.schemas import (
    VerificationRunResponse,
    ManualTriggerRequest,
    RepositoryResponse,
)
from ...services.verification_service import VerificationService

router = APIRouter(prefix="/v1", tags=["Verification Runs"])


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
        r_resp = RepositoryResponse.from_orm(r)
        r_resp.recent_runs = [
            VerificationRunResponse.from_orm(run) for run in recent_runs
        ]
        results.append(r_resp)
    return results


@router.get("/runs", response_model=List[VerificationRunResponse])
def list_runs(
    limit: int = 50,
    repository_id: str = None,
    db: Session = Depends(get_db),
) -> List[VerificationRunResponse]:
    """Retrieve list of verification runs."""
    query = db.query(VerificationRunDB)
    if repository_id:
        query = query.filter_by(repository_id=repository_id)
    runs = query.order_by(VerificationRunDB.created_at.desc()).limit(limit).all()
    return [VerificationRunResponse.from_orm(r) for r in runs]


@router.get("/runs/{run_id}", response_model=VerificationRunResponse)
def get_run(run_id: str, db: Session = Depends(get_db)) -> VerificationRunResponse:
    """Retrieve a specific verification run along with its findings."""
    run = db.query(VerificationRunDB).filter_by(id=run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail=f"Run '{run_id}' not found.")
    return VerificationRunResponse.from_orm(run)


@router.post("/runs/trigger", response_model=VerificationRunResponse)
def trigger_run(
    request: ManualTriggerRequest,
    db: Session = Depends(get_db),
) -> VerificationRunResponse:
    """Manually trigger a verification run on a local workspace or repository."""
    svc = VerificationService(db=db)
    report = svc.execute_verification(
        workspace_path=request.workspace_path,
        spec_path=request.spec_path,
        repository_id=request.repository_id or "local-repo",
        commit_sha=request.commit_sha or "HEAD",
        branch=request.branch or "main",
        event_type="manual",
    )

    run_db = db.query(VerificationRunDB).filter_by(id=report.run_id).first()
    return VerificationRunResponse.from_orm(run_db)
