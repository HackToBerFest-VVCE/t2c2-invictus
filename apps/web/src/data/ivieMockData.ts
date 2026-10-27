export type VerificationStatus =
  | "Reproduced"
  | "Strongly Supported"
  | "Potential"
  | "Inconclusive"
  | "False Positive";

export type Severity = "Critical" | "High" | "Medium" | "Low";

export interface Finding {
  id: string;
  title: string;
  description: string;
  file: string;
  line: number;
  severity: Severity;
  status: VerificationStatus;
  confidence: number; // 0 - 100 illustrative percentage
  reviewed: boolean;
  dismissed: boolean;
  confirmed: boolean;
  repo: string;
  branch: string;
  commit: string;
  requirementId: string;
  requirementQuote: string;
  requirementContext: string;
  codeSnippet: string;
  codeLanguage: string;
  testId: string;
  testName: string;
  testInput: string;
  expectedBehavior: string;
  actualResult: string;
  testExecutionStatus: "Passed" | "Failed" | "Inconclusive";
  reasoning: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  status: "Completed" | "Running" | "Pending";
  duration: string;
  details: string;
  metrics: string;
}

export interface VerificationRun {
  id: string;
  repo: string;
  branch: string;
  commit: string;
  trigger: string;
  findingsCount: number;
  status: "Completed" | "Running" | "Failed";
  timestamp: string;
  duration: string;
  stagesCompleted: number;
  totalStages: number;
}

export interface Requirement {
  id: string;
  title: string;
  category: "Business Logic" | "Financial Precision" | "Input Validation" | "State & Concurrency" | "Security";
  description: string;
  invariantText: string;
  linkedFindingIds: string[];
}

export interface TestEvidenceItem {
  id: string;
  findingId: string;
  testScenario: string;
  input: string;
  expectedResult: string;
  actualResult: string;
  status: "Passed" | "Failed" | "Inconclusive" | "Not Executed";
  explanation: string;
  requirementId: string;
}

export const INITIAL_PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "stage-1",
    name: "Requirements Loaded",
    status: "Completed",
    duration: "140ms",
    details: "Loaded 5 declarative rules from project INVARIANT.md. Parsed AST assertions and semantic contracts.",
    metrics: "5 rules parsed · 0 syntax warnings",
  },
  {
    id: "stage-2",
    name: "Code Changes Analysed",
    status: "Completed",
    duration: "420ms",
    details: "Extracted git diff across 8 files (+284 / -91 lines). Generated control-flow and data-dependency graphs.",
    metrics: "8 files mapped · 14 changed functions",
  },
  {
    id: "stage-3",
    name: "Targeted Tests Simulated",
    status: "Completed",
    duration: "860ms",
    details: "Constructed targeted synthetic inputs exercising branch boundaries, numeric overflows, and null pointers.",
    metrics: "12 targeted scenarios simulated",
  },
  {
    id: "stage-4",
    name: "Evidence Evaluated",
    status: "Completed",
    duration: "310ms",
    details: "Cross-correlated simulated failure traces with formal invariant statements and git commit AST diffs.",
    metrics: "4 invariants correlated · 1 false lead rejected",
  },
  {
    id: "stage-5",
    name: "Findings Classified",
    status: "Completed",
    duration: "180ms",
    details: "Assigned conclusive verification classifications: 3 Reproduced, 4 Potential, 2 Inconclusive, 1 False Positive.",
    metrics: "Confidence scores derived (Illustrative)",
  },
];

