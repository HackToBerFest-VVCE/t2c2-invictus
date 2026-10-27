import React, { useState } from "react";
import {
  MessageSquareText,
  UploadCloud,
  X,
  Sparkles,
  FileText,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { ChatContextFile, Finding } from "../../data/ivieMockData";

interface IvieChatContextDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  chatContexts: ChatContextFile[];
  onAddContext: (context: ChatContextFile) => void;
  onFeedHypothesesToFindings: (newFinding: Finding) => void;
}

export const IvieChatContextDrawer: React.FC<IvieChatContextDrawerProps> = ({
  isOpen,
  onClose,
  onOpen,
  chatContexts,
  onAddContext,
  onFeedHypothesesToFindings,
}) => {
  const [pastedText, setPastedText] = useState("");
  const [contextTitle, setContextTitle] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleQuickLoad = (type: "slack" | "copilot") => {
    if (type === "slack") {
      setContextTitle("incident-slack-discount.md");
      setPastedText(`@sarah: Customer invoice in staging shows 45% discount applied.
@alex: Checking src/discount.ts: applyDiscount() lacks clamp against 30% MAX_DISCOUNT_PERCENT!
@marcus: This violates REQ-001. Please run verification.`);
    } else {
      setContextTitle("copilot-cart-null-check.md");
      setPastedText(`Copilot Review:
File: src/cart.ts:42
Finding: calculateCartTotal iterates cart.items without null-check for sparse items. Directly breaches REQ-003.`);
    }
  };

  const handleUploadContext = () => {
    if (!pastedText.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      const newFile: ChatContextFile = {
        id: `ctx-${Date.now()}`,
        name: contextTitle.trim() || `chat-upload-${Date.now().toString().slice(-4)}.md`,
        size: `${(pastedText.length / 1024).toFixed(1)} KB`,
        timestamp: "Just now",
        messageCount: pastedText.split("\n").filter((l) => l.trim()).length,
        extractedHypothesesCount: 2,
        rawContent: pastedText,
        extractedNotes: [
          "Violation hypothesis: Unclamped discount ceiling in applyDiscount()",
          "Null safety gap: cart.items sparse array iteration",
        ],
      };
      onAddContext(newFile);

      // Create a finding
      const genFinding: Finding = {
        id: `IV-00${Math.floor(Math.random() * 80) + 10}`,
        title: "Chat Context Flag: Unclamped discount parameter breaches 30% limit",
        description: `Synthesized from side-tab chat upload (${newFile.name}): Thread analysis detected missing clamp validation against REQ-001.`,
        file: "src/discount.ts",
        line: 14,
        severity: "High",
        status: "Reproduced",
        confidence: 95,
        reviewed: false,
        dismissed: false,
        confirmed: true,
        repo: "acme/checkout-service",
        branch: "feature/discount-validation",
        commit: "a82f19c",
        requirementId: "REQ-001",
        requirementQuote: "Discounts must never exceed configured maximum discount percentage (30%).",
        requirementContext: "Ingested directly from side-tab chat context.",
        codeSnippet: `export function applyDiscount(price: number, discount: number): number {\n  return price * (1 - discount / 100);\n}`,
        codeLanguage: "typescript",
        testId: "TEST-CHAT-01",
        testName: "verifyChatDiscountBreach",
        testInput: "{ price: 100, discount: 45 }",
        expectedBehavior: "Clamped to 30% or rejected",
        actualResult: "Applied 45% discount directly",
        testExecutionStatus: "Failed",
        reasoning: "Chat context provided deterministic reproduction input for this invariant gap.",
      };
      onFeedHypothesesToFindings(genFinding);
      setSuccessMsg(true);
      setPastedText("");
      setContextTitle("");
      setTimeout(() => setSuccessMsg(false), 3000);
    }, 1000);
  };

  return (
    <>
      {/* Docked Side Tab on Right Edge */}
      {!isOpen && (
        <button
          onClick={onOpen}
          aria-label="Open Chat Context side panel"
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-[#161b22] border-l border-t border-b border-indigo-500/40 hover:border-indigo-500 text-indigo-300 hover:text-white px-2.5 py-4 rounded-l-xl shadow-2xl transition-all flex flex-col items-center space-y-2 group cursor-pointer hover:bg-[#21262d]"
        >
          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <MessageSquareText className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="text-[11px] font-mono font-semibold tracking-wider [writing-mode:vertical-rl] rotate-180 uppercase text-[#c9d1d9] group-hover:text-white">
            Chat Context
          </span>
          <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {chatContexts.length}
          </span>
        </button>
      )}

      {/* Slide-Out Side Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#161b22] border-l border-[#30363d] h-full shadow-2xl flex flex-col text-[#c9d1d9] animate-slideLeft overflow-hidden">
            {/* Drawer Top Header */}
            <div className="p-4 px-5 border-b border-[#30363d] flex items-center justify-between bg-[#0d1117]">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <MessageSquareText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#f0f6fc]">
                    Upload Chat Context
                  </h3>
                  <p className="text-[11px] text-[#8b949e]">
                    Synthesize transcripts into IVIE verification rules
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Quick Load Buttons */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-[#8b949e] block">
                  Quick Load Preset Thread:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleQuickLoad("slack")}
                    className="flex-1 py-1.5 px-2 rounded bg-[#0d1117] hover:bg-[#21262d] text-[#c9d1d9] hover:text-white border border-[#30363d] font-mono text-[11px] transition-colors"
                  >
                    Slack Incident #482
                  </button>
                  <button
                    onClick={() => handleQuickLoad("copilot")}
                    className="flex-1 py-1.5 px-2 rounded bg-[#0d1117] hover:bg-[#21262d] text-[#c9d1d9] hover:text-white border border-[#30363d] font-mono text-[11px] transition-colors"
                  >
                    Copilot PR Review #42
                  </button>
                </div>
              </div>

              {/* Title input */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-[#8b949e] block">
                  Transcript Name
                </label>
                <input
                  type="text"
                  value={contextTitle}
                  onChange={(e) => setContextTitle(e.target.value)}
                  placeholder="e.g. pr-discussion-review.md"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Textarea */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-[#8b949e] block">
                  Chat / Review Content
                </label>
                <textarea
                  rows={8}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste chat transcripts, developer review comments, or incident logs..."
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md p-3 text-xs text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
                />
              </div>

              {/* Ingest Action Button */}
              <button
                onClick={handleUploadContext}
                disabled={isAnalyzing || !pastedText.trim()}
                className="w-full py-2.5 px-4 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs transition-all flex items-center justify-center space-x-2 shadow-sm"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Parsing Context & Synthesizing Findings...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    <span>Upload & Inject into Pipeline</span>
                  </>
                )}
              </button>

              {successMsg && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center space-x-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Hypotheses successfully extracted and added to Findings Explorer!</span>
                </div>
              )}

              {/* Active Archive Summary in Drawer */}
              <div className="pt-3 border-t border-[#30363d] space-y-2">
                <span className="text-[10px] font-mono uppercase text-[#8b949e] block">
                  Existing Uploaded Transcripts ({chatContexts.length})
                </span>
                <div className="space-y-1.5">
                  {chatContexts.map((ctx) => (
                    <div
                      key={ctx.id}
                      className="p-2.5 rounded bg-[#0d1117] border border-[#30363d] text-[11px] font-mono flex items-center justify-between"
                    >
                      <div className="truncate pr-2">
                        <span className="text-[#f0f6fc] block truncate">{ctx.name}</span>
                        <span className="text-[#8b949e] text-[10px]">{ctx.size} · {ctx.timestamp}</span>
                      </div>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 whitespace-nowrap">
                        {ctx.extractedHypothesesCount} rules
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 px-5 border-t border-[#30363d] bg-[#0d1117] flex justify-between items-center text-[11px] font-mono text-[#8b949e]">
              <span>IVIE Context Synthesizer</span>
              <button
                onClick={onClose}
                className="px-3 py-1 rounded bg-[#21262d] text-[#c9d1d9] hover:text-white border border-[#30363d]"
              >
                Close Side Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
