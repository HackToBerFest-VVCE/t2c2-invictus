# Invariant Technical Design Document

This document provides the technical architecture and engineering specification for **Invariant**, an automated continuous verification platform designed to evaluate code commits against behavioral invariants declared in `INVARIANT.md`.

---

## 1. System Goals and Non-Goals

### 1.1 Primary Goals
* **Automate Continuous Invariant Verification**: Enable development teams to assert behavioral and architectural rules that run automatically on every commit and pull request.
* **Declarative Specification as Code**: Maintain specifications alongside source code in version control (`INVARIANT.md`) so that requirements evolve synchronously with the codebase.
* **Empirical, Evidence-Based Reporting**: Ensure that reported failures are backed by reproducible execution traces, concrete assertions, or deterministic static proofs.
* **Bounded AI Assistance**: Leverage AI models to assist human engineers with edge-case hypothesis generation and test synthesis while strictly prohibiting unverified AI hallucinations from marking builds as failed.
* **Seamless Developer Experience**: Provide actionable feedback directly inside GitHub Pull Requests via the Checks API and a dedicated dashboard.

### 1.2 Non-Goals
* **Not a Mathematical Theorem Prover**: Invariant is not intended to provide full formal mathematical proofs for arbitrary Turing-complete code (e.g., Coq, Isabelle, or TLA+).
* **Not a Replacement for Standard Unit Testing**: Invariant augments, rather than replaces, language-specific unit and integration testing frameworks.
* **No Unbounded Autonomous Code Rewriting**: Invariant verifies and diagnoses failures; it does not automatically commit modified code back to customer repositories without explicit developer approval.
* **No Authoritative AI Decision-Making**: The AI model is never allowed to act as an unverified judge of code correctness.

---

## 2. High-Level Architecture & Modules

The platform is divided into modular subsystems with decoupled lifecycles:

```
+-------------------------------------------------------------------------+
| Invariant Platform                                                      |
|                                                                         |
|  +------------------+    +-----------------------+    +---------------+  |
|  | Webhook Ingress  | -> | Verification          | -> | Specification |  |
|  | (FastAPI)        |    | Orchestrator          |    | Parser        |  |
|  +------------------+    +-----------------------+    +---------------+  |
|                                     |                         |         |
|                                     v                         v         |
|                          +-----------------------+    +---------------+  |
|                          | Execution Runner      | <- | AI Assistant  |  |
|                          | (Container Sandbox)   |    | (Hypotheses)  |  |
|                          +-----------------------+    +---------------+  |
|                                     |                                   |
|                                     v                                   |
|                          +-----------------------+                      |
|                          | Findings Classifier   |                      |
|                          +-----------------------+                      |
|                                     |                                   |
|                                     v                                   |
|                          +-----------------------+                      |
|                          | Results Database &    |                      |
|                          | Reporting Engine      |                      |
|                          +-----------------------+                      |
+-------------------------------------------------------------------------+
```

### 2.1 Major Modules and Responsibilities

| Module | Directory (Planned) | Responsibilities | Status |
| :--- | :--- | :--- | :--- |
| **Ingress API** | `api/` | Ingests webhooks, validates HMAC signatures, enforces rate limits, and enqueues jobs. | Planned |
| **Orchestrator** | `core/orchestrator/` | Coordinates the verification lifecycle, manages state transitions, and resolves dependencies. | Planned |
| **Specification Engine**| `spec/` | Parses markdown specifications (`INVARIANT.md`), validates schemas, and maps rules to source paths. | Specification/Design Complete |
| **AI Assistant Gateway**| `ai/` | Builds prompt contexts for edge-case synthesis, enforces boundary guards, and parses AI output. | Planned |
| **Execution Runner** | `runner/` | Manages ephemeral container sandboxes, mounts repositories, executes tests, and captures traces. | Planned |
| **Findings Classifier**| `classifier/` | Evaluates raw execution outputs and assigns standardized confidence levels and evidence tags. | Specification/Design Complete |
| **Storage Engine** | `db/` | Manages relational persistence for runs, checks, findings, and diagnostic logs. | Planned |
| **Reporters** | `reporters/` | Formats and pushes findings to GitHub Checks API, webhook callbacks, and web dashboard. | Planned |

---

## 3. Specification Format and Parsing

### 3.1 Design Principles
The specification file (`INVARIANT.md`) is designed to be:
1. **Human Readable**: Uses standard Markdown with structured headers, bulleted lists, and code blocks.
2. **Machine Parseable**: Employs deterministic keywords (`[INVARIANT]`, `[CONTRACT]`, `[PRE]`, `[POST]`, `[FAILURE]`) and JSON/YAML metadata blocks.
3. **Colocated with Code**: Stored at the root of the target repository, ensuring that specification changes are committed, reviewed, and versioned alongside code changes.

