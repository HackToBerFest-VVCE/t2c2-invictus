import React from "react";
import Link from "next/link";
import { VerificationRun } from "../types";
import { StatusBadge } from "./StatusBadge";

interface RunCardProps {
  run: VerificationRun;
}

export const RunCard: React.FC<RunCardProps> = ({ run }) => {
  const isPass = run.status === "VERIFIED_PASS";
  const isFailure = run.status === "VERIFIED_FAILURE";
  const findingsCount = run.findings ? run.findings.length : 0;

  return (
    <div className="liquid-glass liquid-glass-interactive rounded-xl overflow-hidden group">
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Status Icon + Run Info */}
        <div className="flex items-start space-x-3.5 min-w-0">
          <div className="mt-0.5 flex-shrink-0">
            {isPass ? (
              <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-bold font-mono shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                ✔
              </span>
            ) : isFailure ? (
              <span className="w-6 h-6 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center justify-center text-xs font-bold font-mono shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                ✖
              </span>
            ) : (
              <span className="w-6 h-6 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center justify-center text-xs font-bold font-mono shadow-[0_0_12px_rgba(168,85,247,0.3)]">
                ✦
              </span>
            )}
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center space-x-2.5 flex-wrap">
              <Link
                href={`/runs/${run.id}`}
                className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors truncate"
              >
                {run.summary || `Verification Run #${run.id}`}
              </Link>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[#8b949e] font-mono backdrop-blur-sm">
                {run.id}
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs text-[#8b949e] flex-wrap gap-y-1">
              <span className="font-mono text-indigo-400 hover:text-indigo-300 transition-colors">
                {run.commit_sha ? run.commit_sha.substring(0, 7) : "HEAD"}
              </span>
              <span className="text-white/20">&bull;</span>
              <span className="inline-flex items-center space-x-1.5 font-mono text-white/90 bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-sm">
                <svg className="w-3 h-3 text-indigo-400" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a1 1 0 00-1 1v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.836A2.492 2.492 0 016 7h4a1 1 0 001-1v-.628A2.25 2.25 0 019.5 3.25zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zM3.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z" />
                </svg>
                <span>{run.branch}</span>
              </span>
              <span className="text-white/20">&bull;</span>
              <span className="uppercase text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5 text-[#8b949e]">
                {run.event_type}
              </span>
              <span className="text-white/20">&bull;</span>
              <span>{new Date(run.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right: Duration, Findings count, badge & CTA */}
        <div className="flex items-center space-x-3.5 self-end md:self-center flex-shrink-0">
          {findingsCount > 0 && (
            <span className="text-xs text-white/60 font-mono bg-white/[0.03] px-2 py-0.5 rounded border border-white/5">
              {findingsCount} finding{findingsCount > 1 ? "s" : ""}
            </span>
          )}

          <div className="text-xs font-mono text-[#8b949e]">
            {run.duration_ms} ms
          </div>

          <StatusBadge status={run.status} size="sm" />

          <Link
            href={`/runs/${run.id}`}
            className="text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors flex items-center space-x-1 pl-1"
          >
            <span>Details</span>
            <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
