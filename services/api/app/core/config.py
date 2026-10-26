"""Application configuration and environment variables."""

import os
from typing import Optional


class Settings:
    """Loads configuration from environment with secure defaults."""

    def __init__(self) -> None:
        self.app_name: str = "Invariant API"
        self.version: str = "0.1.0"
        self.environment: str = os.getenv("INVARIANT_ENV", "development")
        self.debug: bool = os.getenv("DEBUG", "true").lower() in ("true", "1")
        self.host: str = os.getenv("INVARIANT_HOST", "0.0.0.0")
        self.port: int = int(os.getenv("INVARIANT_PORT", "8000"))

        self.database_url: str = os.getenv("DATABASE_URL", "sqlite:///./invariant.db")

        self.github_webhook_secret: Optional[str] = os.getenv("GITHUB_WEBHOOK_SECRET")
        self.github_token: Optional[str] = os.getenv("GITHUB_TOKEN")
        self.github_app_id: Optional[str] = os.getenv("GITHUB_APP_ID")
        self.github_private_key_path: Optional[str] = os.getenv(
            "GITHUB_PRIVATE_KEY_PATH"
        )

        self.runner_timeout_seconds: int = int(
            os.getenv("RUNNER_TIMEOUT_SECONDS", "300")
        )

        self.ai_provider: str = os.getenv("AI_PROVIDER", "mock")
        self.ai_api_key: Optional[str] = os.getenv("AI_API_KEY")
        self.ai_api_base_url: str = os.getenv(
            "AI_API_BASE_URL", "https://api.openai.com/v1"
        )
        self.ai_model_name: str = os.getenv("AI_MODEL_NAME", "gpt-4o-mini")

        self.frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:3000")


settings = Settings()
