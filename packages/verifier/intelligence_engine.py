"""Invariant Verification Intelligence Engine (VIE).

Evaluates suspected issues detected by AI reviewers, linters, or static analyzers
against project requirements (INVARIANT.md), code changes, and empirical test evidence
before classifying and reporting findings.
"""

import os
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional, Dict

from packages.spec_engine.parser import SpecParser
from packages.spec_engine.models import InvariantSpec, InvariantRule
from packages.verifier.runner import IsolatedRunner
from packages.verifier.models import VerificationStatus
from packages.ai_engine.factory import get_default_ai_provider


class ClassificationStatus(str, Enum):
    """The 5-tier empirical verification status taxonomy."""

    REPRODUCED = "Reproduced"
    STRONGLY_SUPPORTED = "Strongly Supported"
    POTENTIAL = "Potential"
    INCONCLUSIVE = "Inconclusive"
    FALSE_POSITIVE = "False Positive"


@dataclass
class SuspectedIssue:
    """A candidate defect or invariant violation flagged by detection tools."""

    issue_id: str
    title: str
    description: str
    target_file: str
    affected_lines: str = ""
    diff_patch: Optional[str] = None
    candidate_test_code: Optional[str] = None
    candidate_test_command: Optional[str] = None
    detection_source: str = "ai_reviewer"
    severity: str = "HIGH"
    rule_hint: Optional[str] = None


@dataclass
class VerificationEvidence:
    """Empirical and semantic evidence collected during verification."""

    matched_invariants: List[Dict[str, str]] = field(default_factory=list)
    code_context: str = ""
    has_test_gap: bool = False
    reproduction_command: Optional[str] = None
    exit_code: Optional[int] = None
    execution_trace: Optional[str] = None
    test_duration_ms: int = 0
    test_integrity: str = "NOT_EXECUTED"
    differential_result: Optional[str] = None


@dataclass
class VerifiedClassificationResult:
    """Final, evidence-backed evaluation of a suspected issue."""

    finding_id: str
    issue_id: str
    title: str
    classification: ClassificationStatus
    severity: str
    confidence_score: float
    matched_invariant_id: Optional[str]
    reasoning: List[str]
    affected_code: str
    evidence: VerificationEvidence
    suggested_action: str
    suggested_patch: Optional[str] = None


