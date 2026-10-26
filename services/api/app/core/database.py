"""Database engine and session management."""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from typing import Generator
from .config import settings

# SQLite requires check_same_thread=False
connect_args = {}
if settings.database_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """Dependency for yielding database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create tables if they do not exist and ensure missing columns exist."""
    Base.metadata.create_all(bind=engine)

    # Dynamic column migration for SQLite and relational stores
    try:
        from sqlalchemy import inspect, text

        inspector = inspect(engine)
        tables = inspector.get_table_names()

        with engine.connect() as conn:
            if "findings" in tables:
                finding_cols = {c["name"] for c in inspector.get_columns("findings")}
                if "lifecycle_status" not in finding_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE findings ADD COLUMN lifecycle_status "
                            "VARCHAR(32) DEFAULT 'unconfirmed'"
                        )
                    )
                if "confidence" not in finding_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE findings ADD COLUMN confidence VARCHAR(32) DEFAULT 'HIGH'"
                        )
                    )
                if "suggested_fix" not in finding_cols:
                    conn.execute(
                        text("ALTER TABLE findings ADD COLUMN suggested_fix TEXT")
                    )
                if "reviewer_notes" not in finding_cols:
                    conn.execute(
                        text("ALTER TABLE findings ADD COLUMN reviewer_notes TEXT")
                    )
                if "updated_at" not in finding_cols:
                    conn.execute(
                        text("ALTER TABLE findings ADD COLUMN updated_at TIMESTAMP")
                    )

            if "verification_runs" in tables:
                run_cols = {
                    c["name"] for c in inspector.get_columns("verification_runs")
                }
                if "is_async" not in run_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE verification_runs ADD COLUMN is_async BOOLEAN DEFAULT 0"
                        )
                    )
                if "plan_metadata" not in run_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE verification_runs ADD COLUMN plan_metadata TEXT"
                        )
                    )
                if "completed_at" not in run_cols:
                    conn.execute(
                        text(
                            "ALTER TABLE verification_runs ADD COLUMN completed_at TIMESTAMP"
                        )
                    )

            conn.commit()
    except Exception:
        pass
