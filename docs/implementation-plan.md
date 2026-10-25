# Invariant MVP Implementation Plan

**Objective**: Establish a clean, scalable, maintainable, and verified project structure for **Invariant**, an open-source continuous software verification platform for Hacktoberfest.

---

## 1. Architectural Strategy & Working Path

We prioritize the core end-to-end continuous verification loop:
1. **Specification Engine**: Parse `INVARIANT.md`, extracting structured metadata, rules (`[INVARIANT]`), contracts (`[CONTRACT]`), and edge cases (`[EDGE-CASE]`).
2. **Verification Engine**: Auto-detect project test harnesses (Pytest, npm test), execute tests in an isolated runner with timeouts and resource limits, and collect execution traces and exit codes.
3. **AI Engine (Bounded)**: Provide a provider-independent AI interface that suggests edge-case hypotheses without ever marking builds as failed on unverified suspicion.
4. **Report Engine**: Normalize findings into the 6-tier taxonomy (`VERIFIED_PASS`, `VERIFIED_FAILURE`, `STATIC_WARNING`, `AI_HYPOTHESIS`, `CHECK_ERROR`, `UNSUPPORTED`) and format Markdown/JSON reports.
5. **Backend API (FastAPI)**: Webhook ingress with HMAC-SHA256 signature verification, task orchestration, and REST endpoints for runs and findings.
6. **Web Dashboard (Next.js + Tailwind CSS)**: Modern interface displaying repository verification status, run details, reproduction traces, and finding triage.
7. **Reference Example (`examples/inventory-api`)**: Fully functional inventory service with `INVARIANT.md`, implementation, and Pytest suites for live verification.

---

## 2. Directory Layout & Module Plan

```text
Invariant/
├── apps/
│   └── web/                   # Next.js 14 / React Dashboard (TypeScript + Tailwind CSS)
│       ├── public/
│       └── src/
│           ├── components/    # StatusBadge, RunCard, FindingCard, SpecViewer, Navbar
│           ├── pages/         # Dashboard (index.tsx), Run Details (runs/[id].tsx)
│           ├── hooks/         # useRuns, useSpec hooks
│           ├── services/      # Typed API client for FastAPI backend
│           ├── types/         # Domain models (VerificationRun, Finding, InvariantRule)
│           └── styles/        # Tailwind global styles
│
├── services/
│   └── api/                   # FastAPI Backend Service
│       ├── app/
│       │   ├── api/v1/        # REST endpoints (/runs, /spec)
│       │   ├── core/          # Config, settings, logging
│       │   ├── models/        # SQLite / PostgreSQL ORM models
│       │   ├── schemas/       # Pydantic request/response schemas
│       │   ├── services/      # Verification orchestrator service
│       │   ├── webhooks/      # GitHub webhook handler with HMAC-SHA256 validation
│       │   └── main.py        # FastAPI application factory
│       ├── tests/             # API and webhook tests
│       └── requirements.txt   # FastAPI, Uvicorn, Pydantic, etc.
│
├── packages/                  # Reusable, decoupled Python packages
│   ├── spec-engine/           # INVARIANT.md Markdown AST parser & validator
│   ├── verifier/              # Isolated execution runner & framework adapters
│   │   └── adapters/          # PytestAdapter, GenericTestAdapter
│   ├── ai-engine/             # Provider-independent AI interface (bounded hypotheses)
│   └── report-engine/         # Findings normalizer, Markdown & GitHub report generators
│
├── actions/
│   └── verify/                # GitHub Action definition (action.yml)
│
├── migrations/                # Database migrations schema (SQL)
│
├── examples/
│   └── inventory-api/         # Reference implementation with INVARIANT.md & Pytest
│       ├── INVARIANT.md
│       ├── src/
│       └── tests/
│
├── tests/                     # Top-level integration & end-to-end MVP tests
├── docs/                      # Architectural docs (preserved & maintained)
├── .github/
│   ├── workflows/             # CI and Invariant continuous verification workflows
│   ├── ISSUE_TEMPLATE/        # Bug report and feature request templates
│   └── PULL_REQUEST_TEMPLATE.md
├── README.md                  # Project overview & structure guide
├── CONTRIBUTING.md            # Contributor guidelines
├── LICENSE                    # MIT License
├── tracker.md                 # Real-time development log
├── .gitignore                 # Python, Node, Environment ignores
└── .env.example               # Safe configuration template
```

---

## 3. Implementation Phases

- **Phase 1: Foundation & Git Configuration**
  - Set up `.gitignore`, `.env.example`, `tracker.md`, `.github/` workflows and issue templates, and `actions/verify/`.
- **Phase 2: Packages Implementation**
  - Implement `packages/spec-engine`: Markdown parser extracting YAML frontmatter, invariants, contracts, and edge cases.
  - Implement `packages/verifier`: Isolated process runner with timeouts, environment scrubbing, and test output collection.
  - Implement `packages/ai-engine`: Abstract AI provider interface producing structured `AIHypothesis` objects without authority to fail builds.
  - Implement `packages/report-engine`: Findings normalizer producing Markdown reports, JSON summaries, and GitHub PR comments.
- **Phase 3: Reference Example Implementation**
  - Implement `examples/inventory-api`: Python inventory domain logic and Pytest test suite asserting `INV-01` (non-negative stock) and `INV-02` (conservation of inventory).
- **Phase 4: Backend API (`services/api/`)**
  - Implement FastAPI backend, configuration management, HMAC webhook validation, and orchestration service connecting the packages.
- **Phase 5: Web Application (`apps/web/`)**
  - Implement Next.js + TypeScript + Tailwind CSS dashboard with responsive run history, status badges, and finding trace viewers.
- **Phase 6: Integration Testing & Verification**
  - Execute end-to-end pipeline test verifying that `examples/inventory-api` is parsed, tests executed, evidence collected, and findings generated.
  - Update `README.md` and `tracker.md`.
