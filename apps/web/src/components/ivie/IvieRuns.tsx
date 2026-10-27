import React, { useState } from "react";
import {
  Play,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  GitBranch,
  GitCommit,
  Cpu,
  Layers,
  Sparkles,
  Info,
  Loader2,
} from "lucide-react";
import { VerificationRun } from "../../data/ivieMockData";

interface IvieRunsProps {
  runs: VerificationRun[];
  onAddRun: (newRun: VerificationRun) => void;
  selectedRepo: string;
}

export const IvieRuns: React.FC<IvieRunsProps> = ({ runs, onAddRun, selectedRepo }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [currentStageName, setCurrentStageName] = useState("");
  const [selectedRun, setSelectedRun] = useState<VerificationRun | null>(null);

  const STAGES = [
    "Requirements Loaded (INVARIANT.md AST)",
    "Code Changes Analysed (git diff & AST graph)",
    "Targeted Tests Simulated (synthetic boundary harness)",
    "Evidence Evaluated (contract cross-correlation)",
    "Findings Classified (confidence synthesis)",
  ];

  const handleStartDemoRun = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimulationProgress(10);
    setCurrentStageName(STAGES[0]);

    // Animate stage 1
    setTimeout(() => {
      setSimulationProgress(30);
      setCurrentStageName(STAGES[1]);
    }, 600);

    // Animate stage 2
    setTimeout(() => {
      setSimulationProgress(55);
      setCurrentStageName(STAGES[2]);
    }, 1200);

    // Animate stage 3
    setTimeout(() => {
      setSimulationProgress(80);
      setCurrentStageName(STAGES[3]);
    }, 1800);

    // Animate stage 4
    setTimeout(() => {
      setSimulationProgress(95);
      setCurrentStageName(STAGES[4]);
    }, 2400);

    // Complete run
    setTimeout(() => {
      setSimulationProgress(100);
      setIsSimulating(false);

      const nextNum = 1043 + Math.floor(Math.random() * 50);
      const newRun: VerificationRun = {
        id: `#VR-${nextNum}`,
        repo: selectedRepo,
        branch: "feature/discount-validation",
        commit: Math.random().toString(16).substring(2, 9),
        trigger: "Interactive Simulation Trigger",
        findingsCount: 4,
        status: "Completed",
        timestamp: "Just now",
        duration: "1.82s",
        stagesCompleted: 5,
        totalStages: 5,
      };

      onAddRun(newRun);
      setSelectedRun(newRun);
    }, 3000);
  };

  const filteredRuns = runs.filter((run) => {
    const matchesSearch =
      run.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.commit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.repo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.trigger.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || run.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363d] pb-5">
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc] tracking-tight">
            Verification Runs
          </h1>
          <p className="text-xs text-[#8b949e] mt-1">
            History of automated verification runs evaluating code changes against invariant specifications.
          </p>
        </div>

        <button
          onClick={handleStartDemoRun}
          disabled={isSimulating}
          className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-semibold text-xs transition-all flex items-center space-x-2 shadow-sm self-start sm:self-auto"
        >
          {isSimulating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Simulating Run...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Start Demo Run</span>
            </>
          )}
        </button>
      </div>

      {/* Live Simulation Progress Banner */}
      {isSimulating && (
        <div className="p-4 rounded-lg bg-indigo-950/30 border border-indigo-500/40 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
              <span className="font-semibold text-xs text-[#f0f6fc]">
                Simulating Verification Pipeline...
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-indigo-400">
              {simulationProgress}%
            </span>
          </div>

          <div className="w-full bg-[#161b22] h-2 rounded-full overflow-hidden border border-[#30363d]">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${simulationProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#8b949e]">
            <span className="text-indigo-300">Active Stage: {currentStageName}</span>
            <span>Target: {selectedRepo}</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-3 rounded-lg border border-[#30363d] bg-[#161b22] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#8b949e]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search runs by ID, branch, commit, or trigger..."
            className="w-full pl-9 pr-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md text-xs text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 text-xs text-[#8b949e] font-mono">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d] rounded-md px-2.5 py-1.5 text-xs text-[#c9d1d9] focus:outline-none focus:border-indigo-500"
          >
            <option value="All">All ({runs.length})</option>
            <option value="Completed">Completed</option>
            <option value="Running">Running</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Verification Runs Table */}
      <div className="rounded-lg border border-[#30363d] bg-[#161b22] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0d1117] text-[#8b949e] font-mono text-[11px] border-b border-[#30363d] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5">Run ID</th>
                <th className="py-2.5 px-3.5">Target Repository</th>
                <th className="py-2.5 px-3.5">Branch & Commit</th>
                <th className="py-2.5 px-3.5">Trigger Event</th>
                <th className="py-2.5 px-3.5 text-center">Findings</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5">Duration</th>
                <th className="py-2.5 px-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d] font-sans">
              {filteredRuns.map((run) => (
                <tr
                  key={run.id}
                  onClick={() => setSelectedRun(run)}
                  className="hover:bg-[#1f242c] transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-3.5 font-mono font-bold text-indigo-400 whitespace-nowrap">
                    {run.id}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-[11px] text-[#c9d1d9] whitespace-nowrap">
                    {run.repo}
                  </td>
                  <td className="py-3 px-3.5 font-mono text-[11px] text-[#8b949e] whitespace-nowrap">
                    <span className="text-[#f0f6fc]">{run.branch}</span> @{run.commit}
                  </td>
                  <td className="py-3 px-3.5 text-[#c9d1d9]">
                    {run.trigger}
                  </td>
                  <td className="py-3 px-3.5 text-center whitespace-nowrap">
                    <span className="font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                      {run.findingsCount} issues
                    </span>
                  </td>
                  <td className="py-3 px-3.5 whitespace-nowrap">
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{run.status}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-mono text-[#8b949e] whitespace-nowrap">
                    {run.duration}
                  </td>
                  <td className="py-3 px-3.5 text-right font-mono text-[#8b949e] whitespace-nowrap">
                    {run.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Run Drawer / Inspection View */}
      {selectedRun && (
        <div className="p-4 rounded-lg bg-[#161b22] border border-indigo-500/40 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-[#f0f6fc]">
                Inspecting Run {selectedRun.id}
              </span>
              <span className="px-2 py-0.2 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono">
                {selectedRun.status}
              </span>
            </div>
            <button
              onClick={() => setSelectedRun(null)}
              className="text-xs text-[#8b949e] hover:text-[#f0f6fc]"
            >
              ✕ Close Detail
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d]">
              <span className="text-[#8b949e] text-[10px] block">Repository</span>
              <span className="text-[#f0f6fc]">{selectedRun.repo}</span>
            </div>
            <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d]">
              <span className="text-[#8b949e] text-[10px] block">Branch / Commit</span>
              <span className="text-[#f0f6fc]">{selectedRun.branch} @{selectedRun.commit}</span>
            </div>
            <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d]">
              <span className="text-[#8b949e] text-[10px] block">Evaluated Invariants</span>
              <span className="text-emerald-400 font-bold">5 / 5 Verified</span>
            </div>
            <div className="p-2.5 rounded bg-[#0d1117] border border-[#30363d]">
              <span className="text-[#8b949e] text-[10px] block">Total Duration</span>
              <span className="text-[#f0f6fc]">{selectedRun.duration}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
