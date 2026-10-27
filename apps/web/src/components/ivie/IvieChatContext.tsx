import React, { useState } from "react";
import {
  UploadCloud,
  MessageSquareText,
  FileText,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Trash2,
  Code,
  FileCode,
  Layers,
  Terminal,
  Info,
  Clock,
  Send,
  Loader2,
} from "lucide-react";
import { ChatContextFile, Finding } from "../../data/ivieMockData";

interface IvieChatContextProps {
  chatContexts: ChatContextFile[];
  onAddContext: (context: ChatContextFile) => void;
  onDeleteContext: (id: string) => void;
  onFeedHypothesesToFindings: (newFinding: Finding) => void;
}

export const IvieChatContext: React.FC<IvieChatContextProps> = ({
  chatContexts,
  onAddContext,
  onDeleteContext,
  onFeedHypothesesToFindings,
}) => {
  const [selectedContext, setSelectedContext] = useState<ChatContextFile>(chatContexts[0]);
  const [pastedText, setPastedText] = useState("");
  const [contextTitle, setContextTitle] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    hypotheses: string[];
    contractViolations: string[];
  } | null>(null);
  const [fedSuccess, setFedSuccess] = useState(false);

  // Quick preset loading
  const handleLoadSample = (sampleType: "slack" | "copilot" | "customer") => {
    if (sampleType === "slack") {
      setContextTitle("slack-thread-discount-ceiling.md");
      setPastedText(`[14:02] @sarah.qa: Customer in staging triggered a 45% discount on checkout.
[14:05] @alex.dev: Looking into src/discount.ts: applyDiscount() checks if discount < 0, but never clamps to MAX_DISCOUNT_PERCENT (30%).
[14:08] @marcus.lead: Invariant breach! Coupon stacking also allows expired promo codes if session cache is stale.`);
    } else if (sampleType === "copilot") {
      setContextTitle("copilot-review-null-cart.md");
      setPastedText(`[Copilot Agent Review]
File: src/cart.ts:42
Finding: calculateCartTotal dereferences item.sku without verifying if item is null.
Directly violates REQ-003: Cart operations must validate required values before processing line totals.`);
    } else {
      setContextTitle("customer-support-ticket-819.txt");
      setPastedText(`Ticket #819: Customer charged twice for single checkout button click.
Log trace: Webhook burst occurred within 15ms. Duplicate authorization token generated before status switched to ORDER_PLACED.`);
    }
  };

  const handleProcessContext = () => {
    if (!pastedText.trim()) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setFedSuccess(false);

    setTimeout(() => {
      setIsAnalyzing(false);
      const fileName = contextTitle.trim() || `chat-context-${Date.now().toString().slice(-4)}.md`;
      const newFile: ChatContextFile = {
        id: `ctx-${Date.now()}`,
        name: fileName,
        size: `${(pastedText.length / 1024).toFixed(1)} KB`,
        timestamp: "Just now",
        messageCount: pastedText.split("\n").filter((l) => l.trim()).length,
        extractedHypothesesCount: 2,
        rawContent: pastedText,
        extractedNotes: [
          "Violation hypothesis: Unclamped discount parameter breaches REQ-001 ceiling (30%)",
          "Concurrency gap: Duplicate checkout captures observed under webhook burst",
        ],
      };

      onAddContext(newFile);
      setSelectedContext(newFile);
      setAnalysisResult({
        hypotheses: [
          "Discount computation parameter exceeds permitted ceiling (30%)",
          "Session coupon cache allows expired promotional tokens to bypass UTC expiry check",
        ],
        contractViolations: ["REQ-001 (Discount Limits)", "REQ-004 (Checkout Idempotency)"],
      });
    }, 1200);
  };

  const handleFeedToPipeline = () => {
    const generatedFinding: Finding = {
      id: `IV-00${Math.floor(Math.random() * 80) + 10}`,
      title: "Extracted from Chat: Excessive discount parameter bypasses 30% clamp",
      description: `Synthesized from chat context (${selectedContext.name}): Automated thread analysis flagged un-clamped discount logic violating REQ-001 business limits.`,
      file: "src/discount.ts",
      line: 14,
      severity: "High",
      status: "Reproduced",
      confidence: 94,
      reviewed: false,
      dismissed: false,
      confirmed: true,
      repo: "acme/checkout-service",
      branch: "feature/discount-validation",
      commit: "a82f19c",
      requirementId: "REQ-001",
      requirementQuote: "Discounts must never exceed the configured maximum discount percentage (MAX_DISCOUNT_PERCENT = 30%).",
      requirementContext: "Derived from user chat context upload.",
      codeSnippet: `export function applyDiscount(price: number, discount: number): number {
  // Flagged from uploaded chat context
  return price * (1 - discount / 100);
}`,
      codeLanguage: "typescript",
      testId: "TEST-CHAT-01",
      testName: "verifyChatExtractedDiscountBreach",
      testInput: "{ price: 100, discount: 45 }",
      expectedBehavior: "Clamped to 30% or rejected with Error",
      actualResult: "Applied 45% discount directly",
      testExecutionStatus: "Failed",
      reasoning: "Chat context conversation provided direct reproduction steps for this invariant breach. Directly cross-correlated with REQ-001.",
    };

    onFeedHypothesesToFindings(generatedFinding);
    setFedSuccess(true);
    setTimeout(() => setFedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363d] pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-[#f0f6fc] tracking-tight">
              Chat Context Uploader & Synthesis
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-semibold">
              Context Parser
            </span>
          </div>
          <p className="text-xs text-[#8b949e] mt-1 max-w-2xl">
            Upload AI conversation transcripts, PR comments, or incident chat logs to automatically extract bug hypotheses and evaluate them against project INVARIANT.md rules.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-[#8b949e]">Loaded Transcripts:</span>
          <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {chatContexts.length} Active
          </span>
        </div>
      </div>

      {/* Main Grid: Left Column is Upload/Paste, Right Column is Inspector & Extractor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload / Paste Input Box */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-[#f0f6fc] flex items-center space-x-2">
                <UploadCloud className="w-4 h-4 text-indigo-400" />
                <span>Upload or Paste Chat Context</span>
              </h3>
              <span className="text-[11px] font-mono text-[#8b949e]">Markdown / JSON / Logs</span>
            </div>

            {/* Quick Sample Buttons */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-[#8b949e] block">
                Quick-Load Preset Transcripts:
              </span>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => handleLoadSample("slack")}
                  className="px-2.5 py-1 rounded bg-[#0d1117] hover:bg-[#21262d] text-[#c9d1d9] hover:text-[#f0f6fc] border border-[#30363d] transition-colors"
                >
                  Slack War-Room #checkout
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample("copilot")}
                  className="px-2.5 py-1 rounded bg-[#0d1117] hover:bg-[#21262d] text-[#c9d1d9] hover:text-[#f0f6fc] border border-[#30363d] transition-colors"
                >
                  Copilot PR Review #42
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample("customer")}
                  className="px-2.5 py-1 rounded bg-[#0d1117] hover:bg-[#21262d] text-[#c9d1d9] hover:text-[#f0f6fc] border border-[#30363d] transition-colors"
                >
                  Support Incident #819
                </button>
              </div>
            </div>

            {/* Context Title Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase text-[#8b949e] block">
                Transcript Name / Label
              </label>
              <input
                type="text"
                value={contextTitle}
                onChange={(e) => setContextTitle(e.target.value)}
                placeholder="e.g. pr-42-copilot-discussion.md"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            {/* Paste Context Textarea */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] font-mono text-[#8b949e]">
                <span>Conversation Content:</span>
                <span>{pastedText.length} characters</span>
              </div>
              <textarea
                rows={9}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste chat conversation, developer discussion, or Copilot review feedback here..."
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md p-3 text-xs text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
              />
            </div>

            {/* Action Button */}
            <button
              onClick={handleProcessContext}
              disabled={isAnalyzing || !pastedText.trim()}
              className="w-full py-2.5 px-4 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-all flex items-center justify-center space-x-2 shadow-sm"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Parsing Context & Extracting Invariant Rules...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-200" />
                  <span>Parse & Extract Bug Hypotheses</span>
                </>
              )}
            </button>
          </div>

          {/* Uploaded Transcripts Library */}
          <div className="p-5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs text-[#f0f6fc] flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Transcript Archive ({chatContexts.length})</span>
              </h3>
              <span className="text-[10px] font-mono text-[#8b949e]">Click to inspect</span>
            </div>

            <div className="space-y-2">
              {chatContexts.map((ctx) => {
                const isSelected = selectedContext?.id === ctx.id;
                return (
                  <div
                    key={ctx.id}
                    onClick={() => setSelectedContext(ctx)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-[#21262d] border-indigo-500/50 shadow-sm"
                        : "bg-[#0d1117] border-[#30363d] hover:border-indigo-500/30 hover:bg-[#1a2028]"
                    }`}
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex items-center space-x-2">
                        <MessageSquareText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        <span className="font-mono text-xs font-semibold text-[#f0f6fc] truncate">
                          {ctx.name}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-[#8b949e]">
                        {ctx.size} · {ctx.messageCount} messages · {ctx.timestamp}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {ctx.extractedHypothesesCount} hypotheses
                      </span>
                      {chatContexts.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteContext(ctx.id);
                          }}
                          className="p-1 rounded text-[#8b949e] hover:text-[#f85149] hover:bg-[#21262d]"
                          title="Delete transcript"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Context Inspector & Synthesis Engine */}
        <div className="lg:col-span-6 space-y-4">
          {/* Active Context Content Preview */}
          <div className="p-5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-3">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#8b949e] block">
                  Active Context Inspector
                </span>
                <span className="font-bold text-sm text-[#f0f6fc] font-mono">
                  {selectedContext?.name}
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#8b949e] px-2 py-0.5 rounded bg-[#0d1117] border border-[#30363d]">
                {selectedContext?.size}
              </span>
            </div>

            <pre className="p-3.5 bg-[#0d1117] rounded-lg border border-[#30363d] font-mono text-[11px] text-[#c9d1d9] leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap">
              {selectedContext?.rawContent}
            </pre>
          </div>

          {/* Extracted Invariant Hypotheses */}
          <div className="p-5 rounded-lg bg-[#161b22] border border-indigo-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-xs text-[#f0f6fc]">
                  Extracted Invariant Hypotheses & Evidence
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Synthesis Ready</span>
              </span>
            </div>

            <div className="space-y-2">
              {(analysisResult?.hypotheses || selectedContext?.extractedNotes || []).map(
                (note, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] text-xs space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                        HYP-0{i + 1}
                      </span>
                      <span className="font-semibold text-[#f0f6fc]">{note}</span>
                    </div>
                    <p className="text-[11px] text-[#8b949e] pl-6">
                      Correlated against Project INVARIANT.md contracts: REQ-001 (Discount Limits) & REQ-004 (Idempotency).
                    </p>
                  </div>
                )
              )}
            </div>

            {/* Feed to Findings Button */}
            <div className="pt-2 border-t border-[#30363d] flex items-center justify-between">
              {fedSuccess ? (
                <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-mono animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Added to IVIE Findings Explorer!</span>
                </div>
              ) : (
                <span className="text-[11px] text-[#8b949e] font-mono">
                  Inject into active verification pipeline:
                </span>
              )}

              <button
                onClick={handleFeedToPipeline}
                className="px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-sm"
              >
                <span>Feed to Findings Explorer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
