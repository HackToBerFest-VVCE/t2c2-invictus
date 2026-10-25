import React, { useState } from "react";
import { Finding } from "../types";
import { StatusBadge } from "./StatusBadge";

interface FindingCardProps {
  finding: Finding;
}

export const FindingCard: React.FC<FindingCardProps> = ({ finding }) => {
  const [expandedTrace, setExpandedTrace] = useState<boolean>(true);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  const copyToClipboard = (text: string, isScript = false) => {
    navigator.clipboard.writeText(text);
    if (isScript) {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    } else {
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    }
  };

  const generateReproductionScript = (): string => {
    const cmd = finding.reproduction_command || "pytest -v";
    return `#!/usr/bin/env bash
# ==============================================================================
# Invariant Automated Failure Reproduction Script
# Finding ID: ${finding.id}
# Invariant ID: ${finding.invariant_id || "N/A"}
# Severity: ${finding.severity}
# Target: ${finding.file_path || "General"}
# ==============================================================================

set -euo pipefail

echo "========================================================"
echo " Repro: ${finding.title}"
echo " Expected: ${finding.expected_behavior || "None"}"
echo "========================================================"

# Run the exact failing assertion harness
echo "Executing: ${cmd}"
${cmd}
`;
  };

  const downloadScript = () => {
    const script = generateReproductionScript();
    const blob = new Blob([script], { type: "text/x-sh" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reproduce_${finding.invariant_id || finding.id}.sh`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]";
      case "HIGH":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-300 border-amber-500/20";
      case "LOW":
        return "bg-blue-500/10 text-blue-300 border-blue-500/20";
      case "INFO":
      default:
        return "bg-white/[0.04] text-white/70 border-white/10";
    }
  };

  return (
    <div className="liquid-glass rounded-xl overflow-hidden text-[#c9d1d9] space-y-0 transition-all hover:border-white/20">
      {/* Finding Header with Liquid Glass Bar */}
      <div className="p-4 sm:p-5 bg-white/[0.02] border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[#8b949e]">
              {finding.id}
            </span>
            {finding.invariant_id && (
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                {finding.invariant_id}
              </span>
            )}
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border backdrop-blur-sm ${getSeverityStyle(
                finding.severity
              )}`}
            >
              {finding.severity}
            </span>
            {finding.ai_assisted && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                ✦ AI-Engine Assisted
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-white mt-1">{finding.title}</h4>
        </div>

        <div className="flex items-center space-x-3">
          <StatusBadge status={finding.verification_status} size="sm" />
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Source Location */}
        {finding.file_path && (
          <div className="flex items-center space-x-2 text-xs font-mono text-[#8b949e]">
            <span>Target Location:</span>
            <span className="bg-white/[0.04] px-2.5 py-1 rounded-md border border-white/10 text-indigo-300 backdrop-blur-sm">
              {finding.file_path}
              {finding.line_number ? `:${finding.line_number}` : ""}
            </span>
          </div>
        )}

        {/* Expected vs Actual Glass Wells */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {finding.expected_behavior && (
            <div className="p-3.5 rounded-lg bg-emerald-500/[0.04] border border-emerald-500/20 backdrop-blur-sm space-y-1">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                ✔ Expected Behavior (Specification)
              </span>
              <p className="text-xs text-white/90 font-mono leading-relaxed">
                {finding.expected_behavior}
              </p>
            </div>
          )}

          {finding.actual_behavior && (
            <div className="p-3.5 rounded-lg bg-rose-500/[0.04] border border-rose-500/20 backdrop-blur-sm space-y-1">
              <span className="text-[11px] font-semibold text-rose-400 uppercase tracking-wider block">
                ✖ Observed Failure / State
              </span>
              <p className="text-xs text-white/90 font-mono leading-relaxed">
                {finding.actual_behavior}
              </p>
            </div>
          )}
        </div>

        {/* Reproduction Command & Glass Scripts */}
        {finding.reproduction_command && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#8b949e]">
              <span className="font-semibold uppercase text-[11px] text-white/70">
                Reproduction Command:
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    copyToClipboard(finding.reproduction_command || "", false)
                  }
                  className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-white/80 border border-white/10 transition-all text-xs"
                >
                  {copiedCmd ? "✔ Copied" : "Copy Command"}
                </button>
                <button
                  onClick={downloadScript}
                  className="px-2.5 py-1 rounded-md bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-all flex items-center space-x-1 text-xs"
                >
                  <span>⇣</span>
                  <span>reproduce.sh</span>
                </button>
              </div>
            </div>
            <pre className="p-3 rounded-lg bg-[#070b13]/80 border border-white/[0.08] text-xs font-mono text-sky-300 overflow-x-auto shadow-inner">
              {finding.reproduction_command}
            </pre>
          </div>
        )}

        {/* Execution Trace Terminal Box */}
        {finding.execution_trace && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setExpandedTrace(!expandedTrace)}
                className="text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors flex items-center space-x-1.5"
              >
                <span>{expandedTrace ? "▼" : "▶"}</span>
                <span>{expandedTrace ? "Hide Execution Trace" : "Show Execution Trace & Raw Logs"}</span>
              </button>
              {expandedTrace && (
                <button
                  onClick={() => copyToClipboard(finding.execution_trace || "", true)}
                  className="text-[11px] text-white/60 hover:text-white transition-colors"
                >
                  {copiedScript ? "✔ Trace Copied" : "Copy Trace"}
                </button>
              )}
            </div>

            {expandedTrace && (
              <pre className="p-4 rounded-xl bg-[#060910]/95 border border-white/[0.08] text-xs font-mono text-rose-300 overflow-x-auto leading-relaxed max-h-96 shadow-2xl">
                {finding.execution_trace}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
