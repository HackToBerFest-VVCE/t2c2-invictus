"""Seed utility to populate realistic demonstration data for Invariant MVP."""

import datetime
from sqlalchemy.orm import Session
from ..core.database import SessionLocal
from ..models.models import RepositoryDB, VerificationRunDB, FindingDB


def seed_demo_data(db: Session = None) -> dict:
    """Seed baseline, regression, and fixed runs for demonstration."""
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True

    try:
        # 1. Connected Repository
        repo_id = "HackToBerFest-VVCE/t2c2-invictus"
        repo = db.query(RepositoryDB).filter_by(id=repo_id).first()
        if not repo:
            repo = RepositoryDB(
                id=repo_id,
                owner="HackToBerFest-VVCE",
                name="t2c2-invictus",
                full_name="HackToBerFest-VVCE/t2c2-invictus",
                default_branch="main",
            )
            db.add(repo)
            db.commit()

        # Helper to safely create or update runs
        def get_or_create_run(run_id: str, **kwargs) -> VerificationRunDB:
            r = db.query(VerificationRunDB).filter_by(id=run_id).first()
            if not r:
                r = VerificationRunDB(id=run_id, **kwargs)
                db.add(r)
                db.commit()
            return r

        # 2. Run 1: Baseline Clean Run (Commit a10f92b)
        run_baseline = get_or_create_run(
            run_id="run_demo_baseline_a10f",
            repository_id=repo_id,
            commit_sha="a10f92b3c4e5",
            branch="main",
            event_type="push",
            status="VERIFIED_PASS",
            summary=(
                "All 3 invariants verified passed against isolated test suite. "
                "Zero invariant violations detected."
            ),
            duration_ms=315,
            is_async=False,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2),
            completed_at=datetime.datetime.utcnow() - datetime.timedelta(hours=2),
        )

        # Baseline findings
        if not run_baseline.findings:
            f1 = FindingDB(
                id="FIND-DEMO-001",
                run_id=run_baseline.id,
                invariant_id="INV-001",
                title="Verified Invariant: Non-Negative Stock Balance",
                severity="CRITICAL",
                verification_status="VERIFIED_PASS",
                lifecycle_status="resolved",
                confidence="HIGH",
                file_path="src/inventory.py",
                line_number=45,
                expected_behavior="Stock quantity for any SKU must never drop below 0.",
                actual_behavior="Verified passing across all test suite assertions.",
                reproduction_command="pytest tests/test_inventory.py::test_stock_bounds -v",
                execution_trace="3 passed, 0 failed in 0.08s",
                ai_assisted=False,
            )
            f2 = FindingDB(
                id="FIND-DEMO-002",
                run_id=run_baseline.id,
                invariant_id="INV-002",
                title="Verified Invariant: Conservation of Inventory State",
                severity="CRITICAL",
                verification_status="VERIFIED_PASS",
                lifecycle_status="resolved",
                confidence="HIGH",
                file_path="src/inventory.py",
                line_number=88,
                expected_behavior="Total inventory (available + reserved) must remain constant.",
                actual_behavior="Verified passing across all state transitions.",
                reproduction_command="pytest tests/test_inventory.py::test_conservation -v",
                execution_trace="4 passed, 0 failed in 0.11s",
                ai_assisted=False,
            )
            f3 = FindingDB(
                id="FIND-DEMO-003",
                run_id=run_baseline.id,
                invariant_id="INV-003",
                title="Verified Invariant: Idempotent Reservation Cancellation",
                severity="HIGH",
                verification_status="VERIFIED_PASS",
                lifecycle_status="resolved",
                confidence="HIGH",
                file_path="src/inventory.py",
                line_number=132,
                expected_behavior="Canceling a reservation more than once must be a no-op.",
                actual_behavior="Verified idempotent under repeated calls.",
                reproduction_command="pytest tests/test_inventory.py::test_cancel_idempotence -v",
                execution_trace="2 passed, 0 failed in 0.05s",
                ai_assisted=False,
            )
            db.add_all([f1, f2, f3])
            db.commit()

        # 3. Run 2: Regression Run with Invariant Violation (Commit b21e84c)
        run_regression = get_or_create_run(
            run_id="run_demo_regression_b21e",
            repository_id=repo_id,
            commit_sha="b21e84c7d8a9",
            branch="refactor/fast-checkout",
            event_type="pull_request",
            status="VERIFIED_FAILURE",
            summary=(
                "Invariant violation detected in isolated runner: "
                "INV-001 violated under concurrent reserve requests."
            ),
            duration_ms=442,
            is_async=False,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=45),
            completed_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=45),
        )

        if not run_regression.findings:
            r_fail = FindingDB(
                id="FIND-DEMO-FAIL",
                run_id=run_regression.id,
                invariant_id="INV-001",
                title="Concurrent Reservation Race Condition - Stock Dipped Below Zero",
                severity="CRITICAL",
                verification_status="VERIFIED_FAILURE",
                lifecycle_status="confirmed",
                confidence="HIGH",
                file_path="src/inventory.py",
                line_number=52,
                expected_behavior="Stock quantity for any SKU must never drop below 0.",
                actual_behavior=(
                    "Under 10 parallel reservation workers, SKU-402 inventory dropped to -3."
                ),
                reproduction_command=(
                    "pytest tests/test_inventory.py::test_concurrent_reserve_underflow -v"
                ),
                execution_trace=(
                    "AssertionError: Expected balance >= 0, but received -3 "
                    "during thread sync test.\n"
                    "  File src/inventory.py, line 52, in reserve_stock\n"
                    "    self.stock[sku] -= quantity\n"
                    "FAILED tests/test_inventory.py::test_concurrent_reserve_underflow"
                ),
                suggested_fix=(
                    "Wrap reservation quantity deduction in an atomic transaction or acquire "
                    "a row-level lock (SELECT FOR UPDATE) on the inventory record."
                ),
                reviewer_notes="Confirmed reproduced locally with pytest. Blocking merge.",
                ai_assisted=False,
            )
            r_hyp = FindingDB(
                id="FIND-DEMO-HYP",
                run_id=run_regression.id,
                invariant_id="INV-002",
                title="AI Hypothesis: Missing Check on Partial Release Invalidation",
                severity="HIGH",
                verification_status="AI_HYPOTHESIS",
                lifecycle_status="unconfirmed",
                confidence="MEDIUM",
                file_path="src/inventory.py",
                line_number=95,
                expected_behavior="State conservation preserved during timeout rollback.",
                actual_behavior=(
                    "Hypothesized race when payment webhook aborts during reservation expiration."
                ),
                reproduction_command="pytest tests/test_inventory.py -k 'test_webhook_abort'",
                execution_trace=(
                    "Spec analysis indicated unverified boundary condition for INV-002: "
                    "Partial cancellation with concurrent release."
                ),
                suggested_fix="Introduce explicit idempotency key to rollback handlers.",
                ai_assisted=True,
            )
            db.add_all([r_fail, r_hyp])
            db.commit()

        # 4. Run 3: Fixed Run (Commit c34d71e)
        run_fix = get_or_create_run(
            run_id="run_demo_fixed_c34d",
            repository_id=repo_id,
            commit_sha="c34d71e0f1b2",
            branch="refactor/fast-checkout",
            event_type="pull_request",
            status="VERIFIED_PASS",
            summary=(
                "Regression RESOLVED. Atomic locking verified across 10 concurrent threads. "
                "All 3 invariants passed with 0 failures."
            ),
            duration_ms=338,
            is_async=False,
            created_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=10),
            completed_at=datetime.datetime.utcnow() - datetime.timedelta(minutes=10),
        )

        if not run_fix.findings:
            f_res = FindingDB(
                id="FIND-DEMO-RESOLVED",
                run_id=run_fix.id,
                invariant_id="INV-001",
                title="Verified Invariant: Non-Negative Stock Balance (Atomic Lock Verified)",
                severity="CRITICAL",
                verification_status="VERIFIED_PASS",
                lifecycle_status="resolved",
                confidence="HIGH",
                file_path="src/inventory.py",
                line_number=48,
                expected_behavior="Stock quantity for any SKU must never drop below 0.",
                actual_behavior="Verified passing with 10 threads: 0 underflow occurrences.",
                reproduction_command=(
                    "pytest tests/test_inventory.py::test_concurrent_reserve_underflow -v"
                ),
                execution_trace="10/10 concurrent reservation batches verified clean in 0.14s",
                ai_assisted=False,
            )
            f_con = FindingDB(
                id="FIND-DEMO-FIX2",
                run_id=run_fix.id,
                invariant_id="INV-002",
                title="Verified Invariant: Conservation of Inventory State",
                severity="CRITICAL",
                verification_status="VERIFIED_PASS",
                lifecycle_status="resolved",
                confidence="HIGH",
                file_path="src/inventory.py",
                line_number=88,
                expected_behavior="Total inventory (available + reserved) remains constant.",
                actual_behavior="Verified passing across all test suite assertions.",
                reproduction_command="pytest tests/test_inventory.py::test_conservation -v",
                execution_trace="4 passed in 0.10s",
                ai_assisted=False,
            )
            f_idem = FindingDB(
                id="FIND-DEMO-FIX3",
                run_id=run_fix.id,
                invariant_id="INV-003",
                title="Verified Invariant: Idempotent Reservation Cancellation",
                severity="HIGH",
                verification_status="VERIFIED_PASS",
                lifecycle_status="resolved",
                confidence="HIGH",
                file_path="src/inventory.py",
                line_number=132,
                expected_behavior="Canceling a reservation more than once must be a no-op.",
                actual_behavior="Verified idempotent under repeated calls.",
                reproduction_command="pytest tests/test_inventory.py::test_cancel_idempotence -v",
                execution_trace="2 passed in 0.05s",
                ai_assisted=False,
            )
            db.add_all([f_res, f_con, f_idem])
            db.commit()

        return {
            "status": "success",
            "message": "Demo verification runs seeded successfully.",
            "runs": [
                {
                    "id": run_baseline.id,
                    "status": run_baseline.status,
                    "commit": run_baseline.commit_sha,
                },
                {
                    "id": run_regression.id,
                    "status": run_regression.status,
                    "commit": run_regression.commit_sha,
                },
                {
                    "id": run_fix.id,
                    "status": run_fix.status,
                    "commit": run_fix.commit_sha,
                },
            ],
        }
    finally:
        if should_close:
            db.close()
