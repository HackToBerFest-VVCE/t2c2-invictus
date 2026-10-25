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
        return "bg-[#da3633]/20 text-[#f85149] border-[#da3633]/40";
      case "HIGH":
        return "bg-[#da3633]/10 text-[#ff7b72] border-[#da3633]/30";
      case "MEDIUM":
        return "bg-[#d29922]/15 text-[#e3b341] border-[#d29922]/30";
      case "LOW":
        return "bg-[#58a6ff]/15 text-[#58a6ff] border-[#58a6ff]/30";
      case "INFO":
      default:
        return "bg-[#21262d] text-[#8b949e] border-[#30363d]";
    }
  };

  return (
    <div className="border border-[#30363d] rounded-md bg-[#161b22] overflow-hidden text-[#c9d1d9] space-y-0">
      {/* Finding Header */}
      <div className="p-4 bg-[#21262d]/50 border-b border-[#30363d] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#0d1117] border border-[#30363d] text-[#8b949e]">
              {finding.id}
            </span>
            {finding.invariant_id && (
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#388bfd]/15 text-[#58a6ff] border border-[#388bfd]/30">
                {finding.invariant_id}
              </span>
            )}
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded border ${getSeverityStyle(
                finding.severity
              )}`}
            >
              {finding.severity}
            </span>
            {finding.ai_assisted && (
              <span className="text-xs px-2 py-0.5 rounded bg-[#bc8cff]/15 text-[#d2a8ff] border border-[#bc8cff]/40 font-mono">
                ✦ AI-Engine Assisted
              </span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-[#f0f6fc] mt-1">{finding.title}</h4>
        </div>

        <div className="flex items-center space-x-3">
          <StatusBadge status={finding.verification_status} size="sm" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Source Location */}
        {finding.file_path && (
          <div className="flex items-center space-x-2 text-xs font-mono text-[#8b949e]">
            <span className="text-[#8b949e]">Location:</span>
            <span className="bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d] text-[#58a6ff]">
              {finding.file_path}
              {finding.line_number ? `:${finding.line_number}` : ""}
            </span>
          </div>
        )}

        {/* Expected vs Actual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {finding.expected_behavior && (
            <div className="p-3 rounded-md bg-[#0d1117] border border-[#238636]/30 space-y-1">
              <span className="text-[11px] font-semibold text-[#3fb950] uppercase tracking-wider block">
                ✔ Expected Behavior (Specification)
              </span>
              <p className="text-xs text-[#c9d1d9] font-mono leading-relaxed">
                {finding.expected_behavior}
              </p>
            </div>
          )}

          {finding.actual_behavior && (
            <div className="p-3 rounded-md bg-[#0d1117] border border-[#da3633]/30 space-y-1">
              <span className="text-[11px] font-semibold text-[#f85149] uppercase tracking-wider block">
                ✖ Observed Failure / State
              </span>
              <p className="text-xs text-[#c9d1d9] font-mono leading-relaxed">
                {finding.actual_behavior}
              </p>
            </div>
          )}
        </div>

        {/* Reproduction Command & Scripts */}
        {finding.reproduction_command && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-[#8b949e]">
              <span className="font-semibold uppercase text-[11px]">
                Reproduction Command:
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() =>
                    copyToClipboard(finding.reproduction_command || "", false)
                  }
                  className="px-2 py-0.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] border border-[#30363d] transition-colors"
                >
                  {copiedCmd ? "✔ Copied" : "Copy Command"}
                </button>
                <button
                  onClick={downloadScript}
                  className="px-2 py-0.5 rounded bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] border border-[#30363d] transition-colors flex items-center space-x-1"
                >
                  <span>⇣</span>
                  <span>reproduce.sh</span>
                </button>
              </div>
            </div>
            <pre className="p-2.5 rounded-md bg-[#0d1117] border border-[#30363d] text-xs font-mono text-[#79c0ff] overflow-x-auto">
              {finding.reproduction_command}
            </pre>
          </div>
        )}

        {/* Execution Trace Viewer */}
        {finding.execution_trace && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setExpandedTrace(!expandedTrace)}
                className="text-xs font-mono text-[#58a6ff] hover:underline flex items-center space-x-1"
              >
                <span>{expandedTrace ? "▼" : "▶"}</span>
                <span>{expandedTrace ? "Hide Execution Trace" : "Show Execution Trace & Raw Logs"}</span>
              </button>
              {expandedTrace && (
                <button
                  onClick={() => copyToClipboard(finding.execution_trace || "", true)}
                  className="text-[11px] text-[#8b949e] hover:text-[#c9d1d9]"
                >
                  {copiedScript ? "✔ Trace Copied" : "Copy Trace"}
                </button>
              )}
            </div>

            {expandedTrace && (
              <pre className="p-3.5 rounded-md bg-[#090d13] border border-[#30363d] text-xs font-mono text-[#f85149] overflow-x-auto leading-relaxed max-h-96">
                {finding.execution_trace}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
