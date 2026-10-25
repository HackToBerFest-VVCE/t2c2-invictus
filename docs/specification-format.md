# INVARIANT.md Specification Format & Guide

This document describes the structure, grammar, and authoring guidelines for `INVARIANT.md`, the declarative specification file used by **Invariant** to define, track, and verify software requirements.

---

## 1. Role and Philosophy of `INVARIANT.md`

In traditional software development, requirements and business rules are frequently separated from code—scattered across PRDs, tickets, wikis, or tribal knowledge. As a result, code drifts away from its original requirements without detection.

`INVARIANT.md` bridges this gap by co-locating the system's behavioral specifications directly within the root of the source code repository.

### Guiding Principles:
* **Specific**: Rules must define concrete bounds, states, and operations rather than vague intent.
* **Testable**: Every invariant must be capable of empirical verification through a unit test, property-based check, static check, or execution trace.
* **Unambiguous**: Pre-conditions, post-conditions, and expected error states must have deterministic definitions.
* **Version-Controlled**: Specifications evolve in the same pull requests that modify implementation code.

---

## 2. Specification Structure

An `INVARIANT.md` document is composed of standardized Markdown sections. Machine-parseable tags (`[INVARIANT]`, `[CONTRACT]`, `[EDGE-CASE]`) allow automated tools to extract structured verification goals while remaining clean and readable for human developers.

### Required & Recommended Sections:
1. **Metadata Frontmatter**: Machine-readable specification version and target scope.
2. **Project Overview**: High-level context of the service or component.
3. **Invariants & Business Rules**: Unconditional logical rules that must hold true at all times across all system states.
4. **API Contracts**: Pre-conditions, post-conditions, inputs, and response expectations for public endpoints or methods.
5. **Edge Cases**: Specific boundary inputs, concurrency scenarios, and unusual states.
6. **Expected Failure Behavior**: Documented failure modes, HTTP status codes, and error envelopes.
7. **Verification Expectations**: Guidance indicating which test suites or verification strategies apply.

---

## 3. Illustrative Specification Example: Inventory Management API

The following example demonstrates a complete, valid `INVARIANT.md` specification for an inventory management service.

