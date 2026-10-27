import React from "react";
import { VerificationStatus, Severity } from "../../data/ivieMockData";

export const StatusBadge: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  switch (status) {
    case "Reproduced":
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Reproduced</span>
        </span>
      );
    case "Strongly Supported":
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          <span>Strongly Supported</span>
        </span>
      );
    case "Potential":
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Potential</span>
        </span>
      );
    case "Inconclusive":
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-zinc-500/15 text-zinc-400 border border-zinc-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          <span>Inconclusive</span>
        </span>
      );
    case "False Positive":
      return (
        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          <span>False Positive</span>
        </span>
      );
    default:
      return <span>{status}</span>;
  }
};

export const SeverityBadge: React.FC<{ severity: Severity }> = ({ severity }) => {
  switch (severity) {
    case "Critical":
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-red-950/40 text-red-400 border border-red-500/40">
          Critical
        </span>
      );
    case "High":
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-orange-950/40 text-orange-400 border border-orange-500/40">
          High
        </span>
      );
    case "Medium":
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-950/40 text-amber-400 border border-amber-500/40">
          Medium
        </span>
      );
    case "Low":
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
          Low
        </span>
      );
    default:
      return <span>{severity}</span>;
  }
};
