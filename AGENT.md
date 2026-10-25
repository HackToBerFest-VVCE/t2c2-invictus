# Invariant AI Agent Operational Guide

This document defines the operational directives, architectural constraints, and behavioral standards for AI coding agents (such as Google Antigravity, GitHub Copilot Agent, Cursor, Claude Code, and Aider) operating within the **Invariant** repository.

---

## 1. System Identity & Mission

* **Project**: Invariant
* **Tagline**: Continuous Verification for Every Commit
* **Core Value**: Continuous verification of software commits and pull requests against declarative, machine-parseable invariants defined in `INVARIANT.md`.
* **Repository Architecture**: Modular monorepo comprising reusable Python verification packages (`packages/*`), a FastAPI backend service (`services/api/`), a Next.js 14 web dashboard (`apps/web/`), and reference testbeds (`examples/inventory-api/`).

---

## 2. Inviolable Invariant Rules

Every agent operating in this repository **must strictly uphold** the core invariants defined in [`INVARIANT.md`](INVARIANT.md):

### Rule 1: Fail-Safe Verification Integrity (`INV-01`)
> **Never report an unexecuted, missing, timed-out, or crashed check as passed.**
* A check status of `VERIFIED_PASS` requires positive evidence: clean exit code (`0`), completed assertions, and zero unhandled exceptions.
* If a test runner crashes, times out, or fails to find tests, the status **must** be `CHECK_ERROR` or `UNSUPPORTED`.
* "Untested" or "Inconclusive" is fundamentally distinct from "Verified".

### Rule 2: Webhook Cryptographic Validation (`INV-02`)
> **Always validate incoming GitHub webhook payloads using HMAC-SHA256.**
* Use constant-time comparison (`hmac.compare_digest`) to prevent timing side-channel attacks.
* Reject requests with missing or invalid signatures with HTTP `401 Unauthorized`.
* Zero verification jobs may be dispatched on unauthenticated payloads.

### Rule 3: Non-Authoritative AI Boundary (`INV-03`)
> **AI suggestions are strictly advisory hypotheses and cannot fail a build without dynamic proof.**
* When generating edge cases or boundary tests, tag outputs with status `AI_HYPOTHESIS`.
* An AI output alone is **never** permitted to mark a commit check as `VERIFIED_FAILURE`. A confirmed bug requires an empirical execution trace or reproduced assertion failure from the runner.

### Rule 4: Subprocess Isolation & Secret Scrubbing (`INV-04`, `TH-03`)
> **Never mount or expose host environment credentials to test runner subprocesses.**
* Host keys (`GITHUB_TOKEN`, `AI_API_KEY`, `AWS_`, `SECRET`, `PASSWORD`) must be stripped from the execution environment by `IsolatedRunner`.
* Enforce strict wall-clock timeouts (default: 300 seconds) terminating frozen process trees with `SIGKILL`.

---

## 3. Directory Layout & Module Responsibilities

```text
Invariant/
├── apps/web/                 # Next.js 14 + Tailwind CSS Web Dashboard
├── services/api/             # FastAPI Backend Service (REST & Webhook Ingress)
├── packages/
│   ├── spec_engine/          # INVARIANT.md Markdown AST parser & validator
│   ├── verifier/             # Isolated runner, Pytest adapter, CLI entrypoint
│   ├── ai_engine/            # Provider-independent AI interface (mock, api)
│   └── report_engine/        # Findings normalizer (6-tier taxonomy), Markdown/JSON
├── actions/verify/           # Composite GitHub Action definition
├── examples/inventory-api/   # Reference service with INVARIANT.md & Pytest suite
├── migrations/               # Database schemas (SQLite & PostgreSQL)
├── tests/                    # Top-level integration & end-to-end tests
├── docs/                     # Architecture, technical design, threat model
└── tracker.md                # Active development log (keep updated!)
```

---

## 4. Standard Agent Commands

When inspecting, implementing, or validating changes in this codebase:

### 1. Run Complete Test Suite
```bash
python -m pytest -v
```
*(Expected: All 16 unit, integration, and end-to-end tests passing).*

### 2. Run CLI Invariant Verification on Reference Example
```bash
python -m packages.verifier.cli --workspace examples/inventory-api --spec INVARIANT.md
```
*(Expected: Parses spec, executes Pytest in isolated runner, exits 0 with `VERIFIED_PASS`).*

### 3. Run Reference Example Tests Directly
```bash
python -m pytest examples/inventory-api/tests -v
```

### 4. Verify FastAPI Backend Startup
```bash
python -c "from services.api.app.main import app; print('App title:', app.title)"
```

---

## 5. Coding & Formatting Conventions

* **Python Typing**: Always include explicit type annotations on functions, methods, and return values.
* **Pydantic Models**: Use Pydantic v2 conventions:
  ```python
  model_config = {"from_attributes": True}
  ```
* **Test Classes vs Domain Models**: If a domain dataclass or model starts with `Test` (e.g., `TestExecutionResult`), always declare:
  ```python
  __test__ = False
  ```
  to prevent Pytest from misidentifying it as a test suite.
* **Pytest Import Mode**: Always ensure `pytest.ini` maintains `addopts = --import-mode=importlib` to avoid module collisions between `tests/` and `services/api/tests/`.
* **Zero Secrets**: Never commit real tokens or passwords. Placeholders only in `.env.example`.

---

## 6. Updating Documentation & Tracker

* Whenever you complete a milestone, add a feature, or resolve a bug, record your task, architectural decisions, and test outputs in [`tracker.md`](tracker.md).
* Keep [`README.md`](README.md) synchronized with any directory or stack additions.
* All relative links must point to existing files.
