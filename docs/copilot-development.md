# GitHub Copilot Development Workflow Guide

This document defines how **GitHub Copilot** (Inline Completions, Copilot Chat, and Copilot Agent) is utilized across the engineering lifecycle of **Invariant**. It establishes human-in-the-loop safeguards and provides structured development log templates to record actual engineering sessions.

---

## 1. Copilot Across the Development Lifecycle

In Invariant, GitHub Copilot serves as an interactive pair programmer that accelerates development velocity while leaving architectural ownership and quality verification with the human engineer.

```
+--------------------------------------------------------------------------+
| 1. Planning & Architecture Exploration                                   |
|    - Inspecting existing codebase structure and mapping dependencies     |
|    - Drafting technical design specifications and component interfaces   |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
| 2. Implementation & Scaffolding                                          |
|    - Generating boilerplate schemas, Pydantic models, and typed classes  |
|    - Implementing handlers, parsers, adapters, and data converters       |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
| 3. Testing & Invariant Verification                                      |
|    - Authoring invariant property test harnesses (Hypothesis/Pytest)     |
|    - Validating pre-conditions, post-conditions, and edge cases          |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
| 4. Debugging & Failure Diagnosis                                         |
|    - Analyzing test traces, assertion exceptions, and exit codes         |
|    - Diagnosing race conditions, deadlocks, and import collisions        |
+--------------------------------------------------------------------------+
                                     |
                                     v
+--------------------------------------------------------------------------+
| 5. Documentation & Technical Writing                                     |
|    - Generating clear Markdown documentation and Mermaid diagrams        |
|    - Validating link integrity and updating development logs             |
+--------------------------------------------------------------------------+
```

---

## 2. Recommended Workflows & Prompt Patterns

### 2.1 Planning & Architecture
* **Goal**: Map existing code and design interfaces before writing implementation code.
* **Effective Prompt Pattern**:
  > *"Inspect `packages/verifier/models.py` and `packages/spec-engine/models.py`. Outline an adapter interface in Python that can detect whether a workspace contains a Pytest or Node.js test harness and execute it with resource timeouts."*
* **Human Responsibility**: Verify memory limits, security boundaries, and that no unvetted dependencies are introduced.

### 2.2 Implementation & Typing
* **Goal**: Implement typed, clean functions adhering to repository conventions.
* **Effective Prompt Pattern**:
  > *"Implement a cryptographic verification function in `services/api/app/core/security.py` using Python's `hmac` and `hashlib` modules that validates GitHub webhook signatures with constant-time comparison."*
* **Human Responsibility**: Review edge cases, ensure type annotations pass `mypy`, and verify Pydantic v2 conventions (`model_config = {"from_attributes": True}`).

### 2.3 Testing & Invariant Verification
* **Goal**: Author property-based and deterministic unit tests verifying `INVARIANT.md` rules.
* **Effective Prompt Pattern**:
  > *"Write a pytest test suite for `examples/inventory-api` that validates INV-01: Available stock must never drop below zero under concurrent reservation attempts."*
* **Human Responsibility**: Ensure tests are deterministic, run without network dependencies, and assert genuine invariant properties rather than trivial tautologies.

### 2.4 Debugging & Trace Analysis
* **Goal**: Understand failure traces and resolve bugs cleanly without masking errors.
* **Effective Prompt Pattern**:
  > *"Analyze this pytest collection error: `ImportError: cannot collect test class 'TestExecutionResult'`. Why is pytest attempting to collect this dataclass and how should we configure `__test__ = False`?"*
* **Human Responsibility**: Fix the underlying root cause rather than silencing linters or skipping failing tests.

### 2.5 Documentation & Diagrams
* **Goal**: Maintain technically accurate, synchronized documentation.
* **Effective Prompt Pattern**:
  > *"Generate a GitHub-compatible Mermaid sequence diagram showing the flow from a GitHub webhook event through HMAC verification, spec extraction, sandboxed execution, to check status reporting."*
* **Human Responsibility**: Confirm diagrams reflect actual code rather than aspirational or unbuilt features.

---

## 3. Human-in-the-Loop Safeguards

To prevent technical debt, hallucinations, and security flaws:

1. **Inspect Before Modifying**: Never accept AI suggestions without inspecting existing repository code and preserving working functionality.
2. **Deterministic Verification Required**: Every change generated or assisted by Copilot must be validated by running local tests (`python -m pytest -v`).
3. **No Fabricated Facts**: Do not allow AI tools to insert fictitious endpoints, unsupported benchmarks, or imaginary security certifications into project documentation.
4. **Fail-Safe Integrity**: Never alter a test suite to pass by deleting assertions or marking an unexecuted check as passed (`INV-01`).
5. **No Secret Exposure**: Ensure AI-generated code never hardcodes tokens, passwords, or private keys.

