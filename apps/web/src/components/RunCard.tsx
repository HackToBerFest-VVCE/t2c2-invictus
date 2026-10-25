import React from "react";
import Link from "next/link";
import { VerificationRun } from "../types";
import { StatusBadge } from "./StatusBadge";

interface RunCardProps {
  run: VerificationRun;
}

export const RunCard: React.FC<RunCardProps> = ({ run }) => {
  return (
    <Link
      href={`/runs/${run.id}`}
      className="block p-5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900/90 hover:border-slate-700 transition-all duration-150"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-sm text-indigo-400 font-semibold">
              {run.commit_sha.substring(0, 7)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {run.branch}
            </span>
            <span className="text-xs text-slate-500 uppercase">{run.event_type}</span>
          </div>
          <p className="text-sm text-slate-300 line-clamp-1">
            {run.summary || "Continuous invariant verification executed."}
          </p>
        </div>

        <div className="flex items-center space-x-4 self-start sm:self-auto">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-slate-400">{run.duration_ms} ms</div>
            <div className="text-xs text-slate-500">
              {new Date(run.created_at).toLocaleTimeString()}
            </div>
          </div>
          <StatusBadge status={run.status} />
        </div>
      </div>
    </Link>
  );
};
