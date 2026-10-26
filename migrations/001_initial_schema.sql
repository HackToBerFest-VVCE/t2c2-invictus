-- Invariant Initial Database Schema
-- Compatible with SQLite (Dev) and PostgreSQL (Production)

-- Repositories Table
CREATE TABLE IF NOT EXISTS repositories (
    id VARCHAR(64) PRIMARY KEY,
    owner VARCHAR(128) NOT NULL,
    name VARCHAR(128) NOT NULL,
    full_name VARCHAR(256) NOT NULL UNIQUE,
    default_branch VARCHAR(64) DEFAULT 'main',
    webhook_secret_hash VARCHAR(128),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verification Runs Table
CREATE TABLE IF NOT EXISTS verification_runs (
    id VARCHAR(64) PRIMARY KEY,
    repository_id VARCHAR(64) NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
    commit_sha VARCHAR(64) NOT NULL,
    branch VARCHAR(128),
    event_type VARCHAR(64) NOT NULL, -- 'push', 'pull_request', 'manual'
    delivery_id VARCHAR(128) UNIQUE,
    status VARCHAR(32) NOT NULL, -- 'PENDING', 'RUNNING', 'VERIFIED_PASS', 'VERIFIED_FAILURE', 'CHECK_ERROR'
    summary TEXT,
    duration_ms INTEGER,
    is_async BOOLEAN DEFAULT FALSE,
    plan_metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Findings Table
CREATE TABLE IF NOT EXISTS findings (
    id VARCHAR(64) PRIMARY KEY,
    run_id VARCHAR(64) NOT NULL REFERENCES verification_runs(id) ON DELETE CASCADE,
    invariant_id VARCHAR(64),
    title VARCHAR(256) NOT NULL,
    severity VARCHAR(32) NOT NULL, -- 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'
    verification_status VARCHAR(32) NOT NULL, -- 'VERIFIED_PASS', 'VERIFIED_FAILURE', 'STATIC_WARNING', 'AI_HYPOTHESIS', 'CHECK_ERROR'
    lifecycle_status VARCHAR(32) DEFAULT 'unconfirmed', -- 'unconfirmed', 'confirmed', 'resolved', 'dismissed'
    confidence VARCHAR(32) DEFAULT 'HIGH',
    file_path VARCHAR(512),
    line_number INTEGER,
    expected_behavior TEXT,
    actual_behavior TEXT,
    reproduction_command TEXT,
    execution_trace TEXT,
    suggested_fix TEXT,
    reviewer_notes TEXT,
    ai_assisted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for Fast Querying
CREATE INDEX IF NOT EXISTS idx_runs_repo_id ON verification_runs(repository_id);
CREATE INDEX IF NOT EXISTS idx_runs_commit_sha ON verification_runs(commit_sha);
CREATE INDEX IF NOT EXISTS idx_findings_run_id ON findings(run_id);
CREATE INDEX IF NOT EXISTS idx_findings_status ON findings(verification_status);
