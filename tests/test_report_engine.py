"""Integration tests for the Report Engine."""

from packages.verifier.models import (
    TestExecutionResult,
    VerificationStatus,
    EvidenceTrace,
)
from packages.report_engine.normalizer import FindingNormalizer
from packages.report_engine.generators import (
    MarkdownReportGenerator,
    JSONReportGenerator,
    GitHubIssueDraftGenerator,
)


def test_report_generation_from_passing_result() -> None:
    test_result = TestExecutionResult(
        adapter_name="pytest",
        status=VerificationStatus.VERIFIED_PASS,
        evidence=EvidenceTrace(
            exit_code=0,
            stdout="5 passed in 0.15s",
            stderr="",
            reproduction_command="pytest",
            duration_ms=150,
        ),
        passed_count=5,
        failed_count=0,
    )

    normalizer = FindingNormalizer()
    report = normalizer.normalize(test_result=test_result)

    assert report.status == VerificationStatus.VERIFIED_PASS
    assert report.passed_count == 5

    # Test Markdown generation
    md_gen = MarkdownReportGenerator()
    md = md_gen.generate(report)
    assert "# Invariant Verification Report" in md
    assert "PASSED (VERIFIED)" in md
    assert "150 ms" in md

    # Test JSON generation
    json_gen = JSONReportGenerator()
    json_str = json_gen.generate(report)
    assert '"status": "VERIFIED_PASS"' in json_str


def test_report_generation_from_failure() -> None:
    test_result = TestExecutionResult(
        adapter_name="pytest",
        status=VerificationStatus.VERIFIED_FAILURE,
        evidence=EvidenceTrace(
            exit_code=1,
            stdout="",
            stderr="AssertionError: stock is -2",
            reproduction_command="pytest",
            duration_ms=210,
        ),
        passed_count=4,
        failed_count=1,
        failure_details=[
            {
                "test_name": "test_inv_01_stock",
                "trace": "AssertionError: item.available_stock >= 0 failed",
            }
        ],
    )

    normalizer = FindingNormalizer()
    report = normalizer.normalize(test_result=test_result)

    assert report.status == VerificationStatus.VERIFIED_FAILURE
    assert len(report.findings) == 1
    finding = report.findings[0]
    assert finding.status == VerificationStatus.VERIFIED_FAILURE
    assert finding.title == "Test Failure in test_inv_01_stock"

    # Test GitHub Issue Draft Generation
    issue_gen = GitHubIssueDraftGenerator()
    issue_text = issue_gen.generate(report)
    assert "[BUG] Verified Invariant Violation" in issue_text
    assert "AssertionError" in issue_text
