"""FastAPI Application entrypoint for Invariant Backend Service."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import init_db
from .api.v1.runs import router as runs_router
from .webhooks.github import router as webhooks_router


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="Invariant API",
        description="Continuous Verification for Every Commit",
        version="0.1.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Configure CORS for Dashboard integration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Restrict in production via settings.frontend_url
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Initialize Database Schema
    init_db()

    # Register Routers
    app.include_router(runs_router, prefix="/api")
    app.include_router(webhooks_router, prefix="/api")

    @app.get("/health", tags=["Health"])
    def health_check() -> dict:
        """Service health check endpoint."""
        return {
            "status": "healthy",
            "service": "invariant-api",
            "version": settings.version,
            "environment": settings.environment,
        }

    return app


app = create_app()
