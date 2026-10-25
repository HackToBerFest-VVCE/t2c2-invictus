"""Normalizer for mapping raw test results and AI hypotheses into structured findings."""

import datetime
import uuid
from typing import List, Optional
from packages.verifier.models import TestExecutionResult, VerificationStatus
from packages.spec_engine.models import InvariantSpec
from packages.ai_engine.interfaces import AIHypothesis
from .models import VerificationFinding, VerificationReport


class FindingNormalizer:
    """Normalizes raw outputs into formal Invariant finding models."""

    def normalize(
        self,
        test_result: TestExecutionResult,
        spec: Optional[InvariantSpec] = None,
        hypotheses: Optional[List[AIHypothesis]] = None,
        run_id: Optional[str] = None,
    ) -> VerificationReport:
        run_id = run_id or f"run_{uuid.uuid4().hex[:12]}"
        findings: List[VerificationFinding] = []
        hypotheses = hypotheses or []
        inv_count = len(spec.invariants) if spec else 0

        # 1. Process test failures into VERIFIED_FAILURE findings
        if test_result.failure_details:
            for detail in test_result.failure_details:
                test_name = detail.get("test_name", "Unknown Test")
                trace = detail.get("trace", "")

                # Try to associate with an invariant ID from spec
                matched_inv = None
                if spec:
                    for inv in spec.invariants:
                        if (
                            inv.id.lower() in test_name.lower()
                            or inv.title.lower() in test_name.lower()
                        ):
                            matched_inv = inv
                            break

                inv_id = matched_inv.id if matched_inv else None
                severity = matched_inv.severity if matched_inv else "HIGH"

                findings.append(
                    VerificationFinding(
                        finding_id=f"FIND-{uuid.uuid4().hex[:6].upper()}",
                        title=f"Test Failure in {test_name}",
                        invariant_id=inv_id,
                        severity=severity,
                        status=VerificationStatus.VERIFIED_FAILURE,
                        expected_behavior="Test assertion should hold true without exceptions.",
                        actual_behavior=f"Assertion failed in {test_name}.",
                        reproduction_command=test_result.evidence.reproduction_command,
                        execution_trace=trace,
                        ai_assisted=False,
                    )
                )
        elif (
            test_result.status == VerificationStatus.VERIFIED_FAILURE
            and not test_result.failure_details
        ):
            findings.append(
                VerificationFinding(
                    finding_id=f"FIND-{uuid.uuid4().hex[:6].upper()}",
                    title="Reproduced Test Suite Failure",
                    invariant_id=None,
                    severity="HIGH",
                    status=VerificationStatus.VERIFIED_FAILURE,
                    actual_behavior=test_result.error_message
                    or "Test harness returned non-zero exit code.",
                    reproduction_command=test_result.evidence.reproduction_command,
                    execution_trace=test_result.evidence.stderr
                    or test_result.evidence.stdout,
                )
            )

        # 2. Add AI hypotheses as AI_HYPOTHESIS status (never marked as verified failure!)
        for hyp in hypotheses:
            findings.append(
                VerificationFinding(
                    finding_id=hyp.id,
                    title=hyp.title,
                    invariant_id=hyp.invariant_id,
                    severity=hyp.severity,
                    status=VerificationStatus.AI_HYPOTHESIS,
                    expected_behavior="System maintains invariant under boundary inputs.",
                    actual_behavior=hyp.postulated_scenario,
                    reproduction_command=hyp.suggested_test_input,
                    execution_trace=hyp.description,
                    ai_assisted=True,
                )
            )

        # 3. Overall status resolution: failures override pass
        if test_result.status == VerificationStatus.VERIFIED_FAILURE:
            overall_status = VerificationStatus.VERIFIED_FAILURE
            summary = f"Verification FAILED. {test_result.failed_count} test(s) failed."
        elif test_result.status == VerificationStatus.CHECK_ERROR:
            overall_status = VerificationStatus.CHECK_ERROR
            summary = (
                f"Verification check encountered an error: {test_result.error_message}"
            )
        elif test_result.status == VerificationStatus.UNSUPPORTED:
            overall_status = VerificationStatus.UNSUPPORTED
            summary = "No supported test harness detected or zero tests collected."
        else:
            overall_status = VerificationStatus.VERIFIED_PASS
            summary = f"All {test_result.passed_count} test checks PASSED successfully."

        return VerificationReport(
            run_id=run_id,
            status=overall_status,
            timestamp=datetime.datetime.now(datetime.timezone.utc).isoformat(),
            duration_ms=test_result.evidence.duration_ms,
            invariants_evaluated=inv_count,
            findings=findings,
            summary=summary,
            passed_count=test_result.passed_count,
            failed_count=test_result.failed_count,
            hypothesis_count=len(hypotheses),
        )
