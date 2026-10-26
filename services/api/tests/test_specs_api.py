"""Integration tests for specification and test-gap API endpoints."""

import pytest
from fastapi.testclient import TestClient
from services.api.app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_get_spec_success(client: TestClient) -> None:
    response = client.get("/api/v1/specs?spec_path=INVARIANT.md")
    assert response.status_code == 200
    data = response.json()
    assert data["spec_version"] == "1.0.0"
    assert data["target_system"] == "Invariant Platform Core"
    assert data["invariants_count"] >= 1
    assert "INV-01" in data["raw_content"]


def test_get_spec_not_found(client: TestClient) -> None:
    response = client.get("/api/v1/specs?spec_path=NON_EXISTENT_SPEC.md")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_analyze_spec_coverage(client: TestClient) -> None:
    response = client.get("/api/v1/specs/analyze?spec_path=INVARIANT.md")
    assert response.status_code == 200
    data = response.json()
    assert data["total_invariants"] >= 1
    assert data["coverage_percentage"] >= 0.0
    assert "invariants" in data
    assert len(data["invariants"]) == data["total_invariants"]

    # Verify every invariant has either COVERED or UNTESTED_GAP status
    for inv in data["invariants"]:
        assert inv["test_coverage_status"] in {"COVERED", "UNTESTED_GAP"}
        if inv["test_coverage_status"] == "UNTESTED_GAP":
            assert inv["suggested_test_sketch"] is not None
