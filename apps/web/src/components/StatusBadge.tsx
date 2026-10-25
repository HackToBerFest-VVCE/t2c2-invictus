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
          bg: "bg-[#238636]/15 border-[#238636]/50 text-[#3fb950]",
          dot: "bg-[#3fb950]",
          icon: "✔",
          label: "Verified Pass",
        };
      case "VERIFIED_FAILURE":
        return {
          bg: "bg-[#da3633]/15 border-[#da3633]/50 text-[#f85149]",
          dot: "bg-[#f85149]",
          icon: "✖",
          label: "Verified Failure",
        };
      case "STATIC_WARNING":
        return {
          bg: "bg-[#d29922]/15 border-[#d29922]/50 text-[#e3b341]",
          dot: "bg-[#d29922]",
          icon: "▲",
          label: "Static Warning",
        };
      case "AI_HYPOTHESIS":
        return {
          bg: "bg-[#bc8cff]/15 border-[#bc8cff]/50 text-[#d2a8ff]",
          dot: "bg-[#bc8cff]",
          icon: "✦",
          label: "AI Hypothesis",
        };
      case "CHECK_ERROR":
        return {
          bg: "bg-[#da3633]/20 border-[#f85149]/60 text-[#ff7b72]",
          dot: "bg-[#ff7b72]",
          icon: "⛔",
          label: "Check Error",
        };
      case "UNSUPPORTED":
      default:
        return {
          bg: "bg-[#21262d] border-[#30363d] text-[#8b949e]",
          dot: "bg-[#8b949e]",
          icon: "○",
          label: "Unsupported",
        };
    }
  };

  const config = getBadgeConfig();
  const sizeClasses =
    size === "sm"
      ? "text-[11px] px-2 py-0.5 gap-1.5"
      : "text-xs px-2.5 py-1 gap-1.5 font-medium";

  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono tracking-tight ${config.bg} ${sizeClasses}`}
    >
      <span className="text-[10px] leading-none font-bold">{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
};
