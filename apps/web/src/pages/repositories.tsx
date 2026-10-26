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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-4">
          <div>
            <h1 className="text-xl font-bold text-[#f0f6fc]">
              Connected Repositories
            </h1>
            <p className="text-xs text-[#8b949e] mt-1">
              Active repositories connected to the Invariant backend database.
            </p>
          </div>
          <button
            onClick={() => setIsTriggerOpen(true)}
            className="btn-apple-liquid btn-apple-green self-start sm:self-auto px-3.5 py-1.5 text-xs font-semibold"
          >
            + Run Verification
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#8b949e] border border-[#30363d] rounded-md bg-[#161b22] font-mono text-xs">
            <span className="animate-spin inline-block mr-2">↻</span>
            Loading repositories from backend...
          </div>
        ) : errorMsg ? (
          <div className="p-5 text-xs font-mono bg-[#da3633]/15 border border-[#da3633]/40 text-[#f85149] rounded-md space-y-2">
            <div className="font-bold">Backend Error:</div>
            <div>{errorMsg}</div>
            <button
              onClick={loadRepos}
              className="mt-2 btn-apple-liquid btn-apple-secondary px-3 py-1 text-xs"
            >
              ↻ Retry
            </button>
          </div>
        ) : repositories.length === 0 ? (
          <div className="p-12 text-center border border-[#30363d] rounded-md bg-[#161b22] space-y-3">
            <p className="text-sm font-semibold text-[#f0f6fc]">
              No repositories found in backend database.
            </p>
            <p className="text-xs text-[#8b949e] max-w-md mx-auto">
              Run a verification on a workspace or register a repository via GitHub webhooks to populate this list.
            </p>
            <button
              onClick={() => setIsTriggerOpen(true)}
              className="btn-apple-liquid btn-apple-green px-3.5 py-1.5 text-xs"
            >
              ▶ Trigger Run on Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {repositories.map((repo) => (
              <div
                key={repo.id}
                className="border border-[#30363d] rounded-md bg-[#161b22] p-5 space-y-4 hover:border-[#58a6ff]/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-[#58a6ff] hover:underline cursor-pointer">
                        {repo.full_name}
                      </span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded-full border border-[#30363d] text-[#8b949e]">
                        Public
                      </span>
                      <span className="text-xs font-mono text-[#8b949e] bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d]">
                        Branch: {repo.default_branch}
                      </span>
                    </div>
                    <p className="text-xs text-[#8b949e]">
                      Continuous invariant rules configured in <code className="text-[#c9d1d9]">INVARIANT.md</code>.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href="/"
                      className="btn-apple-liquid btn-apple-secondary px-3 py-1.5 text-xs"
                    >
                      View Runs
                    </Link>
                  </div>
                </div>

                {repo.recent_runs && repo.recent_runs.length > 0 && (
                  <div className="border-t border-[#30363d] pt-3 space-y-2">
                    <span className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider block">
                      Recent Verification Runs:
                    </span>
                    <div className="space-y-1.5">
                      {repo.recent_runs.map((r) => (
                        <div
                          key={r.id}
                          className="flex items-center justify-between text-xs font-mono bg-[#0d1117] p-2 rounded border border-[#30363d]"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-[#58a6ff]">{r.id}</span>
                            <span className="text-[#8b949e]">{r.commit_sha.substring(0, 7)}</span>
                            <span className="text-[#8b949e]">({r.branch})</span>
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