### 3.2 Parsing Strategy
* **Lexer / AST Generation**: Invariant utilizes a Markdown AST parser (e.g., `markdown-it` or `mistletoe`) to decompose the document into structured heading trees and block nodes.
* **Clause Extraction**: Rule extractors scan for tagged sections:
  * Invariant definitions: `### INV-<ID>: <Rule Statement>`
  * Pre-conditions and Post-conditions: `- PRE: <Condition>`, `- POST: <Condition>`
  * Error models: `- FAILURE: <Expected Error Code and Structure>`
* **Validation & Linting**: The parser checks for missing identifiers, ambiguous terms, or circular rule references before execution proceeds.

---

## 4. Verification Workflow

The verification pipeline executes in strictly ordered, isolated stages:

1. **Ingest & Verify Event**: Receive GitHub webhook payload; authenticate HMAC signature.
2. **Context Assembly**: Clone repository at the target commit SHA; fetch base branch diff.
3. **Specification Extraction**: Parse `INVARIANT.md` from the commit tree. If absent or invalid, emit a specification warning and abort.
4. **Impact Analysis**: Compare changed files against invariant mapping tags to determine the minimal necessary check set.
5. **AI Hypothesis Formulation (Optional)**: If enabled, prompt the AI API with the diff and invariant rules to generate boundary values and stress conditions.
6. **Sandboxed Execution**:
   * Provision isolated ephemeral execution runner (Docker container).
   * Run existing repository test harnesses.
   * Execute invariant property tests and edge-case assertion harnesses.
   * Enforce resource quotas (time, memory, CPU, network).
7. **Evidence Ingestion & Classification**: Inspect return codes, stdout, stderr, and tracebacks to categorize findings.
8. **Persistence & Notification**: Store run artifacts in the database; update GitHub Checks and Web Dashboard.

---

## 5. AI API Integration and Boundaries

A foundational architectural requirement of Invariant is the **strict boundary** placed on artificial intelligence:

```
+-----------------------------------------------------------------+
| Permitted AI Responsibilities                                   |
| - Proposing boundary conditions (e.g., negative integers)      |
| - Suggesting edge cases from invariant descriptions             |
| - Formulating draft property tests for human/runner evaluation  |
| - Generating natural-language explanations of test failures    |
+-----------------------------------------------------------------+
                                |
                                v STRICT PROHIBITION
+-----------------------------------------------------------------+
| Forbidden AI Behaviors                                          |
| - AI output alone CANNOT fail a build                          |
| - AI output CANNOT be marked as a verified bug without a trace  |
| - AI cannot execute code directly outside sandboxed runners     |
| - AI cannot override verified passing test results              |
+-----------------------------------------------------------------+
```

### 5.1 AI Prompt and Context Sanitization
When sending repository contexts to an external AI API:
* **Token Pruning**: Only the unified diff and relevant sections of `INVARIANT.md` are passed to minimize token consumption and exposure.
* **Secrets Scrubbing**: Environment keys, detected private tokens, and sensitive strings are masked prior to transmission.
* **Prompt Injection Defense**: Untrusted code or user-contributed comments are encapsulated within strict XML/JSON data boundaries and accompanied by system-level instructions instructing the model to treat the content as inert code data.

---

## 6. Finding Classification and Evidence

All findings produced during verification are classified into a discrete taxonomy:

| Classification | Meaning | Required Evidence | Actionable Impact |
| :--- | :--- | :--- | :--- |
| **`VERIFIED_PASS`** | The invariant was tested and upheld. | Executed test suite completed with exit code 0 and positive assertion counts. | Informative badge; check passes. |
| **`VERIFIED_FAILURE`** | An invariant was unequivocally violated. | Concrete test failure, assertion trace, or reproduced error output. | Fails GitHub Check; blocks merge. |
| **`STATIC_WARNING`** | Potential invariant violation found by static rule analysis. | Source file path, line number, and AST rule match. | Warning annotation; advisory. |
| **`AI_HYPOTHESIS`** | Speculative invariant violation proposed by AI analysis. | AI reasoning trace and proposed failure scenario (unexecuted/unreproduced). | Advisory note on Dashboard; does NOT fail build. |
| **`CHECK_ERROR`** | Invariant could not be verified due to environment or tool failure. | Runner crash log, timeout trace, or missing dependency error. | Inconclusive status; requires triage. |
| **`UNSUPPORTED`** | Invariant clause contains constructs unsupported by the runner. | Parser diagnostic indicating missing harness for rule type. | Informational notice. |

