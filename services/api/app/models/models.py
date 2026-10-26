"""SQLAlchemy ORM models for Invariant."""

import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from ..core.database import Base


class RepositoryDB(Base):
    __tablename__ = "repositories"

    id = Column(String(64), primary_key=True, index=True)
    owner = Column(String(128), nullable=False)
    name = Column(String(128), nullable=False)
    full_name = Column(String(256), nullable=False, unique=True, index=True)
    default_branch = Column(String(64), default="main")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    runs = relationship(
        "VerificationRunDB", back_populates="repository", cascade="all, delete-orphan"
    )


class VerificationRunDB(Base):
    __tablename__ = "verification_runs"

    id = Column(String(64), primary_key=True, index=True)
    repository_id = Column(
        String(64), ForeignKey("repositories.id"), nullable=False, index=True
    )
    commit_sha = Column(String(64), nullable=False, index=True)
    branch = Column(String(128), default="main")
    event_type = Column(String(64), default="push")
    delivery_id = Column(String(128), unique=True, nullable=True)
    status = Column(String(32), nullable=False)  # VERIFIED_PASS, VERIFIED_FAILURE, etc.
    summary = Column(Text, default="")
    duration_ms = Column(Integer, default=0)
    is_async = Column(Boolean, default=False)
    plan_metadata = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    repository = relationship("RepositoryDB", back_populates="runs")
    findings = relationship(
        "FindingDB", back_populates="run", cascade="all, delete-orphan"
    )


class FindingDB(Base):
    __tablename__ = "findings"

    id = Column(String(64), primary_key=True, index=True)
    run_id = Column(
        String(64), ForeignKey("verification_runs.id"), nullable=False, index=True
    )
    invariant_id = Column(String(64), nullable=True)
    title = Column(String(256), nullable=False)
    severity = Column(String(32), default="HIGH")
    verification_status = Column(String(32), nullable=False)
    lifecycle_status = Column(String(32), default="unconfirmed", index=True)
    confidence = Column(String(32), default="HIGH")
    file_path = Column(String(512), nullable=True)
    line_number = Column(Integer, nullable=True)
    expected_behavior = Column(Text, default="")
    actual_behavior = Column(Text, default="")
    reproduction_command = Column(Text, nullable=True)
    execution_trace = Column(Text, nullable=True)
    suggested_fix = Column(Text, nullable=True)
    reviewer_notes = Column(Text, nullable=True)
    ai_assisted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )

    run = relationship("VerificationRunDB", back_populates="findings")
