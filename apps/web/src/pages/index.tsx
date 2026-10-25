import React from "react";
import Head from "next/head";
import { useRuns } from "../hooks/useRuns";
import { RunCard } from "../components/RunCard";

export default function DashboardPage() {
  const { runs, loading, error, refresh } = useRuns();

  const totalRuns = runs.length;
  const passedRuns = runs.filter((r) => r.status === "VERIFIED_PASS").length;
  const failedRuns = runs.filter((r) => r.status === "VERIFIED_FAILURE").length;

  return (
    <>
      <Head>
        <title>Invariant &bull; Continuous Software Verification</title>
        <meta
          name="description"
          content="Continuous Verification for Every Commit. Verify code against declarative INVARIANT.md specifications."
        />
      </Head>

      <div className="space-y-8">
        {/* Header Hero */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Verification Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Active repository invariants enforced continuously against every commit.
            </p>
          </div>
          <button
            onClick={refresh}
            className="self-start md:self-auto px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 transition-colors"
          >
            Refresh Status
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Total Verification Runs
            </span>
            <div className="text-3xl font-bold text-white mt-2">{totalRuns}</div>
          </div>
          <div className="p-5 rounded-xl border border-emerald-900/40 bg-emerald-950/20">
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              Verified Passes
            </span>
            <div className="text-3xl font-bold text-emerald-400 mt-2">{passedRuns}</div>
          </div>
          <div className="p-5 rounded-xl border border-rose-900/40 bg-rose-950/20">
            <span className="text-xs uppercase tracking-wider text-rose-400 font-semibold">
              Verified Failures
            </span>
            <div className="text-3xl font-bold text-rose-400 mt-2">{failedRuns}</div>
          </div>
        </div>

        {/* Runs List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">Recent Verification Cycles</h2>
            <span className="text-xs text-slate-500">{runs.length} runs recorded</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 border border-slate-800 rounded-xl bg-slate-900/20">
              Loading verification history...
            </div>
          ) : error ? (
            <div className="p-5 text-sm text-rose-400 border border-rose-900 rounded-xl bg-rose-950/30">
              {error}
            </div>
          ) : runs.length === 0 ? (
            <div className="p-12 text-center text-slate-400 border border-slate-800 rounded-xl bg-slate-900/20">
              No verification runs recorded yet. Push a commit or trigger a verification run.
            </div>
          ) : (
            <div className="space-y-3">
              {runs.map((run) => (
                <RunCard key={run.id} run={run} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