export const INITIAL_FINDINGS: Finding[] = [
  {
    id: "IV-001",
    title: "Discount exceeds permitted limit",
    description: "The discount computation function fails to enforce the maximum ceiling threshold (30%) defined in INVARIANT.md, allowing cumulative discounts of up to 100%.",
    file: "src/discount.ts",
    line: 14,
    severity: "High",
    status: "Reproduced",
    confidence: 96,
    reviewed: false,
    dismissed: false,
    confirmed: true,
    repo: "acme/checkout-service",
    branch: "feature/discount-validation",
    commit: "a82f19c",
    requirementId: "REQ-001",
    requirementQuote: "Discounts must never exceed the configured maximum discount percentage (MAX_DISCOUNT_PERCENT = 30%).",
    requirementContext: "Any calculated percentage above 30% must raise a ValidationError or clamp to MAX_DISCOUNT_PERCENT.",
    codeSnippet: `export function applyDiscount(price: number, discount: number): number {
  // BUG: Missing clamp check against MAX_DISCOUNT_PERCENT (30%)
  if (discount < 0) {
    throw new Error("Discount cannot be negative");
  }
  return price * (1 - discount / 100);
}`,
    codeLanguage: "typescript",
    testId: "TEST-DISC-01",
    testName: "verifyDiscountCeilingExceeded",
    testInput: `{ price: 100, discount: 45 }`,
    expectedBehavior: "Expected Error('Discount exceeds maximum limit: 30%') or clamped result of 70",
    actualResult: "Returned 55 (45% discount applied without restriction)",
    testExecutionStatus: "Failed",
    reasoning: "Synthetic test harness successfully submitted discount = 45%. The function returned 55 instead of rejecting the operation. Directly violates REQ-001 assertion: `discount <= 30`.",
  },
  {
    id: "IV-002",
    title: "Missing null check in cart handler",
    description: "Cart item iteration dereferences `item.sku` without validating whether `item` is null or undefined after optional filtering.",
    file: "src/cart.ts",
    line: 42,
    severity: "Medium",
    status: "Strongly Supported",
    confidence: 82,
    reviewed: false,
    dismissed: false,
    confirmed: false,
    repo: "acme/checkout-service",
    branch: "feature/discount-validation",
    commit: "a82f19c",
    requirementId: "REQ-003",
    requirementQuote: "Cart operations must validate required values and handle sparse items before processing line totals.",
    requirementContext: "Sparse arrays or undefined items from API payloads must be skipped gracefully without throwing TypeError.",
    codeSnippet: `export function calculateCartTotal(cart: Cart): number {
  return cart.items.reduce((sum, item) => {
    // Potential TypeError if item is undefined in sparse array
    const linePrice = item.price * item.quantity;
    return sum + linePrice;
  }, 0);
}`,
    codeLanguage: "typescript",
    testId: "TEST-CART-04",
    testName: "verifySparseCartArrayHandling",
    testInput: `{ cart: { items: [ { price: 20, quantity: 2 }, null ] } }`,
    expectedBehavior: "Skip null item gracefully and return total = 40",
    actualResult: "TypeError: Cannot read properties of null (reading 'price')",
    testExecutionStatus: "Failed",
    reasoning: "Static AST analyzer detected unvalidated property access on array elements. Simulation confirmed runtime exception when payload contained sparse or null elements.",
  },
  {
    id: "IV-003",
    title: "Incorrect rounding at currency boundary",
    description: "Tax calculation uses floating-point multiplication directly without half-up cent rounding, causing 1-cent discrepancy on fractions.",
    file: "src/pricing.ts",
    line: 88,
    severity: "Medium",
    status: "Potential",
    confidence: 64,
    reviewed: false,
    dismissed: false,
    confirmed: false,
    repo: "acme/checkout-service",
    branch: "feature/discount-validation",
    commit: "a82f19c",
    requirementId: "REQ-002",
    requirementQuote: "All monetary calculations must use the configured currency precision (2 decimal places) and standard banker's/half-up rounding rules.",
    requirementContext: "Subtotal + Tax + Shipping must equal Grand Total down to the exact smallest currency unit (cent).",
    codeSnippet: `export function computeSalesTax(subtotal: number, taxRate: number): number {
  // Floating point precision leak: 19.99 * 0.0825 = 1.649175
  return Math.round(subtotal * taxRate * 100) / 100;
}`,
    codeLanguage: "typescript",
    testId: "TEST-CURR-09",
    testName: "verifyFractionalCentRounding",
    testInput: `{ subtotal: 19.99, taxRate: 0.0825 }`,
    expectedBehavior: "1.65 (Rounded according to currency config)",
    actualResult: "1.65 (Matches under standard rounding, but differs on compound cart sums by 0.01)",
    testExecutionStatus: "Passed",
    reasoning: "Single item round succeeds, but compound invoice summation across multi-currency orders exhibits intermittent 1-cent delta. Needs broader test coverage to definitively reproduce.",
  },
  {
    id: "IV-004",
    title: "Suspected race condition in checkout",
    description: "Parallel payment confirmation webhooks can simultaneously query cart state before status flag transitions to 'ORDER_PLACED'.",
    file: "src/checkout.ts",
    line: 124,
    severity: "High",
    status: "Inconclusive",
    confidence: 41,
    reviewed: false,
    dismissed: false,
    confirmed: false,
    repo: "acme/checkout-service",
    branch: "feature/discount-validation",
    commit: "a82f19c",
    requirementId: "REQ-004",
    requirementQuote: "Checkout must not create duplicate orders or initiate duplicate captures for the same confirmed transaction.",
    requirementContext: "Idempotency key locking must guard order finalization against concurrent webhook bursts.",
    codeSnippet: `export async function finalizeCheckout(cartId: string, paymentToken: string) {
  const cart = await getCart(cartId);
  if (cart.status === "COMPLETED") return; // Gap between read and write
  
  await processPayment(paymentToken);
  await updateCartStatus(cartId, "COMPLETED");
}`,
    codeLanguage: "typescript",
    testId: "TEST-RACE-02",
    testName: "simulateConcurrentCheckoutBursts",
    testInput: `Parallel invocation: finalizeCheckout('cart_101', 'tok_abc') x 5`,
    expectedBehavior: "Single order created, exactly 1 capture transaction",
    actualResult: "Simulated worker encountered lock contention; lock timeout prevented duplicate in 3 of 4 runs",
    testExecutionStatus: "Inconclusive",
    reasoning: "Code inspection indicates a theoretical check-then-act race condition, but distributed lock simulation produced non-deterministic results. Flagged as Inconclusive pending stress harness.",
  },
  {
    id: "IV-005",
    title: "Unnecessary validation warning on zero-dollar items",
    description: "Promotional zero-dollar gift items trigger a false 'INVALID_ITEM_PRICE' diagnostic warning during order normalization.",
    file: "src/validator.ts",
    line: 56,
    severity: "Low",
    status: "False Positive",
    confidence: 18,
    reviewed: false,
    dismissed: true,
    confirmed: false,
    repo: "acme/checkout-service",
    branch: "feature/discount-validation",
    commit: "a82f19c",
    requirementId: "REQ-005",
    requirementQuote: "Input validation must reject strictly negative prices but permit promotional zero-cost line items (price >= 0).",
    requirementContext: "Price validation predicate is intended to catch negative quantities or prices, not gift items.",
    codeSnippet: `export function validateLineItem(item: LineItem): boolean {
  // False positive trigger: price === 0 is valid for promotional gifts
  if (item.price <= 0) {
    logger.warn("Potential price anomaly: " + item.sku);
  }
  return item.price >= 0;
}`,
    codeLanguage: "typescript",
    testId: "TEST-VAL-03",
    testName: "testPromotionalGiftItemValidation",
    testInput: `{ sku: 'FREE-GIFT-PEN', price: 0, quantity: 1 }`,
    expectedBehavior: "Accepted as valid line item with zero warning",
    actualResult: "Warning emitted to console, but line item accepted successfully",
    testExecutionStatus: "Passed",
    reasoning: "The logger warning does not impact order creation or violate transaction invariants. The validator correctly returns true for zero-dollar items. Classified as False Positive.",
  },
  {
    id: "IV-006",
    title: "Unchecked coupon expiry in session cache",
    description: "Cached session tokens allow expired coupons to remain applicable if checkout completes within 10 minutes of cache invalidation.",
    file: "src/coupon.ts",
    line: 33,
    severity: "Medium",
    status: "Reproduced",
    confidence: 91,
    reviewed: true,
    dismissed: false,
    confirmed: true,
    repo: "acme/checkout-service",
    branch: "feature/discount-validation",
    commit: "a82f19c",
    requirementId: "REQ-001",
    requirementQuote: "Promotional codes must validate UTC expiration timestamp at the exact time of order placement.",
    requirementContext: "Stale session cached coupons must be re-validated against current epoch time.",
    codeSnippet: `export function isCouponActive(coupon: Coupon): boolean {
  // Stale check uses session creation time instead of Date.now()
  return coupon.sessionCachedTimestamp < coupon.expiryTimestamp;
}`,
    codeLanguage: "typescript",
    testId: "TEST-COUP-01",
    testName: "verifyExpiredCouponRejection",
    testInput: `{ couponCode: 'FLASH30', expiry: '2026-10-27T10:00:00Z', currentTime: '2026-10-27T11:00:00Z' }`,
    expectedBehavior: "Return false and reject coupon as expired",
    actualResult: "Returned true based on session creation time (09:45:00Z)",
    testExecutionStatus: "Failed",
    reasoning: "Deterministic simulation proved coupon with past expiry is accepted if user started session 15 minutes prior. High severity business logic violation.",
  },
];

