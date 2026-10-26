"""Unit tests for GitHub Checks API client and annotation generator."""

from packages.report_engine.models import VerificationReport, VerificationFinding
from packages.verifier.models import VerificationStatus
from services.api.app.services.github_checks import GitHubChecksService


def test_github_checks_payload_success() -> None:
    svc = GitHubChecksService(github_token=None)
    report = VerificationReport(
        run_id="run_chk_1",
        status=VerificationStatus.VERIFIED_PASS,
        timestamp="2026-10-26T23:00:00",
        duration_ms=120,
        invariants_evaluated=3,
        summary="All invariant verification checks passed.",
        passed_count=3,
        failed_count=0,
    )

    payload = svc.build_check_run_payload(report=report, commit_sha="abc1234")
    assert payload["name"] == "Invariant Verification"
    assert payload["head_sha"] == "abc1234"
    assert payload["conclusion"] == "success"
    assert payload["status"] == "completed"
    assert "passed" in payload["output"]["title"].lower()
    assert len(payload["output"]["annotations"]) == 0


def test_github_checks_payload_with_annotations() -> None:
    svc = GitHubChecksService(github_token=None)
    findings = [
        VerificationFinding(
            finding_id="f_chk_fail",
            title="Boundary check violated",
            invariant_id="INV-01",
            severity="HIGH",
            status=VerificationStatus.VERIFIED_FAILURE,
            file_path="src/inventory.py",
            line_number=28,
            actual_behavior="Allowed negative inventory balance",
            reproduction_command="pytest tests/test_inventory.py",
            execution_trace="assert balance >= 0",
        )
    ]
    report = VerificationReport(
        run_id="run_chk_2",
        status=VerificationStatus.VERIFIED_FAILURE,
        timestamp="2026-10-26T23:00:00",
        duration_ms=250,
        invariants_evaluated=4,
        findings=findings,
        summary="Verified invariant failure detected in inventory boundary.",
        passed_count=3,
        failed_count=1,
    )

    payload = svc.build_check_run_payload(report=report, commit_sha="def5678")
    assert payload["conclusion"] == "failure"
    annotations = payload["output"]["annotations"]
    assert len(annotations) == 1
    assert annotations[0]["path"] == "src/inventory.py"
    assert annotations[0]["start_line"] == 28
    assert annotations[0]["end_line"] == 28
    assert annotations[0]["annotation_level"] == "failure"
    assert "Boundary check violated" in annotations[0]["title"]
    assert "Reproduction: pytest tests/test_inventory.py" in annotations[0]["message"]


def test_github_checks_dry_run_publish() -> None:
    svc = GitHubChecksService(github_token=None)
    report = VerificationReport(
        run_id="run_chk_3",
        status=VerificationStatus.VERIFIED_PASS,
        timestamp="2026-10-26T23:00:00",
        duration_ms=100,
        invariants_evaluated=1,
    )

    result = svc.publish_check_run(
        owner="test-owner",
        repo="test-repo",
        commit_sha="111222333",
        report=report,
    )
    assert result["status"] == "dry_run"
    assert result["posted"] is False
    assert "payload" in result
