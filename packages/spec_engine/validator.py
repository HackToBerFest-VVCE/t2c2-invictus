"""Specification validation and quality linting rules."""

from typing import List
from .models import InvariantSpec


class SpecValidator:
    """Validates Invariant specifications for testability, completeness, and clarity."""

    def validate(self, spec: InvariantSpec) -> List[str]:
        """Validate specification rules, returning a list of quality warnings/errors."""
        issues: List[str] = []

        if not spec.invariants:
            issues.append("CRITICAL: Specification defines zero invariant rules.")

        if not spec.project_overview:
            issues.append("WARNING: Missing Project Overview section.")

        for inv in spec.invariants:
            if not inv.id.startswith("INV-"):
                issues.append(f"WARNING: Invariant ID '{inv.id}' does not follow naming convention INV-XX.")

            if len(inv.rule_statement.split()) < 4:
                issues.append(f"WARNING: Invariant '{inv.id}' rule statement is too brief or ambiguous.")

            # Check for vague terms
            vague_words = ["fast", "good", "robust", "secure", "properly", "correctly", "normal"]
            words = inv.rule_statement.lower().split()
            for vw in vague_words:
                if vw in words and not inv.formal_assertion:
                    issues.append(
                        f"NOTICE: Invariant '{inv.id}' uses subjective term '{vw}' without a formal assertion."
                    )

        return issues
