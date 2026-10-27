import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { fetchRepositories, fetchRuns, checkBackendHealth } from "../services/api";
import { Repository, VerificationRun, BackendHealth } from "../types";
import { TriggerModal } from "../components/TriggerModal";
import { useRepo } from "../context/RepoContext";

import { ALL_DEMO_REPOSITORIES } from "../data/demoData";

export default function ProfilePage() {
  const { activeRepo, setActiveRepo } = useRepo();
  const [activeTab, setActiveTab] = useState<"overview" | "repositories" | "projects" | "packages" | "stars">("overview");
  const [repos, setRepos] = useState<Repository[]>([]);
  const [runs, setRuns] = useState<VerificationRun[]>([]);
  const [health, setHealth] = useState<BackendHealth>({
    status: "checking",
    service: "invariant-api",
    connected: false,
  });
  const [isTriggerOpen, setIsTriggerOpen] = useState(false);
  const [repoSearch, setRepoSearch] = useState("");
  const [repoFilter, setRepoFilter] = useState("all");
  const [starredRepos, setStarredRepos] = useState<Record<string, boolean>>({
    "code-shelf": true,
    "osl-vvce-website": true,
    "t2c2-invictus": true,
    "casefile": true,
    "scanr": true,
    "pragathi": true,
  });
  const [isCopied, setIsCopied] = useState<string | null>(null);

  const loadData = () => {
    Promise.all([
      fetchRepositories().catch(() => []),
      fetchRuns().catch(() => []),
      checkBackendHealth().catch(() => ({
        status: "offline",
        service: "invariant-api",
        connected: false,
      })),
    ]).then(([r, runList, h]) => {
      // Gather demo runs for all repositories
      const allDemoRuns = ALL_DEMO_REPOSITORIES.flatMap((repo) => repo.recent_runs || []);

      // Merge backend live runs with all demo runs
      const runMap = new Map<string, VerificationRun>();
      (runList || []).forEach((item) => runMap.set(item.id, item));
      allDemoRuns.forEach((item) => {
        if (!runMap.has(item.id)) {
          runMap.set(item.id, item);
        }
      });

      const combined = Array.from(runMap.values());
      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setRepos(r || []);
      setRuns(combined);
      setHealth(h);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRuns = runs.length;
  const passedRuns = runs.filter((r) => r.status === "VERIFIED_PASS").length;
  const passRate = totalRuns > 0 ? Math.round((passedRuns / totalRuns) * 100) : 100;
  const avgDuration =
    totalRuns > 0
      ? Math.round(runs.reduce((acc, r) => acc + (r.duration_ms || 0), 0) / totalRuns)
      : 0;

  // Real repositories from Srinivas P (srinivas2s)
  const userRepositories = [
    {
      name: "pragathi",
      visibility: "Private",
      forkedFrom: null,
      desc: "Internal development project and verification test suite.",
      lang: "JavaScript",
      langColor: "#f1e05a",
      license: null,
      updated: "Updated 2 days ago",
      stars: 0,
    },
    {
      name: "tiper",
      visibility: "Private",
      forkedFrom: null,
      desc: "Full-stack analytics dashboard and real-time telemetry service.",
      lang: "JavaScript",
      langColor: "#f1e05a",
      license: null,
      updated: "Updated 4 days ago",
      stars: 0,
    },
    {
      name: "osl-vvce-website",
      visibility: "Public",
      forkedFrom: "osl-vvce/osl-vvce-website",
      desc: "OSL Website",
      lang: "TypeScript",
      langColor: "#3178c6",
      license: "MIT License",
      updated: "Updated 4 days ago",
      stars: 1,
    },
    {
      name: "code-shelf",
      visibility: "Public",
      forkedFrom: "osl-vvce/code-shelf",
      desc: "A centralized project showcase and member directory for students at VVCE. Designed to highlight student innovation and technical expertise through public profiles and project hosting",
      lang: "TypeScript",
      langColor: "#3178c6",
      license: "Apache License 2.0",
      updated: "Updated 4 days ago",
      stars: 2,
    },
    {
      name: "scanr",
      visibility: "Public",
      forkedFrom: null,
      desc: "High-speed document scanner and optical character recognition pipeline.",
      lang: "Vue",
      langColor: "#41b883",
      license: null,
      updated: "Updated last week",
      stars: 1,
    },
    {
      name: "casefile",
      visibility: "Public",
      forkedFrom: null,
      desc: "Digital investigation case management and evidence locker system.",
      lang: "TypeScript",
      langColor: "#3178c6",
      license: "MIT License",
      updated: "Updated last week",
      stars: 1,
    },
    {
      name: "neon-runner",
      visibility: "Public",
      forkedFrom: null,
      desc: "Fast asynchronous job queue and distributed runner engine.",
      lang: "JavaScript",
      langColor: "#f1e05a",
      license: null,
      updated: "Updated last week",
      stars: 0,
    },
    {
      name: "udyog-netra",
      visibility: "Private",
      forkedFrom: null,
      desc: "Industrial telemetry monitoring and defect detection computer vision model.",
      lang: "JavaScript",
      langColor: "#f1e05a",
      license: null,
      updated: "Updated 2 weeks ago",
      stars: 0,
    },
    {
      name: "Srinivas2s",
      visibility: "Public",
      forkedFrom: null,
      desc: "Personal GitHub configuration profile and automated workflows.",
      lang: "Markdown",
      langColor: "#8b949e",
      license: null,
      updated: "Updated 2 weeks ago",
      stars: 5,
    },
    {
      name: "t2c2-invictus",
      visibility: "Public",
      forkedFrom: null,
      desc: "Continuous verification engine for invariants, AST conformance, and schema diffing.",
      lang: "Python",
      langColor: "#3572A5",
      license: "MIT License",
      updated: "Updated today",
      stars: 48,
    },
  ];

  const filteredRepos = userRepositories.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
      r.desc.toLowerCase().includes(repoSearch.toLowerCase());
    if (repoFilter === "public") return matchesSearch && r.visibility === "Public";
    if (repoFilter === "private") return matchesSearch && r.visibility === "Private";
    return matchesSearch;
  });

  const toggleStar = (repoName: string) => {
    setStarredRepos((prev) => ({
      ...prev,
      [repoName]: !prev[repoName],
    }));
  };

  const copyToClipboard = (text: string, id: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(text);
      setIsCopied(id);
      setTimeout(() => setIsCopied(null), 2000);
    }
  };

  // Projects data across multiple repositories
  const projects = [
    {
      id: "proj_1",
      title: "Invariant Spec Compliance Board",
      repo: "t2c2-invictus",
      desc: "Declarative invariant testing, continuous contract validation, and multi-branch regression detection.",
      status: "Active",
      progress: 100,
      updatedAt: "Updated today",
      invariantsCount: 18,
      leadBranch: "frontend",
    },
    {
      id: "proj_2",
      title: "Automated AST Conformance Tracker",
      repo: "t2c2-invictus",
      desc: "Abstract syntax tree test-gap analysis and OpenAPI v3 interface compliance verifier.",
      status: "In Progress",
      progress: 92,
      updatedAt: "Updated 2 days ago",
      invariantsCount: 14,
      leadBranch: "main",
    },
    {
      id: "proj_3",
      title: "Document OCR Invariant Assertion Matrix",
      repo: "scanr",
      desc: "Bounding-box spatial invariance, confidence thresholds, and character recognition consistency checks.",
      status: "Active",
      progress: 96,
      updatedAt: "Updated 3 days ago",
      invariantsCount: 12,
      leadBranch: "main",
    },
    {
      id: "proj_4",
      title: "Open Source Lab Portal Security & Auth Gate",
      repo: "osl-vvce-website",
      desc: "Session invariant verification, CSRF token validation, and OAuth2 callback boundary checks.",
      status: "Active",
      progress: 100,
      updatedAt: "Updated 4 days ago",
      invariantsCount: 8,
      leadBranch: "master",
    },
    {
      id: "proj_5",
      title: "Code-Shelf Catalog Integrity Engine",
      repo: "code-shelf",
      desc: "SemVer package dependency cycle prevention, author attribution checks, and license verification.",
      status: "Active",
      progress: 94,
      updatedAt: "Updated 5 days ago",
      invariantsCount: 15,
      leadBranch: "main",
    },
    {
      id: "proj_6",
      title: "Udyog-Netra Industrial Telemetry Guardrails",
      repo: "udyog-netra",
      desc: "Streaming vibration telemetry anomaly bounds, frame rate guarantees, and real-time inference latency constraints.",
      status: "In Progress",
      progress: 88,
      updatedAt: "Updated 1 week ago",
      invariantsCount: 10,
      leadBranch: "main",
    },
  ];

  // Packages data across repositories
  const packages = [
    {
      id: "pkg_1",
      name: "invariant-cli",
      repo: "t2c2-invictus",
      registry: "npm / pypi",
      version: "v0.1.0",
      desc: "Command-line software verification tool for running continuous invariant checks in local and CI environments.",
      installCmd: "pip install invariant-verifier",
      ecosystem: "Python / Node.js",
      downloads: "1.4k",
    },
    {
      id: "pkg_2",
      name: "t2c2-invictus-runner",
      repo: "t2c2-invictus",
      registry: "Docker Container",
      version: "latest",
      desc: "Hardened execution container bundling FastAPI verification engine, pytest runners, and AST analyzers.",
      installCmd: "docker pull ghcr.io/hacktoberfest-vvce/t2c2-invictus:latest",
      ecosystem: "Container Image",
      downloads: "840",
    },
    {
      id: "pkg_3",
      name: "@invariant/spec-parser",
      repo: "t2c2-invictus",
      registry: "npm",
      version: "v0.1.0",
      desc: "Fast AST parser for INVARIANT.md declarative specifications with OpenAPI and TypeScript bindings.",
      installCmd: "npm install @invariant/spec-parser",
      ecosystem: "TypeScript",
      downloads: "620",
    },
    {
      id: "pkg_4",
      name: "@scanr/ocr-core",
      repo: "scanr",
      registry: "npm",
      version: "v1.2.4",
      desc: "High-speed document scanner and optical character recognition invariant validation library.",
      installCmd: "npm install @scanr/ocr-core",
      ecosystem: "TypeScript",
      downloads: "1.8k",
    },
    {
      id: "pkg_5",
      name: "neon-runner-daemon",
      repo: "neon-runner",
      registry: "npm / pypi",
      version: "v0.8.2",
      desc: "Fast asynchronous job queue and distributed runner engine with zero-leak worker pooling.",
      installCmd: "npm install neon-runner-daemon",
      ecosystem: "Node.js",
      downloads: "950",
    },
    {
      id: "pkg_6",
      name: "casefile-sdk",
      repo: "casefile",
      registry: "npm",
      version: "v2.0.1",
      desc: "Cryptographic tamper-evident evidence locker client for digital investigation workflows.",
      installCmd: "npm install casefile-sdk",
      ecosystem: "TypeScript",
      downloads: "430",
    },
  ];

  const starredList = userRepositories.filter((r) => starredRepos[r.name]);

  return (
    <>
      <Head>
        <title>Srinivas P (srinivas2s) · Profile</title>
        <meta
          name="description"
          content="GitHub Developer Profile of Srinivas P (srinivas2s)"
        />
      </Head>

      <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] pb-16">
        {/* Navigation Tabs Bar — Overview, Repositories, Projects, Packages, Stars */}
        <div className="border-b border-[#30363d] bg-[#0d1117] sticky top-16 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-6 overflow-x-auto no-scrollbar text-sm -mb-px">
              {/* Overview Tab */}
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

              {/* Repositories Tab */}
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
                <span className="gh-counter text-xs">{userRepositories.length}</span>
              </button>

              {/* Projects Tab */}
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

              {/* Packages Tab */}
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

              {/* Stars Tab */}
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
                <span className="gh-counter text-xs">{starredList.length}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Srinivas P Profile Sidebar */}
            <div className="md:col-span-4 lg:col-span-3 space-y-4">
              {/* Photo Avatar with Status Indicator */}
              <div className="relative inline-block w-48 h-48 md:w-full md:h-auto md:aspect-square mx-auto md:mx-0">
                <div className="w-full h-full rounded-full border border-[#30363d] p-1 bg-[#161b22] shadow-xl overflow-hidden">
                  <img
                    src="/profile.jpg"
                    alt="Srinivas P"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>

                {/* Status bubble */}
                <div
                  title={health.connected ? "FastAPI Backend Online" : "FastAPI Backend Offline"}
                  className="absolute bottom-2 right-2 bg-[#161b22] border border-[#30363d] rounded-full px-2.5 py-1 text-xs shadow-md flex items-center space-x-1.5"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      health.connected ? "bg-[#3fb950] animate-pulseGlow" : "bg-[#f85149]"
                    }`}
                  />
                  <span className="hidden sm:inline text-[11px] text-[#c9d1d9] font-medium font-mono">
                    {health.connected ? "Online" : "Offline"}
                  </span>
                </div>
              </div>

              {/* Names & ID */}
              <div className="pt-2">
                <h1 className="text-2xl font-bold text-[#f0f6fc] leading-tight tracking-tight">
                  Srinivas P
                </h1>
                <div className="text-base text-[#8b949e] font-mono mt-0.5">
                  srinivas2s
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => setIsTriggerOpen(true)}
                  className="btn-pixel btn-pixel-green w-full"
                >
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Run Verification</span>
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    href="/"
                    className="btn-pixel btn-pixel-dark flex-1 text-xs text-center"
                  >
                    <span>Dashboard</span>
                  </Link>

                  <a
                    href="http://localhost:8000/docs"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-pixel btn-pixel-dark px-3 text-xs"
                    title="Interactive Swagger Docs"
                  >
                    <span>Docs ↗</span>
                  </a>
                </div>
              </div>

              {/* Real Environment Details */}
              <div className="p-3.5 rounded-lg border border-[#30363d] bg-[#161b22] space-y-2.5 text-xs">
                <div className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-wider font-mono">
                  Environment
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8b949e]">User ID</span>
                  <span className="font-mono text-[#f0f6fc] font-medium">
                    srinivas2s
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8b949e]">Active Repo</span>
                  <span className="font-mono text-[#58a6ff] font-semibold">
                    {activeRepo.name}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8b949e]">Service</span>
                  <span className="font-mono text-[#f0f6fc]">
                    {health.service || "invariant-api"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8b949e]">Backend Port</span>
                  <span className="font-mono text-[#f0f6fc]">
                    :8000
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#8b949e]">Frontend Port</span>
                  <span className="font-mono text-[#f0f6fc]">
                    :3000
                  </span>
                </div>
              </div>
            </div>

            {/* Right Main Column: Tab Views */}
            <div className="md:col-span-8 lg:col-span-9 space-y-6">
              {/* TAB 1: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Telemetry Metrics */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-semibold text-[#f0f6fc]">
                        Verification Telemetry
                      </h2>
                      <button
                        onClick={loadData}
                        className="text-xs text-[#8b949e] hover:text-[#f0f6fc] flex items-center space-x-1 font-mono transition-colors"
                      >
                        <span>↻ Refresh</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="p-4 rounded-md border border-[#30363d] bg-[#161b22]">
                        <div className="text-xs text-[#8b949e] font-medium flex items-center space-x-1.5">
                          <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Total Runs</span>
                        </div>
                        <div className="text-2xl font-bold font-mono text-[#f0f6fc] mt-2">
                          {totalRuns}
                        </div>
                        <div className="text-[11px] text-[#8b949e] mt-1 font-mono">
                          Database recorded
                        </div>
                      </div>

                      <div className="p-4 rounded-md border border-[#30363d] bg-[#161b22]">
                        <div className="text-xs text-[#8b949e] font-medium flex items-center space-x-1.5">
                          <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span>Passing Runs</span>
                        </div>
                        <div className="text-2xl font-bold font-mono text-[#3fb950] mt-2">
                          {passedRuns}
                        </div>
                        <div className="text-[11px] text-[#8b949e] mt-1 font-mono">
                          {passRate}% success rate
                        </div>
                      </div>

                      <div className="p-4 rounded-md border border-[#30363d] bg-[#161b22]">
                        <div className="text-xs text-[#8b949e] font-medium flex items-center space-x-1.5">
                          <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Avg Duration</span>
                        </div>
                        <div className="text-2xl font-bold font-mono text-[#f0f6fc] mt-2">
                          {avgDuration}ms
                        </div>
                        <div className="text-[11px] text-[#8b949e] mt-1 font-mono">
                          Worker execution
                        </div>
                      </div>

                      <div className="p-4 rounded-md border border-[#30363d] bg-[#161b22]">
                        <div className="text-xs text-[#8b949e] font-medium flex items-center space-x-1.5">
                          <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                          <span>Repositories</span>
                        </div>
                        <div className="text-2xl font-bold font-mono text-[#f0f6fc] mt-2">
                          {userRepositories.length}
                        </div>
                        <div className="text-[11px] text-[#8b949e] mt-1 font-mono">
                          srinivas2s account
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pinned Repositories Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-[#f0f6fc]">
                        Pinned Repositories
                      </h2>
                      <button
                        onClick={() => setActiveTab("repositories")}
                        className="text-xs text-[#8b949e] hover:text-[#f0f6fc] font-mono"
                      >
                        All Repositories →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {userRepositories.slice(0, 4).map((repo) => {
                        const isCurrent = repo.name === activeRepo.name;
                        return (
                          <div
                            key={repo.name}
                            onClick={() => setActiveRepo(repo.name)}
                            className={`p-4 rounded-md border bg-[#161b22] flex flex-col justify-between transition-all cursor-pointer group ${
                              isCurrent
                                ? "border-[#58a6ff] ring-1 ring-[#58a6ff]/40 bg-[#1f6feb]/5"
                                : "border-[#30363d] hover:border-[#58a6ff]/50"
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-sm text-[#58a6ff] hover:underline flex items-center space-x-1.5 truncate">
                                  <span className="truncate">{repo.name}</span>
                                  {isCurrent && (
                                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1f6feb]/20 text-[#58a6ff] border border-[#1f6feb]/40">
                                      Active
                                    </span>
                                  )}
                                </span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#30363d] text-[#8b949e] flex-shrink-0">
                                  {repo.visibility}
                                </span>
                              </div>

                            {repo.forkedFrom && (
                              <div className="text-[11px] text-[#8b949e] mt-1 truncate">
                                Forked from {repo.forkedFrom}
                              </div>
                            )}

                            <p className="text-xs text-[#8b949e] mt-2 line-clamp-2 leading-relaxed">
                              {repo.desc}
                            </p>
                          </div>

                          <div className="flex items-center space-x-3 text-xs text-[#8b949e] mt-4 pt-2 border-t border-[#30363d]/40">
                            <div className="flex items-center space-x-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: repo.langColor }}
                              />
                              <span>{repo.lang}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </div>

                  {/* Recent Runs Activity */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[#f0f6fc]">
                        Recent Verification Runs
                      </h3>
                      <Link href="/" className="text-xs text-[#8b949e] hover:text-[#f0f6fc]">
                        Open dashboard view →
                      </Link>
                    </div>

                    {runs.length === 0 ? (
                      <div className="p-8 text-center rounded-md border border-[#30363d] bg-[#161b22] text-xs text-[#8b949e]">
                        No verification runs recorded yet. Click "Run Verification" to trigger your first run.
                      </div>
                    ) : (
                      <div className="divide-y divide-[#30363d] rounded-md border border-[#30363d] bg-[#161b22] overflow-hidden">
                        {runs.slice(0, 5).map((run) => (
                          <div
                            key={run.id}
                            className="p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-[#1f242c] transition-colors"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    run.status === "VERIFIED_PASS"
                                      ? "bg-[#3fb950]"
                                      : run.status === "VERIFIED_FAILURE"
                                      ? "bg-[#f85149]"
                                      : "bg-[#d29922]"
                                  }`}
                                />
                                <Link
                                  href={`/runs/${run.id}`}
                                  className="font-mono text-xs font-semibold text-[#f0f6fc] hover:text-[#58a6ff] hover:underline truncate"
                                >
                                  {run.id}
                                </Link>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[#58a6ff]">
                                  {run.repository_id || "t2c2-invictus"}
                                </span>
                                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded border border-[#30363d] text-[#8b949e]">
                                  {run.branch}
                                </span>
                                <span className="text-[11px] font-mono text-[#8b949e]">
                                  @{run.commit_sha}
                                </span>
                              </div>
                              {run.summary && (
                                <p className="text-xs text-[#8b949e] truncate pl-4">
                                  {run.summary}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center space-x-3 text-xs font-mono text-[#8b949e] self-end sm:self-auto flex-shrink-0 pl-4">
                              <span>{run.duration_ms}ms</span>
                              <Link
                                href={`/runs/${run.id}`}
                                className="btn-pixel btn-pixel-dark text-[11px] py-1 px-2.5"
                              >
                                Details →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: REPOSITORIES (Matches user screenshots) */}
              {activeTab === "repositories" && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Search and Filters Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={repoSearch}
                        onChange={(e) => setRepoSearch(e.target.value)}
                        placeholder="Find a repository..."
                        className="w-full bg-[#161b22] border border-[#30363d] rounded-md px-3 py-1.5 text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={repoFilter}
                        onChange={(e) => setRepoFilter(e.target.value)}
                        className="bg-[#161b22] border border-[#30363d] rounded-md px-2.5 py-1.5 text-xs text-[#c9d1d9] focus:outline-none"
                      >
                        <option value="all">Type: All</option>
                        <option value="public">Public</option>
                        <option value="private">Private</option>
                      </select>

                      <button
                        onClick={() => setIsTriggerOpen(true)}
                        className="btn-pixel btn-pixel-green text-xs py-1.5 px-3"
                      >
                        + New Verification
                      </button>
                    </div>
                  </div>

                  {/* Repositories List matching screenshot */}
                  <div className="divide-y divide-[#30363d] rounded-md border border-[#30363d] bg-[#161b22] overflow-hidden">
                    {filteredRepos.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#8b949e]">
                        No repositories matching "{repoSearch}"
                      </div>
                    ) : (
                      filteredRepos.map((repo) => {
                        const isStarred = !!starredRepos[repo.name];
                        const isCurrent = repo.name === activeRepo.name;
                        return (
                          <div
                            key={repo.name}
                            className={`p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors ${
                              isCurrent
                                ? "bg-[#1f6feb]/5 border-l-2 border-[#58a6ff]"
                                : "hover:bg-[#1f242c]"
                            }`}
                          >
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setActiveRepo(repo.name)}
                                  className="font-semibold text-base text-[#58a6ff] hover:underline cursor-pointer truncate text-left"
                                >
                                  {repo.name}
                                </button>
                                {isCurrent && (
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1f6feb]/20 text-[#58a6ff] border border-[#1f6feb]/40">
                                    Active
                                  </span>
                                )}
                                <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#30363d] text-[#8b949e]">
                                  {repo.visibility}
                                </span>
                              </div>

                              {repo.forkedFrom && (
                                <div className="text-xs text-[#8b949e]">
                                  Forked from{" "}
                                  <span className="text-[#58a6ff] hover:underline cursor-pointer">
                                    {repo.forkedFrom}
                                  </span>
                                </div>
                              )}

                              {repo.desc && (
                                <p className="text-xs text-[#8b949e] line-clamp-2 leading-relaxed">
                                  {repo.desc}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-3 text-xs text-[#8b949e] pt-1">
                                <div className="flex items-center space-x-1.5">
                                  <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: repo.langColor }}
                                  />
                                  <span>{repo.lang}</span>
                                </div>

                                {repo.license && (
                                  <div className="flex items-center space-x-1">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                    </svg>
                                    <span>{repo.license}</span>
                                  </div>
                                )}

                                <span>{repo.updated}</span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 self-start sm:self-auto flex-shrink-0">
                              <button
                                onClick={() => toggleStar(repo.name)}
                                className={`btn-pixel text-xs py-1 px-3 flex items-center space-x-1.5 ${
                                  isStarred ? "btn-pixel-dark text-[#e3b341]" : "btn-pixel-dark"
                                }`}
                              >
                                <svg className={`w-3.5 h-3.5 ${isStarred ? "fill-current" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                </svg>
                                <span>{isStarred ? "Starred" : "Star"}</span>
                              </button>

                              <button
                                onClick={() => {
                                  setActiveRepo(repo.name);
                                  setIsTriggerOpen(true);
                                }}
                                className="btn-pixel btn-pixel-green text-xs py-1 px-3"
                              >
                                Run Tests
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PROJECTS */}
              {activeTab === "projects" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-[#f0f6fc]">
                        Active Compliance Projects
                      </h2>
                      <p className="text-xs text-[#8b949e] mt-0.5">
                        Track progress across declarative specification rules and test-gap coverage.
                      </p>
                    </div>

                    <Link
                      href="/spec"
                      className="btn-pixel btn-pixel-dark text-xs py-1.5 px-3"
                    >
                      View Specifications →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="p-5 rounded-md border border-[#30363d] bg-[#161b22] space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              <h3 className="text-sm font-semibold text-[#f0f6fc]">
                                {proj.title}
                              </h3>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[#58a6ff]">
                                {proj.repo}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#30363d] text-[#3fb950] font-mono">
                                {proj.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#8b949e] leading-relaxed">
                              {proj.desc}
                            </p>
                          </div>

                          <div className="text-xs font-mono text-[#8b949e] flex-shrink-0">
                            {proj.updatedAt}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-mono text-[#8b949e]">
                            <span>Compliance Coverage</span>
                            <span className="text-[#f0f6fc] font-semibold">{proj.progress}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#21262d] overflow-hidden">
                            <div
                              className="h-full bg-[#3fb950] rounded-full transition-all duration-500"
                              style={{ width: `${proj.progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono text-[#8b949e] pt-1 border-t border-[#30363d]/60">
                          <span>{proj.invariantsCount} Invariants Enforced</span>
                          <Link href="/spec" className="text-[#58a6ff] hover:underline">
                            Inspect Spec Rules →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: PACKAGES */}
              {activeTab === "packages" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-[#f0f6fc]">
                        Software Packages & Artifacts
                      </h2>
                      <p className="text-xs text-[#8b949e] mt-0.5">
                        Published verifier libraries, docker runners, and CLI executables.
                      </p>
                    </div>

                    <a
                      href="http://localhost:8000/docs"
                      target="_blank"
                      rel="noreferrer"
                      className="btn-pixel btn-pixel-dark text-xs py-1.5 px-3"
                    >
                      API Specs →
                    </a>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className="p-4 rounded-md border border-[#30363d] bg-[#161b22] space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-[#8b949e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span className="font-mono text-sm font-semibold text-[#f0f6fc]">
                              {pkg.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[#58a6ff]">
                              {pkg.repo}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#30363d] text-[#8b949e]">
                              {pkg.version}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#30363d] text-[#8b949e]">
                              {pkg.registry}
                            </span>
                          </div>

                          <div className="text-xs font-mono text-[#8b949e]">
                            {pkg.downloads} installs
                          </div>
                        </div>

                        <p className="text-xs text-[#8b949e]">
                          {pkg.desc}
                        </p>

                        <div className="flex items-center justify-between p-2 rounded bg-[#0d1117] border border-[#30363d] text-xs font-mono">
                          <span className="text-[#c9d1d9] truncate select-all">
                            {pkg.installCmd}
                          </span>
                          <button
                            onClick={() => copyToClipboard(pkg.installCmd, pkg.id)}
                            className="text-[#8b949e] hover:text-[#f0f6fc] text-[11px] ml-2 flex-shrink-0"
                          >
                            {isCopied === pkg.id ? "✓ Copied" : "Copy"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: STARS */}
              {activeTab === "stars" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-[#f0f6fc]">
                        Starred Repositories ({starredList.length})
                      </h2>
                      <p className="text-xs text-[#8b949e] mt-0.5">
                        Repositories starred by srinivas2s.
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-[#30363d] rounded-md border border-[#30363d] bg-[#161b22] overflow-hidden">
                    {starredList.map((item) => (
                      <div
                        key={item.name}
                        className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-[#1f242c] transition-colors"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-base text-[#58a6ff] hover:underline cursor-pointer">
                              {item.name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-[#30363d] text-[#8b949e]">
                              {item.visibility}
                            </span>
                          </div>

                          <p className="text-xs text-[#8b949e]">
                            {item.desc}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-[#8b949e] pt-1">
                            <div className="flex items-center space-x-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: item.langColor }}
                              />
                              <span>{item.lang}</span>
                            </div>
                            <span className="flex items-center space-x-1">
                              <svg className="w-3.5 h-3.5 text-[#8b949e]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.784 1.399 8.167-7.333-3.856-7.333 3.856 1.399-8.167-5.934-5.784 8.2-1.192zm0 5.702l-2.223 4.504-4.97.722 3.596 3.506-.848 4.95 4.445-2.337 4.445 2.337-.848-4.95 3.596-3.506-4.97-.722z" />
                              </svg>
                              <span>{item.stars}</span>
                            </span>
                            <span>{item.updated}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 self-start sm:self-auto flex-shrink-0">
                          <button
                            onClick={() => toggleStar(item.name)}
                            className="btn-pixel btn-pixel-dark text-xs py-1 px-3 flex items-center space-x-1.5"
                          >
                            <svg className="w-3.5 h-3.5 text-[#8b949e] fill-current" viewBox="0 0 24 24">
                              <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.784 1.399 8.167-7.333-3.856-7.333 3.856 1.399-8.167-5.934-5.784 8.2-1.192z" />
                            </svg>
                            <span>Unstar</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TriggerModal
        isOpen={isTriggerOpen}
        onClose={() => setIsTriggerOpen(false)}
        onSuccess={() => {
          loadData();
        }}
      />
    </>
  );
}