> [!IMPORTANT]
> **Integrity Guarantee**: An unavailable or crashed check must **never** be reported as a passed check. If a verification check cannot execute, it must yield `CHECK_ERROR` or `INCONCLUSIVE`.

---

## 7. GitHub Event Handling & Integration

### 7.1 Webhook Ingress
* **Supported Events**:
  * `push`: Verifies the latest commit on monitored branches.
  * `pull_request` (`opened`, `synchronize`, `reopened`): Verifies proposed pull request changes against target branch invariants.
* **Security Validation**:
  * Validates the `X-Hub-Signature-256` header using HMAC SHA-256 against a pre-shared secret.
  * Discards requests with timestamp drifts exceeding 300 seconds to prevent replay attacks.

### 7.2 Checks API Integration
* Upon job acceptance, Invariant creates a Check Run with `status: in_progress`.
* Upon completion, the Check Run is updated with:
  * `conclusion`: `success`, `failure`, or `neutral`.
  * `output.title`: Summary of verified invariants.
  * `output.annotations`: File-level annotations indicating exact lines where verified invariant failures occurred.

---

## 8. Error Handling and Retry Strategy

```
Webhook Ingress --------> [HMAC Check] ----(Fail)----> HTTP 401 (Dropped)
                               |
                             (Pass)
                               v
                       [Task Enqueued]
                               |
                               v
                     [Runner Execution]
                               |
              +----------------+----------------+
              |                                 |
           (Crash)                          (Timeout)
              |                                 |
              v                                 v
      [Retry with Backoff]             [Terminate Sandbox]
      (Max 2 retries)                           |
              |                                 v
        (Exhausted)                      [Emit CHECK_ERROR]
              v
      [Emit CHECK_ERROR]
```

* **Transient Network Failures**: Calls to GitHub APIs or external AI APIs employ exponential backoff with jitter (initial delay 500ms, max 3 retries).
* **Runner Crashes**: If an execution sandbox terminates abnormally (OOM killed, runner host disruption), the orchestrator retries up to 2 times before marking the check as `CHECK_ERROR`.
* **Hard Timeouts**: Sandboxes are bound by a strict wall-clock timeout (default: 300 seconds). If exceeded, SIGKILL is sent to the container, and an inconclusive timeout finding is recorded.

---

## 9. Scalability Considerations

* **Decoupled Architecture**: Ingress API servers are stateless and can scale horizontally behind a load balancer.
* **Queue-Based Work Distribution**: Jobs are queued in Redis or RabbitMQ and consumed by a fleet of autoscaling runner worker nodes.
* **Sandbox Isolation**: Each verification run executes in its own container instance, preventing cross-tenant interference and dirty workspace states.
* **Database Optimization**: Verification runs and logs are indexed by repository ID, commit SHA, and timestamp; older detailed execution logs can be archived to object storage (e.g., S3 or MinIO).

---

## 10. Security and Permissions

* **Least Privilege Access**: GitHub App permissions are scoped to `checks:write`, `contents:read`, and `pull_requests:read`.
* **Isolated Execution**: Untrusted repository code runs in non-privileged container runtimes (e.g., Rootless Docker or gVisor) with:
  * Read-only root filesystem where possible.
  * Dropped Linux capabilities (`CAP_SYS_ADMIN`, `CAP_NET_RAW` disabled).
  * Disabled network egress during test execution (except when mocking is explicitly bypassed).
* **Secret Management**: Environment variables containing AI API keys and GitHub tokens are injected directly into backend workers and never mounted inside customer code execution sandboxes.

---

## 11. Known Limitations & Unresolved Design Choices

### 11.1 Known Current Limitations
* **Early Repository Stage**: The repository is currently in its bootstrap and scaffolding phase; execution runners and webhook handlers are specified but not yet fully deployed to production.
* **Property Test Synthesis Complexity**: Automatically translating natural-language invariant statements into runnable code tests without developer assistance remains an active research topic.
* **Language Support**: Initial execution runner targets Python and Node.js environments; compiled languages (Rust, Go, C++) will require custom toolchain container images.

### 11.2 Unresolved Design Choices
* **Container Runtime vs. MicroVMs**: Evaluating whether lightweight Docker containers provide sufficient multi-tenant isolation, or if Firecracker MicroVMs should be adopted for public multi-tenant SaaS deployments.
* **AI Provider Abstraction**: Evaluating LiteLLM vs. native SDKs for provider-agnostic LLM integration.
* **State Machine Verification**: Determining the optimal syntax in `INVARIANT.md` for declaring temporal logic and multi-step state transitions without requiring developers to learn TLA+ or Promela.
