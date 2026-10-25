"""Mock AI provider for offline testing and deterministic CI runs."""

import uuid
from typing import List
from ..interfaces import BaseAIProvider, AIRequestPayload, AIHypothesis


class MockAIProvider(BaseAIProvider):
    """Deterministic, offline-friendly AI provider that derives realistic edge cases from invariant rules."""

    def provider_name(self) -> str:
        return "mock"

    def generate_hypotheses(self, payload: AIRequestPayload) -> List[AIHypothesis]:
        hypotheses: List[AIHypothesis] = []

        for inv in payload.invariants:
            inv_id = inv.get("id", "INV-GEN")
            title = inv.get("title", "Invariant")
            rule = inv.get("rule_statement", "")

            # Generate synthetic boundary hypothesis based on rule keywords
            if "stock" in rule.lower() or "balance" in rule.lower() or "greater" in rule.lower():
                hypotheses.append(
                    AIHypothesis(
                        id=f"HYP-{uuid.uuid4().hex[:6].upper()}",
                        invariant_id=inv_id,
                        title=f"Boundary Underflow Check for {title}",
                        description=f"AI-suggested edge case evaluating negative value boundary conditions for rule: {rule}",
                        postulated_scenario="Simultaneous decrement or reservation requests totaling more than current stock capacity.",
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
                        description="AI-suggested edge case testing whether multiple duplicate cancellation calls produce identical post-state.",
                        postulated_scenario="Dispatching identical cancellation payload twice in rapid succession.",
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
                    description="AI-suggested edge case sending empty or unexpected property values.",
                    postulated_scenario="Empty request payload or missing required identifier field.",
                    severity="LOW",
                    confidence=0.50,
                )
            )

        return hypotheses