export const INITIAL_VERIFICATION_RUNS: VerificationRun[] = [
  {
    id: "#VR-1042",
    repo: "acme/checkout-service",
    branch: "feature/discount-validation",
    commit: "a82f19c",
    trigger: "Pull Request #42",
    findingsCount: 6,
    status: "Completed",
    timestamp: "12 minutes ago",
    duration: "1.91s",
    stagesCompleted: 5,
    totalStages: 5,
  },
  {
    id: "#VR-1041",
    repo: "acme/checkout-service",
    branch: "main",
    commit: "f4021bb",
    trigger: "Merge commit into main",
    findingsCount: 2,
    status: "Completed",
    timestamp: "3 hours ago",
    duration: "1.45s",
    stagesCompleted: 5,
    totalStages: 5,
  },
  {
    id: "#VR-1040",
    repo: "acme/inventory-worker",
    branch: "fix/deadlock-backoff",
    commit: "c381d09",
    trigger: "Push to branch",
    findingsCount: 4,
    status: "Completed",
    timestamp: "Yesterday at 17:30",
    duration: "2.10s",
    stagesCompleted: 5,
    totalStages: 5,
  },
  {
    id: "#VR-1039",
    repo: "acme/checkout-service",
    branch: "refactor/cart-store",
    commit: "e1903aa",
    trigger: "Manual verification run",
    findingsCount: 1,
    status: "Completed",
    timestamp: "2 days ago",
    duration: "1.65s",
    stagesCompleted: 5,
    totalStages: 5,
  },
];

