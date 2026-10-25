import React, { useState, useMemo } from "react";
import Head from "next/head";
import { useRuns } from "../hooks/useRuns";
import { RunCard } from "../components/RunCard";
import { TriggerModal } from "../components/TriggerModal";

export default function DashboardPage() {
  const { runs, loading, error, refresh } = useRuns();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [branchFilter, setBranchFilter] = useState("ALL");
  const [isTriggerOpen, setIsTriggerOpen] = useState(false);

  // Compute metrics from actual runs returned by the backend
  const totalRuns = runs.length;
  const passedRuns = runs.filter((r) => r.status === "VERIFIED_PASS").length;
  const failedRuns = runs.filter((r) => r.status === "VERIFIED_FAILURE").length;
  const aiHypothesisRuns = runs.filter((r) => r.status === "AI_HYPOTHESIS").length;

  // Extract unique branches from real data
  const uniqueBranches = useMemo(() => {
    const set = new Set<string>();
    runs.forEach((r) => {
      if (r.branch) set.add(r.branch);
    });
    return Array.from(set);
  }, [runs]);

  // Filter runs based on user query
  const filteredRuns = useMemo(() => {
    return runs.filter((run) => {
      const matchesSearch =
        searchTerm === "" ||
        run.commit_sha?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        run.branch?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        run.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        run.id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || run.status === statusFilter;

      const matchesBranch =
        branchFilter === "ALL" || run.branch === branchFilter;

      return matchesSearch && matchesStatus && matchesBranch;
    });
  }, [runs, searchTerm, statusFilter, branchFilter]);

  return (
    <>
      <Head>
        <title>Invariant &bull; Continuous Software Verification</title>
        <meta
          name="description"
          content="Continuous verification for every commit against declarative INVARIANT.md specifications."
        />
      </Head>

      <div className="space-y-7">
        {/* Hero Section with Liquid Glass Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-mono mb-2 shadow-[0_0_12px_rgba(99,102,241,0.25)]">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>Continuous Invariant Verification Platform</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight liquid-title">
              Verification Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#8b949e] mt-1 max-w-xl">
              Assert declarative requirements across every commit and pull request with isolated sandboxing and empirical proof.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={refresh}
              className="px-3.5 py-2 text-xs font-medium rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/90 transition-all flex items-center space-x-1.5 shadow-sm"
              title="Refresh from backend"
            >
              <span>↻</span>
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsTriggerOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white border border-emerald-400/30 shadow-[0_4px_20px_rgba(16,185,129,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center space-x-1.5"
            >
              <span>▶</span>
              <span>Run Verification</span>
            </button>
          </div>
        </div>

        {/* Liquid Glass Metric Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total */}
          <div className="liquid-glass liquid-glass-interactive rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="text-xs font-mono text-white/60 flex items-center justify-between">
              <span>TOTAL RUNS</span>
              <span className="w-6 h-6 rounded-lg bg-white/[0.04] border border-white/10 flex items-center justify-center text-indigo-400 font-bold">
                #
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-white mt-2">
              {totalRuns}
            </div>
            <div className="text-[11px] text-white/50 mt-1">Monitored commits</div>
          </div>

          {/* Card 2: Passes */}
          <div className="liquid-glass liquid-glass-interactive rounded-2xl p-5 relative overflow-hidden group hover:border-emerald-500/40">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="text-xs font-mono text-emerald-400 flex items-center justify-between">
              <span>VERIFIED PASSES</span>
              <span className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                ✔
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-emerald-400 mt-2">
              {passedRuns}
            </div>
            <div className="text-[11px] text-emerald-400/70 mt-1">Assertions upheld</div>
          </div>

          {/* Card 3: Failures */}
          <div className="liquid-glass liquid-glass-interactive rounded-2xl p-5 relative overflow-hidden group hover:border-rose-500/40">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="text-xs font-mono text-rose-400 flex items-center justify-between">
              <span>VIOLATIONS / FAILS</span>
              <span className="w-6 h-6 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                ✖
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-rose-400 mt-2">
              {failedRuns}
            </div>
            <div className="text-[11px] text-rose-400/70 mt-1">Blocking violations</div>
          </div>

          {/* Card 4: AI Hypotheses */}
          <div className="liquid-glass liquid-glass-interactive rounded-2xl p-5 relative overflow-hidden group hover:border-purple-500/40">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="text-xs font-mono text-purple-300 flex items-center justify-between">
              <span>AI HYPOTHESES</span>
              <span className="w-6 h-6 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                ✦
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-purple-300 mt-2">
              {aiHypothesisRuns}
            </div>
            <div className="text-[11px] text-purple-300/70 mt-1">Speculative advisories</div>
          </div>
        </div>

        {/* Liquid Glass Filter and Search Bar */}
        <div className="liquid-glass rounded-2xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Filter by commit SHA, branch, or summary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 glass-input rounded-xl font-mono text-xs text-[#c9d1d9] placeholder-white/30 focus:outline-none transition-all"
              />
              <span className="absolute left-3 top-2.5 text-white/40 text-xs">
                🔍
              </span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 glass-input rounded-xl font-mono text-xs text-white/90 focus:outline-none transition-all"
            >
              <option value="ALL">Status: All</option>
              <option value="VERIFIED_PASS">Status: Verified Pass</option>
              <option value="VERIFIED_FAILURE">Status: Verified Failure</option>
              <option value="AI_HYPOTHESIS">Status: AI Hypothesis</option>
              <option value="STATIC_WARNING">Status: Static Warning</option>
            </select>

            {uniqueBranches.length > 0 && (
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="px-3 py-2 glass-input rounded-xl font-mono text-xs text-white/90 focus:outline-none transition-all"
              >
                <option value="ALL">Branch: All</option>
                {uniqueBranches.map((b) => (
                  <option key={b} value={b}>
                    Branch: {b}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Runs List */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs text-[#8b949e]">
            <span className="font-semibold text-white/90">
              Verification Runs ({filteredRuns.length})
            </span>
            <span className="font-mono text-[11px]">Live records from FastAPI backend</span>
          </div>

          {loading ? (
            <div className="p-16 text-center text-[#8b949e] liquid-glass rounded-2xl font-mono text-xs space-y-2">
              <span className="animate-spin inline-block mr-2 text-indigo-400 text-base">↻</span>
              <div>Connecting to FastAPI backend (http://localhost:8000)...</div>
            </div>
          ) : error ? (
            <div className="p-6 text-xs font-mono bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl space-y-2 backdrop-blur-md">
              <div className="font-bold flex items-center space-x-2">
                <span>⛔</span>
                <span>Backend Connection Notice:</span>
              </div>
              <div className="text-white/80">{error}</div>
              <div className="text-[#c9d1d9] text-[11px] pt-1">
                To connect to live verification data, start the FastAPI service:
                <code className="block mt-1.5 p-3 rounded-lg bg-[#070b13]/90 border border-white/10 text-indigo-300 font-mono shadow-inner">
                  python -m uvicorn services.api.app.main:app --host 0.0.0.0 --port 8000 --reload
                </code>
              </div>
              <button
                onClick={refresh}
                className="mt-3 px-3.5 py-1.5 bg-white/[0.05] border border-white/10 text-white rounded-lg hover:bg-white/[0.1] transition-all"
              >
                ↻ Retry Connection
              </button>
            </div>
          ) : filteredRuns.length === 0 ? (
            <div className="p-16 text-center liquid-glass rounded-2xl space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl mx-auto shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                ✦
              </div>
              <div className="space-y-1">
                <p className="text-base font-semibold text-white">
                  No verification runs recorded yet.
                </p>
                <p className="text-xs text-[#8b949e] max-w-md mx-auto">
                  Trigger an automated verification run using the button below or submit a pull request with an <code className="text-indigo-400">INVARIANT.md</code> specification.
                </p>
              </div>
              <button
                onClick={() => setIsTriggerOpen(true)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white border border-emerald-400/30 shadow-[0_4px_18px_rgba(16,185,129,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                ▶ Trigger First Verification Run
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRuns.map((run) => (
                <RunCard key={run.id} run={run} />
              ))}
            </div>
          )}
        </div>
      </div>

      <TriggerModal
        isOpen={isTriggerOpen}
        onClose={() => setIsTriggerOpen(false)}
        onSuccess={refresh}
      />
    </>
  );
}
