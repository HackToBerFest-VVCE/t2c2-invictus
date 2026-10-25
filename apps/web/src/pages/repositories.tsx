import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Repository } from "../types";
import { fetchRepositories } from "../services/api";
import { StatusBadge } from "../components/StatusBadge";
import { TriggerModal } from "../components/TriggerModal";

export default function RepositoriesPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTriggerOpen, setIsTriggerOpen] = useState<boolean>(false);

  const loadRepos = () => {
    setLoading(true);
    setErrorMsg(null);
    fetchRepositories()
      .then((data) => setRepositories(data))
      .catch((err) => {
        setErrorMsg(err.message || "Failed to fetch repositories from backend.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRepos();
  }, []);

  return (
    <>
      <Head>
        <title>Connected Repositories &bull; Invariant</title>
      </Head>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold liquid-title">
              Connected Repositories
            </h1>
            <p className="text-xs text-[#8b949e] mt-1">
              Active repositories connected to the Invariant backend database.
            </p>
          </div>
          <button
            onClick={() => setIsTriggerOpen(true)}
            className="self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white border border-emerald-400/30 shadow-[0_4px_18px_rgba(16,185,129,0.35)] transition-all"
          >
            + Run Verification
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-[#8b949e] liquid-glass rounded-2xl font-mono text-xs space-y-2">
            <span className="animate-spin inline-block mr-2 text-indigo-400 text-base">↻</span>
            <div>Loading repositories from backend...</div>
          </div>
        ) : errorMsg ? (
          <div className="p-6 text-xs font-mono bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl space-y-2 backdrop-blur-md">
            <div className="font-bold flex items-center space-x-2">
              <span>⛔</span>
              <span>Backend Error:</span>
            </div>
            <div>{errorMsg}</div>
            <button
              onClick={loadRepos}
              className="mt-2 px-3 py-1.5 bg-white/[0.05] border border-white/10 rounded-lg text-white hover:bg-white/[0.1] transition-all"
            >
              ↻ Retry
            </button>
          </div>
        ) : repositories.length === 0 ? (
          <div className="p-16 text-center liquid-glass rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl mx-auto shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              📁
            </div>
            <p className="text-base font-semibold text-white">
              No repositories found in backend database.
            </p>
            <p className="text-xs text-[#8b949e] max-w-md mx-auto">
              Run a verification on a workspace or register a repository via GitHub webhooks to populate this list.
            </p>
            <button
              onClick={() => setIsTriggerOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white border border-emerald-400/30 shadow-[0_4px_18px_rgba(16,185,129,0.35)] transition-all"
            >
              ▶ Trigger Run on Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="liquid-glass liquid-glass-interactive rounded-2xl p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2.5 flex-wrap">
                      <span className="text-base font-semibold text-white hover:text-indigo-300 transition-colors cursor-pointer">
                        {repo.full_name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 bg-white/[0.04] text-[#8b949e]">
                        Public
                      </span>
                      <span className="text-xs font-mono text-indigo-300 bg-white/[0.04] px-2.5 py-0.5 rounded-md border border-white/10">
                        Branch: {repo.default_branch}
                      </span>
                    </div>
                    <p className="text-xs text-[#8b949e]">
                      Continuous invariant rules configured in <code className="text-white/80">INVARIANT.md</code>.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href="/"
                      className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08] transition-all"
                    >
                      View Runs &rarr;
                    </Link>
                  </div>
                </div>

                {repo.recent_runs && repo.recent_runs.length > 0 && (
                  <div className="border-t border-white/[0.06] pt-3.5 space-y-2">
                    <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider block">
                      Recent Verification Runs:
                    </span>
                    <div className="space-y-2">
                      {repo.recent_runs.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between text-xs font-mono bg-white/[0.02] p-2.5 rounded-xl border border-white/5"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-indigo-400 font-semibold">{r.id}</span>
                            <span className="text-white/40">{r.commit_sha.substring(0, 7)}</span>
                            <span className="text-white/40">({r.branch})</span>
                          </div>
                          <StatusBadge status={r.status} size="sm" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <TriggerModal
        isOpen={isTriggerOpen}
        onClose={() => setIsTriggerOpen(false)}
        onSuccess={loadRepos}
      />
    </>
  );
}
