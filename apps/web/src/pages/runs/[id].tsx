import React, { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { VerificationRun } from "../../types";
import { fetchRun } from "../../services/api";
import { StatusBadge } from "../../components/StatusBadge";
import { FindingCard } from "../../components/FindingCard";
import { TriggerModal } from "../../components/TriggerModal";

export default function RunDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [run, setRun] = useState<VerificationRun | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [isTriggerOpen, setIsTriggerOpen] = useState<boolean>(false);

  const loadRun = (runId: string) => {
    setLoading(true);
    setErrorMsg(null);
    fetchRun(runId)
      .then((data) => {
        setRun(data);
      })
      .catch((err) => {
        setErrorMsg(err.message || "Failed to load run details from backend.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (id && typeof id === "string") {
      loadRun(id);
    }
  }, [id]);

  const findings = useMemo(() => run?.findings || [], [run]);

  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      const matchStatus =
        statusFilter === "ALL" || f.verification_status === statusFilter;
      const matchSeverity =
        severityFilter === "ALL" || f.severity === severityFilter;
      return matchStatus && matchSeverity;
    });
  }, [findings, statusFilter, severityFilter]);

  if (loading) {
    return (
      <div className="p-16 text-center text-[#8b949e] liquid-glass rounded-2xl font-mono text-xs space-y-2">
        <span className="animate-spin inline-block mr-2 text-indigo-400 text-base">↻</span>
        <div>Loading verification run report from backend...</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="space-y-4">
        <Link
          href="/"
          className="text-xs font-mono text-indigo-400 hover:text-indigo-300 inline-flex items-center space-x-1"
        >
          <span>&larr;</span>
          <span>Back to Verification Runs</span>
        </Link>
        <div className="p-6 border border-rose-500/30 bg-rose-500/10 text-rose-300 rounded-2xl font-mono text-xs space-y-2 backdrop-blur-md">
          <p className="font-bold">Error Querying Backend:</p>
          <p>{errorMsg}</p>
          <button
            onClick={() => id && typeof id === "string" && loadRun(id)}
            className="px-3 py-1.5 bg-white/[0.05] border border-white/10 text-white rounded-lg hover:bg-white/[0.1] transition-all"
          >
            ↻ Retry
          </button>
        </div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="space-y-4">
        <Link
          href="/"
          className="text-xs font-mono text-indigo-400 hover:text-indigo-300 inline-flex items-center space-x-1"
        >
          <span>&larr;</span>
          <span>Back to Verification Runs</span>
        </Link>
        <div className="p-12 text-center liquid-glass rounded-2xl text-[#8b949e] space-y-2">
          <p className="text-base font-semibold text-white">Run Not Found</p>
          <p className="text-xs font-mono">
            Verification run <span className="text-indigo-400 font-bold">{id}</span> does not exist in the database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Run {run.id} &bull; Invariant Check</title>
      </Head>

      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs text-[#8b949e]">
          <Link
            href="/"
            className="text-indigo-400 hover:text-indigo-300 inline-flex items-center space-x-1 font-mono transition-colors"
          >
            <span>&larr;</span>
            <span>Back to Verification Runs</span>
          </Link>

          <button
            onClick={() => setIsTriggerOpen(true)}
            className="px-3 py-1 text-xs font-medium rounded-lg border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] transition-all shadow-sm"
          >
            Re-run Verification
          </button>
        </div>

        {/* Liquid Glass Header Panel */}
        <div className="liquid-glass rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-5 sm:p-6 border-b border-white/[0.08] bg-white/[0.02] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                <span className="font-mono text-xl font-extrabold text-white">
                  {run.id}
                </span>
                <StatusBadge status={run.status} />
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-white/70 font-mono">
                  {run.repository_id}
                </span>
              </div>
              <p className="text-xs text-[#8b949e] mt-2 flex items-center space-x-2 flex-wrap">
                <span>Triggered via</span>
                <span className="font-mono uppercase text-white/90 bg-white/[0.04] px-2 py-0.5 rounded border border-white/10">
                  {run.event_type}
                </span>
                <span>on branch</span>
                <span className="font-mono text-indigo-400">{run.branch}</span>
              </p>
            </div>

            <div className="text-left sm:text-right text-xs font-mono text-[#8b949e] space-y-1">
              <div>
                Commit:{" "}
                <span className="text-indigo-400 font-semibold">
                  {run.commit_sha ? run.commit_sha.substring(0, 7) : "HEAD"}
                </span>
              </div>
              <div>
                Execution Time:{" "}
                <span className="text-white/90">{run.duration_ms} ms</span>
              </div>
              <div>
                Timestamp: {new Date(run.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-5 bg-black/20">
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block mb-1">
              Verification Summary:
            </span>
            <p className="text-xs text-white/90 font-mono leading-relaxed">
              {run.summary || "No execution summary available."}
            </p>
          </div>
        </div>

        {/* Findings Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Evaluated Invariant Findings ({findings.length})
              </h2>
              <p className="text-xs text-[#8b949e]">
                Assertion traces, static diagnostics, and AI-assisted hypothesis checks.
              </p>
            </div>

            <div className="flex items-center space-x-2.5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 glass-input rounded-xl text-xs font-mono text-white/90 focus:outline-none"
              >
                <option value="ALL">Status: All</option>
                <option value="VERIFIED_FAILURE">Failures Only</option>
                <option value="VERIFIED_PASS">Passes Only</option>
                <option value="AI_HYPOTHESIS">AI Hypotheses</option>
                <option value="STATIC_WARNING">Static Warnings</option>
              </select>

              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-1.5 glass-input rounded-xl text-xs font-mono text-white/90 focus:outline-none"
              >
                <option value="ALL">Severity: All</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {filteredFindings.length === 0 ? (
            <div className="p-16 text-center liquid-glass rounded-2xl space-y-3">
              <span className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg mx-auto shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                ✔
              </span>
              <p className="text-sm font-semibold text-white">
                {findings.length === 0
                  ? "Zero Invariant Violations Detected"
                  : "No Findings Match Current Filter"}
              </p>
              <p className="text-xs text-[#8b949e]">
                {findings.length === 0
                  ? "All declarative rules passed verification without assertion errors or warnings."
                  : "Try switching status or severity filter back to 'All'."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFindings.map((finding) => (
                <FindingCard key={finding.id} finding={finding} />
              ))}
            </div>
          )}
        </div>
      </div>

      <TriggerModal
        isOpen={isTriggerOpen}
        onClose={() => setIsTriggerOpen(false)}
      />
    </>
  );
}
