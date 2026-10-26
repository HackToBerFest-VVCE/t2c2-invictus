"""Integration tests for cross-commit run comparison and regression detection."""

import pytest
from fastapi.testclient import TestClient
from services.api.app.main import app
from services.api.app.core.database import SessionLocal
from services.api.app.models.models import RepositoryDB, VerificationRunDB, FindingDB


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_compare_runs_regressions_and_resolutions(client: TestClient) -> None:
    with SessionLocal() as db:
        # Create repo
        repo = db.query(RepositoryDB).filter_by(id="test-repo-compare").first()
        if not repo:
            repo = RepositoryDB(
                id="test-repo-compare",
                owner="invictus",
                name="test-repo-compare",
                full_name="invictus/test-repo-compare",
            )
            db.add(repo)
            db.commit()

        # Base run: fails INV-01, fails INV-99
        base_run = VerificationRunDB(
            id="run_base_test",
            repository_id="test-repo-compare",
            commit_sha="commit_base",
            status="VERIFIED_FAILURE",
            summary="Base run with 2 failures",
        )
        db.merge(base_run)

        # Head run: fixed INV-01, introduced regression INV-02, still fails INV-99
        head_run = VerificationRunDB(
            id="run_head_test",
            repository_id="test-repo-compare",
            commit_sha="commit_head",
            status="VERIFIED_FAILURE",
            summary="Head run with 1 fixed and 1 regression",
        )
        db.merge(head_run)

        db.query(FindingDB).filter(
            FindingDB.run_id.in_(["run_base_test", "run_head_test"])
        ).delete()

        # Base findings
        db.add(
            FindingDB(
                id="f_base_1",
                run_id="run_base_test",
                invariant_id="INV-01",
                title="Fail Safe Check Failed",
                severity="CRITICAL",
                verification_status="VERIFIED_FAILURE",
            )
        )
        db.add(
            FindingDB(
                id="f_base_2",
                run_id="run_base_test",
                invariant_id="INV-99",
                title="Persistent Failure",
                severity="HIGH",
                verification_status="VERIFIED_FAILURE",
            )
        )

        # Head findings
        db.add(
            FindingDB(
                id="f_head_1",
                run_id="run_head_test",
                invariant_id="INV-02",
                title="Webhook HMAC Invalid",
                severity="CRITICAL",
                verification_status="VERIFIED_FAILURE",
            )
        )
        db.add(
            FindingDB(
                id="f_head_2",
                run_id="run_head_test",
                invariant_id="INV-99",
                title="Persistent Failure",
                severity="HIGH",
                verification_status="VERIFIED_FAILURE",
            )
        )
        db.commit()

    response = client.get(
        "/api/v1/runs/compare?base_run_id=run_base_test&head_run_id=run_head_test"
    )
    assert response.status_code == 200
    data = response.json()

    assert data["base_run_id"] == "run_base_test"
    assert data["head_run_id"] == "run_head_test"
    assert data["total_regressions"] == 1
    assert data["total_resolved"] == 1
    assert data["total_persistent"] == 1

    # Regression is INV-02
    assert data["new_regressions"][0]["invariant_id"] == "INV-02"
    # Resolved is INV-01
    assert data["resolved_findings"][0]["invariant_id"] == "INV-01"
    # Persistent is INV-99
    assert data["persistent_findings"][0]["invariant_id"] == "INV-99"


def test_compare_runs_not_found(client: TestClient) -> None:
    resp1 = client.get(
        "/api/v1/runs/compare?base_run_id=nonexistent&head_run_id=neither"
    )
    assert resp1.status_code == 404
