"""Mock AI provider for offline testing and deterministic CI runs."""

import uuid
from typing import List
from ..interfaces import BaseAIProvider, AIRequestPayload, AIHypothesis


class MockAIProvider(BaseAIProvider):
    """Deterministic, offline-friendly AI provider that derives realistic edge cases
    from invariant rules.
    """

    def provider_name(self) -> str:
        return "mock"

    def generate_hypotheses(self, payload: AIRequestPayload) -> List[AIHypothesis]:
        hypotheses: List[AIHypothesis] = []

        for inv in payload.invariants:
            inv_id = inv.get("id", "INV-GEN")
            title = inv.get("title", "Invariant")
            rule = inv.get("rule_statement", "")

            # Generate synthetic boundary hypothesis based on rule keywords
            if (
                "stock" in rule.lower()
                or "balance" in rule.lower()
                or "greater" in rule.lower()
            ):
                hypotheses.append(
                    AIHypothesis(
                        id=f"HYP-{uuid.uuid4().hex[:6].upper()}",
                        invariant_id=inv_id,
                        title=f"Boundary Underflow Check for {title}",
                        description=(
                            f"AI-suggested edge case evaluating negative value boundary "
                            f"conditions for rule: {rule}"
                        ),
                        postulated_scenario=(
                            "Simultaneous decrement or reservation requests totaling more "
                            "than current stock capacity."
                        ),
                        severity="HIGH",
                        suggested_test_input="quantity = current_stock + 1",
                        confidence=0.75,
                    )
                )

            if "idempotent" in rule.lower() or "cancel" in rule.lower():
                hypotheses.append(
                    AIHypothesis(
                        id=f"HYP-{uuid.uuid4().hex[:6].upper()}",
                        invariant_id=inv_id,
                        title=f"Repeated Execution Idempotency for {title}",
                        description=(
                            "AI-suggested edge case testing whether multiple duplicate "
                            "cancellation calls produce identical post-state."
                        ),
                        postulated_scenario=(
                            "Dispatching identical cancellation payload twice in rapid succession."
                        ),
                        severity="MEDIUM",
                        suggested_test_input="duplicate_call_count = 3",
                        confidence=0.70,
                    )
                )

        # Fallback if no specific keyword matched
        if not hypotheses and payload.invariants:
            first_inv = payload.invariants[0]
            hypotheses.append(
                AIHypothesis(
                    id=f"HYP-{uuid.uuid4().hex[:6].upper()}",
                    invariant_id=first_inv.get("id"),
                    title="Null and Malformed Payload Boundary",
                    description=(
                        "AI-suggested edge case sending empty or unexpected property values."
                    ),
                    postulated_scenario=(
                        "Empty request payload or missing required identifier field."
                    ),
                    severity="LOW",
                    confidence=0.50,
                )
            )

            return hypotheses

    def generate_fix(
        self,
        invariant_rule: str,
        failure_trace: str,
        code_context: str,
    ) -> dict:
        """Deterministic heuristic fix generator when no LLM API key is present."""
        is_balance_or_race = (
            "balance" in invariant_rule.lower()
            or "concurrency" in failure_trace.lower()
            or "underflow" in failure_trace.lower()
        )
        if is_balance_or_race:
            return {
                "root_cause": (
                    "Race condition or missing atomic constraint allowed state "
                    "mutation below required boundary."
                ),
                "suggested_fix": (
                    "Guard state transitions with threading locks or atomic database "
                    "transactions (SELECT FOR UPDATE) to ensure balance >= 0."
                ),
                "replacement_code": (
                    "with self._lock:\n"
                    "    if self.stock.get(sku, 0) < quantity:\n"
                    "        raise InsufficientStockError(f'Insufficient stock for {sku}')\n"
                    "    self.stock[sku] -= quantity"
                ),
                "confidence": "MEDIUM",
            }
        return {
            "root_cause": "Assertion failure indicating invariant specification violation.",
            "suggested_fix": (
                "Add defensive parameter validation and verify post-conditions match invariant."
            ),
            "replacement_code": "",
            "confidence": "LOW",
        }
