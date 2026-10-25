import React, { useState } from "react";
import { Finding } from "../types";
import { StatusBadge } from "./StatusBadge";

interface FindingCardProps {
  finding: Finding;
}

export const FindingCard: React.FC<FindingCardProps> = ({ finding }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {finding.id}
            </span>
            {finding.invariant_id && (
              <span className="text-xs font-mono font-bold text-indigo-400">
                {finding.invariant_id}
              </span>
            )}
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-950/60 text-rose-400">
              {finding.severity}
            </span>
          </div>
          <h4 className="text-base font-semibold text-slate-100">{finding.title}</h4>
        </div>

        <div>
          <StatusBadge status={finding.verification_status} size="sm" />
        </div>
      </div>

      <div className="text-sm space-y-2 text-slate-300">
        {finding.expected_behavior && (
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider block">
              Expected Behavior:
            </span>
            <p className="text-slate-300">{finding.expected_behavior}</p>
          </div>
        )}
        {finding.actual_behavior && (
          <div>
            <span className="text-xs text-slate-500 uppercase tracking-wider block">
              Actual Behavior:
            </span>
            <p className="text-slate-300">{finding.actual_behavior}</p>
          </div>
        )}
      </div>

      {finding.reproduction_command && (
        <div className="space-y-1">
          <span className="text-xs text-slate-500 uppercase tracking-wider block">
            Reproduction Command / Test Input:
          </span>
          <pre className="bg-slate-950 p-2.5 rounded border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
            {finding.reproduction_command}
          </pre>
        </div>
      )}

      {finding.execution_trace && (
        <div className="space-y-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold focus:outline-none"
          >
            {expanded ? "▼ Hide Execution Trace" : "▶ Show Execution Trace & Evidence"}
          </button>

          {expanded && (
            <pre className="mt-2 bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs font-mono text-rose-300 overflow-x-auto leading-relaxed">
              {finding.execution_trace}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