export const INITIAL_REQUIREMENTS: Requirement[] = [
  {
    id: "REQ-001",
    title: "Discount Limits & Expiry",
    category: "Business Logic",
    description: "Discounts must never exceed the configured maximum discount percentage (MAX_DISCOUNT_PERCENT = 30%). Promotional codes must validate UTC expiration timestamp at the exact moment of order authorization.",
    invariantText: "assert discount <= MAX_DISCOUNT_PERCENT (30%)\nassert coupon.expiry_timestamp > current_timestamp()",
    linkedFindingIds: ["IV-001", "IV-006"],
  },
  {
    id: "REQ-002",
    title: "Currency Precision & Banker's Rounding",
    category: "Financial Precision",
    description: "All monetary calculations must use the configured currency precision and standard rounding rules. Subtotal + Tax + Shipping must exactly match Grand Total with zero floating point drift.",
    invariantText: "assert round_currency(subtotal + tax + shipping) == grand_total\nassert currency_precision == 2",
    linkedFindingIds: ["IV-003"],
  },
  {
    id: "REQ-003",
    title: "Cart Sparse Array & Null Safety",
    category: "Input Validation",
    description: "Cart operations must validate required values before processing. Sparse line items or null references from API payloads must be handled without throwing uncaught exceptions.",
    invariantText: "assert all(item is not None for item in cart.items)\nassert item.price >= 0 and item.quantity > 0",
    linkedFindingIds: ["IV-002"],
  },
  {
    id: "REQ-004",
    title: "Checkout Idempotency & Order Integrity",
    category: "State & Concurrency",
    description: "Checkout must not create duplicate orders or initiate duplicate payment captures for the same confirmed transaction under concurrent webhook retries.",
    invariantText: "assert count(orders_by_idempotency_key(key)) <= 1\nassert payment_captures_for_cart(cart_id) <= 1",
    linkedFindingIds: ["IV-004"],
  },
  {
    id: "REQ-005",
    title: "Boundary Conditions & Promotional Gifts",
    category: "Input Validation",
    description: "Input validation must reject strictly negative prices but permit promotional zero-cost gift items (price >= 0) without triggering error diagnostics.",
    invariantText: "assert item.price >= 0\nassert not emit_error_if(item.price == 0 and item.is_promotional)",
    linkedFindingIds: ["IV-005"],
  },
];

