# Invariant Verification Sequence Diagram

This document illustrates the execution lifecycle of a continuous verification cycle in **Invariant**, tracing interactions from a developer's code change on GitHub through specification parsing, sandboxed execution, AI-assisted edge-case hypothesis generation, classification, and reporting.

---

## 1. Sequence Overview

The sequence represents the end-to-end verification flow. Components marked with **[Planned]** reflect the target architecture during the current hackathon development phase.

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant GH as GitHub Repository
    participant API as Invariant Webhook API [Planned]
    participant Orch as Verification Orchestrator [Planned]
    participant Parser as Specification Parser [Design]
    participant AI as AI API Assistant [Planned]
    participant Runner as Verification Runner (Sandbox) [Planned]
    participant Classifier as Findings Classifier [Design]
    participant DB as Results Database [Planned]
    participant Dash as Invariant Dashboard [Planned]
    participant Checks as GitHub Checks API [Planned]

    %% 1. Ingestion Phase
    Note over Dev,GH: Phase 1: Code Change & Event Ingestion
    Dev->>GH: git push / Open Pull Request
    GH->>API: POST /api/v1/webhooks/github (HMAC-SHA256 Signed Payload)
    activate API
    API->>API: Validate HMAC signature & payload timestamp
    alt Signature Invalid or Expired
        API-->>GH: 401 Unauthorized / 400 Bad Request
    else Valid Payload
        API-->>GH: 202 Accepted (Verification Queued)
        API->>Orch: Enqueue verification job (Repo, Commit SHA, Ref)
    end
    deactivate API

    %% 2. Specification & Planning Phase
    Note over Orch,Parser: Phase 2: Specification Parsing & Planning
    activate Orch
    Orch->>GH: Fetch commit tree, diff, & INVARIANT.md
    GH-->>Orch: Repository files & INVARIANT.md content
    
    Orch->>Parser: Parse INVARIANT.md & extract rules
    activate Parser
    Parser->>Parser: Validate spec syntax, extract invariants & API contracts
    Parser-->>Orch: Structured Invariant Model
    deactivate Parser

    %% 3. AI Assistance Phase (Optional & Bounded)
    Note over Orch,AI: Phase 3: AI-Assisted Hypothesis Generation (Bounded)
    opt AI Assistance Configured (Edge-Case Suggestion)
        Orch->>AI: Request edge cases & boundary inputs (Diff + Invariant Clauses)
        activate AI
        Note right of AI: AI acts as an advisor only.<br/>Cannot declare confirmed bugs.
        AI-->>Orch: Generated edge-case hypotheses & synthetic test inputs
        deactivate AI
    end

    %% 4. Sandboxed Execution Phase
    Note over Orch,Runner: Phase 4: Isolated Execution & Evidence Collection
    Orch->>Runner: Dispatch verification jobs (Commit, Tests, Synthetic Checks)
    activate Runner
    Runner->>Runner: Initialize isolated container sandbox
    Runner->>Runner: Checkout code, install dependencies under resource limits
    Runner->>Runner: Execute test suites & property-based invariant checks
    Runner->>Runner: Capture exit codes, stdout/stderr, stack traces
    Runner-->>Orch: Raw test outputs & execution traces
    deactivate Runner

    %% 5. Classification & Persistence Phase
    Note over Orch,Classifier: Phase 5: Evidence Classification & Storage
    Orch->>Classifier: Evaluate test results + AI hypotheses
    activate Classifier
    Classifier->>Classifier: Classify findings into verified, warning, hypothesis, or error
    Classifier-->>Orch: Classified Verification Report
    deactivate Classifier

    Orch->>DB: Save verification run, metrics, and findings
    activate DB
    DB-->>Orch: Run ID confirmation
    deactivate DB

    %% 6. Notification & Developer Feedback Phase
    Note over Orch,Dev: Phase 6: Feedback & Remediation
    opt GitHub Integration Implemented
        Orch->>Checks: Create / Update Check Run (Status, Summary, Annotations)
        activate Checks
        Checks-->>GH: Post PR checks & line annotations
        deactivate Checks
    end

    Orch->>Dash: Publish report to Web Dashboard
    deactivate Orch
    
    Dash-->>Dev: Inspect verification report, failures, & evidence
    GH-->>Dev: View PR check run summary & inline annotations
    
    Note over Dev: Developer fixes invariant violation and pushes a new commit
