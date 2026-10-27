import React from "react";
import {
  ShieldAlert,
  Layers,
  FileCheck2,
  ListTree,
  FlaskConical,
  Settings,
  GitBranch,
  CircleDot,
  CheckCircle2,
  Sparkles,
  MessageSquareText,
  UploadCloud,
} from "lucide-react";

export type IvieTab =
  | "overview"
  | "runs"
  | "findings"
  | "requirements"
  | "evidence"
  | "context"
  | "settings";

interface IvieSidebarProps {
  activeTab: IvieTab;
  onTabChange: (tab: IvieTab) => void;
  selectedRepo: string;
  onRepoChange: (repo: string) => void;
  findingsCount: number;
  unreviewedCount: number;
  contextCount?: number;
}

export const IvieSidebar: React.FC<IvieSidebarProps> = ({
  activeTab,
  onTabChange,
  selectedRepo,
  onRepoChange,
  findingsCount,
  unreviewedCount,
  contextCount = 2,
}) => {
  const navItems: { id: IvieTab; label: string; icon: React.ReactNode; badge?: number; badgeText?: string }[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: "runs",
      label: "Verification Runs",
      icon: <FileCheck2 className="w-4 h-4" />,
    },
    {
      id: "findings",
      label: "Findings",
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: unreviewedCount,
    },
    {
      id: "requirements",
      label: "Requirements",
      icon: <ListTree className="w-4 h-4" />,
    },
    {
      id: "evidence",
      label: "Test Evidence",
      icon: <FlaskConical className="w-4 h-4" />,
    },
    {
      id: "context",
      label: "Chat Context",
      icon: <MessageSquareText className="w-4 h-4" />,
      badgeText: `${contextCount}`,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 bg-[#161b22] border-r border-[#30363d] flex flex-col justify-between h-[calc(100vh-65px)] sticky top-[65px] flex-shrink-0">
      {/* Top Header / Branding */}
      <div className="p-4 border-b border-[#30363d]">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-mono font-bold text-xs shadow-inner">
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-sm text-[#f0f6fc] tracking-tight">IVIE</span>
              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-[#8b949e] leading-none mt-0.5 font-medium truncate">
              Invariant Verification Engine
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        <div className="px-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-[#8b949e]">
          Verification Service
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? "bg-[#21262d] text-[#ffffff] font-semibold border border-[#30363d] shadow-sm"
                  : "text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#1f242c]"
              }`}
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <span className={isActive ? "text-indigo-400" : "text-[#8b949e]"}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 ? (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  {item.badge}
                </span>
              ) : item.badgeText ? (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {item.badgeText}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Footer / Status Controls */}
      <div className="p-3 border-t border-[#30363d] space-y-3 bg-[#0d1117]/60">
        {/* Demo Mode Badge */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-indigo-950/30 border border-indigo-500/20 text-[11px]">
          <div className="flex items-center space-x-1.5 text-indigo-300">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="font-semibold">Demo Mode</span>
          </div>
          <span className="text-[10px] text-indigo-400/80 font-mono">Simulated</span>
        </div>

        {/* Repository Selector */}
        <div className="space-y-1">
          <label className="text-[10px] font-mono uppercase text-[#8b949e] flex items-center space-x-1">
            <GitBranch className="w-3 h-3 text-[#8b949e]" />
            <span>Target Repository</span>
          </label>
          <select
            value={selectedRepo}
            onChange={(e) => onRepoChange(e.target.value)}
            className="w-full bg-[#161b22] border border-[#30363d] text-[#c9d1d9] rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="acme/checkout-service">acme/checkout-service</option>
            <option value="acme/inventory-worker">acme/inventory-worker</option>
            <option value="t2c2-invictus">t2c2-invictus</option>
          </select>
        </div>

        {/* Small System Status Indicator */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#8b949e] pt-1 border-t border-[#30363d]/50">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
            <span>IVIE Core</span>
          </div>
          <span className="text-[#3fb950] text-[10px]">Operational</span>
        </div>
      </div>
    </aside>
  );
};
