import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { fetchRuns, compareRuns } from "../services/api";
import { VerificationRun, RunComparison } from "../types";
import { FindingCard } from "../components/FindingCard";
import { ALL_DEMO_REPOSITORIES } from "../data/demoData";

export default function ComparePage() {
  const router = useRouter();
  const { base, head } = router.query;

  const [runs, setRuns] = useState<VerificationRun[]>([]);
  const [baseRunId, setBaseRunId] = useState<string>("");
  const [headRunId, setHeadRunId] = useState<string>("");
  const [comparison, setComparison] = useState<RunComparison | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const performComparison = (baseId: string, headId: string, optionalRuns?: VerificationRun[]) => {
    if (!baseId || !headId) return;
    setLoading(true);
    setErrorMsg(null);

    const runList = optionalRuns && optionalRuns.length > 0 ? optionalRuns : runs;

    compareRuns(baseId, headId)
      .then((res) => {
        setComparison(res);
      })
      .catch(() => {
        // Compute comparison between the runs if backend endpoint is unavailable for demo runs
        const b = runList.find((r) => r.id === baseId);
        const h = runList.find((r) => r.id === headId);

        if (b && h) {
          const bFindings = b.findings || [];
          const hFindings = h.findings || [];
          const newRegs = hFindings.filter((hf) => !bFindings.some((bf) => bf.id === hf.id));
          const resolved = bFindings.filter((bf) => !hFindings.some((hf) => hf.id === bf.id));
          const persistent = hFindings.filter((hf) => bFindings.some((bf) => bf.id === hf.id));

          setComparison({
            base_run_id: baseId,
            head_run_id: headId,
            new_regressions: newRegs,
            resolved_findings: resolved,
            persistent_findings: persistent,
            total_regressions: newRegs.length,
            total_resolved: resolved.length,
            total_persistent: persistent.length,
            summary: `Compared [${b.repository_id}] ${b.id} against [${h.repository_id}] ${h.id}: ${newRegs.length} regressions, ${resolved.length} resolved.`,
          });
          setErrorMsg(null);
        } else {
          setErrorMsg("Failed to compare verification runs.");
          setComparison(null);
        }
      })
      .finally(() => setLoading(false));
  };

  // Load available runs for selection from backend + all demo repositories
  useEffect(() => {
    const allDemoRuns = ALL_DEMO_REPOSITORIES.flatMap((r) => r.recent_runs || []);

    fetchRuns()
      .then((data) => {
        const runMap = new Map<string, VerificationRun>();
        data.forEach((r) => runMap.set(r.id, r));
        allDemoRuns.forEach((r) => {
          if (!runMap.has(r.id)) runMap.set(r.id, r);
        });

        const combined = Array.from(runMap.values());
        combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setRuns(combined);

        if (combined.length >= 2) {
          const initialHead = (head as string) || combined[0].id;
          const initialBase = (base as string) || combined[1].id;
          setHeadRunId(initialHead);
          setBaseRunId(initialBase);
          performComparison(initialBase, initialHead, combined);
        } else if (combined.length === 1) {
          setHeadRunId(combined[0].id);
          setBaseRunId(combined[0].id);
        }
      })
      .catch(() => {
        setRuns(allDemoRuns);
        if (allDemoRuns.length >= 2) {
          const initialHead = (head as string) || allDemoRuns[0].id;
          const initialBase = (base as string) || allDemoRuns[1].id;
          setHeadRunId(initialHead);
          setBaseRunId(initialBase);
          performComparison(initialBase, initialHead, allDemoRuns);
        }
      });
  }, [base, head]);

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
        <div>
          <h1 className="text-xl font-bold text-[#f0f6fc]">
            Cross-Commit Verification Run Comparison
          </h1>
          <p className="text-xs text-[#8b949e] mt-1">
            Compare findings and invariants between base and head runs across repositories to identify regressions and resolved fixes.
          </p>
        </div>

        {/* Quick Demo Scenarios Across Repositories */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#8b949e] font-mono text-[11px]">
            Comparison Scenarios:
          </span>

          <button
            type="button"
            onClick={() => {
              setBaseRunId("run_pragathi_88a1");
              setHeadRunId("run_pragathi_54b2");
              router.push("/compare?base=run_pragathi_88a1&head=run_pragathi_54b2", undefined, { shallow: true });
              performComparison("run_pragathi_88a1", "run_pragathi_54b2");
            }}
            className="px-2.5 py-1 rounded-md bg-[#da3633]/15 border border-[#da3633]/30 text-[#f85149] hover:bg-[#da3633]/25 transition font-mono text-[11px]"
          >
            ▲ pragathi: Main vs Staging Warning
          </button>

          <button
            type="button"
            onClick={() => {
              setBaseRunId("run_shelf_44f1");
              setHeadRunId("run_shelf_21b3");
              router.push("/compare?base=run_shelf_44f1&head=run_shelf_21b3", undefined, { shallow: true });
              performComparison("run_shelf_44f1", "run_shelf_21b3");
            }}
            className="px-2.5 py-1 rounded-md bg-[#bc8cff]/15 border border-[#bc8cff]/30 text-[#d2a8ff] hover:bg-[#bc8cff]/25 transition font-mono text-[11px]"
          >
            ✦ code-shelf: Master vs Concurrency Hypothesis
          </button>

          <button
            type="button"
            onClick={() => {
              setBaseRunId("run_casefile_43c1");
              setHeadRunId("run_casefile_77b2");
              router.push("/compare?base=run_casefile_43c1&head=run_casefile_77b2", undefined, { shallow: true });
              performComparison("run_casefile_43c1", "run_casefile_77b2");
            }}
            className="px-2.5 py-1 rounded-md bg-[#238636]/15 border border-[#238636]/30 text-[#3fb950] hover:bg-[#238636]/25 transition font-mono text-[11px]"
          >
            ✓ casefile: Audit Branch vs Verified Head
          </button>
        </div>

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
                  [{r.repository_id}] {r.id} ({r.commit_sha.slice(0, 7)} · {r.branch}) &bull; {r.status}
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
                  [{r.repository_id}] {r.id} ({r.commit_sha.slice(0, 7)} · {r.branch}) &bull; {r.status}
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
          <div className="p-4 rounded-md bg-[#da3633]/15 border border-[#da3633]/30 text-[#f85149] text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="p-16 text-center text-[#8b949e] border border-[#30363d] rounded-md bg-[#161b22] font-mono text-xs">
            <span className="animate-spin inline-block mr-2">↻</span>
            Diffing declarative invariant states and execution traces...
          </div>
        ) : comparison ? (
          <div className="space-y-6">
            {/* Summary Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d] space-y-1">
                <span className="text-[11px] font-mono uppercase text-[#f85149]">
                  New Regressions
                </span>
                <p className="text-2xl font-bold font-mono text-[#f85149]">
                  {comparison.total_regressions}
                </p>
                <span className="text-xs text-[#8b949e]">
                  Failed in head, were passing in base
                </span>
              </div>

              <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d] space-y-1">
                <span className="text-[11px] font-mono uppercase text-[#3fb950]">
                  Resolved Invariants
                </span>
                <p className="text-2xl font-bold font-mono text-[#3fb950]">
                  {comparison.total_resolved}
                </p>
                <span className="text-xs text-[#8b949e]">
                  Passing in head, were failing in base
                </span>
              </div>

              <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d] space-y-1">
                <span className="text-[11px] font-mono uppercase text-[#8b949e]">
                  Persistent Invariants
                </span>
                <p className="text-2xl font-bold font-mono text-[#f0f6fc]">
                  {comparison.total_persistent}
                </p>
                <span className="text-xs text-[#8b949e]">
                  Unchanged status across both runs
                </span>
              </div>
            </div>

            {/* Invariant Diff Statement */}
            <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d] space-y-1">
              <span className="text-[11px] font-mono uppercase text-[#8b949e] block">
                Verification Diff Summary:
              </span>
              <p className="text-xs text-[#c9d1d9] font-mono">
                {comparison.summary}
              </p>
            </div>

            {/* New Regressions List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[#f0f6fc] flex items-center space-x-2">
                <span className="text-[#f85149]">●</span>
                <span>New Regressions ({comparison.new_regressions.length})</span>
              </h3>
              {comparison.new_regressions.length === 0 ? (
                <div className="p-6 rounded-md bg-[#161b22] border border-[#30363d] text-center text-xs text-[#8b949e] font-mono">
                  ✓ Zero new regressions introduced in head run.
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
        ) : null}
      </div>
    </>
  );
}
