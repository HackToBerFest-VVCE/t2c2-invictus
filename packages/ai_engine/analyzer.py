"""High-level AI analysis service with strict non-authoritative boundary enforcement."""

from typing import List, Optional
from packages.spec_engine.models import InvariantSpec
from .interfaces import BaseAIProvider, AIHypothesis, AIRequestPayload
from .providers.mock_provider import MockAIProvider


class AIAnalyzer:
    """Coordinates AI-assisted hypothesis generation with strict behavioral boundaries.
    
    GUARANTEE: AI outputs are always tagged as advisory hypotheses and cannot directly
    cause a verification run to fail without dynamic test evidence.
    """

    def __init__(self, provider: Optional[BaseAIProvider] = None) -> None:
        self.provider = provider or MockAIProvider()

    def analyze_spec(
        self, spec: InvariantSpec, diff_content: str = ""
    ) -> List[AIHypothesis]:
        """Generate structured edge-case hypotheses for the declared invariants."""
        inv_payload = [
            {
                "id": inv.id,
                "title": inv.title,
                "rule_statement": inv.rule_statement,
                "formal_assertion": inv.formal_assertion,
                "severity": inv.severity,
            }
            for inv in spec.invariants
        ]

        payload = AIRequestPayload(
            target_system=spec.metadata.target_system,
            invariants=inv_payload,
            diff_content=diff_content,
        )

        return self.provider.generate_hypotheses(payload)
