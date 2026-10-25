import React from "react";
import { VerificationStatus } from "../types";

interface StatusBadgeProps {
  status: VerificationStatus;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "md",
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case "VERIFIED_PASS":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.2)]",
          glow: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]",
          icon: "✔",
          label: "Verified Pass",
        };
      case "VERIFIED_FAILURE":
        return {
          bg: "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.2)]",
          glow: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.9)]",
          icon: "✖",
          label: "Verified Failure",
        };
      case "STATIC_WARNING":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.2)]",
          glow: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]",
          icon: "▲",
          label: "Static Warning",
        };
      case "AI_HYPOTHESIS":
        return {
          bg: "bg-purple-500/10 border-purple-500/30 text-purple-300 shadow-[0_0_14px_rgba(168,85,247,0.25)]",
          glow: "bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.9)]",
          icon: "✦",
          label: "AI Hypothesis",
        };
      case "CHECK_ERROR":
        return {
          bg: "bg-red-500/15 border-red-500/40 text-red-300 shadow-[0_0_14px_rgba(239,68,68,0.25)]",
          glow: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.9)]",
          icon: "⛔",
          label: "Check Error",
        };
      case "UNSUPPORTED":
      default:
        return {
          bg: "bg-white/[0.04] border-white/10 text-[#8b949e]",
          glow: "bg-slate-400",
          icon: "○",
          label: "Unsupported",
        };
    }
  };

  const config = getBadgeConfig();
  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2.5 py-0.5 gap-1.5"
      : "text-xs px-3 py-1 gap-2 font-medium";

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md font-mono tracking-tight ${config.bg} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.glow}`} />
      <span className="text-[10px] leading-none font-bold">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};