---

## 4. Development Session Log Template

Contributors using GitHub Copilot or AI coding assistants must record actual usage in pull requests or in the log entries below. **Do not fabricate past conversations or claim tests passed if they were not executed.**

```markdown
### Copilot Development Session Log

- **Date**: YYYY-MM-DD
- **Engineer**: @username
- **Feature / Task**: [Brief description of the task]
- **Copilot Role**:
  - [ ] Planning & Architecture
  - [ ] Implementation
  - [ ] Testing & Invariant Verification
  - [ ] Debugging & Failure Diagnosis
  - [ ] Documentation & Diagrams
- **Actual Prompts Used**:
  1. "`<exact or summarized prompt>`"
  2. "`<exact or summarized prompt>`"
- **Key Code / Files Modified**:
  - `path/to/file1.py`
  - `path/to/file2.py`
- **Human Decisions & Overrides**:
  - [Note any suggestions that were rejected, modified, or corrected by the human engineer]
- **Verification Commands Executed**:
  ```bash
  # Record the exact test commands run and their actual results:
  python -m pytest -v
  ```
- **Outcome**: [Summary of completed work and current status]
```

---

## 5. Actual Development Session Records

Use the section below to record real development sessions conducted during Hacktoberfest.

### Session Record #1
* **Date**: 2026-10-25
* **Engineer**: Team INVICTUS
* **Feature / Task**: Project Scaffolding, Core Verification Packages, and Reference Testbed
* **Copilot Role**:
  - [x] Planning & Architecture
  - [x] Implementation
  - [x] Testing & Invariant Verification
  - [x] Debugging & Failure Diagnosis
  - [x] Documentation & Diagrams
* **Actual Prompts Used**:
  1. *"Establish a clean, scalable, and maintainable project structure for Invariant, suitable for an MVP that can be expanded into a production-grade platform."*
  2. *"Implement packages/spec-engine, packages/verifier, packages/ai-engine, and packages/report-engine with clear interfaces."*
  3. *"Set up the GitHub Copilot development workflow for Invariant, including .github/copilot-instructions.md and CI workflows."*
* **Key Code / Files Created**:
  - `packages/spec-engine/`: Markdown parser and validator for `INVARIANT.md`.
  - `packages/verifier/`: Isolated subprocess runner with secret scrubbing and timeout watchdog.
  - `packages/ai-engine/`: Provider-independent AI interface with non-authoritative boundary.
  - `packages/report-engine/`: Findings normalizer implementing 6-tier verification taxonomy.
  - `services/api/`: FastAPI backend with HMAC-SHA256 webhook validation and delivery deduplication.
  - `apps/web/`: Next.js 14 + Tailwind CSS dashboard.
  - `examples/inventory-api/`: Reference service declaring and testing `INV-01`, `INV-02`, and `INV-03`.
  - `tests/`: 16 integration, unit, and end-to-end tests.
* **Human Decisions & Overrides**:
  - Configured `pytest.ini` with `--import-mode=importlib` to prevent package collision between top-level `tests/` and service `services/api/tests/`.
  - Declared `__test__ = False` on `TestExecutionResult` model so Pytest does not mistake the dataclass for a test suite.
  - Enforced strict `INV-03` non-authoritative AI boundary: AI hypotheses cannot cause a commit check to fail without runner reproduction traces.
* **Verification Commands Executed**:
  ```bash
  python -m pytest -v
  # Result: 16 passed in 4.36s (100% pass rate)

  python -m packages.verifier.cli --workspace examples/inventory-api --spec INVARIANT.md
  # Result: Status VERIFIED_PASS, 5 passed, 0 failed, duration 1150ms
  ```
* **Outcome**: Full MVP continuous verification loop operational, documented, and tested.

---

### Session Record #2 (Template - Ready for Next Task)
* **Date**: _[To be filled on next session]_
* **Engineer**: _[Contributor username]_
* **Feature / Task**: _[Describe the task]_
* **Copilot Role**:
  - [ ] Planning & Architecture
  - [ ] Implementation
  - [ ] Testing & Invariant Verification
  - [ ] Debugging & Failure Diagnosis
  - [ ] Documentation & Diagrams
* **Actual Prompts Used**:
  1. *"..."*
* **Key Code / Files Modified**:
  - `...`
* **Human Decisions & Overrides**:
  - _[List human review decisions]_
* **Verification Commands Executed**:
  ```bash
  # Commands and actual output
  ```
* **Outcome**: _[Results and next steps]_
