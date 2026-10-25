"""Provider-independent AI engine interfaces and hypothesis models."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any


@dataclass
class AIHypothesis:
    """Represents an AI-generated hypothesis or edge-case suggestion.

    CRITICAL INVARIANT RULE (INV-03):
    An AIHypothesis is strictly advisory and non-authoritative. It must never be
    treated as a confirmed failure unless independently reproduced by an isolated runner.
    """

    id: str
    invariant_id: Optional[str]
    title: str
    description: str
    postulated_scenario: str
    severity: str = "MEDIUM"
    suggested_test_input: Optional[str] = None
    affected_files: List[str] = field(default_factory=list)
    confidence: float = 0.5
    raw_ai_response: Optional[str] = None


@dataclass
class AIRequestPayload:
    """Input payload sent to AI providers for edge-case derivation."""

    target_system: str
    invariants: List[Dict[str, Any]]
    diff_content: str = ""
    file_context: Optional[str] = None


class BaseAIProvider(ABC):
    """Abstract provider-independent AI model interface."""

    @abstractmethod
    def provider_name(self) -> str:
        """Name of the provider (e.g., 'mock', 'openai', 'anthropic')."""
        pass

    @abstractmethod
    def generate_hypotheses(self, payload: AIRequestPayload) -> List[AIHypothesis]:
        """Generate structured edge-case hypotheses from specification clauses and diffs."""
        pass
