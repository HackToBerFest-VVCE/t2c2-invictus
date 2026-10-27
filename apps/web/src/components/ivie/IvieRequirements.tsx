import React, { useState } from "react";
import {
  ListTree,
  Search,
  BookOpen,
  FileCode,
  ShieldAlert,
  ArrowRight,
  Code,
  CheckCircle2,
} from "lucide-react";
import { Requirement, Finding } from "../../data/ivieMockData";

interface IvieRequirementsProps {
  requirements: Requirement[];
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
}

export const IvieRequirements: React.FC<IvieRequirementsProps> = ({
  requirements,
  findings,
  onSelectFinding,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReq, setSelectedReq] = useState<Requirement>(requirements[0]);
  const [activeSubTab, setActiveSubTab] = useState<"structured" | "raw">("structured");

  const filteredRequirements = requirements.filter(
    (req) =>
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rawInvariantMarkdown = `# Project Invariant Specification (INVARIANT.md)
Target System: acme/checkout-service (v2.4.0)

## 1. Business Logic Invariants
### REQ-001 — Discount Limits & Expiry
Discounts must never exceed the configured maximum discount percentage (MAX_DISCOUNT_PERCENT = 30%).
- Formal Assertion: \`assert discount <= 30\`
- Temporal Condition: \`assert coupon.expiry_timestamp > current_timestamp()\`

## 2. Financial Precision Invariants
### REQ-002 — Currency Precision & Banker's Rounding
All monetary calculations must use configured currency precision and standard half-up rounding.
- Formal Assertion: \`assert round_currency(subtotal + tax + shipping) == grand_total\`

## 3. Input Validation Invariants
### REQ-003 — Cart Sparse Array & Null Safety
Cart operations must validate required values before processing line totals.
- Formal Assertion: \`assert all(item is not None for item in cart.items)\`

### REQ-005 — Boundary Conditions & Promotional Gifts
Validation predicates must reject negative values but allow promotional items.
- Formal Assertion: \`assert item.price >= 0\`

## 4. State & Concurrency Invariants
### REQ-004 — Checkout Idempotency & Order Integrity
Checkout transactions must enforce idempotency keys to prevent duplicate order finalization.
- Formal Assertion: \`assert count(orders_by_idempotency_key(key)) <= 1\``;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363d] pb-5">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] tracking-tight">
            Requirements Explorer (`INVARIANT.md`)
          </h1>
          <p className="text-xs text-[#8b949e] mt-1">
            Formal contract rules loaded from repository specifications used to evaluate bug hypotheses.
          </p>
        </div>

        {/* Tab Toggle: Structured vs Raw Markdown */}
        <div className="flex items-center space-x-1 p-1 bg-[#161b22] border border-[#30363d] rounded-lg self-start sm:self-auto text-xs font-mono">
          <button
            onClick={() => setActiveSubTab("structured")}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeSubTab === "structured"
                ? "bg-[#21262d] text-[#f0f6fc] font-semibold shadow-sm"
                : "text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            Structured View
          </button>
          <button
            onClick={() => setActiveSubTab("raw")}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeSubTab === "raw"
                ? "bg-[#21262d] text-[#f0f6fc] font-semibold shadow-sm"
                : "text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            Raw INVARIANT.md
          </button>
        </div>
      </div>

      {activeSubTab === "raw" ? (
        <div className="rounded-lg border border-[#30363d] bg-[#161b22] overflow-hidden">
          <div className="px-4 py-2 border-b border-[#30363d] bg-[#0d1117] flex items-center justify-between text-xs font-mono text-[#8b949e]">
            <span>examples/checkout-service/INVARIANT.md</span>
            <span>Markdown · UTF-8</span>
          </div>
          <pre className="p-6 font-mono text-xs text-[#c9d1d9] leading-relaxed overflow-x-auto">
            <code>{rawInvariantMarkdown}</code>
          </pre>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Requirements List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8b949e]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search requirements by ID, title, or category..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#161b22] border border-[#30363d] rounded-md text-xs text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="space-y-2">
              {filteredRequirements.map((req) => {
                const isSelected = selectedReq.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedReq(req)}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all space-y-1.5 ${
                      isSelected
                        ? "bg-[#21262d] border-indigo-500/50 shadow-sm"
                        : "bg-[#161b22] border-[#30363d] hover:border-indigo-500/30 hover:bg-[#1a2028]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                        {req.id}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0d1117] border border-[#30363d] text-[#8b949e]">
                        {req.category}
                      </span>
                    </div>

                    <h4 className="font-semibold text-xs text-[#f0f6fc]">
                      {req.title}
                    </h4>

                    <p className="text-[11px] text-[#8b949e] line-clamp-2">
                      {req.description}
                    </p>

                    <div className="flex items-center space-x-1.5 text-[10px] font-mono text-[#8b949e] pt-1">
                      <ShieldAlert className="w-3 h-3 text-amber-400" />
                      <span>Linked Findings: {req.linkedFindingIds.length}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Requirement Details & Linked Findings */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-4">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                    {selectedReq.id}
                  </span>
                  <span className="font-bold text-base text-[#f0f6fc]">
                    {selectedReq.title}
                  </span>
                </div>
                <span className="text-xs font-mono text-[#8b949e]">
                  Category: {selectedReq.category}
                </span>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-[#8b949e] block">
                  Requirement Statement
                </span>
                <p className="text-xs text-[#c9d1d9] leading-relaxed bg-[#0d1117] p-3 rounded-lg border border-[#30363d]">
                  {selectedReq.description}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-[#8b949e] block">
                  Declarative Assertion Expression
                </span>
                <pre className="p-3 bg-[#0d1117] rounded-lg border border-[#30363d] font-mono text-xs text-indigo-300 overflow-x-auto">
                  <code>{selectedReq.invariantText}</code>
                </pre>
              </div>
            </div>

            {/* Linked Findings Section */}
            <div className="p-5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-xs text-[#f0f6fc] flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Linked Bug Hypotheses ({selectedReq.linkedFindingIds.length})</span>
                </h3>
                <span className="text-[10px] font-mono text-[#8b949e]">
                  Click to inspect evidence
                </span>
              </div>

              <div className="space-y-2">
                {selectedReq.linkedFindingIds.map((fId) => {
                  const findingObj = findings.find((f) => f.id === fId);
                  if (!findingObj) return null;

                  return (
                    <div
                      key={findingObj.id}
                      onClick={() => onSelectFinding(findingObj)}
                      className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] hover:border-indigo-500/50 hover:bg-[#1f242c] transition-all cursor-pointer flex items-center justify-between"
                    >
                      <div className="space-y-1 min-w-0 pr-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-indigo-400">
                            {findingObj.id}
                          </span>
                          <span className="font-semibold text-xs text-[#f0f6fc] truncate">
                            {findingObj.title}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-[#8b949e]">
                          {findingObj.file}:{findingObj.line} · Confidence: {findingObj.confidence}%
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <span className="text-xs text-indigo-400 font-mono flex items-center space-x-0.5">
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
