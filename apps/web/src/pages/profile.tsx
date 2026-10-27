import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { fetchRepositories, fetchRuns, checkBackendHealth } from "../services/api";
import { Repository, VerificationRun, BackendHealth } from "../types";
import { TriggerModal } from "../components/TriggerModal";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "repositories" | "runs">("overview");
  const [repos, setRepos] = useState<Repository[]>([]);
  const [runs, setRuns] = useState<VerificationRun[]>([]);
  const [health, setHealth] = useState<BackendHealth>({
    status: "checking",
    service: "invariant-api",
    connected: false,
  });
  const [isTriggerOpen, setIsTriggerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = () => {
    setIsLoading(true);
    Promise.all([
      fetchRepositories().catch(() => []),
      fetchRuns().catch(() => []),
      checkBackendHealth().catch(() => ({
        status: "offline",
        service: "invariant-api",
        connected: false,
      })),
    ]).then(([r, runList, h]) => {
      setRepos(r || []);
      setRuns(runList || []);
      setHealth(h);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRuns = runs.length;
  const passedRuns = runs.filter((r) => r.status === "VERIFIED_PASS").length;
  const passRate = totalRuns > 0 ? Math.round((passedRuns / totalRuns) * 100) : 100;
  const avgDuration =
    totalRuns > 0
      ? Math.round(runs.reduce((acc, r) => acc + (r.duration_ms || 0), 0) / totalRuns)
      : 0;

  const primaryRepo = repos[0] || {
    id: "t2c2-invictus",
    name: "t2c2-invictus",
    owner: "local",
    full_name: "local/t2c2-invictus",
    default_branch: "frontend",
  };

  return (
    <>
      <Head>
        <title>INVICTUS · Verification Engine Profile</title>
        <meta
          name="description"
          content="Continuous Verification Engine Profile for t2c2-invictus"
        />
      </Head>

      <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] pb-16">
        {/* Navigation Tabs Bar */}
        <div className="border-b border-[#30363d] bg-[#0d1117] sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar text-sm -mb-px">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-3 px-2 inline-flex items-center space-x-2 border-b-2 font-medium transition-colors ${
                  activeTab === "overview"
                    ? "border-[#f0f6fc] text-[#f0f6fc] font-semibold"
                    : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
                }`}
              >
                <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab("repositories")}
                className={`py-3 px-2 inline-flex items-center space-x-2 border-b-2 font-medium transition-colors ${
                  activeTab === "repositories"
                    ? "border-[#f0f6fc] text-[#f0f6fc] font-semibold"
                    : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
                }`}
              >
                <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span>Repositories</span>
                <span className="gh-counter text-xs">{repos.length}</span>
              </button>

              <button
                onClick={() => setActiveTab("runs")}
                className={`py-3 px-2 inline-flex items-center space-x-2 border-b-2 font-medium transition-colors ${
                  activeTab === "runs"
                    ? "border-[#f0f6fc] text-[#f0f6fc] font-semibold"
                    : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
                }`}
              >
                <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Verification Runs</span>
                <span className="gh-counter text-xs">{runs.length}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Clean Real Profile Sidebar */}
            <div className="md:col-span-4 lg:col-span-3 space-y-4">
              {/* Clean Monogram Avatar */}
              <div className="relative inline-block w-40 h-40 md:w-full md:h-auto md:aspect-square mx-auto md:mx-0">
                <div className="w-full h-full rounded-2xl border border-[#30363d] bg-[#161b22] p-2 shadow-lg flex items-center justify-center">
                  <div className="w-full h-full rounded-xl bg-[#0d1117] border border-[#21262d] flex flex-col items-center justify-center select-none">
                    <span className="font-mono text-4xl font-bold tracking-widest text-[#f0f6fc]">
                      INV
                    </span>
                    <span className="text-[10px] font-mono tracking-wider text-[#8b949e] uppercase mt-1">
                      INVICTUS CORE
                    </span>
                  </div>
                </div>

                {/* Status bubble */}
                <div
                  title={health.connected ? "FastAPI Backend is Online" : "FastAPI Backend is Offline"}
                  className="absolute bottom-2 right-2 bg-[#161b22] border border-[#30363d] rounded-full px-2.5 py-1 text-xs shadow-md flex items-center space-x-1.5"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      health.connected ? "bg-[#3fb950] animate-pulseGlow" : "bg-[#f85149]"
                    }`}
                  />
                  <span className="hidden sm:inline text-[11px] text-[#c9d1d9] font-medium font-mono">
                    {health.connected ? "Online" : "Offline"}
                  </span>
                </div>
              </div>

              {/* Real Names & Information */}
              <div className="pt-2">
                <h1 className="text-2xl font-bold text-[#f0f6fc] leading-tight tracking-tight">
                  INVICTUS
                </h1>
                <div className="text-sm text-[#8b949e] font-mono mt-0.5">
                  {primaryRepo.name}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => setIsTriggerOpen(true)}
                  className="btn-pixel btn-pixel-green w-full"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Run Verification</span>
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    href="/"
                    className="btn-pixel btn-pixel-dark flex-1 text-xs text-center"
                  >
                    <span>View Dashboard</span>
                  </Link>

                  <a
                    href="http://localhost:8000/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-pixel btn-pixel-dark px-3 text-xs"
                    title="Interactive Swagger Docs"
                  >
                    <span>Docs ↗</span>
                  </a>
                </div>
              </div>

              {/* Real Environment Details */}
              <div className="p-3.5 rounded-lg border border-[#30363d] bg-[#161b22] space-y-2.5 text-xs">
                <div className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider font-mono">
                  Environment
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8b949e]">Repository</span>
                  <span className="font-mono text-[#f0f6fc] font-medium">
                    {primaryRepo.name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8b949e]">Branch</span>
                  <span className="font-mono text-[#f0f6fc]">
                    {primaryRepo.default_branch}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8b949e]">Service</span>
                  <span className="font-mono text-[#f0f6fc]">
                    {health.service || "invariant-api"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8b949e]">Backend Port</span>
                  <span className="font-mono text-[#f0f6fc]">
                    :8000
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8b949e]">Frontend Port</span>
                  <span className="font-mono text-[#f0f6fc]">
                    :3000
                  </span>
                </div>
              </div>
            </div>

            {/* Right Main Column: Real Telemetry & Real Runs */}
            <div className="md:col-span-8 lg:col-span-9 space-y-6">
              {/* Real Telemetry Metrics */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-[#f0f6fc]">
                    Verification Telemetry
                  </h2>
                  <button
                    onClick={loadData}
                    className="text-xs text-[#8b949e] hover:text-[#f0f6fc] flex items-center space-x-1 font-mono transition-colors"
                  >
                    <span>↻ Refresh</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-md border border-[#30363d] bg-[#161b22]">
                    <div className="text-xs text-[#8b949e] font-medium flex items-center space-x-1.5">
                      <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Total Executions</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-[#f0f6fc] mt-2">
                      {totalRuns}
                    </div>
                    <div className="text-[11px] text-[#8b949e] mt-1 font-mono">
                      Database recorded
                    </div>
                  </div>

                  <div className="p-4 rounded-md border border-[#30363d] bg-[#161b22]">
                    <div className="text-xs text-[#8b949e] font-medium flex items-center space-x-1.5">
                      <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Passing Runs</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-[#3fb950] mt-2">
                      {passedRuns}
                    </div>
                    <div className="text-[11px] text-[#8b949e] mt-1 font-mono">
                      {passRate}% success rate
                    </div>
                  </div>

                  <div className="p-4 rounded-md border border-[#30363d] bg-[#161b22]">
                    <div className="text-xs text-[#8b949e] font-medium flex items-center space-x-1.5">
                      <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Avg Duration</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-[#f0f6fc] mt-2">
                      {avgDuration}ms
                    </div>
                    <div className="text-[11px] text-[#8b949e] mt-1 font-mono">
                      FastAPI worker threads
                    </div>
                  </div>

                  <div className="p-4 rounded-md border border-[#30363d] bg-[#161b22]">
                    <div className="text-xs text-[#8b949e] font-medium flex items-center space-x-1.5">
                      <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span>Active Repositories</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-[#f0f6fc] mt-2">
                      {repos.length}
                    </div>
                    <div className="text-[11px] text-[#8b949e] mt-1 font-mono">
                      Connected to runner
                    </div>
                  </div>
                </div>
              </div>

              {/* Connected Repositories Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#f0f6fc]">
                    Connected Repositories
                  </h2>
                  <Link href="/repositories" className="text-xs text-[#8b949e] hover:text-[#f0f6fc]">
                    View all repositories →
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {repos.map((repo) => (
                    <div
                      key={repo.id}
                      className="p-4 rounded-md border border-[#30363d] bg-[#161b22] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:border-[#444c56] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          <span className="font-semibold text-sm text-[#f0f6fc]">
                            {repo.full_name || repo.name}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#30363d] text-[#8b949e]">
                            Active
                          </span>
                        </div>
                        <div className="text-xs text-[#8b949e] font-mono">
                          Default branch: <span className="text-[#f0f6fc]">{repo.default_branch}</span> · ID: {repo.id}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setIsTriggerOpen(true)}
                          className="btn-pixel btn-pixel-green text-xs py-1 px-3"
                        >
                          Run Tests
                        </button>
                        <Link
                          href="/"
                          className="btn-pixel btn-pixel-dark text-xs py-1 px-3"
                        >
                          View Runs
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Real Recent Verification Runs Activity */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[#f0f6fc]">
                    Recorded Verification Runs
                  </h3>
                  <Link href="/" className="text-xs text-[#8b949e] hover:text-[#f0f6fc]">
                    Open dashboard view →
                  </Link>
                </div>

                {runs.length === 0 ? (
                  <div className="p-8 text-center rounded-md border border-[#30363d] bg-[#161b22] text-xs text-[#8b949e]">
                    No verification runs recorded yet. Click "Run Verification" to trigger your first run.
                  </div>
                ) : (
                  <div className="divide-y divide-[#30363d] rounded-md border border-[#30363d] bg-[#161b22] overflow-hidden">
                    {runs.slice(0, 6).map((run) => (
                      <div
                        key={run.id}
                        className="p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-[#1f242c] transition-colors"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                run.status === "VERIFIED_PASS"
                                  ? "bg-[#3fb950]"
                                  : run.status === "VERIFIED_FAILURE"
                                  ? "bg-[#f85149]"
                                  : "bg-[#d29922]"
                              }`}
                            />
                            <Link
                              href={`/runs/${run.id}`}
                              className="font-mono text-xs font-semibold text-[#f0f6fc] hover:text-[#58a6ff] hover:underline truncate"
                            >
                              {run.id}
                            </Link>
                            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded border border-[#30363d] text-[#8b949e]">
                              {run.branch}
                            </span>
                            <span className="text-[11px] font-mono text-[#8b949e]">
                              @{run.commit_sha}
                            </span>
                          </div>
                          {run.summary && (
                            <p className="text-xs text-[#8b949e] truncate pl-4">
                              {run.summary}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 text-xs font-mono text-[#8b949e] self-end sm:self-auto flex-shrink-0 pl-4">
                          <span>{run.duration_ms}ms</span>
                          <Link
                            href={`/runs/${run.id}`}
                            className="btn-pixel btn-pixel-dark text-[11px] py-1 px-2.5"
                          >
                            Details →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <TriggerModal
        isOpen={isTriggerOpen}
        onClose={() => setIsTriggerOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />
    </>
  );
}
