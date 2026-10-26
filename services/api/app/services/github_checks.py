"""GitHub Checks API integration service.

Builds and publishes GitHub Check Runs and line-level pull request annotations
based on Invariant continuous verification reports.
"""

import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, List, Optional
from packages.report_engine.models import VerificationReport
from packages.verifier.models import VerificationStatus
from packages.report_engine.generators import MarkdownReportGenerator

logger = logging.getLogger(__name__)


class GitHubChecksService:
    """Manages publishing check runs and code annotations to GitHub."""

    def __init__(self, github_token: Optional[str] = None) -> None:
        self.github_token = github_token
        self.report_generator = MarkdownReportGenerator()

    def build_check_run_payload(
        self,
        report: VerificationReport,
        commit_sha: str,
        status: str = "completed",
    ) -> Dict[str, Any]:
        """Construct standard GitHub Check Run payload with line-level annotations."""
        # 1. Determine GitHub check conclusion
        if report.status == VerificationStatus.VERIFIED_PASS:
            conclusion = "success"
        elif report.status == VerificationStatus.VERIFIED_FAILURE:
            conclusion = "failure"
        else:
            conclusion = "neutral"

        # 2. Extract line-level annotations for diff highlighting
        annotations: List[Dict[str, Any]] = []
        for finding in report.findings:
            if finding.file_path:
                line = finding.line_number or 1
                level = (
                    "failure"
                    if finding.severity.upper() in {"CRITICAL", "HIGH"}
                    else "warning"
                )
                if finding.status == VerificationStatus.STATIC_WARNING:
                    level = "warning"
                elif finding.status == VerificationStatus.AI_HYPOTHESIS:
                    level = "notice"

                message = (
                    finding.actual_behavior
                    or finding.expected_behavior
                    or finding.title
                )
                if finding.reproduction_command:
                    message += f"\nReproduction: {finding.reproduction_command}"

                annotations.append(
                    {
                        "path": finding.file_path.replace("\\", "/").lstrip("./"),
                        "start_line": line,
                        "end_line": line,
                        "annotation_level": level,
                        "title": f"[{finding.severity}] {finding.title[:60]}",
                        "message": message[:1000],
                        "raw_details": (finding.execution_trace or "")[:4000],
                    }
                )

        # Cap GitHub annotations to 50 max per API call per GitHub limit
        annotations = annotations[:50]

        summary_text = (
            f"### Invariant Continuous Verification Results\n\n"
            f"* **Run ID**: `{report.run_id}`\n"
            f"* **Status**: `{report.status.value}`\n"
            f"* **Duration**: {report.duration_ms} ms\n"
            f"* **Invariants Evaluated**: {report.invariants_evaluated}\n"
            f"* **Passed**: {report.passed_count} | **Failed**: {report.failed_count} | "
            f"**AI Hypotheses**: {report.hypothesis_count}\n\n"
            f"> {report.summary}"
        )

        full_markdown = self.report_generator.generate(report)

        return {
            "name": "Invariant Verification",
            "head_sha": commit_sha,
            "status": status,
            "conclusion": conclusion if status == "completed" else None,
            "output": {
                "title": (
                    f"Invariant: {report.status.value} "
                    f"({report.passed_count} passed, {report.failed_count} failed)"
                ),
                "summary": summary_text,
                "text": full_markdown,
                "annotations": annotations,
            },
        }

    def publish_check_run(
        self,
        owner: str,
        repo: str,
        commit_sha: str,
        report: VerificationReport,
    ) -> Dict[str, Any]:
        """Publish check run to GitHub API or return dry-run payload if token is unset."""
        payload = self.build_check_run_payload(report=report, commit_sha=commit_sha)

        if not self.github_token:
            logger.info(
                "No GitHub token configured; check run produced in dry-run mode."
            )
            return {
                "status": "dry_run",
                "posted": False,
                "payload": payload,
                "message": (
                    "GitHub token not provided. "
                    "Generated valid Check Run payload in offline/dry-run mode."
                ),
            }

        url = f"https://api.github.com/repos/{owner}/{repo}/check-runs"
        data_bytes = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=data_bytes,
            headers={
                "Authorization": f"Bearer {self.github_token}",
                "Accept": "application/vnd.github+json",
                "User-Agent": "Invariant-Verification-Platform",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
                return {
                    "status": "published",
                    "posted": True,
                    "check_run_id": resp_data.get("id"),
                    "html_url": resp_data.get("html_url"),
                    "payload": payload,
                }
        except urllib.error.HTTPError as e:
            error_body = e.read().decode("utf-8", errors="ignore")
            logger.error(f"GitHub Checks API HTTP error {e.code}: {error_body}")
            return {
                "status": "error",
                "posted": False,
                "http_code": e.code,
                "error": error_body,
                "payload": payload,
            }
        except Exception as e:
            logger.error(f"Failed to post check run to GitHub: {str(e)}")
            return {
                "status": "error",
                "posted": False,
                "error": str(e),
                "payload": payload,
            }
