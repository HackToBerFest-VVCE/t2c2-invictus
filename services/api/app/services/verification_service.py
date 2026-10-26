"""Verification orchestrator service."""

import os
import uuid
import json
import datetime
from typing import Optional
from sqlalchemy.orm import Session

from packages.spec_engine.parser import SpecParser
from packages.verifier.runner import IsolatedRunner
from packages.ai_engine.analyzer import AIAnalyzer
from packages.ai_engine.providers.mock_provider import MockAIProvider
from packages.ai_engine.providers.api_provider import GenericAPIProvider
from packages.report_engine.normalizer import FindingNormalizer
from packages.report_engine.models import VerificationReport
from .github_checks import GitHubChecksService
from ..core.config import settings
from ..models.models import RepositoryDB, VerificationRunDB, FindingDB


class VerificationService:
    """Orchestrates end-to-end continuous verification workflow."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.spec_parser = SpecParser()
        self.normalizer = FindingNormalizer()
        self.github_checks = GitHubChecksService(github_token=settings.github_token)

        # Initialize AI Analyzer based on environment configuration
        if settings.ai_provider == "api" and settings.ai_api_key:
            provider = GenericAPIProvider(
                api_key=settings.ai_api_key,
                base_url=settings.ai_api_base_url,
                model_name=settings.ai_model_name,
            )
        else:
            provider = MockAIProvider()

        self.ai_analyzer = AIAnalyzer(provider=provider)

    def execute_verification(
        self,
        workspace_path: str,
        spec_path: str = "INVARIANT.md",
        repository_id: str = "default-repo",
        commit_sha: str = "HEAD",
        branch: str = "main",
        event_type: str = "manual",
        delivery_id: Optional[str] = None,
        run_id: Optional[str] = None,
        is_async: bool = False,
    ) -> VerificationReport:
        """Run complete verification pipeline and persist results."""
        active_run_id = run_id or f"run_{uuid.uuid4().hex[:12]}"
        full_spec_path = os.path.join(workspace_path, spec_path)

        # 1. Parse Specification
        spec = None
        if os.path.exists(full_spec_path):
            spec = self.spec_parser.parse_file(full_spec_path)

        # 2. Run Isolated Verifier
        runner = IsolatedRunner(
            workspace_root=workspace_path,
            timeout_seconds=settings.runner_timeout_seconds,
        )
        test_result = runner.auto_verify()

        # 3. AI Hypothesis Generation (Strictly Bounded)
        hypotheses = []
        if spec and spec.invariants:
            hypotheses = self.ai_analyzer.analyze_spec(spec)

        # 4. Normalize Results
        report = self.normalizer.normalize(
            test_result=test_result,
            spec=spec,
            hypotheses=hypotheses,
            run_id=active_run_id,
        )

        # 5. Persist to Database
        self._save_to_db(
            report=report,
            repository_id=repository_id,
            commit_sha=commit_sha,
            branch=branch,
            event_type=event_type,
            delivery_id=delivery_id,
            is_async=is_async,
        )

        # 6. Publish GitHub Check Run if configured
        try:
            repo_parts = repository_id.split("/")
            owner = repo_parts[0] if len(repo_parts) > 1 else "local"
            repo_name = repo_parts[1] if len(repo_parts) > 1 else repository_id
            self.github_checks.publish_check_run(
                owner=owner,
                repo=repo_name,
                commit_sha=commit_sha,
                report=report,
            )
        except Exception:
            pass  # Non-blocking for offline or mock scenarios

        return report

    def _save_to_db(
        self,
        report: VerificationReport,
        repository_id: str,
        commit_sha: str,
        branch: str,
        event_type: str,
        delivery_id: Optional[str],
        is_async: bool = False,
    ) -> None:
        """Commit verification run and findings to relational store."""
        # Ensure repository record exists
        repo = self.db.query(RepositoryDB).filter_by(id=repository_id).first()
        if not repo:
            repo_parts = repository_id.split("/")
            owner = repo_parts[0] if len(repo_parts) > 1 else "local"
            name = repo_parts[1] if len(repo_parts) > 1 else repository_id
            repo = RepositoryDB(
                id=repository_id,
                owner=owner,
                name=name,
                full_name=repository_id if "/" in repository_id else f"{owner}/{name}",
                default_branch=branch,
            )
            self.db.add(repo)
            self.db.commit()

        plan_meta = json.dumps(
            {
                "invariants_evaluated": report.invariants_evaluated,
                "passed_count": report.passed_count,
                "failed_count": report.failed_count,
                "hypothesis_count": report.hypothesis_count,
            }
        )

        # Check if run record was already created (e.g. async pre-creation)
        run_db = self.db.query(VerificationRunDB).filter_by(id=report.run_id).first()
        now = datetime.datetime.utcnow()
        if run_db:
            run_db.status = report.status.value
            run_db.summary = report.summary
            run_db.duration_ms = report.duration_ms
            run_db.plan_metadata = plan_meta
            run_db.completed_at = now
        else:
            run_db = VerificationRunDB(
                id=report.run_id,
                repository_id=repository_id,
                commit_sha=commit_sha,
                branch=branch,
                event_type=event_type,
                delivery_id=delivery_id,
                status=report.status.value,
                summary=report.summary,
                duration_ms=report.duration_ms,
                is_async=is_async,
                plan_metadata=plan_meta,
                created_at=now,
                completed_at=now,
            )
            self.db.add(run_db)

        # Clear existing findings for this run if re-running
        self.db.query(FindingDB).filter_by(run_id=report.run_id).delete()

        for f in report.findings:
            suggested_fix = (
                f"Verify requirements for '{f.invariant_id}' and add boundary checks."
                if f.invariant_id
                else "Review execution trace and resolve invariant assertion."
            )
            finding_db = FindingDB(
                id=f.finding_id,
                run_id=report.run_id,
                invariant_id=f.invariant_id,
                title=f.title,
                severity=f.severity,
                verification_status=f.status.value,
                lifecycle_status="unconfirmed",
                confidence="HIGH" if not f.ai_assisted else "MEDIUM",
                file_path=f.file_path,
                line_number=f.line_number,
                expected_behavior=f.expected_behavior,
                actual_behavior=f.actual_behavior,
                reproduction_command=f.reproduction_command,
                execution_trace=f.execution_trace,
                suggested_fix=suggested_fix,
                ai_assisted=f.ai_assisted,
                created_at=now,
                updated_at=now,
            )
            self.db.add(finding_db)

        self.db.commit()
