"""Unit and integration tests for Invariant Verification Intelligence Engine (VIE)."""

from fastapi.testclient import TestClient

from packages.verifier.intelligence_engine import (
    VerificationIntelligenceEngine,
    ClassificationStatus,
    SuspectedIssue,
)
from services.api.app.main import app

client = TestClient(app)


def test_taxonomy_endpoint():
    """Verify that the 5-tier classification taxonomy is returned by API."""
    response = client.get("/api/v1/intelligence/taxonomy")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5

    statuses = [item["status"] for item in data]
    assert "Reproduced" in statuses
    assert "Strongly Supported" in statuses
    assert "Potential" in statuses
    assert "Inconclusive" in statuses
    assert "False Positive" in statuses


def test_evaluate_issue_reproduced():
    """Verify that a failing test reproduction classifies the issue as 'Reproduced'."""
    engine = VerificationIntelligenceEngine(
        workspace_root="examples/inventory-api",
        spec_path="examples/inventory-api/INVARIANT.md",
    )

    issue = SuspectedIssue(
        issue_id="ISSUE-001",
        title="Stock Underflow on Concurrent Reservation",
        description="Available stock drops below zero when concurrent reserves occur.",
        target_file="src/inventory.py",
        candidate_test_command=(
            "python -c \"import sys; "
            "sys.stderr.write('AssertionError: item.available_stock is -2\\n'); "
            "sys.exit(1)\""
        ),
        rule_hint="INV-01",
        severity="CRITICAL",
    )

    result = engine.evaluate_issue(issue)
    assert result.classification == ClassificationStatus.REPRODUCED
    assert result.confidence_score >= 0.90
    assert result.suggested_action == "BLOCK_PR"
    assert result.matched_invariant_id == "INV-01"
    assert result.evidence.exit_code == 1
    assert "AssertionError" in (result.evidence.execution_trace or "")


def test_evaluate_issue_false_positive():
    """Verify that a passing test execution proves the issue is a 'False Positive'."""
    engine = VerificationIntelligenceEngine(
        workspace_root="examples/inventory-api",
        spec_path="examples/inventory-api/INVARIANT.md",
    )

    issue = SuspectedIssue(
        issue_id="ISSUE-002",
        title="Hallucinated Deadlock in Stock Lookup",
        description="AI reviewer claims get_available_stock deadlocks under concurrent access.",
        target_file="src/inventory.py",
        candidate_test_command="python -c \"import sys; print('All lookups passed'); sys.exit(0)\"",
        rule_hint="INV-01",
    )

    result = engine.evaluate_issue(issue)
    assert result.classification == ClassificationStatus.FALSE_POSITIVE
    assert result.confidence_score >= 0.80
    assert result.suggested_action == "DISMISS_FALSE_POSITIVE"
    assert result.evidence.exit_code == 0


def test_evaluate_issue_inconclusive():
    """Verify that an invalid harness or runner crash yields 'Inconclusive'."""
    engine = VerificationIntelligenceEngine(
        workspace_root="examples/inventory-api",
        spec_path="examples/inventory-api/INVARIANT.md",
    )

    issue = SuspectedIssue(
        issue_id="ISSUE-003",
        title="Flaky Resource Exhaustion",
        description="Worker crashed during execution.",
        target_file="src/inventory.py",
        candidate_test_command="python -c \"import time; time.sleep(5)\"",
    )

    # Set 1 second timeout to trigger execution watchdog
    result = engine.evaluate_issue(issue, runner_timeout_seconds=1)
    assert result.classification == ClassificationStatus.INCONCLUSIVE
    assert result.suggested_action == "FIX_HARNESS"
    assert result.evidence.test_integrity == "TIMEOUT_OR_CRASH"


def test_api_evaluate_issue_endpoint():
    """Verify that the FastAPI endpoint POST /api/v1/intelligence/evaluate returns 200."""
    payload = {
        "issue_id": "ISSUE-API-01",
        "title": "Negative Stock Level Violation",
        "description": "Stock drops below 0 when reserving more than available.",
        "target_file": "examples/inventory-api/src/inventory.py",
        "candidate_test_command": "python -c \"import sys; sys.exit(0)\"",
        "workspace_path": "examples/inventory-api",
        "spec_path": "examples/inventory-api/INVARIANT.md",
        "rule_hint": "INV-01",
    }

    response = client.post("/api/v1/intelligence/evaluate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "finding_id" in data
    assert "classification" in data
    assert "confidence_score" in data
    assert "reasoning" in data
    assert isinstance(data["reasoning"], list)
