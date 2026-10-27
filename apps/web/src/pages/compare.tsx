import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { fetchRuns, compareRuns } from "../services/api";
import { VerificationRun, RunComparison } from "../types";
import { FindingCard } from "../components/FindingCard";

export default function ComparePage() {
  const router = useRouter();
  const { base, head } = router.query;

  const [runs, setRuns] = useState<VerificationRun[]>([]);
  const [baseRunId, setBaseRunId] = useState<string>("");
  const [headRunId, setHeadRunId] = useState<string>("");
  const [comparison, setComparison] = useState<RunComparison | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Load available runs for selection
  useEffect(() => {
    fetchRuns()
      .then((data) => {
        setRuns(data);
        if (data.length >= 2) {
          const initialHead = (head as string) || data[0].id;
          const initialBase = (base as string) || data[1].id;
          setHeadRunId(initialHead);
          setBaseRunId(initialBase);
          performComparison(initialBase, initialHead);
        } else if (data.length === 1) {
          setHeadRunId(data[0].id);
          setBaseRunId(data[0].id);
        }
      })
      .catch((err) => {
        setErrorMsg(err.message || "Failed to load verification runs.");
      });
  }, [base, head]);

  const performComparison = (baseId: string, headId: string) => {
    if (!baseId || !headId) return;
    setLoading(true);
    setErrorMsg(null);
    compareRuns(baseId, headId)
      .then((res) => {
        setComparison(res);
      })
      .catch((err) => {
        setErrorMsg(err.message || "Failed to compare verification runs.");
        setComparison(null);
      })
      .finally(() => setLoading(false));
  };

  const handleCompareClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (baseRunId && headRunId) {
      router.push(`/compare?base=${baseRunId}&head=${headRunId}`, undefined, { shallow: true });
      performComparison(baseRunId, headRunId);
    }
  };

  return (
    <>
      <Head>
        <title>Cross-Commit Run Comparison &bull; Invariant</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-[#30363d] pb-4">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1f6feb]/15 text-[#58a6ff] border border-[#1f6feb]/40">
              Cross-Commit Regression Tracker
            </span>
          </div>
          <h1 className="text-xl font-bold text-[#f0f6fc] mt-2">
            Verification Run Comparison
          </h1>
          <p className="text-xs text-[#8b949e] mt-1">
            Compare findings and invariants between base and head runs to identify new regressions or confirmed fixes.
          </p>
        </div>

        {/* Quick Demo Scenarios */}
        {runs.some((r) => r.id === "run_demo_baseline_a10f") && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#8b949e] font-mono text-[11px]">
              Demo Scenarios:
            </span>
            <button
              type="button"
              onClick={() => {
                setBaseRunId("run_demo_baseline_a10f");
                setHeadRunId("run_demo_regression_b21e");
                router.push(
                  "/compare?base=run_demo_baseline_a10f&head=run_demo_regression_b21e",
                  undefined,
                  { shallow: true }
                );
                performComparison(
                  "run_demo_baseline_a10f",
                  "run_demo_regression_b21e"
                );
              }}
              className="px-2.5 py-1 rounded-md bg-[#da3633]/15 border border-[#da3633]/30 text-[#f85149] hover:bg-[#da3633]/25 transition font-mono text-[11px]"
            >
              ⚠ Baseline vs Invariant Regression (Detect Violation)
            </button>
            <button
              type="button"
              onClick={() => {
                setBaseRunId("run_demo_regression_b21e");
                setHeadRunId("run_demo_fixed_c34d");
                router.push(
                  "/compare?base=run_demo_regression_b21e&head=run_demo_fixed_c34d",
                  undefined,
                  { shallow: true }
                );
                performComparison(
                  "run_demo_regression_b21e",
                  "run_demo_fixed_c34d"
                );
              }}
              className="px-2.5 py-1 rounded-md bg-[#238636]/15 border border-[#238636]/30 text-[#3fb950] hover:bg-[#238636]/25 transition font-mono text-[11px]"
            >
              ✓ Regression vs Fixed (Verify Resolution)
            </button>
          </div>
        )}

        {/* Selection Bar */}
        <form
          onSubmit={handleCompareClick}
          className="p-4 rounded-md bg-[#161b22] border border-[#30363d] flex flex-col md:flex-row items-center gap-4"
        >
          <div className="flex-1 w-full space-y-1">
            <label className="text-[11px] font-mono text-[#8b949e] block">
              Base (Previous) Run:
            </label>
            <select
              value={baseRunId}
              onChange={(e) => setBaseRunId(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs font-mono text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
            >
              {runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} ({r.commit_sha.slice(0, 7)}) &bull; {r.status}
                </option>
              ))}
            </select>
          </div>

          <div className="text-[#8b949e] font-bold text-sm hidden md:block mt-4">
            &rarr;
          </div>

          <div className="flex-1 w-full space-y-1">
            <label className="text-[11px] font-mono text-[#8b949e] block">
              Head (Current) Run:
            </label>
            <select
              value={headRunId}
              onChange={(e) => setHeadRunId(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs font-mono text-[#f0f6fc] focus:outline-none focus:border-[#58a6ff]"
            >
              {runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} ({r.commit_sha.slice(0, 7)}) &bull; {r.status}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !baseRunId || !headRunId}
            className="btn-apple-liquid btn-apple-blue px-5 py-2 text-xs font-semibold self-stretch md:self-end"
          >
            {loading ? "Comparing..." : "Compare"}
          </button>
        </form>

        {errorMsg && (
          <div className="p-4 rounded-md bg-[#da3633]/15 border border-[#da3633]/40 text-[#f85149] text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {comparison && (
          <div className="space-y-6">
            {/* Metric Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d]">
                <span className="text-[11px] font-mono uppercase text-[#f85149]">
                  New Regressions
                </span>
                <p className="text-2xl font-bold font-mono text-[#f85149] mt-1">
                  +{comparison.total_regressions}
                </p>
                <span className="text-[11px] text-[#8b949e]">Failing in head, clean in base</span>
              </div>

              <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d]">
                <span className="text-[11px] font-mono uppercase text-[#3fb950]">
                  Resolved Invariants
                </span>
                <p className="text-2xl font-bold font-mono text-[#3fb950] mt-1">
                  -{comparison.total_resolved}
                </p>
                <span className="text-[11px] text-[#8b949e]">Fixed in head commit</span>
              </div>

              <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d]">
                <span className="text-[11px] font-mono uppercase text-[#e3b341]">
                  Persistent Failures
                </span>
                <p className="text-2xl font-bold font-mono text-[#e3b341] mt-1">
                  {comparison.total_persistent}
                </p>
                <span className="text-[11px] text-[#8b949e]">Failing across both runs</span>
              </div>
            </div>

            {/* Summary Message */}
            <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded font-mono text-xs text-[#c9d1d9]">
              &gt; {comparison.summary}
            </div>

            {/* New Regressions List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#f0f6fc] flex items-center space-x-2">
                <span className="text-[#f85149]">●</span>
                <span>New Regressions ({comparison.new_regressions.length})</span>
              </h3>
              {comparison.new_regressions.length === 0 ? (
                <div className="p-6 rounded-md bg-[#161b22] border border-[#30363d] text-center text-xs text-[#8b949e] font-mono">
                  ✔ Zero new regressions introduced in head run.
                </div>
              ) : (
                <div className="space-y-3">
                  {comparison.new_regressions.map((f) => (
                    <FindingCard key={f.id} finding={f} />
                  ))}
                </div>
              )}
            </div>

            {/* Resolved Findings List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#f0f6fc] flex items-center space-x-2">
                <span className="text-[#3fb950]">●</span>
                <span>Resolved Invariants ({comparison.resolved_findings.length})</span>
              </h3>
              {comparison.resolved_findings.length === 0 ? (
                <div className="p-6 rounded-md bg-[#161b22] border border-[#30363d] text-center text-xs text-[#8b949e] font-mono">
                  No previous failures were marked resolved in this comparison.
                </div>
              ) : (
                <div className="space-y-3">
                  {comparison.resolved_findings.map((f) => (
                    <FindingCard key={f.id} finding={f} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
