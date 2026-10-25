"""GitHub webhook ingress handler with HMAC-SHA256 signature validation."""

import json
from fastapi import APIRouter, Request, Header, HTTPException, Depends
from sqlalchemy.orm import Session

from ..core.config import settings
from ..core.security import verify_github_signature, deduplicator
from ..core.database import get_db
from ..schemas.schemas import WebhookDeliveryResponse
from ..services.verification_service import VerificationService

router = APIRouter(prefix="/v1/webhooks", tags=["Webhooks"])


@router.post("/github", response_model=WebhookDeliveryResponse, status_code=202)
async def handle_github_webhook(
    request: Request,
    x_hub_signature_256: str = Header(None),
    x_github_delivery: str = Header(None),
    x_github_event: str = Header("push"),
    db: Session = Depends(get_db),
) -> WebhookDeliveryResponse:
    """Ingest, authenticate, and dispatch GitHub webhook events."""
    payload_bytes = await request.body()

    # 1. Enforce Webhook Secret Validation (INV-02)
    if settings.github_webhook_secret:
        if not x_hub_signature_256:
            raise HTTPException(
                status_code=401,
                detail="Missing X-Hub-Signature-256 cryptographic signature header.",
            )
        is_valid = verify_github_signature(
            payload_bytes=payload_bytes,
            signature_header=x_hub_signature_256,
            secret=settings.github_webhook_secret,
        )
        if not is_valid:
            raise HTTPException(
                status_code=401,
                detail="Invalid HMAC-SHA256 webhook signature.",
            )

    # 2. Replay Defense / Idempotency Check
    delivery_id = x_github_delivery or "unknown_delivery"
    if deduplicator.is_duplicate(delivery_id):
        return WebhookDeliveryResponse(
            status="duplicate_ignored",
            delivery_id=delivery_id,
            message="Webhook event was already processed within the idempotency window.",
        )

    # 3. Parse JSON Body
    try:
        payload = json.loads(payload_bytes.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload structure.")

    repo_data = payload.get("repository", {})
    repo_name = repo_data.get("name", "unknown_repo")
    commit_sha = payload.get("after") or payload.get("head_commit", {}).get("id", "HEAD")
    branch = payload.get("ref", "refs/heads/main").replace("refs/heads/", "")

    # Dispatch Verification
    svc = VerificationService(db=db)
    report = svc.execute_verification(
        workspace_path=".",
        spec_path="INVARIANT.md",
        repository_id=repo_name,
        commit_sha=commit_sha,
        branch=branch,
        event_type=x_github_event,
        delivery_id=delivery_id,
    )

    return WebhookDeliveryResponse(
        status="accepted",
        delivery_id=delivery_id,
        run_id=report.run_id,
        message=f"Continuous verification completed with status: {report.status.value}",
    )
