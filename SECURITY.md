# Security Policy & Guidelines

The Invariant team (Team INVICTUS) takes the security of our continuous software verification platform, its runners, and the code repositories it evaluates seriously.

---

## 1. Supported Versions

We provide security updates and patches for the following versions:

| Version | Supported | Status |
| :--- | :--- | :--- |
| `0.1.x` (MVP / Current) | :white_check_mark: | Active Development |
| `< 0.1.0` | :x: | Unsupported Prototype |

---

## 2. Reporting a Vulnerability

If you discover a security vulnerability or security weakness in Invariant (such as a sandbox breakout, secret leakage, HMAC bypass, or remote code execution flaw):

> [!CAUTION]
> **Please DO NOT report security vulnerabilities through public GitHub issues, pull requests, or public forums.**

### Reporting Procedure:
1. **Email Details**: Send a private report to:
   * **`security@invariant.dev`** (or contact repository administrators via GitHub private vulnerability reporting).
2. **Include in Your Report**:
   * A clear summary of the vulnerability and affected components (`services/api`, `packages/verifier`, etc.).
   * Step-by-step reproduction instructions or a minimal Proof of Concept (PoC).
   * Potential impact assessment (e.g., host breakout, token exfiltration, spoofed verification status).
   * Any suggested mitigations or patches.

### Response SLA:
* **Initial Acknowledgment**: Within **48 hours** of report receipt.
* **Triage & Severity Assessment**: Within **5 business days**.
* **Coordinated Disclosure**: We adhere to coordinated vulnerability disclosure. We will work with you to validate the issue, prepare a patch, and coordinate public release notes crediting your contribution.

---

## 3. Core Architectural Security Controls

Invariant enforces defense-in-depth principles across the continuous verification pipeline:

```
[GitHub Webhook] ──> [HMAC-SHA256 Auth (INV-02)] ──> [Delivery Deduplicator]
                                                             |
                                                             v
[Sanitized Context] <── [Zero Secret Mount (TH-03)] <── [Isolated Runner]
                                                             |
                                                             v
[Non-Authoritative AI] ──(Advisory Only)──> [Execution Trace Required (INV-03)]
```

### 1. Webhook HMAC Cryptographic Validation (`INV-02`)
* Every incoming GitHub webhook is validated against the configured `GITHUB_WEBHOOK_SECRET` using HMAC-SHA256.
* Signatures are checked using constant-time string comparison (`hmac.compare_digest`) to prevent timing side-channel attacks.
* Requests with missing or invalid signatures are rejected immediately with `401 Unauthorized`.

### 2. Delivery Replay Protection
* Webhook requests track GitHub's `X-GitHub-Delivery` GUID using a memory-efficient deduplicator with a 24-hour TTL window to prevent replay attacks.

### 3. Subprocess Isolation & Secret Scrubbing (`TH-03`)
* Test execution runs in an isolated subprocess environment with its own working directory.
* Host environment variables matching sensitive prefixes (`GITHUB_TOKEN`, `AI_API_KEY`, `AWS_`, `SECRET`, `PASSWORD`, `PRIVATE_KEY`) are stripped before executing customer test code.
* Host secrets are never mounted into user test runners.

### 4. Wall-Clock Watchdogs & Resource Quotas (`INV-04`)
* The `IsolatedRunner` enforces a hard wall-clock timeout (default: 300 seconds).
* Any hanging or looping process tree is terminated with `SIGKILL` and recorded as `CHECK_ERROR` (Exit code `124`).

### 5. Non-Authoritative AI Boundary (`INV-03`)
* All AI model suggestions are classified strictly as `AI_HYPOTHESIS`.
* AI suggestions can **never** mark a commit as failed without reproducible, dynamic test execution evidence produced by the runner.

### 6. Fail-Safe Verification Integrity (`INV-01`)
* Unexecuted, crashed, or timed-out checks must **never** be reported as `VERIFIED_PASS`. Inconclusive states are clearly flagged.

---

## 4. Known Out-of-Scope Scenarios

The following scenarios are considered out-of-scope for bug bounty or vulnerability reports:
* Attacks requiring physical access to a developer's local machine.
* Issues in third-party dependencies that do not have an applicable attack vector in Invariant.
* Denial of service attacks against local development instances (`http://localhost:8000`) caused by deliberate developer test commands.
* Theoretical AI prompt injection that produces inaccurate hypothesis suggestions, since hypotheses are strictly non-authoritative by design (`INV-03`).

---

## 5. Security References

* [Threat Model (`docs/threat-model.md`)](docs/threat-model.md) - Full STRIDE threat analysis.
* [Verification Model (`docs/verification-model.md`)](docs/verification-model.md) - Evidence and classification guarantees.
* [Platform Specification (`INVARIANT.md`)](INVARIANT.md) - Formal security invariants (`INV-01` through `INV-04`).
