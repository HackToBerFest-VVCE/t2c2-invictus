"""Integration tests for finding lifecycle status management."""

import pytest
from fastapi.testclient import TestClient
from services.api.app.main import app
from services.api.app.core.database import SessionLocal
from services.api.app.models.models import RepositoryDB, VerificationRunDB, FindingDB


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def seeded_finding() -> str:
    finding_id = "f_lifecycle_test"
    with SessionLocal() as db:
        repo = db.query(RepositoryDB).filter_by(id="test-repo-life").first()
        if not repo:
            repo = RepositoryDB(
                id="test-repo-life",
                owner="invictus",
                name="test-repo-life",
                full_name="invictus/test-repo-life",
            )
            db.add(repo)
            db.commit()

        run = VerificationRunDB(
            id="run_life_test",
            repository_id="test-repo-life",
            commit_sha="commit_life",
            status="VERIFIED_FAILURE",
        )
        db.merge(run)
        db.query(FindingDB).filter_by(id=finding_id).delete()

        finding = FindingDB(
            id=finding_id,
            run_id="run_life_test",
            invariant_id="INV-03",
            title="AI Hypothesis Requires Sandbox Confirmation",
            severity="HIGH",
            verification_status="AI_HYPOTHESIS",
            lifecycle_status="unconfirmed",
        )
        db.add(finding)
        db.commit()
    return finding_id


def test_update_finding_lifecycle_success(
    client: TestClient, seeded_finding: str
) -> None:
    # 1. Update to confirmed with notes
    resp1 = client.patch(
        f"/api/v1/findings/{seeded_finding}/status",
        json={
            "lifecycle_status": "confirmed",
            "reviewer_notes": "Verified by security lead.",
        },
    )
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["id"] == seeded_finding
    assert data1["lifecycle_status"] == "confirmed"
    assert data1["reviewer_notes"] == "Verified by security lead."

    # 2. Update to resolved
    resp2 = client.patch(
        f"/api/v1/findings/{seeded_finding}/status",
        json={"lifecycle_status": "resolved", "reviewer_notes": "Fixed in patch #12."},
    )
    assert resp2.status_code == 200
    assert resp2.json()["lifecycle_status"] == "resolved"


def test_update_finding_invalid_status(client: TestClient, seeded_finding: str) -> None:
    resp = client.patch(
        f"/api/v1/findings/{seeded_finding}/status",
        json={"lifecycle_status": "invalid_random_state"},
    )
    assert resp.status_code == 400
    assert "Invalid lifecycle status" in resp.json()["detail"]


def test_update_finding_not_found(client: TestClient) -> None:
    resp = client.patch(
        "/api/v1/findings/nonexistent_f_id/status",
        json={"lifecycle_status": "confirmed"},
    )
    assert resp.status_code == 404
