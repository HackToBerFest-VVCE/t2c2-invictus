import React, { useEffect, useState, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import { fetchRepositories } from "../services/api";
import { StatusBadge } from "../components/StatusBadge";
import { TriggerModal } from "../components/TriggerModal";
import { useRepo } from "../context/RepoContext";
import { ALL_DEMO_REPOSITORIES, ExtendedRepository } from "../data/demoData";

export default function RepositoriesPage() {
  const { activeRepo, setActiveRepo } = useRepo();
  const [repositories, setRepositories] = useState<ExtendedRepository[]>(ALL_DEMO_REPOSITORIES);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTriggerOpen, setIsTriggerOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "active" | "public" | "private">("all");

  const loadRepos = () => {
    setLoading(true);
    setErrorMsg(null);
    fetchRepositories()
      .then((backendData) => {
        // Merge live runs from backend for t2c2-invictus or any other matching repo
        const merged = ALL_DEMO_REPOSITORIES.map((repo) => {
          const liveRepo = backendData.find(
            (b) => b.name === repo.name || b.id === repo.id || b.full_name?.includes(repo.name)
          );
          if (liveRepo && liveRepo.recent_runs && liveRepo.recent_runs.length > 0) {
            return {
              ...repo,
              recent_runs: liveRepo.recent_runs,
            };
          }
          return repo;
        });
        setRepositories(merged);
      })
      .catch((err) => {
        console.warn("Backend unavailable, using full repository directory:", err);
        setRepositories(ALL_DEMO_REPOSITORIES);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRepos();
  }, []);

  const filteredRepositories = useMemo(() => {
    return repositories.filter((repo) => {
      const matchesSearch =
        searchTerm === "" ||
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.desc.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterMode === "active") {
        return matchesSearch && repo.name === activeRepo.name;
      }
      if (filterMode === "public") {
        return matchesSearch && repo.visibility === "Public";
      }
      if (filterMode === "private") {
        return matchesSearch && repo.visibility === "Private";
      }
      return matchesSearch;
    });
  }, [repositories, searchTerm, filterMode, activeRepo.name]);

  return (
    <>
      <Head>
        <title>Connected Repositories &bull; Invariant</title>
      </Head>

      <div className="space-y-6">
        {/* Header Hero */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-4">
          <div>
            <h1 className="text-xl font-bold text-[#f0f6fc]">
              Connected Repositories
            </h1>
            <p className="text-xs text-[#8b949e] mt-1">
              Active repositories ({repositories.length} total) connected to the Invariant verification engine.
            </p>
          </div>
          <button
            onClick={() => setIsTriggerOpen(true)}
            className="btn-apple-liquid btn-apple-green self-start sm:self-auto px-3.5 py-1.5 text-xs font-semibold"
          >
            + Run Verification
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3 rounded-md border border-[#30363d] bg-[#161b22] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Find a connected repository..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-md font-mono text-xs text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
              />
              <svg
                className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#8b949e]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex items-center space-x-1 overflow-x-auto text-xs font-mono">
              <button
                onClick={() => setFilterMode("all")}
                className={`px-3 py-1.5 rounded-md border transition-colors ${
                  filterMode === "all"
                    ? "bg-[#21262d] border-[#8b949e] text-[#f0f6fc]"
                    : "border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9]"
                }`}
              >
                All ({repositories.length})
              </button>
              <button
                onClick={() => setFilterMode("active")}
                className={`px-3 py-1.5 rounded-md border transition-colors ${
                  filterMode === "active"
                    ? "bg-[#1f6feb]/20 border-[#58a6ff] text-[#58a6ff] font-semibold"
                    : "border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9]"
                }`}
              >
                Active: {activeRepo.name}
              </button>
              <button
                onClick={() => setFilterMode("public")}
                className={`px-3 py-1.5 rounded-md border transition-colors ${
                  filterMode === "public"
                    ? "bg-[#21262d] border-[#8b949e] text-[#f0f6fc]"
                    : "border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9]"
                }`}
              >
                Public
              </button>
              <button
                onClick={() => setFilterMode("private")}
                className={`px-3 py-1.5 rounded-md border transition-colors ${
                  filterMode === "private"
                    ? "bg-[#21262d] border-[#8b949e] text-[#f0f6fc]"
                    : "border-[#30363d] text-[#8b949e] hover:text-[#c9d1d9]"
                }`}
              >
                Private
              </button>
            </div>
          </div>
        </div>

        {/* Repositories List */}
        {loading ? (
          <div className="p-12 text-center text-[#8b949e] border border-[#30363d] rounded-md bg-[#161b22] font-mono text-xs">
            <span className="animate-spin inline-block mr-2">↻</span>
            Loading repositories...
          </div>
        ) : filteredRepositories.length === 0 ? (
          <div className="p-12 text-center border border-[#30363d] rounded-md bg-[#161b22] space-y-3">
            <p className="text-sm font-semibold text-[#f0f6fc]">
              No repositories match current filter.
            </p>
            <p className="text-xs text-[#8b949e]">
              Try searching with another query or select "All".
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterMode("all");
              }}
              className="btn-apple-liquid btn-apple-secondary px-3 py-1 text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredRepositories.map((repo) => {
              const isCurrent = repo.name === activeRepo.name;
              return (
                <div
                  key={repo.id}
                  className={`border rounded-md bg-[#161b22] p-5 space-y-4 transition-all ${
                    isCurrent
                      ? "border-[#58a6ff] ring-1 ring-[#58a6ff]/40 bg-[#161b22]"
                      : "border-[#30363d] hover:border-[#58a6ff]/50"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <button
                          onClick={() => setActiveRepo(repo.name)}
                          className="text-base font-semibold text-[#58a6ff] hover:underline cursor-pointer text-left"
                        >
                          {repo.full_name}
                        </button>
                        {isCurrent && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1f6feb]/20 text-[#58a6ff] border border-[#1f6feb]/40 font-semibold">
                            Active
                          </span>
                        )}
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full border ${
                            repo.visibility === "Private"
                              ? "text-[#e3b341] bg-[#d29922]/10 border-[#d29922]/30"
                              : "text-[#8b949e] border-[#30363d]"
                          }`}
                        >
                          {repo.visibility}
                        </span>
                        <span className="text-xs font-mono text-[#8b949e] bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d]">
                          Branch: {repo.default_branch}
                        </span>
                      </div>

                      {repo.forkedFrom && (
                        <div className="text-xs text-[#8b949e]">
                          Forked from{" "}
                          <span className="text-[#58a6ff] hover:underline">{repo.forkedFrom}</span>
                        </div>
                      )}

                      <p className="text-xs text-[#c9d1d9] leading-relaxed">
                        {repo.desc}
                      </p>

                      <div className="flex items-center space-x-3 text-xs text-[#8b949e] pt-1">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: repo.langColor }}
                          />
                          <span>{repo.lang}</span>
                        </div>
                        {repo.license && <span>{repo.license}</span>}
                        <span>{repo.updated}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          setActiveRepo(repo.name);
                          setIsTriggerOpen(true);
                        }}
                        className="btn-pixel btn-pixel-green text-xs py-1.5 px-3"
                      >
                        Run Verification
                      </button>
                      <Link
                        href="/"
                        onClick={() => setActiveRepo(repo.name)}
                        className="btn-pixel btn-pixel-dark text-xs py-1.5 px-3"
                      >
                        View Runs
                      </Link>
                    </div>
                  </div>

                  {/* Recent Verification Runs for this Repo */}
                  {repo.recent_runs && repo.recent_runs.length > 0 && (
                    <div className="border-t border-[#30363d] pt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider block">
                          Recent Verification Runs:
                        </span>
                        <span className="text-[11px] font-mono text-[#8b949e]">
                          {repo.recent_runs.length} runs recorded
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {repo.recent_runs.map((r) => (
                          <Link
                            key={r.id}
                            href={`/runs/${r.id}`}
                            className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono bg-[#0d1117] p-2.5 rounded border border-[#30363d] hover:border-[#58a6ff]/50 transition-colors gap-2"
                          >
                            <div className="flex items-center space-x-2.5 truncate">
                              <span className="text-[#58a6ff] hover:underline font-semibold">{r.id}</span>
                              <span className="text-[#8b949e]">{r.commit_sha.substring(0, 7)}</span>
                              <span className="text-[#8b949e]">({r.branch})</span>
                              {r.summary && (
                                <span className="text-[#c9d1d9] truncate hidden md:inline text-[11px]">
                                  {r.summary}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 self-start sm:self-auto flex-shrink-0">
                              <span className="text-[#8b949e] text-[11px]">{r.duration_ms}ms</span>
                              <StatusBadge status={r.status} size="sm" />
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
