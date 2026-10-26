"""Integration tests for report export endpoints (Markdown, JSON, GitHub Issue draft)."""

import json
import pytest
from fastapi.testclient import TestClient
from services.api.app.main import app
from services.api.app.core.database import SessionLocal
from services.api.app.models.models import RepositoryDB, VerificationRunDB, FindingDB


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def seeded_run() -> str:
    run_id = "run_export_test"
    with SessionLocal() as db:
        repo = db.query(RepositoryDB).filter_by(id="test-repo-export").first()
        if not repo:
            repo = RepositoryDB(
                id="test-repo-export",
                owner="invictus",
                name="test-repo-export",
                full_name="invictus/test-repo-export",
            )
            db.add(repo)
            db.commit()

        run = VerificationRunDB(
            id=run_id,
            repository_id="test-repo-export",
            commit_sha="export_sha_123",
            status="VERIFIED_FAILURE",
            summary="Verification detected invariant violations.",
            duration_ms=450,
        )
        db.merge(run)
        db.query(FindingDB).filter_by(run_id=run_id).delete()

        db.add(
            FindingDB(
                id="f_export_1",
                run_id=run_id,
                invariant_id="INV-01",
                title="Fail-Safe Verification Inconclusive",
                severity="CRITICAL",
                verification_status="VERIFIED_FAILURE",
                file_path="packages/verifier/runner.py",
                line_number=42,
                expected_behavior="Must not report unrun check as VERIFIED_PASS",
                actual_behavior="Reported check as VERIFIED_PASS",
                reproduction_command="pytest tests/test_verifier.py",
                execution_trace="AssertionError: Status is VERIFIED_PASS",
            )
        )
        db.commit()
    return run_id


def test_export_markdown(client: TestClient, seeded_run: str) -> None:
    response = client.get(f"/api/v1/runs/{seeded_run}/export/markdown")
    assert response.status_code == 200
    assert "text/markdown" in response.headers["content-type"]
    assert "attachment;" in response.headers["content-disposition"]
    text = response.text
    assert f"# Invariant Verification Report: `{seeded_run}`" in text
    assert "INV-01" in text
    assert "Fail-Safe Verification Inconclusive" in text


def test_export_json(client: TestClient, seeded_run: str) -> None:
    response = client.get(f"/api/v1/runs/{seeded_run}/export/json")
    assert response.status_code == 200
    assert "application/json" in response.headers["content-type"]
    assert "attachment;" in response.headers["content-disposition"]
    data = json.loads(response.text)
    assert data["run_id"] == seeded_run
    assert data["status"] == "VERIFIED_FAILURE"
    assert len(data["findings"]) == 1
    assert data["findings"][0]["finding_id"] == "f_export_1"


def test_export_github_issue(client: TestClient, seeded_run: str) -> None:
    response = client.get(f"/api/v1/runs/{seeded_run}/export/github-issue")
    assert response.status_code == 200
    assert "text/markdown" in response.headers["content-type"]
    text = response.text
    assert "[BUG] Verified Invariant Violation:" in text
    assert "pytest tests/test_verifier.py" in text


def test_export_not_found(client: TestClient) -> None:
    assert client.get("/api/v1/runs/nonexistent_run/export/markdown").status_code == 404
    assert client.get("/api/v1/runs/nonexistent_run/export/json").status_code == 404
    assert (
        client.get("/api/v1/runs/nonexistent_run/export/github-issue").status_code
        == 404
    )
