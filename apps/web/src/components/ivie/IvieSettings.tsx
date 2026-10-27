import React, { useState } from "react";
import {
  Settings,
  GitBranch,
  Clock,
  Cpu,
  Layers,
  Shield,
  Save,
  CheckCircle2,
  Info,
  Sliders,
} from "lucide-react";

interface IvieSettingsProps {
  selectedRepo: string;
  onRepoChange: (repo: string) => void;
}

export const IvieSettings: React.FC<IvieSettingsProps> = ({
  selectedRepo,
  onRepoChange,
}) => {
  const [timeoutSeconds, setTimeoutSeconds] = useState(30);
  const [autoClassifyThreshold, setAutoClassifyThreshold] = useState(75);
  const [defaultStatus, setDefaultStatus] = useState("Potential");
  const [executionMode, setExecutionMode] = useState("Simulation");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(null as any), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-[#30363d] pb-5">
        <h1 className="text-xl font-bold text-[#f0f6fc] tracking-tight">
          IVIE Engine Settings
        </h1>
        <p className="text-xs text-[#8b949e] mt-1">
          Configure local simulation parameters, verification thresholds, and mock pipeline settings.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 text-xs">
        {/* Repository Scope */}
        <div className="p-5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-4">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-indigo-400" />
            <h3 className="font-semibold text-sm text-[#f0f6fc]">
              Repository & Target Environment
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[11px] text-[#8b949e] uppercase block">
                Active Repository
              </label>
              <select
                value={selectedRepo}
                onChange={(e) => onRepoChange(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-xs text-[#f0f6fc] focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="acme/checkout-service">acme/checkout-service</option>
                <option value="acme/inventory-worker">acme/inventory-worker</option>
                <option value="t2c2-invictus">t2c2-invictus</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[11px] text-[#8b949e] uppercase block">
                INVARIANT.md Spec Path
              </label>
              <input
                type="text"
                defaultValue="examples/checkout-service/INVARIANT.md"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-xs text-[#c9d1d9] font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Verification Engine Parameters */}
        <div className="p-5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-4">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <h3 className="font-semibold text-sm text-[#f0f6fc]">
              Verification Parameters (UI Simulation)
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-[#8b949e] uppercase">
                  Verification Timeout
                </span>
                <span className="text-indigo-400 font-bold">{timeoutSeconds} seconds</span>
              </div>
              <input
                type="range"
                min="5"
                max="120"
                value={timeoutSeconds}
                onChange={(e) => setTimeoutSeconds(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <span className="text-[10px] text-[#8b949e] block">
                Simulated execution timeout budget before flagging tests as Inconclusive.
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-[#8b949e] uppercase">
                  Strong Support Confidence Threshold
                </span>
                <span className="text-indigo-400 font-bold">{autoClassifyThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                value={autoClassifyThreshold}
                onChange={(e) => setAutoClassifyThreshold(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <span className="text-[10px] text-[#8b949e] block">
                Confidence percentage required before classifying an issue as Strongly Supported.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="font-mono text-[11px] text-[#8b949e] uppercase block">
                  Default Unverified Status
                </label>
                <select
                  value={defaultStatus}
                  onChange={(e) => setDefaultStatus(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-xs text-[#f0f6fc] focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="Potential">Potential</option>
                  <option value="Inconclusive">Inconclusive</option>
                  <option value="Strongly Supported">Strongly Supported</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-mono text-[11px] text-[#8b949e] uppercase block">
                  Test Execution Mode
                </label>
                <select
                  value={executionMode}
                  onChange={(e) => setExecutionMode(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-xs text-[#f0f6fc] focus:outline-none focus:border-indigo-500 font-mono"
                >
                  <option value="Simulation">Simulation (Mock Engine)</option>
                  <option value="DryRun">Dry Run Only</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Status (Explicit Demo Disclaimers) */}
        <div className="p-5 rounded-lg bg-[#161b22] border border-[#30363d] space-y-3">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-zinc-400" />
            <h3 className="font-semibold text-sm text-[#f0f6fc]">
              Service Integrations & Disclaimers
            </h3>
          </div>

          <div className="divide-y divide-[#30363d] font-mono text-xs">
            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="text-[#f0f6fc] block">AI Provider Engine</span>
                <span className="text-[10px] text-[#8b949e]">Hypothesis generation provider</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#21262d] text-zinc-400 border border-[#30363d] text-[11px]">
                Not Connected (Simulated)
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="text-[#f0f6fc] block">GitHub App Webhook</span>
                <span className="text-[10px] text-[#8b949e]">PR check-run reporting</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-indigo-950/40 text-indigo-400 border border-indigo-500/30 text-[11px]">
                Demo Only
              </span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <div>
                <span className="text-[#f0f6fc] block">Sandbox Runner Isolation</span>
                <span className="text-[10px] text-[#8b949e]">Containerized execution environment</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-[11px]">
                Local Mock Engine
              </span>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {isSaved ? (
            <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-mono animate-fadeIn">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings updated successfully in local state.</span>
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
