"""Integration tests for FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient
from services.api.app.main import app


from services.api.app.core.config import settings


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_health_check(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "invariant-api"


def test_list_runs_endpoint(client: TestClient) -> None:
    response = client.get("/api/v1/runs")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_list_repositories_endpoint(client: TestClient) -> None:
    response = client.get("/api/v1/repositories")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_manual_trigger_sync(client: TestClient) -> None:
    response = client.post(
        "/api/v1/runs/trigger",
        json={
            "workspace_path": "examples/inventory-api",
            "spec_path": "INVARIANT.md",
            "repository_id": "test-manual-sync",
            "commit_sha": "abc1234",
            "async_run": False,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["repository_id"] == "test-manual-sync"
    assert data["commit_sha"] == "abc1234"
    assert data["status"] in {"VERIFIED_PASS", "VERIFIED_FAILURE", "CHECK_ERROR"}
    assert "findings" in data


def test_manual_trigger_async(client: TestClient) -> None:
    response = client.post(
        "/api/v1/runs/trigger",
        json={
            "workspace_path": "examples/inventory-api",
            "spec_path": "INVARIANT.md",
            "repository_id": "test-manual-async",
            "commit_sha": "def5678",
            "async_run": True,
        },
    )
    assert response.status_code == 202
    data = response.json()
    assert data["repository_id"] == "test-manual-async"
    assert data["is_async"] is True
    assert data["status"] == "IN_PROGRESS"


def test_get_run_endpoints(client: TestClient) -> None:
    # 404 on missing run
    resp_404 = client.get("/api/v1/runs/nonexistent_run_id_999")
    assert resp_404.status_code == 404


def test_webhook_unauthorized_when_signature_missing_or_invalid(
    client: TestClient,
) -> None:
    original_secret = settings.github_webhook_secret
    try:
        settings.github_webhook_secret = "test_active_secret"

        # Missing signature header
        resp1 = client.post("/api/v1/webhooks/github", json={"action": "push"})
        assert resp1.status_code == 401
        assert "Missing X-Hub-Signature-256" in resp1.json()["detail"]

        # Invalid signature header
        resp2 = client.post(
            "/api/v1/webhooks/github",
            json={"action": "push"},
            headers={"X-Hub-Signature-256": "sha256=invalid"},
        )
        assert resp2.status_code == 401
        assert "Invalid HMAC-SHA256" in resp2.json()["detail"]
    finally:
        settings.github_webhook_secret = original_secret