class VerificationIntelligenceEngine:
    """Post-detection verification engine for filtering false positives and proving bugs."""

    def __init__(self, workspace_root: str = ".", spec_path: str = "INVARIANT.md") -> None:
        self.workspace_root = os.path.abspath(workspace_root)
        self.spec_path = spec_path
        self.spec_parser = SpecParser()
        self.ai_provider = get_default_ai_provider()

    def evaluate_issue(
        self,
        issue: SuspectedIssue,
        runner_timeout_seconds: int = 60,
    ) -> VerifiedClassificationResult:
        """Execute the 7-step empirical verification workflow on a suspected issue."""
        reasoning: List[str] = []
        finding_id = f"VIE-{uuid.uuid4().hex[:8].upper()}"

        # ---------------------------------------------------------
        # Step 1: Parse and Ground Against INVARIANT.md
        # ---------------------------------------------------------
        full_spec_path = os.path.join(self.workspace_root, self.spec_path)
        if not os.path.exists(full_spec_path):
            full_spec_path = os.path.join(self.workspace_root, "INVARIANT.md")

        spec: Optional[InvariantSpec] = None
        matched_inv: Optional[InvariantRule] = None
        matched_invariants_list: List[Dict[str, str]] = []

        if os.path.exists(full_spec_path):
            spec = self.spec_parser.parse_file(full_spec_path)
            reasoning.append(
                f"Parsed specification '{os.path.basename(full_spec_path)}' containing "
                f"{len(spec.invariants)} invariant(s) and {len(spec.contracts)} contract(s)."
            )

            # Match against explicit invariant rules
            for inv in spec.invariants:
                query = f"{issue.title} {issue.description} {issue.rule_hint or ''}".lower()

                # Keyword and identifier intersection
                if (
                    inv.id.lower() in query
                    or any(w in query for w in inv.title.lower().split() if len(w) > 4)
                ):
                    matched_invariants_list.append({
                        "id": inv.id,
                        "title": inv.title,
                        "rule": inv.rule_statement,
                        "assertion": inv.formal_assertion,
                    })
                    if not matched_inv:
                        matched_inv = inv

            if matched_inv:
                reasoning.append(
                    f"Grounded finding against invariant [{matched_inv.id}]: "
                    f"'{matched_inv.rule_statement}' (Severity: {matched_inv.severity})."
                )
            else:
                reasoning.append(
                    "Finding could not be mapped to any explicit rule in INVARIANT.md. "
                    "Classified as ungrounded candidate."
                )
        else:
            reasoning.append(f"Specification file not found at '{full_spec_path}'.")

        # ---------------------------------------------------------
        # Step 2: Analyze Affected Code and Diff
        # ---------------------------------------------------------
        code_context = ""
        full_target_file = os.path.join(self.workspace_root, issue.target_file)
        if os.path.exists(full_target_file):
            try:
                with open(full_target_file, "r", encoding="utf-8", errors="replace") as f:
                    lines = f.readlines()
                code_context = "".join(lines[:60])
                reasoning.append(
                    f"Inspected source file '{issue.target_file}' ({len(lines)} lines)."
                )
            except Exception as e:
                reasoning.append(f"Warning: Could not read target file: {e}")
        else:
            reasoning.append(f"Target file '{issue.target_file}' does not exist in workspace.")

        # Check for test gaps in affected domain
        has_test_gap = False
        if spec and spec.invariants:
            try:
                from services.api.app.services.test_gap_analyzer import (
                    TestGapAnalyzer,
                )

                gap_analyzer = TestGapAnalyzer(self.workspace_root)
                gap_report = gap_analyzer.analyze(spec)
                if matched_inv:
                    for inv_status in gap_report.invariants:
                        if (
                            inv_status.id == matched_inv.id
                            and inv_status.status != "COVERED"
                        ):
                            has_test_gap = True
                            reasoning.append(
                                f"AST Test-Gap Analysis confirms invariant [{matched_inv.id}] "
                                f"has no existing unit or property tests (Untested gap)."
                            )
                            break
            except Exception as e:
                reasoning.append(f"Test-gap analysis skipped: {e}")

        # ---------------------------------------------------------
        # Step 3: Run Isolated Reproduction Test
        # ---------------------------------------------------------
        runner = IsolatedRunner(
            workspace_root=self.workspace_root,
            timeout_seconds=runner_timeout_seconds,
        )

        evidence = VerificationEvidence(
            matched_invariants=matched_invariants_list,
            code_context=code_context[:300],
            has_test_gap=has_test_gap,
        )

        test_executed = False
        raw_result = None

        # Execute candidate reproduction command or auto-verify project test suite
        if issue.candidate_test_command:
            reasoning.append(
                f"Executing candidate reproduction command: '{issue.candidate_test_command}'"
            )
            raw_result = runner.run_command(issue.candidate_test_command)
            test_executed = True
        elif os.path.exists(os.path.join(self.workspace_root, "tests")):
            reasoning.append(
                "Executing existing workspace test suite to verify failure reproduction."
            )
            raw_result = runner.auto_verify()
            test_executed = True

        # ---------------------------------------------------------
        # Step 4: Evaluate Evidence and Execution Integrity
        # ---------------------------------------------------------
        if test_executed and raw_result:
            evidence.reproduction_command = raw_result.evidence.reproduction_command
            evidence.exit_code = raw_result.evidence.exit_code
            evidence.execution_trace = raw_result.evidence.stack_trace or raw_result.evidence.stderr
            evidence.test_duration_ms = raw_result.evidence.duration_ms

            if raw_result.status == VerificationStatus.CHECK_ERROR:
                evidence.test_integrity = "TIMEOUT_OR_CRASH"
                reasoning.append(
                    f"Execution watchdog triggered error or timeout: {raw_result.error_message}"
                )
            elif raw_result.status == VerificationStatus.VERIFIED_FAILURE:
                evidence.test_integrity = "ASSERTION_FAILURE"
                reasoning.append(
                    f"Reproduction test failed with exit code {raw_result.evidence.exit_code}. "
                    f"Concrete failure trace captured ({raw_result.failed_count} failure(s))."
                )
            elif raw_result.status == VerificationStatus.VERIFIED_PASS:
                evidence.test_integrity = "PASSING"
                reasoning.append(
                    f"Test execution succeeded with exit code 0 "
                    f"({raw_result.passed_count} assertions verified cleanly)."
                )
        else:
            evidence.test_integrity = "NOT_EXECUTED"
            reasoning.append(
                "Dynamic test reproduction was not executed (no runner or command provided)."
            )

        # ---------------------------------------------------------
        # Step 5: Classify Finding (5-Tier Taxonomy)
        # ---------------------------------------------------------
        confidence = 0.20
        suggested_action = "INVESTIGATE"
        classification = ClassificationStatus.POTENTIAL

        # Rule A: Concrete execution failure reproduced in sandbox
        if evidence.test_integrity == "ASSERTION_FAILURE":
            classification = ClassificationStatus.REPRODUCED
            confidence = 0.95
            suggested_action = "BLOCK_PR"
            reasoning.append(
                "CLASSIFICATION: 'Reproduced'. The suspected failure was conclusively reproduced "
                "in an isolated sandbox with recorded exit code != 0 and concrete assertion trace."
            )

        # Rule B: Clean passing test proves suspected issue did not manifest (False Positive)
        elif evidence.test_integrity == "PASSING":
            classification = ClassificationStatus.FALSE_POSITIVE
            confidence = 0.90
            suggested_action = "DISMISS_FALSE_POSITIVE"
            reasoning.append(
                "CLASSIFICATION: 'False Positive'. Reproduction test completed with exit code 0; "
                "all invariant assertions held true under empirical execution."
            )

        # Rule C: Execution timed out, crashed, or missing harness
        elif evidence.test_integrity == "TIMEOUT_OR_CRASH":
            classification = ClassificationStatus.INCONCLUSIVE
            confidence = 0.40
            suggested_action = "FIX_HARNESS"
            reasoning.append(
                "CLASSIFICATION: 'Inconclusive'. The verification check could not establish "
                "validity due to execution timeout, memory exhaustion, or harness misconfiguration."
            )

        # Rule D: Strong static & semantic signals without execution runner
        elif matched_inv and has_test_gap:
            classification = ClassificationStatus.STRONGLY_SUPPORTED
            confidence = 0.75
            suggested_action = "WARN_REVIEWER"
            reasoning.append(
                "CLASSIFICATION: 'Strongly Supported'. Multiple static/semantic signals "
                "corroborate the finding (explicit INVARIANT.md violation and confirmed "
                "untested test gap), though dynamic reproduction was not executed."
            )

        # Rule E: Plausible AI hypothesis without execution proof
        else:
            classification = ClassificationStatus.POTENTIAL
            confidence = 0.50
            suggested_action = "ADVISORY_NOTICE"
            reasoning.append(
                "CLASSIFICATION: 'Potential'. The issue is plausible based on code structure "
                "and AI hypothesis, but lacks empirical reproduction or corroborating static proof."
            )

        # ---------------------------------------------------------
        # Step 6: AI-Assisted Fix Suggestion (Optional synthesis)
        # ---------------------------------------------------------
        suggested_patch = None
        if classification in (
            ClassificationStatus.REPRODUCED,
            ClassificationStatus.STRONGLY_SUPPORTED,
        ):
            try:
                rule_stmt = matched_inv.rule_statement if matched_inv else issue.description
                ai_res = self.ai_provider.suggest_fix(
                    invariant_rule=rule_stmt,
                    failure_trace=evidence.execution_trace or issue.description,
                    file_context=code_context,
                )
                suggested_patch = ai_res.replacement_code
                reasoning.append(
                    f"Synthesized candidate code fix with {int(ai_res.confidence * 100)}% "
                    f"model confidence via {self.ai_provider.__class__.__name__}."
                )
            except Exception as e:
                reasoning.append(f"AI fix synthesis skipped: {e}")

        return VerifiedClassificationResult(
            finding_id=finding_id,
            issue_id=issue.issue_id,
            title=issue.title,
            classification=classification,
            severity=matched_inv.severity if matched_inv else issue.severity,
            confidence_score=round(confidence, 2),
            matched_invariant_id=matched_inv.id if matched_inv else None,
            reasoning=reasoning,
            affected_code=code_context[:400],
            evidence=evidence,
            suggested_action=suggested_action,
            suggested_patch=suggested_patch,
        )
