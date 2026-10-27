import React, { useState } from "react";
import {
  GitBranch,
  GitCommit,
  CheckCircle2,
  ChevronRight,
  Info,
  ArrowRight,
  Sparkles,
  Play,
  Layers,
  FileCheck2,
  ShieldAlert,
} from "lucide-react";
import { Finding, PipelineStage, INITIAL_PIPELINE_STAGES } from "../../data/ivieMockData";
import { StatusBadge, SeverityBadge } from "./IvieBadges";
import { IviePipelineStageModal } from "./IviePipelineStageModal";

interface IvieOverviewProps {
  findings: Finding[];
  selectedRepo: string;
  onSelectFinding: (finding: Finding) => void;
  onNavigateToRuns: () => void;
  onNavigateToFindings: () => void;
}

export const IvieOverview: React.FC<IvieOverviewProps> = ({
  findings,
  selectedRepo,
  onSelectFinding,
  onNavigateToRuns,
  onNavigateToFindings,
}) => {
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);

  // Compute metrics from current state
  const totalFindings = findings.length;
  const reviewedCount = findings.filter((f) => f.reviewed || f.confirmed || f.dismissed).length;
  const reproducedCount = findings.filter((f) => f.status === "Reproduced").length;
  const potentialCount = findings.filter((f) => f.status === "Potential").length;
  const inconclusiveCount = findings.filter((f) => f.status === "Inconclusive").length;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#30363d] pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-[#f0f6fc] tracking-tight">
              Verification Overview
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-semibold">
              Demo Run
            </span>
          </div>
          <p className="text-xs text-[#8b949e] mt-1 max-w-2xl">
            Evaluate suspected issues against requirements, code changes, and test evidence.
          </p>

          {/* Context Badges */}
          <div className="flex items-center space-x-2.5 text-xs font-mono text-[#8b949e] mt-3 flex-wrap gap-y-1.5">
            <span className="px-2 py-0.5 rounded bg-[#161b22] border border-[#30363d] text-[#c9d1d9] flex items-center space-x-1.5">
              <span>Repo:</span>
              <strong className="text-indigo-400 font-semibold">{selectedRepo}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-[#161b22] border border-[#30363d] text-[#c9d1d9] flex items-center space-x-1.5">
              <GitBranch className="w-3 h-3 text-[#8b949e]" />
              <span>feature/discount-validation</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-[#161b22] border border-[#30363d] text-[#8b949e] flex items-center space-x-1">
              <GitCommit className="w-3 h-3 text-[#8b949e]" />
              <span>a82f19c</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-[#161b22] border border-[#30363d] text-indigo-300">
              Run: #VR-1042
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Completed · Demo</span>
            </span>
          </div>
        </div>

        <button
          onClick={onNavigateToRuns}
          className="self-start md:self-auto px-3.5 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Launch Verification Run</span>
        </button>
      </div>

      {/* Summary Metrics (4 Compact Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-1">
          <div className="text-[11px] font-mono text-[#8b949e] uppercase tracking-wider">
            Findings Reviewed
          </div>
          <div className="text-2xl font-bold font-mono text-[#f0f6fc]">
            {reviewedCount} <span className="text-xs font-normal text-[#8b949e]">/ {totalFindings}</span>
          </div>
          <div className="text-[10px] text-[#8b949e]">
            {Math.round((reviewedCount / (totalFindings || 1)) * 100)}% review coverage
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-1">
          <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
            Reproduced
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {reproducedCount}
          </div>
          <div className="text-[10px] text-[#8b949e]">
            Confirmed violation evidence
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-1">
          <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider">
            Potential
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {potentialCount}
          </div>
          <div className="text-[10px] text-[#8b949e]">
            Requires boundary test data
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#161b22] border border-[#30363d] space-y-1">
          <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
            Inconclusive
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-300">
            {inconclusiveCount}
          </div>
          <div className="text-[10px] text-[#8b949e]">
            Non-deterministic traces
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 text-[11px] text-[#8b949e] italic">
        <Info className="w-3.5 h-3.5 text-[#8b949e] flex-shrink-0" />
        <span>Metrics and classifications reflect synthetic demonstration fixtures in this simulation.</span>
      </div>

      {/* Verification Pipeline Stepper */}
      <div className="p-5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-sm text-[#f0f6fc] flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Verification Pipeline Stages</span>
            </h3>
            <p className="text-[11px] text-[#8b949e]">
              Click on any stage to inspect sample telemetry and AST artifacts.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>5/5 Completed</span>
          </span>
        </div>

        {/* Horizontal Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
          {INITIAL_PIPELINE_STAGES.map((stage, idx) => (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage)}
              className="p-3 rounded-lg bg-[#0d1117] border border-[#30363d] hover:border-indigo-500/50 hover:bg-[#1f242c] text-left transition-all group flex flex-col justify-between space-y-2 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <span className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-mono text-[10px] font-bold">
                  ✓
                </span>
                <span className="font-mono text-[10px] text-[#8b949e]">
                  {stage.duration}
                </span>
              </div>
              <div>
                <span className="font-semibold text-xs text-[#f0f6fc] group-hover:text-indigo-300 transition-colors block truncate">
                  {stage.name}
                </span>
                <span className="text-[10px] text-[#8b949e] block mt-0.5 truncate">
                  {stage.metrics}
                </span>
              </div>
              <div className="text-[10px] text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-0.5 pt-1 border-t border-[#30363d]/40">
                <span>Inspect details</span>
                <ChevronRight className="w-2.5 h-2.5" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Findings Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-sm text-[#f0f6fc] flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <span>Recent Verification Findings</span>
            </h3>
            <p className="text-[11px] text-[#8b949e]">
              Issues evaluated against INVARIANT.md contracts. Click row to inspect code and test evidence.
            </p>
          </div>
          <button
            onClick={onNavigateToFindings}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
          >
            <span>View all findings ({totalFindings})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="rounded-lg border border-[#30363d] bg-[#161b22] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0d1117] text-[#8b949e] font-mono text-[11px] border-b border-[#30363d] uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5">Finding ID</th>
                  <th className="py-2.5 px-3.5">Suspected Issue</th>
                  <th className="py-2.5 px-3.5">File & Location</th>
                  <th className="py-2.5 px-3.5">Severity</th>
                  <th className="py-2.5 px-3.5">Verification Status</th>
                  <th className="py-2.5 px-3.5 text-right">Confidence</th>
                  <th className="py-2.5 px-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d] font-sans">
                {findings.slice(0, 5).map((finding) => (
                  <tr
                    key={finding.id}
                    onClick={() => onSelectFinding(finding)}
                    className="hover:bg-[#1f242c] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3.5 font-mono font-bold text-indigo-400 whitespace-nowrap">
                      {finding.id}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-[#f0f6fc] group-hover:text-indigo-300 transition-colors">
                        {finding.title}
                      </div>
                      <div className="text-[11px] text-[#8b949e] line-clamp-1 mt-0.5">
                        {finding.description}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 font-mono text-[11px] text-[#8b949e] whitespace-nowrap">
                      {finding.file}:{finding.line}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <SeverityBadge severity={finding.severity} />
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <StatusBadge status={finding.status} />
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono font-semibold text-[#c9d1d9] whitespace-nowrap">
                      {finding.confidence}%
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFinding(finding);
                        }}
                        className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] hover:text-[#ffffff] text-[11px] font-medium border border-[#30363d]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stage Telemetry Modal */}
      <IviePipelineStageModal
        stage={selectedStage}
        onClose={() => setSelectedStage(null)}
      />
    </div>
  );
};
