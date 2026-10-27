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

        {/* 4 Stat Cards (GitHub style with hover animations) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="stat-card p-4 rounded-md border border-[#30363d] bg-[#161b22] hover:border-[#58a6ff]/50 animate-fadeInUp">
            <div className="flex items-center space-x-1.5 mb-1">
              <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="currentColor" viewBox="0 0 16 16"><path d="M1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zM8 0a8 8 0 100 16A8 8 0 008 0zM6.379 5.227A.25.25 0 006 5.442v5.117a.25.25 0 00.379.214l4.264-2.559a.25.25 0 000-.428L6.379 5.227z" /></svg>
              <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
                Total Runs
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#f0f6fc] mt-1.5">
              {totalRuns}
            </div>
            <div className="text-[11px] text-[#8b949e] mt-1">Evaluated commits</div>
          </div>

          <div className="stat-card p-4 rounded-md border border-[#238636]/40 bg-[#238636]/10 hover:border-[#3fb950]/70 animate-fadeInUp" style={{ animationDelay: '50ms' }}>
            <div className="flex items-center space-x-1.5 mb-1">
              <svg className="w-3.5 h-3.5 text-[#3fb950]" fill="currentColor" viewBox="0 0 16 16"><path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" /></svg>
              <span className="text-xs font-semibold text-[#3fb950] uppercase tracking-wider">
                Verified Passes
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#3fb950] mt-1.5">
              {passedRuns}
            </div>
            <div className="text-[11px] text-[#3fb950]/80 mt-1">100% assertions upheld</div>
          </div>

          <div className="stat-card p-4 rounded-md border border-[#da3633]/40 bg-[#da3633]/10 hover:border-[#f85149]/70 animate-fadeInUp" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center space-x-1.5 mb-1">
              <svg className="w-3.5 h-3.5 text-[#f85149]" fill="currentColor" viewBox="0 0 16 16"><path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" /></svg>
              <span className="text-xs font-semibold text-[#f85149] uppercase tracking-wider">
                Verified Failures
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-[#f85149] mt-1.5">
              {failedRuns}
            </div>
            <div className="text-[11px] text-[#f85149]/80 mt-1">Blocking violations</div>
          </div>

          <div className="stat-card p-4 rounded-md border border-[#bc8cff]/40 bg-[#bc8cff]/10 hover:border-[#d2a8ff]/70 animate-fadeInUp" style={{ animationDelay: '150ms' }}>
            <div className="flex items-center space-x-1.5 mb-1">
              <svg className="w-3.5 h-3.5 text-[#bc8cff]" fill="currentColor" viewBox="0 0 16 16"><path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 001.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 00-1.828 1.829l-.645 1.936a.361.361 0 01-.686 0l-.645-1.937a2.89 2.89 0 00-1.828-1.828l-1.937-.645a.361.361 0 010-.686l1.937-.645a2.89 2.89 0 001.828-1.829l.645-1.936zM3.794 1.148a.217.217 0 01.412 0l.387 1.162c.173.518.5.845 1.017 1.018l1.162.387a.217.217 0 010 .412l-1.162.387c-.518.173-.844.5-1.017 1.017l-.387 1.162a.217.217 0 01-.412 0l-.387-1.162A1.734 1.734 0 002.39 4.527l-1.162-.387a.217.217 0 010-.412l1.162-.387A1.734 1.734 0 003.407 2.31l.387-1.162zM10.863.099a.145.145 0 01.274 0l.258.774c.115.346.334.564.68.68l.774.258a.145.145 0 010 .274l-.774.258c-.346.115-.565.334-.68.68l-.258.774a.145.145 0 01-.274 0l-.258-.774a1.156 1.156 0 00-.68-.68l-.774-.258a.145.145 0 010-.274l.774-.258c.346-.115.565-.334.68-.68L10.863.1z" /></svg>
              <span className="text-xs font-semibold text-[#bc8cff] uppercase tracking-wider">
                AI Hypotheses
              </span>
            </div>
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
