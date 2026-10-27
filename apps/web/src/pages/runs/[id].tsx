import React, { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { VerificationRun } from "../../types";
import { fetchRun, getExportUrl } from "../../services/api";
import { StatusBadge } from "../../components/StatusBadge";
import { FindingCard } from "../../components/FindingCard";
import { TriggerModal } from "../../components/TriggerModal";
import { ALL_DEMO_REPOSITORIES, ExtendedRepository } from "../../data/demoData";

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

    // Check if run exists in demo catalog
    const allDemoRuns: VerificationRun[] = ALL_DEMO_REPOSITORIES.flatMap(
      (r: ExtendedRepository) => r.recent_runs || []
    );
    const demoMatch = allDemoRuns.find((r: VerificationRun) => r.id === runId);

    fetchRun(runId)
      .then((data) => {
        if (data) {
          setRun(data);
        } else if (demoMatch) {
          setRun(demoMatch);
        } else {
          setErrorMsg(`Verification run '${runId}' not found.`);
        }
      })
      .catch((err) => {
        if (demoMatch) {
          setRun(demoMatch);
          setErrorMsg(null);
        } else {
          setErrorMsg(err.message || "Failed to load run details from backend.");
        }
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
      <div className="p-16 text-center text-[#8b949e] border border-[#30363d] rounded-md bg-[#161b22] font-mono text-xs">
        <span className="animate-spin inline-block mr-2">↻</span>
        Loading verification run report from backend...
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="space-y-4">
        <Link
          href="/"
          className="text-xs font-mono text-[#58a6ff] hover:underline inline-flex items-center space-x-1"
        >
          <span>&larr;</span>
          <span>Back to Verification Runs</span>
        </Link>
        <div className="p-6 border border-[#da3633]/40 bg-[#da3633]/15 text-[#f85149] rounded-md font-mono text-xs space-y-2">
          <p className="font-bold">Error Querying Backend:</p>
          <p>{errorMsg}</p>
          <button
            onClick={() => id && typeof id === "string" && loadRun(id)}
            className="btn-apple-liquid btn-apple-secondary px-3 py-1 text-xs"
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
          className="text-xs font-mono text-[#58a6ff] hover:underline inline-flex items-center space-x-1"
        >
          <span>&larr;</span>
          <span>Back to Verification Runs</span>
        </Link>
        <div className="p-8 text-center border border-[#30363d] rounded-md bg-[#161b22] text-[#8b949e] space-y-2">
          <p className="text-sm font-semibold text-[#f0f6fc]">Run Not Found</p>
          <p className="text-xs font-mono">
            Verification run <span className="text-[#58a6ff]">{id}</span> does not exist in the database.
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
            className="text-[#58a6ff] hover:underline inline-flex items-center space-x-1"
          >
            <span>&larr;</span>
            <span>Back to Verification Runs</span>
          </Link>

          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <Link
              href={`/compare?head=${run.id}`}
              className="btn-apple-liquid btn-apple-secondary px-3 py-1.5 text-xs font-medium"
            >
              ⇄ Compare Run
            </Link>

            <a
              href={getExportUrl(run.id, "markdown")}
              download
              className="btn-apple-liquid btn-apple-secondary px-3 py-1.5 text-xs font-medium"
              title="Download GitHub-Flavored Markdown report"
            >
              ↓ Markdown
            </a>

            <a
              href={getExportUrl(run.id, "json")}
              download
              className="btn-apple-liquid btn-apple-secondary px-3 py-1.5 text-xs font-medium"
              title="Download machine-readable JSON report"
            >
              ↓ JSON
            </a>

            <a
              href={getExportUrl(run.id, "github-issue")}
              download
              className="btn-apple-liquid btn-apple-secondary px-3 py-1.5 text-xs font-medium"
              title="Download pre-filled GitHub Issue draft"
            >
              ↓ Issue Draft
            </a>

            <button
              onClick={() => setIsTriggerOpen(true)}
              className="btn-apple-liquid btn-apple-secondary px-3 py-1.5 text-xs font-medium"
            >
              Re-run Verification
            </button>
          </div>
        </div>

        {/* Header Panel */}
        <div className="border border-[#30363d] rounded-md bg-[#161b22] overflow-hidden">
          <div className="p-5 border-b border-[#30363d] bg-[#21262d]/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                <span className="font-mono text-lg font-bold text-[#f0f6fc]">
                  {run.id}
                </span>
                <StatusBadge status={run.status} />
                <span className="text-xs px-2 py-0.5 rounded bg-[#0d1117] border border-[#30363d] text-[#8b949e] font-mono">
                  {run.repository_id}
                </span>
              </div>
              <p className="text-xs text-[#8b949e] mt-1.5 flex items-center space-x-2 flex-wrap">
                <span>Triggered via</span>
                <span className="font-mono uppercase text-[#c9d1d9] bg-[#0d1117] px-1.5 py-0.2 rounded border border-[#30363d]">
                  {run.event_type}
                </span>
                <span>on branch</span>
                <span className="font-mono text-[#58a6ff]">{run.branch}</span>
              </p>
            </div>

            <div className="text-left sm:text-right text-xs font-mono text-[#8b949e] space-y-1">
              <div>
                Commit:{" "}
                <span className="text-[#58a6ff]">
                  {run.commit_sha ? run.commit_sha.substring(0, 7) : "HEAD"}
                </span>
              </div>
              <div>
                Execution Time:{" "}
                <span className="text-[#c9d1d9]">{run.duration_ms} ms</span>
              </div>
              <div>
                Timestamp: {new Date(run.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#0d1117]/60">
            <span className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider block mb-1">
              Verification Summary:
            </span>
            <p className="text-xs text-[#c9d1d9] font-mono leading-relaxed">
              {run.summary || "No execution summary available."}
            </p>
          </div>
        </div>

        {/* Findings Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-3">
            <div>
              <h2 className="text-sm font-semibold text-[#f0f6fc]">
                Evaluated Invariant Findings ({findings.length})
              </h2>
              <p className="text-xs text-[#8b949e]">
                Assertion traces, static diagnostics, and AI-assisted hypothesis checks.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1 bg-[#0d1117] border border-[#30363d] rounded text-xs font-mono text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
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
                className="px-2 py-1 bg-[#0d1117] border border-[#30363d] rounded text-xs font-mono text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
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
            <div className="p-12 text-center border border-[#30363d] rounded-md bg-[#161b22] space-y-2">
              <svg className="w-10 h-10 text-[#3fb950] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-sm font-semibold text-[#f0f6fc]">
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
