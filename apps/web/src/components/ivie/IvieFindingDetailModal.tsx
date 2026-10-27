import React, { useState } from "react";
import {
  X,
  FileCode,
  BookOpen,
  FlaskConical,
  CheckCircle2,
  XCircle,
  HelpCircle,
  GitBranch,
  GitCommit,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { Finding, VerificationStatus } from "../../data/ivieMockData";
import { StatusBadge, SeverityBadge } from "./IvieBadges";

interface IvieFindingDetailModalProps {
  finding: Finding | null;
  onClose: () => void;
  onToggleReviewed: (id: string) => void;
  onToggleConfirmed: (id: string) => void;
  onToggleDismissed: (id: string) => void;
  onChangeStatus: (id: string, status: VerificationStatus) => void;
  onNavigateToRequirement?: (reqId: string) => void;
  onNavigateToTest?: (testId: string) => void;
}

export const IvieFindingDetailModal: React.FC<IvieFindingDetailModalProps> = ({
  finding,
  onClose,
  onToggleReviewed,
  onToggleConfirmed,
  onToggleDismissed,
  onChangeStatus,
  onNavigateToRequirement,
  onNavigateToTest,
}) => {
  if (!finding) return null;

  const [isChangingStatus, setIsChangingStatus] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-[#c9d1d9]">
        {/* Modal Top Header */}
        <div className="p-4 px-6 border-b border-[#30363d] flex items-start justify-between bg-[#0d1117]/80">
          <div className="space-y-1.5 min-w-0 pr-4">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                {finding.id}
              </span>
              <SeverityBadge severity={finding.severity} />
              <StatusBadge status={finding.status} />

              {finding.reviewed && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/30 text-emerald-400 border border-emerald-500/30">
                  ✓ Reviewed
                </span>
              )}
              {finding.dismissed && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/30 text-rose-400 border border-rose-500/30">
                  ⊘ Dismissed
                </span>
              )}
              {finding.confirmed && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/30 text-blue-400 border border-blue-500/30">
                  ★ Confirmed
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-[#f0f6fc] tracking-tight">
              {finding.title}
            </h2>
            <div className="flex items-center space-x-3 text-xs text-[#8b949e] font-mono flex-wrap">
              <span className="flex items-center space-x-1">
                <FileCode className="w-3.5 h-3.5" />
                <span className="text-[#c9d1d9]">{finding.file}:{finding.line}</span>
              </span>
              <span>·</span>
              <span className="flex items-center space-x-1">
                <GitBranch className="w-3.5 h-3.5" />
                <span>{finding.branch}</span>
              </span>
              <span>·</span>
              <span className="flex items-center space-x-1">
                <GitCommit className="w-3.5 h-3.5" />
                <span>@{finding.commit}</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#21262d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs leading-relaxed">
          {/* Issue Overview & Confidence Score */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg bg-[#0d1117] border border-[#30363d]">
            <div className="md:col-span-3 space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#8b949e]">
                Executive Issue Summary
              </span>
              <p className="text-xs text-[#c9d1d9] leading-relaxed">
                {finding.description}
              </p>
            </div>
            <div className="border-t md:border-t-0 md:border-l border-[#30363d] pt-3 md:pt-0 md:pl-4 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase text-[#8b949e]">
                  Confidence
                </span>
                <span className="font-mono text-sm font-bold text-indigo-400">
                  {finding.confidence}%
                </span>
              </div>
              <div className="w-full bg-[#21262d] h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all"
                  style={{ width: `${finding.confidence}%` }}
                />
              </div>
              <p className="text-[10px] text-[#8b949e] mt-1.5 italic leading-tight">
                Illustrative demonstration score, not calibrated statistical probability.
              </p>
            </div>
          </div>

          {/* SECTION 1: Requirement Evidence (INVARIANT.md) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-semibold text-[#f0f6fc]">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Project Requirement Evidence (`INVARIANT.md`)</span>
              </div>
              {onNavigateToRequirement && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToRequirement(finding.requirementId);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center space-x-1"
                >
                  <span>{finding.requirementId} Specs</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
            <div className="p-3.5 rounded-lg bg-indigo-950/20 border border-indigo-500/30 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[10px]">
                  {finding.requirementId}
                </span>
                <span className="font-semibold text-xs text-[#f0f6fc]">Contract Statement</span>
              </div>
              <blockquote className="border-l-2 border-indigo-500/60 pl-3 italic text-xs text-indigo-100/90 font-mono">
                "{finding.requirementQuote}"
              </blockquote>
              <p className="text-[11px] text-[#8b949e]">
                <strong className="text-[#c9d1d9]">Impact Analysis:</strong> {finding.requirementContext}
              </p>
            </div>
          </div>

          {/* SECTION 2: Affected Code Snippet */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-semibold text-[#f0f6fc]">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>Suspected Code Location</span>
              </div>
              <span className="font-mono text-[11px] text-[#8b949e]">
                {finding.file}:{finding.line}
              </span>
            </div>
            <div className="rounded-lg bg-[#0d1117] border border-[#30363d] overflow-hidden">
              <div className="px-3 py-1.5 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between text-[11px] font-mono text-[#8b949e]">
                <span>{finding.file}</span>
                <span>TypeScript</span>
              </div>
              <pre className="p-3.5 font-mono text-xs overflow-x-auto text-[#c9d1d9] leading-relaxed">
                <code>{finding.codeSnippet}</code>
              </pre>
            </div>
          </div>

          {/* SECTION 3: Targeted Test Execution Evidence */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm font-semibold text-[#f0f6fc]">
                <FlaskConical className="w-4 h-4 text-amber-400" />
                <span>Targeted Test Evidence</span>
              </div>
              {onNavigateToTest && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToTest(finding.testId);
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-mono flex items-center space-x-1"
                >
                  <span>{finding.testId} Trace</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="font-mono font-semibold text-xs text-[#f0f6fc]">
                  {finding.testName}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    finding.testExecutionStatus === "Failed"
                      ? "bg-rose-950/40 text-rose-400 border border-rose-500/30"
                      : finding.testExecutionStatus === "Passed"
                      ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  }`}
                >
                  Execution: {finding.testExecutionStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[11px] font-mono">
                <div className="p-2.5 rounded bg-[#161b22] border border-[#30363d]/70 space-y-1">
                  <span className="text-[#8b949e] block font-semibold text-[10px] uppercase">
                    Simulated Input Payload:
                  </span>
                  <span className="text-indigo-300 break-all">{finding.testInput}</span>
                </div>

                <div className="p-2.5 rounded bg-[#161b22] border border-[#30363d]/70 space-y-1">
                  <span className="text-[#8b949e] block font-semibold text-[10px] uppercase">
                    Expected Invariant Outcome:
                  </span>
                  <span className="text-emerald-300">{finding.expectedBehavior}</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-rose-950/20 border border-rose-500/20 text-[11px] font-mono space-y-1">
                <span className="text-rose-400 font-semibold text-[10px] uppercase block">
                  Simulated Actual Result:
                </span>
                <span className="text-rose-200">{finding.actualResult}</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: Classification Reasoning */}
          <div className="space-y-2">
            <span className="text-sm font-semibold text-[#f0f6fc] block">
              Classification Reasoning & Synthesis
            </span>
            <div className="p-3.5 rounded-lg bg-[#0d1117] border border-[#30363d] text-xs text-[#c9d1d9] leading-relaxed">
              {finding.reasoning}
            </div>
          </div>
        </div>

        {/* Modal Action Controls Footer */}
        <div className="p-4 px-6 border-t border-[#30363d] bg-[#0d1117] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Change Verification Status Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono text-[#8b949e]">Reclassify Status:</span>
            <select
              value={finding.status}
              onChange={(e) => onChangeStatus(finding.id, e.target.value as VerificationStatus)}
              className="bg-[#161b22] border border-[#30363d] text-xs font-semibold text-[#f0f6fc] rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="Reproduced">Reproduced</option>
              <option value="Strongly Supported">Strongly Supported</option>
              <option value="Potential">Potential</option>
              <option value="Inconclusive">Inconclusive</option>
              <option value="False Positive">False Positive</option>
            </select>
          </div>

          {/* Interactive Action Buttons */}
          <div className="flex items-center space-x-2 justify-end">
            <button
              onClick={() => onToggleReviewed(finding.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                finding.reviewed
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/50"
                  : "bg-[#21262d] text-[#c9d1d9] border-[#30363d] hover:text-[#f0f6fc]"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{finding.reviewed ? "Reviewed" : "Mark Reviewed"}</span>
            </button>

            <button
              onClick={() => onToggleConfirmed(finding.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                finding.confirmed
                  ? "bg-blue-950/40 text-blue-300 border-blue-500/50"
                  : "bg-[#21262d] text-[#c9d1d9] border-[#30363d] hover:text-[#f0f6fc]"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{finding.confirmed ? "Confirmed" : "Confirm Finding"}</span>
            </button>

            <button
              onClick={() => onToggleDismissed(finding.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center space-x-1.5 ${
                finding.dismissed
                  ? "bg-rose-950/40 text-rose-300 border-rose-500/50"
                  : "bg-[#21262d] text-[#c9d1d9] border-[#30363d] hover:text-[#f85149]"
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{finding.dismissed ? "Restore" : "Dismiss Finding"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
