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
  const getStyles = () => {
    switch (status) {
      case "VERIFIED_PASS":
        return "bg-emerald-950/80 text-emerald-400 border-emerald-800/60";
      case "VERIFIED_FAILURE":
        return "bg-rose-950/80 text-rose-400 border-rose-800/60";
      case "STATIC_WARNING":
        return "bg-amber-950/80 text-amber-400 border-amber-800/60";
      case "AI_HYPOTHESIS":
        return "bg-indigo-950/80 text-indigo-300 border-indigo-800/60";
      case "CHECK_ERROR":
        return "bg-red-950/80 text-red-300 border-red-800/60";
      case "UNSUPPORTED":
      default:
        return "bg-slate-900 text-slate-400 border-slate-700";
    }
  };

  const getLabel = () => {
    switch (status) {
      case "VERIFIED_PASS":
        return "PASS (VERIFIED)";
      case "VERIFIED_FAILURE":
        return "FAIL (REPRODUCED)";
      case "STATIC_WARNING":
        return "STATIC WARNING";
      case "AI_HYPOTHESIS":
        return "AI HYPOTHESIS";
      case "CHECK_ERROR":
        return "CHECK ERROR";
      case "UNSUPPORTED":
        return "UNSUPPORTED";
      default:
        return status;
    }
  };

  const sizeClasses =
    size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1 font-semibold";

  return (
    <span
      className={`inline-flex items-center rounded-full border ${getStyles()} ${sizeClasses} tracking-wide uppercase`}
    >
      <span
        className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
          status === "VERIFIED_PASS"
            ? "bg-emerald-400"
            : status === "VERIFIED_FAILURE"
            ? "bg-rose-400"
            : status === "AI_HYPOTHESIS"
            ? "bg-indigo-400"
            : "bg-slate-400"
        }`}
      />
      {getLabel()}
    </span>
  );
};
