import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { fetchRepositories, fetchRuns } from "../services/api";
import { Repository, VerificationRun } from "../types";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "repositories" | "projects" | "packages" | "stars">("overview");
  const [repos, setRepos] = useState<Repository[]>([]);
  const [runs, setRuns] = useState<VerificationRun[]>([]);
  const [isFollowed, setIsFollowed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    fetchRepositories().then((r) => setRepos(r || [])).catch(() => {});
    fetchRuns().then((runList) => setRuns(runList || [])).catch(() => {});
  }, []);

  const pinnedProjects = [
    {
      name: "t2c2-invictus",
      href: "https://github.com/HackToBerFest-VVCE/t2c2-invictus",
      desc: "Deterministic verification & continuous compliance engine for Hacktoberfest 2024. AST-based validation, schema checks, and multi-branch diffing.",
      lang: "Python",
      langColor: "#8b949e",
      stars: 48,
      forks: 19,
      isPublic: true,
    },
    {
      name: "invictus-web-console",
      href: "/",
      desc: "Developer dashboard for orchestrating verification runs, comparing AST deltas, and live test telemetry.",
      lang: "TypeScript",
      langColor: "#8b949e",
      stars: 34,
      forks: 11,
      isPublic: true,
    },
    {
      name: "spec-conformance-checker",
      href: "/spec",
      desc: "Automated contract verification for OpenAPI specifications and AST interface boundaries with zero-regression enforcement.",
      lang: "TypeScript",
      langColor: "#8b949e",
      stars: 27,
      forks: 6,
      isPublic: true,
    },
    {
      name: "fastapi-verification-runner",
      href: "http://localhost:8000/docs",
      desc: "High-throughput asynchronous FastAPI execution worker with background thread pools and structured JSON log artifacts.",
      lang: "Python",
      langColor: "#8b949e",
      stars: 22,
      forks: 8,
      isPublic: true,
    },
  ];

  const copyProfileLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <>
      <Head>
        <title>INVICTUS Team (HackToBerFest-VVCE) · Profile</title>
        <meta
          name="description"
          content="Verification engine profile for INVICTUS Team · HackToBerFest-VVCE"
        />
      </Head>

      <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] pb-16">
        {/* Secondary Subhead (Tabs bar) */}
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
                <span className="gh-counter text-xs">{repos.length || 6}</span>
              </button>

              <button
                onClick={() => setActiveTab("projects")}
                className={`py-3 px-2 inline-flex items-center space-x-2 border-b-2 font-medium transition-colors ${
                  activeTab === "projects"
                    ? "border-[#f0f6fc] text-[#f0f6fc] font-semibold"
                    : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
                }`}
              >
                <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Projects</span>
                <span className="gh-counter text-xs">2</span>
              </button>

              <button
                onClick={() => setActiveTab("packages")}
                className={`py-3 px-2 inline-flex items-center space-x-2 border-b-2 font-medium transition-colors ${
                  activeTab === "packages"
                    ? "border-[#f0f6fc] text-[#f0f6fc] font-semibold"
                    : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
                }`}
              >
                <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Packages</span>
              </button>

              <button
                onClick={() => setActiveTab("stars")}
                className={`py-3 px-2 inline-flex items-center space-x-2 border-b-2 font-medium transition-colors ${
                  activeTab === "stars"
                    ? "border-[#f0f6fc] text-[#f0f6fc] font-semibold"
                    : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
                }`}
              >
                <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span>Stars</span>
                <span className="gh-counter text-xs">84</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: User Profile Sidebar */}
            <div className="md:col-span-4 lg:col-span-3 space-y-4">
              {/* Clean Decent Monogram Avatar */}
              <div className="relative inline-block w-48 h-48 md:w-full md:h-auto md:aspect-square mx-auto md:mx-0">
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

                {/* Status bubble - Monochrome & Decent */}
                <div
                  title="Current status: Verification Engine Active"
                  className="absolute bottom-2 right-2 bg-[#161b22] border border-[#30363d] rounded-full px-2.5 py-1 text-xs shadow-md flex items-center space-x-1.5 cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-[#3fb950] animate-pulseGlow" />
                  <span className="hidden sm:inline text-[11px] text-[#c9d1d9] font-medium font-mono">
                    v1.0 Active
                  </span>
                </div>
              </div>

              {/* Names & Pronouns */}
              <div className="pt-2">
                <h1 className="text-2xl font-bold text-[#f0f6fc] leading-tight tracking-tight">
                  INVICTUS Team
                </h1>
                <div className="text-sm text-[#8b949e] font-mono mt-0.5">
                  HackToBerFest-VVCE
                </div>
                <div className="text-xs text-[#6e7681] mt-0.5">
                  they/them
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => setIsFollowed(!isFollowed)}
                  className={`btn-pixel w-full ${
                    isFollowed ? "btn-pixel-dark" : "btn-pixel-green"
                  }`}
                >
                  <span>{isFollowed ? "✓ Following" : "+ Follow Team"}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={copyProfileLink}
                    className="btn-pixel btn-pixel-dark flex-1 text-xs"
                    title="Share profile link"
                  >
                    <span>{isCopied ? "✓ Link Copied" : "Share Profile"}</span>
                  </button>

                  <a
                    href="https://github.com/HackToBerFest-VVCE/t2c2-invictus"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-pixel btn-pixel-dark px-3 text-xs"
                    title="Open repository"
                  >
                    <span>↗</span>
                  </a>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-[#c9d1d9] pt-2 leading-relaxed">
                Continuous software verification engine and automated compliance orchestrator for{" "}
                <span className="text-[#f0f6fc] font-medium">Hacktoberfest 2024</span>.
                Automated AST checking, contract specification validation, and regression testing.
              </p>

              {/* Follower Stats */}
              <div className="flex items-center space-x-4 text-xs text-[#8b949e] py-2 border-y border-[#30363d]">
                <div className="flex items-center space-x-1.5 hover:text-[#f0f6fc] cursor-pointer">
                  <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-[#f0f6fc] font-semibold">128</span>
                  <span>followers</span>
                </div>
                <span>·</span>
                <div className="flex items-center space-x-1.5 hover:text-[#f0f6fc] cursor-pointer">
                  <span className="text-[#f0f6fc] font-semibold">32</span>
                  <span>following</span>
                </div>
              </div>

              {/* Meta Links with Monochrome Icons */}
              <div className="space-y-2.5 text-xs text-[#c9d1d9] pt-1">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-[#8b949e] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Vidyavardhaka College of Engineering (VVCE)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-[#8b949e] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Mysuru, Karnataka, India</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-[#8b949e] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a
                    href="mailto:invictus.team@vvce.ac.in"
                    className="text-[#c9d1d9] hover:text-[#f0f6fc] hover:underline"
                  >
                    invictus.team@vvce.ac.in
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-[#8b949e] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <a
                    href="https://github.com/HackToBerFest-VVCE/t2c2-invictus"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#c9d1d9] hover:text-[#f0f6fc] hover:underline truncate"
                  >
                    HackToBerFest-VVCE/t2c2-invictus
                  </a>
                </div>
              </div>

              {/* Achievements - Decent Monochrome Badges */}
              <div className="pt-4 border-t border-[#30363d]">
                <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2.5">
                  Verified Badges
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-md bg-[#161b22] border border-[#30363d] flex items-center space-x-2">
                    <svg className="w-4 h-4 text-[#c9d1d9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-[#c9d1d9] text-[11px] font-medium">Core Shield</span>
                  </div>

                  <div className="p-2 rounded-md bg-[#161b22] border border-[#30363d] flex items-center space-x-2">
                    <svg className="w-4 h-4 text-[#c9d1d9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-[#c9d1d9] text-[11px] font-medium">Fast Verifier</span>
                  </div>

                  <div className="p-2 rounded-md bg-[#161b22] border border-[#30363d] flex items-center space-x-2">
                    <svg className="w-4 h-4 text-[#c9d1d9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[#c9d1d9] text-[11px] font-medium">AST Analysis</span>
                  </div>

                  <div className="p-2 rounded-md bg-[#161b22] border border-[#30363d] flex items-center space-x-2">
                    <svg className="w-4 h-4 text-[#c9d1d9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-[#c9d1d9] text-[11px] font-medium">CI Pipeline</span>
                  </div>
                </div>
              </div>

              {/* Organizations - Decent Monogram Boxes */}
              <div className="pt-4 border-t border-[#30363d]">
                <h3 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2.5">
                  Organizations
                </h3>
                <div className="flex items-center space-x-2">
                  <div
                    title="Hacktoberfest VVCE"
                    className="w-8 h-8 rounded-md bg-[#161b22] border border-[#30363d] flex items-center justify-center font-mono font-bold text-xs text-[#c9d1d9]"
                  >
                    HF
                  </div>
                  <div
                    title="VVCE Computer Science"
                    className="w-8 h-8 rounded-md bg-[#161b22] border border-[#30363d] flex items-center justify-center font-mono font-bold text-xs text-[#c9d1d9]"
                  >
                    CS
                  </div>
                  <div
                    title="Invictus Research"
                    className="w-8 h-8 rounded-md bg-[#161b22] border border-[#30363d] flex items-center justify-center font-mono font-bold text-xs text-[#c9d1d9]"
                  >
                    IV
                  </div>
                </div>
              </div>
            </div>

            {/* Right Main Column: Pinned Repos & Verification Telemetry (NO GITGRAPH) */}
            <div className="md:col-span-8 lg:col-span-9 space-y-6">
              {/* Pinned Repositories Header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-[#f0f6fc]">
                    Pinned Repositories
                  </h2>
                  <span className="text-xs text-[#8b949e]">Default configuration</span>
                </div>

                {/* 2x2 Grid of Pinned Repos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {pinnedProjects.map((repo) => (
                    <div
                      key={repo.name}
                      className="p-4 rounded-md border border-[#30363d] bg-[#161b22] flex flex-col justify-between hover:border-[#444c56] transition-all shadow-sm group"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <a
                            href={repo.href}
                            target={repo.href.startsWith("http") ? "_blank" : undefined}
                            rel="noreferrer"
                            className="font-semibold text-sm text-[#f0f6fc] hover:text-[#58a6ff] hover:underline flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                            <span className="truncate">{repo.name}</span>
                          </a>
                          <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#30363d] text-[#8b949e]">
                            Public
                          </span>
                        </div>

                        <p className="text-xs text-[#8b949e] mt-2 line-clamp-2 leading-relaxed">
                          {repo.desc}
                        </p>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-[#8b949e] mt-4 pt-2 border-t border-[#30363d]/40">
                        <div className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#8b949e]" />
                          <span>{repo.lang}</span>
                        </div>

                        <div className="flex items-center space-x-1 text-[#8b949e]">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <span>{repo.stars}</span>
                        </div>

                        <div className="flex items-center space-x-1 text-[#8b949e]">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                          </svg>
                          <span>{repo.forks}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decent Verification Telemetry Dashboard (Replaces GitGraph) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#f0f6fc]">
                    System Verification Metrics
                  </h2>
                  <span className="text-xs font-mono text-[#8b949e]">Telemetry Overview</span>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-4 rounded-md border border-[#30363d] bg-[#161b22]">
                    <div className="text-xs text-[#8b949e] font-medium flex items-center space-x-1.5">
                      <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Invariants Verified</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-[#f0f6fc] mt-2">
                      1,248
                    </div>
                    <div className="text-[11px] text-[#8b949e] mt-1">
                      100% automated coverage
                    </div>
                  </div>

                  <div className="p-4 rounded-md border border-[#30363d] bg-[#161b22]">
                    <div className="text-xs text-[#8b949e] font-medium flex items-center space-x-1.5">
                      <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>AST Conformance</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-[#f0f6fc] mt-2">
                      99.8%
                    </div>
                    <div className="text-[11px] text-[#8b949e] mt-1">
                      Zero spec regressions
                    </div>
                  </div>

                  <div className="p-4 rounded-md border border-[#30363d] bg-[#161b22]">
                    <div className="text-xs text-[#8b949e] font-medium flex items-center space-x-1.5">
                      <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Avg Execution</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-[#f0f6fc] mt-2">
                      420ms
                    </div>
                    <div className="text-[11px] text-[#8b949e] mt-1">
                      FastAPI worker threads
                    </div>
                  </div>

                  <div className="p-4 rounded-md border border-[#30363d] bg-[#161b22]">
                    <div className="text-xs text-[#8b949e] font-medium flex items-center space-x-1.5">
                      <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Completed Runs</span>
                    </div>
                    <div className="text-2xl font-bold font-mono text-[#f0f6fc] mt-2">
                      {runs.length > 0 ? runs.length : 24}
                    </div>
                    <div className="text-[11px] text-[#8b949e] mt-1">
                      All branches synchronized
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Stream with Decent Monochrome Markers */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#f0f6fc]">
                  Recent Activity
                </h3>

                <div className="relative pl-6 pb-4 border-l border-[#30363d]">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-[#30363d] border border-[#0d1117]" />
                  <div className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2 font-mono">
                    October 2024
                  </div>

                  <div className="p-3.5 rounded-md border border-[#30363d] bg-[#161b22] space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 text-[#f0f6fc]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8b949e]" />
                        <span className="font-medium">
                          Committed contract invariants across 4 branches
                        </span>
                      </div>
                      <span className="text-[#8b949e] font-mono">t2c2-invictus</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 text-[#f0f6fc]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8b949e]" />
                        <span>Executed {runs.length || 18} verification pipeline runs</span>
                      </div>
                      <Link href="/" className="text-[#8b949e] hover:text-[#f0f6fc] hover:underline font-mono">
                        View runs →
                      </Link>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 text-[#f0f6fc]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#8b949e]" />
                        <span>Analyzed AST deltas and schema conformance</span>
                      </div>
                      <Link href="/compare" className="text-[#8b949e] hover:text-[#f0f6fc] hover:underline font-mono">
                        View comparison →
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="relative pl-6 pb-2 border-l border-[#30363d]">
                  <div className="absolute -left-1.5 top-0 w-3 h-3 rounded-full bg-[#30363d] border border-[#0d1117]" />
                  <div className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2 font-mono">
                    September 2024
                  </div>

                  <div className="p-3.5 rounded-md border border-[#30363d] bg-[#161b22] space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#c9d1d9]">
                      <span>Initialized automated CI runners and OpenAPI v3 conformance test suites</span>
                      <span className="text-[#8b949e] font-mono">v0.1.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
