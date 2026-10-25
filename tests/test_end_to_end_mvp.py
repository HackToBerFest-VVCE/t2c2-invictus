"""End-to-End MVP Verification Pipeline Test."""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from services.api.app.core.database import Base
from services.api.app.services.verification_service import VerificationService
from packages.verifier.models import VerificationStatus


def test_end_to_end_verification_pipeline() -> None:
    """Validate full flow: Parse spec -> Execute tests -> AI hypotheses -> Save DB."""
    # Setup test in-memory SQLite database
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    SessionTest = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionTest()

    try:
        service = VerificationService(db=db)
        inv_dir = os.path.join("examples", "inventory-api")

        report = service.execute_verification(
            workspace_path=inv_dir,
            spec_path="INVARIANT.md",
            repository_id="inventory-api-repo",
            commit_sha="c0ffee123456",
            branch="feature/invariants",
            event_type="push",
        )

        # Invariant checks:
        assert report.status == VerificationStatus.VERIFIED_PASS
        assert report.passed_count >= 5
        assert report.failed_count == 0
        assert report.invariants_evaluated >= 3

        # Verify AI hypotheses were generated without overriding test pass
        assert report.hypothesis_count > 0
        hyp_findings = [
            f for f in report.findings if f.status == VerificationStatus.AI_HYPOTHESIS
        ]
        assert len(hyp_findings) > 0
        for hyp in hyp_findings:
            assert hyp.ai_assisted is True
            # INV-03: AI Hypothesis must never be marked as a verified failure
            assert hyp.status != VerificationStatus.VERIFIED_FAILURE

        # Verify database persistence
        from services.api.app.models.models import VerificationRunDB, FindingDB

        db_run = db.query(VerificationRunDB).filter_by(id=report.run_id).first()
        assert db_run is not None
        assert db_run.status == "VERIFIED_PASS"
        assert db_run.commit_sha == "c0ffee123456"

        db_findings = db.query(FindingDB).filter_by(run_id=report.run_id).all()
        assert len(db_findings) == len(report.findings)

    finally:
        db.close()