```

---

## 2. Step-by-Step Stage Breakdown

### Stage 1: Ingestion & Validation
1. **Developer Action**: The developer pushes a commit or opens/updates a Pull Request on GitHub.
2. **Webhook Ingestion**: GitHub dispatches an HTTPS `POST` payload containing the commit metadata, repository information, and an `X-Hub-Signature-256` header.
3. **HMAC Validation**: Invariant's webhook handler verifies the payload signature using the configured secret key. Malformed or unauthenticated requests are rejected immediately with `401 Unauthorized`.
4. **Job Enqueueing**: Upon validation, the event is acknowledged with `202 Accepted` and enqueued onto the internal asynchronous task queue.

### Stage 2: Specification Parsing & Planning
5. **Git Tree Retrieval**: The orchestrator checks out the commit diff and locates `INVARIANT.md` in the repository root.
6. **Specification Parsing**: The parser converts `INVARIANT.md` into an abstract syntax tree of formal statements:
   * Logical invariants (e.g., `account.balance >= 0`).
   * API contracts (pre-conditions, post-conditions, response codes).
   * Declared failure modes and expected error envelopes.
7. **Rule Mapping**: The orchestrator matches modified source files against relevant invariant clauses.

### Stage 3: AI-Assisted Analysis (Bounded)
8. **Hypothesis Generation**: If AI assistance is enabled, Invariant invokes the AI API with:
   * The text of the affected invariant clauses.
   * The unified git diff of the commit.
9. **Role of AI**: The AI API suggests prospective edge cases (e.g., integer overflow boundaries, concurrent access scenarios, null payload structures).
10. **Strict Non-Authoritative Boundary**: The AI API **cannot** declare a bug or fail a build. All AI suggestions are treated as unverified hypotheses until dynamically confirmed or refuted by the execution runner.

### Stage 4: Sandboxed Test Execution
11. **Sandbox Allocation**: The Verification Runner initializes an ephemeral container environment with strict memory, CPU, and network limits.
12. **Execution**: The runner runs:
    * Existing repository unit and integration test suites.
    * Invariant property-based test harnesses.
    * Synthesized tests derived from edge-case hypotheses.
13. **Evidence Capture**: The runner logs stdout, stderr, process exit codes, and call traces as cryptographic or log-level evidence.

### Stage 5: Classification & Storage
14. **Evidence-Based Classification**: The Findings Classifier maps execution outputs into distinct categories:
    * **`VERIFIED_PASS`**: Check ran and passed assertions.
    * **`VERIFIED_FAILURE`**: Check ran and produced an unequivocal reproduced failure.
    * **`STATIC_WARNING`**: Identified via static analysis without dynamic runtime reproduction.
    * **`AI_HYPOTHESIS`**: Suggested by AI but not yet reproduced by a concrete test.
    * **`CHECK_ERROR`**: Test could not execute due to environment or configuration faults.
15. **Persistence**: The run record, individual findings, and associated evidence logs are committed to the Results Database.

### Stage 6: Reporting & Remediation
16. **GitHub Checks**: The GitHub integration creates a Check Run on the commit, posting a high-level summary and inline annotations on lines with verified failures.
17. **Dashboard Notification**: The run is available on the Invariant web dashboard for interactive investigation.
18. **Developer Remediation**: The developer reviews the actionable evidence (trace, expected vs. actual behavior), updates their code, and pushes a subsequent commit, re-triggering the verification pipeline.

---

## 3. Planned vs. Designed Elements

| Sequence Step | Implementation Status | Notes |
| :--- | :--- | :--- |
| **HMAC Webhook Processing** | Planned | Endpoint design and signature verification algorithms specified. |
| **`INVARIANT.md` Parsing** | Specification/Design Complete | Schema and markdown section conventions defined. |
| **AI Hypothesis Generation** | Planned | Prompt architecture and boundary rules specified. |
| **Sandbox Execution** | Planned | Container execution harness and timeout mechanics defined. |
| **Evidence Classification** | Specification/Design Complete | Formal finding classification taxonomy fully specified. |
| **GitHub Checks Publishing** | Planned | GitHub App manifest and Check Run payloads specified. |
