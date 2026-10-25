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
    <div className="border border-[#30363d] rounded-md bg-[#161b22] hover:bg-[#1c2128] transition-colors overflow-hidden group">
      <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Status Icon + Run Info */}
        <div className="flex items-start space-x-3 min-w-0">
          <div className="mt-0.5 flex-shrink-0">
            {isPass ? (
              <span className="w-5 h-5 rounded-full bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40 flex items-center justify-center text-xs font-bold font-mono">
                ✔
              </span>
            ) : isFailure ? (
              <span className="w-5 h-5 rounded-full bg-[#da3633]/20 text-[#f85149] border border-[#da3633]/40 flex items-center justify-center text-xs font-bold font-mono">
                ✖
              </span>
            ) : (
              <span className="w-5 h-5 rounded-full bg-[#bc8cff]/20 text-[#bc8cff] border border-[#bc8cff]/40 flex items-center justify-center text-xs font-bold font-mono">
                ✦
              </span>
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center space-x-2 flex-wrap">
              <Link
                href={`/runs/${run.id}`}
                className="font-semibold text-sm text-[#f0f6fc] group-hover:text-[#58a6ff] transition-colors truncate"
              >
                {run.summary || `Verification Run #${run.id}`}
              </Link>
              <span className="text-[11px] px-1.5 py-0.2 rounded bg-[#21262d] border border-[#30363d] text-[#8b949e] font-mono">
                {run.id}
              </span>
            </div>

            <div className="flex items-center space-x-3 text-xs text-[#8b949e] flex-wrap gap-y-1">
              <span className="font-mono text-[#58a6ff] hover:underline cursor-pointer">
                {run.commit_sha ? run.commit_sha.substring(0, 7) : "HEAD"}
              </span>
              <span>&bull;</span>
              <span className="inline-flex items-center space-x-1 font-mono text-[#c9d1d9] bg-[#0d1117] px-1.5 py-0.5 rounded border border-[#30363d]">
                <svg className="w-3 h-3 text-[#8b949e]" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a1 1 0 00-1 1v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.836A2.492 2.492 0 016 7h4a1 1 0 001-1v-.628A2.25 2.25 0 019.5 3.25zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zM3.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z" />
                </svg>
                <span>{run.branch}</span>
              </span>
              <span>&bull;</span>
              <span className="uppercase text-[11px] px-1.5 py-0.2 rounded bg-[#21262d] text-[#8b949e]">
                {run.event_type}
              </span>
              <span>&bull;</span>
              <span>{new Date(run.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right: Duration, findings, badge & Apple Liquid CTA Button */}
        <div className="flex items-center space-x-3.5 self-end md:self-center flex-shrink-0">
          {findingsCount > 0 && (
            <span className="text-xs text-[#8b949e] font-mono">
              {findingsCount} finding{findingsCount > 1 ? "s" : ""}
            </span>
          )}

          <div className="text-xs font-mono text-[#8b949e]">
            {run.duration_ms} ms
          </div>

          <StatusBadge status={run.status} size="sm" />

          <Link
            href={`/runs/${run.id}`}
            className="btn-apple-liquid btn-apple-secondary px-2.5 py-1 text-xs"
          >
            <span>Details</span>
            <span className="ml-1 text-xs">&rarr;</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