```markdown
---
spec_version: "1.0.0"
target_system: "InventoryService"
status: "Active"
verification_level: "Strict"
---

# Inventory Management Service Specification

## 1. Project Overview
The Inventory Management Service is responsible for tracking item stock levels, reserving units for pending customer orders, and fulfilling or canceling stock reservations.

---

## 2. Invariants & Business Rules

### INV-01: Non-Negative Stock Balance [INVARIANT]
* **Rule**: An item's available stock level must never drop below zero under any sequence of operations or concurrent transactions.
* **Formal Assertion**: `item.available_stock >= 0`
* **Applies To**: `POST /inventory/reserve`, `POST /inventory/deduct`, `POST /inventory/restock`
* **Severity**: Critical

### INV-02: Conservation of Inventory State [INVARIANT]
* **Rule**: The total stock of any item must always equal the sum of its available stock, reserved stock, and fulfilled stock.
* **Formal Assertion**: `item.total_stock == (item.available_stock + item.reserved_stock + item.fulfilled_stock)`
* **Applies To**: All inventory mutation routines.
* **Severity**: Critical

### INV-03: Idempotent Reservation Cancellation [INVARIANT]
* **Rule**: Canceling an already canceled or non-existent reservation ID must result in a no-op post-state without modifying stock counters.
* **Formal Assertion**: `POST /reservations/{id}/cancel` called multiple times yields identical final state.
* **Severity**: High

---

## 3. API Contracts

### Contract: Reserve Stock [CONTRACT]
* **Endpoint**: `POST /api/v1/inventory/reserve`
* **Pre-conditions**:
  * `request.quantity > 0`
  * `request.item_id` corresponds to an existing, active product catalog entry.
* **Post-conditions**:
  * `item.available_stock_after == item.available_stock_before - request.quantity`
  * `item.reserved_stock_after == item.reserved_stock_before + request.quantity`
  * Returns HTTP `201 Created` with unique `reservation_id` and ISO-8601 expiry timestamp.
* **Failure Modes**:
  * If `request.quantity > item.available_stock`: Must return HTTP `409 Conflict` with error code `INSUFFICIENT_STOCK`. Stock counters must remain unchanged.
  * If `request.quantity <= 0`: Must return HTTP `400 Bad Request` with error code `INVALID_QUANTITY`.

---

## 4. Edge Cases

### EDGE-01: Zero and Negative Quantity Ingestion [EDGE-CASE]
* Any reservation request with `quantity <= 0` must be rejected immediately during input schema validation before acquiring database locks.

### EDGE-02: Concurrent Reservation Race Condition [EDGE-CASE]
* When two concurrent transactions attempt to reserve the final remaining stock of an item (e.g., available stock = 1, both request 1), exactly one transaction must succeed (`201 Created`) and the second transaction must fail (`409 Conflict`). Under no interleaving may both succeed.

### EDGE-03: Integer Overflow on Restock [EDGE-CASE]
* Adding stock (`POST /inventory/restock`) with extremely large values (e.g., `2^31 - 1`) must not overflow 32-bit or 64-bit integer limits.

---

## 5. Expected Failure Behavior

| Triggering Condition | Expected HTTP Code | Error Code Identifier | Expected State Change |
| :--- | :--- | :--- | :--- |
| Insufficient available stock | `409 Conflict` | `INSUFFICIENT_STOCK` | Zero mutation; balance preserved. |
| Negative quantity in payload | `400 Bad Request` | `INVALID_QUANTITY` | Zero mutation; rejected at ingress. |
| Non-existent item ID | `404 Not Found` | `ITEM_NOT_FOUND` | Zero mutation. |
| Expired reservation cancellation | `410 Gone` | `RESERVATION_EXPIRED` | Released stock already restored; no-op. |

---

## 6. Verification Expectations

* **Unit & Integration Tests**: All happy paths and 4xx failure modes must be covered by automated test suites located in `tests/test_inventory.py`.
* **Property-Based Testing**: Rule `INV-01` and `INV-02` must be validated using property-based generation (e.g., Hypothesis) simulating random concurrent reservation/restock sequences.
* **Static Analysis**: Linter rules must prohibit raw, unparameterized database queries modifying stock counters outside atomic transactions.
```

---

## 4. Authoring Guidelines: Writing Testable Invariants

To maximize the effectiveness of Invariant, write rules that conform to the following criteria:

| Quality | Weak Example | Strong, Testable Example |
| :--- | :--- | :--- |
| **Precision** | "Stock should never be too low." | "Available stock must be `>= 0` at all times." |
| **Atomicity** | "The API is robust against errors." | "When inventory is insufficient, the endpoint returns HTTP `409 Conflict` with body `{'error': 'INSUFFICIENT_STOCK'}` and does not alter stock values." |
| **Concurrency** | "Handles multiple users well." | "Simultaneous reservations totaling more than available stock must fail with HTTP `409` for all requests beyond available capacity." |
| **Error Cases** | "Invalid requests fail." | "Requests with non-positive quantities (`quantity <= 0`) are rejected with HTTP `400 Bad Request`." |

---

## 5. Automated Enforcement vs. Planned Capabilities

> [!NOTE]
> It is vital to understand what Invariant enforces automatically today versus planned capabilities.

* **Specification Validation & Parsing** *[Design/Specification Complete]*:
  * Invariant parses markdown headers, tags (`[INVARIANT]`, `[CONTRACT]`), and metadata blocks.
  * Structural linting identifies missing error models or untagged invariant claims.
* **Deterministic Unit & Property Test Execution** *[Planned]*:
  * Invariant executes repository test harnesses inside sandboxes to confirm assertions linked to invariant IDs.
* **Automated Test Synthesis from Invariants** *[Planned/Future]*:
  * Synthesizing full executable property tests directly from natural-language invariant text via the AI API is a planned roadmap capability. In the initial phase, developers author test harnesses in their repository test suites, and Invariant orchestrates their continuous verification against the declared rules.
