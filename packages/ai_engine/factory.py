"""Provider factory for Invariant AI Engine with automatic environment detection."""

import os
from .interfaces import BaseAIProvider
from .providers.mock_provider import MockAIProvider
from .providers.gemini_provider import GeminiAIProvider
from .providers.api_provider import GenericAPIProvider


def get_default_ai_provider() -> BaseAIProvider:
    """Return configured AI provider based on environment variables."""
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        model = os.environ.get("GEMINI_MODEL", "gemini-1.5-flash")
        return GeminiAIProvider(api_key=gemini_key, model_name=model)

    openai_key = os.environ.get("OPENAI_API_KEY")
    if openai_key:
        base_url = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")
        model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
        return GenericAPIProvider(
            api_key=openai_key, base_url=base_url, model_name=model
        )

    return MockAIProvider()