export const INITIAL_TEST_EVIDENCE: TestEvidenceItem[] = [
  {
    id: "TEST-DISC-01",
    findingId: "IV-001",
    testScenario: "Excessive discount clamp enforcement",
    input: "{ price: 100, discount: 45 }",
    expectedResult: "Error('Discount exceeds maximum limit: 30%') or clamped to 70",
    actualResult: "Returned 55 (applied 45% discount unrestricted)",
    status: "Failed",
    explanation: "Confirms that discounts above the 30% ceiling bypass clamp logic entirely and reduce price below minimum business margins.",
    requirementId: "REQ-001",
  },
  {
    id: "TEST-CART-04",
    findingId: "IV-002",
    testScenario: "Sparse array with null cart item",
    input: "{ cart: { items: [ { price: 20, quantity: 2 }, null ] } }",
    expectedResult: "Gracefully skip null item, return sum = 40",
    actualResult: "TypeError: Cannot read properties of null (reading 'price')",
    status: "Failed",
    explanation: "Demonstrates that malformed API payloads directly crash the pricing pipeline with an unhandled runtime error.",
    requirementId: "REQ-003",
  },
  {
    id: "TEST-CURR-09",
    findingId: "IV-003",
    testScenario: "Fractional cent sales tax rounding",
    input: "{ subtotal: 19.99, taxRate: 0.0825 }",
    expectedResult: "1.65 (Rounded to 2 decimals)",
    actualResult: "1.65 (Matches under single line, but produces 0.01 drift across aggregated multi-item invoices)",
    status: "Passed",
    explanation: "Single scenario passes, but cumulative invoice summation indicates potential 1-cent variance across regional jurisdictions.",
    requirementId: "REQ-002",
  },
  {
    id: "TEST-RACE-02",
    findingId: "IV-004",
    testScenario: "Concurrent webhook checkout finalization bursts",
    input: "Parallel invocation: finalizeCheckout('cart_101', 'tok_abc') x 5",
    expectedResult: "Single order record created, 1 payment capture executed",
    actualResult: "Lock contention observed; non-deterministic execution in mock runner",
    status: "Inconclusive",
    explanation: "High risk of race condition identified in source code, but simulated concurrency harness did not trigger double-charge deterministically.",
    requirementId: "REQ-004",
  },
  {
    id: "TEST-VAL-03",
    findingId: "IV-005",
    testScenario: "Zero-cost promotional item validation",
    input: "{ sku: 'FREE-GIFT-PEN', price: 0, quantity: 1 }",
    expectedResult: "Valid line item accepted, 0 anomaly warnings",
    actualResult: "Warning logged to console, item accepted",
    status: "Passed",
    explanation: "The diagnostic warning is cosmetic only. Functional invariants remain intact and order authorises normally.",
    requirementId: "REQ-005",
  },
  {
    id: "TEST-COUP-01",
    findingId: "IV-006",
    testScenario: "Expired coupon with stale session cache timestamp",
    input: "{ couponCode: 'FLASH30', expiry: '10:00:00Z', currentTime: '11:00:00Z' }",
    expectedResult: "Coupon rejected with 'COUPON_EXPIRED'",
    actualResult: "Coupon accepted because session creation time (09:45:00Z) was checked",
    status: "Failed",
    explanation: "Validates that stale session cache allows expired discounts to leak into final purchase transactions.",
    requirementId: "REQ-001",
  },
];
