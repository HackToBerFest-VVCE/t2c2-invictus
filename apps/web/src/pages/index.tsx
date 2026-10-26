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

  // Compute metrics from actual runs returned by backend
  const totalRuns = runs.length;
  const passedRuns = runs.filter((r) => r.status === "VERIFIED_PASS").length;
  const failedRuns = runs.filter((r) => r.status === "VERIFIED_FAILURE").length;
  const aiHypothesisRuns = runs.filter((r) => r.status === "AI_HYPOTHESIS").length;

  // Extract unique branches
  const uniqueBranches = useMemo(() => {
    const set = new Set<string>();
    runs.forEach((r) => {
      if (r.branch) set.add(r.branch);
    });
    return Array.from(set);
  }, [runs]);

  // Filter runs based on search & filter
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

      <div className="space-y-6">
        {/* Header Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#30363d] pb-5">
          <div>
            <h1 className="text-2xl font-bold text-[#f0f6fc]">
              Verification Dashboard
            </h1>
            <p className="text-sm text-[#8b949e] mt-1">
              Active repository invariants enforced continuously against every commit.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={refresh}
              className="btn-apple-liquid btn-apple-secondary px-3 py-1.5 text-xs space-x-1"
            >
              <span>↻</span>
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsTriggerOpen(true)}
              className="btn-apple-liquid btn-apple-green px-3.5 py-1.5 text-xs space-x-1"
            >
              <span>▶</span>
              <span>Run Verification</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards (Clean GitHub style) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-md border border-[#30363d] bg-[#161b22]">
            <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider block">
              Total Runs
            </span>
            <div className="text-2xl font-bold font-mono text-[#f0f6fc] mt-1.5">
              {totalRuns}
            </div>
            <div className="text-[11px] text-[#8b949e] mt-1">Evaluated commits</div>
          </div>

          <div className="p-4 rounded-md border border-[#238636]/40 bg-[#238636]/10">
            <span className="text-xs font-semibold text-[#3fb950] uppercase tracking-wider block">
              Verified Passes
            </span>
            <div className="text-2xl font-bold font-mono text-[#3fb950] mt-1.5">
              {passedRuns}
            </div>
            <div className="text-[11px] text-[#3fb950]/80 mt-1">100% assertions upheld</div>
          </div>

          <div className="p-4 rounded-md border border-[#da3633]/40 bg-[#da3633]/10">
            <span className="text-xs font-semibold text-[#f85149] uppercase tracking-wider block">
              Verified Failures
            </span>
            <div className="text-2xl font-bold font-mono text-[#f85149] mt-1.5">
              {failedRuns}
            </div>
            <div className="text-[11px] text-[#f85149]/80 mt-1">Blocking violations</div>
          </div>

          <div className="p-4 rounded-md border border-[#bc8cff]/40 bg-[#bc8cff]/10">
            <span className="text-xs font-semibold text-[#bc8cff] uppercase tracking-wider block">
              AI Hypotheses
            </span>
            <div className="text-2xl font-bold font-mono text-[#bc8cff] mt-1.5">
              {aiHypothesisRuns}
            </div>
            <div className="text-[11px] text-[#bc8cff]/80 mt-1">Advisory signals</div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-3 rounded-md border border-[#30363d] bg-[#161b22] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Filter by commit SHA, branch, or summary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md font-mono text-xs text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
              />
              <span className="absolute left-2.5 top-2 text-[#8b949e] text-xs">
                🔍
              </span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md font-mono text-xs text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
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
                className="px-2.5 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md font-mono text-xs text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
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

        {/* Verification Runs List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#8b949e]">
            <span className="font-semibold text-[#f0f6fc]">
              Verification Runs ({filteredRuns.length})
            </span>
            <span>Live records from FastAPI backend</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-[#8b949e] border border-[#30363d] rounded-md bg-[#161b22] font-mono text-xs">
              <span className="animate-spin inline-block mr-2">↻</span>
              Connecting to FastAPI backend (http://localhost:8000)...
            </div>
          ) : error ? (
            <div className="p-5 text-xs font-mono bg-[#da3633]/15 border border-[#da3633]/40 text-[#f85149] rounded-md space-y-2">
              <div className="font-bold">Backend Connection Notice:</div>
              <div>{error}</div>
              <div className="text-[#c9d1d9] text-[11px] pt-1">
                To connect to live data, start the FastAPI service:
                <code className="block mt-1 p-2 rounded bg-[#0d1117] border border-[#30363d] text-[#58a6ff]">
                  python -m uvicorn services.api.app.main:app --host 0.0.0.0 --port 8000 --reload
                </code>
              </div>
              <button
                onClick={refresh}
                className="mt-2 btn-apple-liquid btn-apple-secondary px-3 py-1 text-xs"
              >
                ↻ Retry Connection
              </button>
            </div>
          ) : filteredRuns.length === 0 ? (
            <div className="p-12 text-center border border-[#30363d] rounded-md bg-[#161b22] space-y-3">
              <p className="text-sm font-semibold text-[#f0f6fc]">
                No verification runs recorded yet.
              </p>
              <p className="text-xs text-[#8b949e] max-w-md mx-auto">
                Trigger an automated verification run using the button below or submit a pull request with an <code className="text-[#58a6ff]">INVARIANT.md</code> file.
              </p>
              <button
                onClick={() => setIsTriggerOpen(true)}
                className="btn-apple-liquid btn-apple-green px-4 py-2 text-xs"
              >
                ▶ Trigger First Verification Run
              </button>
            </div>
          ) : (
            <div className="space-y-2">
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
