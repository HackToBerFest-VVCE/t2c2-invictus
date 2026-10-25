import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { VerificationRun } from "../../types";
import { fetchRun } from "../../services/api";
import { StatusBadge } from "../../components/StatusBadge";
import { FindingCard } from "../../components/FindingCard";

export default function RunDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [run, setRun] = useState<VerificationRun | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (id && typeof id === "string") {
      fetchRun(id)
        .then((data) => setRun(data))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 border border-slate-800 rounded-xl bg-slate-900/20">
        Loading verification run details...
      </div>
    );
  }

  if (!run) {
    return (
      <div className="space-y-4">
        <Link href="/" className="text-xs text-indigo-400 hover:text-indigo-300">
          &larr; Back to Dashboard
        </Link>
        <div className="p-8 text-center text-slate-400 border border-slate-800 rounded-xl bg-slate-900/30">
          Verification run <span className="font-mono text-slate-200">{id}</span> was not found.
        </div>
      </div>
    );
  }

  const findings = run.findings || [];

  return (
    <>
      <Head>
        <title>Run {run.id} &bull; Invariant</title>
      </Head>

      <div className="space-y-6">
        <div>
          <Link href="/" className="text-xs text-indigo-400 hover:text-indigo-300">
            &larr; Back to Dashboard
          </Link>
        </div>

        {/* Run Header Card */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <div className="flex items-center space-x-3">
                <span className="font-mono text-xl font-bold text-white">{run.id}</span>
                <StatusBadge status={run.status} />
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Triggered via <span className="uppercase font-semibold">{run.event_type}</span> on branch{" "}
                <span className="font-mono text-slate-200">{run.branch}</span>
              </p>
            </div>
            <div className="text-right text-xs text-slate-400 space-y-1">
              <div>Commit: <span className="font-mono text-slate-200">{run.commit_sha}</span></div>
              <div>Duration: <span className="font-semibold text-slate-200">{run.duration_ms} ms</span></div>
              <div>Timestamp: {new Date(run.created_at).toLocaleString()}</div>
            </div>
          </div>

          <div className="text-sm text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800/60">
            <span className="text-xs text-slate-500 uppercase font-semibold block mb-1">
              Verification Summary:
            </span>
            {run.summary || "No summary details provided."}
          </div>
        </div>

        {/* Findings List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Evaluated Findings ({findings.length})</h2>
          </div>

          {findings.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-slate-800 rounded-xl bg-slate-900/20">
              Zero invariant violations or warnings recorded for this run. All checks passed!
            </div>
          ) : (
            <div className="space-y-4">
              {findings.map((f) => (
                <FindingCard key={f.id} finding={f} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
