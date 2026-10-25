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


def test_webhook_unauthorized_when_signature_missing_or_invalid(client: TestClient) -> None:
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
