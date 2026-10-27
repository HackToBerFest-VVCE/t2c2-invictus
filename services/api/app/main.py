"""FastAPI Application entrypoint for Invariant Backend Service."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .core.database import init_db
from .api.v1.runs import router as runs_router
from .api.v1.specs import router as specs_router
from .api.v1.mcp import router as mcp_router
from .webhooks.github import router as webhooks_router


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    tags_metadata = [
        {
            "name": "Verification Runs",
            "description": (
                "Trigger runs, list verification history, compare runs across commits, "
                "manage finding lifecycles, and export reports in Markdown/JSON."
            ),
        },
        {
            "name": "Specifications",
            "description": (
                "Parse declarative INVARIANT.md specifications and execute automated "
                "AST test-gap analysis against project test suites."
            ),
        },
        {
            "name": "Model Context Protocol (MCP)",
            "description": (
                "Inspect and execute Model Context Protocol (MCP) tools directly via "
                "interactive REST endpoints (tool listing, verification, AI repair, "
                "and fix branch)."
            ),
        },
        {
            "name": "Webhooks",
            "description": (
                "GitHub webhook ingress handling push and pull_request events with "
                "HMAC-SHA256 signature verification and delivery deduplication."
            ),
        },
        {
            "name": "Health",
            "description": "Service health check and version metadata.",
        },
    ]

    app = FastAPI(
        title="Invariant Continuous Verification API",
        description=(
            "### Invariant API\n\n"
            "Continuous Verification for Every Commit.\n\n"
            "* **Fail-Safe Verification Taxonomy**: Strict 6-tier verification status model.\n"
            "* **Evidence-Backed**: Collects exit codes, traces, and reproduction commands.\n"
            "* **HMAC Cryptographic Validation**: Constant-time signature verification.\n"
            "* **GitHub Checks API**: Generates check runs and line-level diff annotations."
        ),
        version="0.1.0",
        openapi_tags=tags_metadata,
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
    app.include_router(specs_router, prefix="/api")
    app.include_router(mcp_router, prefix="/api")
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
