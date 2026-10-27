import React, { useState, useEffect } from "react";
import Head from "next/head";
import { TriggerModal } from "../components/TriggerModal";
import { analyzeSpecification } from "../services/api";
import { SpecAnalysis, SpecInvariant } from "../types";
import { useRepo } from "../context/RepoContext";
import { DEMO_SPECS_BY_REPO } from "../data/demoData";

interface SpecData {
  filePath: string;
  specVersion: string;
  targetScope: string;
  content: string;
}

export default function SpecPage() {
  const { activeRepo, setActiveRepo, repositories } = useRepo();
  const [spec, setSpec] = useState<SpecData | null>(null);
  const [analysis, setAnalysis] = useState<SpecAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<"analysis" | "raw">("analysis");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTriggerOpen, setIsTriggerOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copySketch = (id: string, text: string) => {
    if (typeof window !== "undefined" && navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  useEffect(() => {
    setLoading(true);
    setErrorMsg(null);

    const repoSpec = DEMO_SPECS_BY_REPO[activeRepo.name] || DEMO_SPECS_BY_REPO["t2c2-invictus"];
    setAnalysis(repoSpec);

    if (activeRepo.name === "t2c2-invictus") {
      // 1. Fetch raw spec from backend
      fetch("/api/spec")
        .then(async (res) => {
          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Failed to load specification file");
          }
          return res.json();
        })
        .then((data) => setSpec(data))
        .catch(() => {
          setSpec({
            filePath: "examples/inventory-api/INVARIANT.md",
            specVersion: repoSpec.spec_version,
            targetScope: repoSpec.target_system,
            content: `# Inventory Invariants\n\nAll stock levels must remain non-negative under concurrent requests.\nConservation of inventory state: total == available + reserved + fulfilled.`,
          });
        })
        .finally(() => setLoading(false));

      // 2. Fetch live test-gap analysis from backend
      analyzeSpecification("INVARIANT.md")
        .then((data) => setAnalysis(data))
        .catch(() => {});
    } else {
      // Generate synthetic raw markdown content for the selected repository
      const rawMarkdown = `# ${activeRepo.name} Specification (INVARIANT.md)

## System Scope
${repoSpec.target_system} (Specification Version: ${repoSpec.spec_version})

## Declarative Invariant Rules
${repoSpec.invariants
  .map(
    (inv: SpecInvariant) => `### ${inv.id}: ${inv.title}
- **Rule Statement:** ${inv.rule_statement}
- **Formal Assertion:** \`${inv.formal_assertion || "N/A"}\`
- **Severity Level:** ${inv.severity}
- **Coverage Status:** ${inv.test_coverage_status}
- **Associated Tests:** ${inv.associated_tests.length > 0 ? inv.associated_tests.join(", ") : "None (Untested Gap)"}
`
  )
  .join("\n")}`;

      setSpec({
        filePath: `${activeRepo.name}/INVARIANT.md`,
        specVersion: repoSpec.spec_version,
        targetScope: repoSpec.target_system,
        content: rawMarkdown,
      });
      setLoading(false);
    }
  }, [activeRepo.name]);

  return (
    <>
      <Head>
        <title>INVARIANT.md Specification &bull; Invariant</title>
      </Head>

      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-4">
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[#58a6ff]">
                spec_version: {analysis?.spec_version || spec?.specVersion || "1.0.0"}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#238636]/15 text-[#3fb950] border border-[#238636]/40">
                scope: {analysis?.target_system || spec?.targetScope || activeRepo.name}
              </span>
              {analysis && (
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1f6feb]/15 text-[#58a6ff] border border-[#1f6feb]/40">
                  {analysis.coverage_percentage}% verified
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-[#f0f6fc] mt-2">
              INVARIANT.md Specification Explorer
            </h1>
            <p className="text-xs text-[#8b949e] mt-1">
              Declarative platform requirements cross-referenced with empirical test coverage.
            </p>
          </div>

          <button
            onClick={() => setIsTriggerOpen(true)}
            className="btn-apple-liquid btn-apple-green self-start sm:self-auto px-4 py-2 text-xs font-semibold"
          >
            Verify Specifications Now
          </button>
        </div>

        {/* Repository Switcher Tabs for Specifications */}
        <div className="p-2.5 rounded-md border border-[#30363d] bg-[#161b22] flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <span className="text-xs text-[#8b949e] font-mono pl-1 flex-shrink-0">
            Repo Spec:
          </span>
          {repositories.map((repo) => {
            const isCurrent = repo.name === activeRepo.name;
            return (
              <button
                key={repo.name}
                onClick={() => setActiveRepo(repo.name)}
                className={`px-3 py-1 rounded text-xs font-mono transition-colors flex-shrink-0 flex items-center space-x-1.5 ${
                  isCurrent
                    ? "bg-[#1f6feb]/20 text-[#58a6ff] border border-[#58a6ff]/50 font-semibold"
                    : "text-[#8b949e] hover:text-[#c9d1d9] border border-transparent hover:border-[#30363d]"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? "bg-[#58a6ff]" : "bg-[#8b949e]"}`} />
                <span>{repo.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-[#30363d]">
          <button
            onClick={() => setActiveTab("analysis")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "analysis"
                ? "border-[#58a6ff] text-[#f0f6fc]"
                : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            Test Gap & Verification Analysis ({analysis?.invariants.length || 0})
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "raw"
                ? "border-[#58a6ff] text-[#f0f6fc]"
                : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            Raw Specification ({spec?.filePath || "INVARIANT.md"})
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#8b949e] border border-[#30363d] rounded-md bg-[#161b22] font-mono text-xs">
            <span className="animate-spin inline-block mr-2">↻</span>
            Loading {activeRepo.name} specifications...
          </div>
        ) : errorMsg && !spec ? (
          <div className="p-5 text-xs font-mono bg-[#da3633]/15 border border-[#da3633]/40 text-[#f85149] rounded-md">
            {errorMsg}
          </div>
        ) : activeTab === "analysis" && analysis ? (
          <div className="space-y-6">
            {/* Stat Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d]">
                <span className="text-[11px] font-mono uppercase text-[#8b949e]">Total Invariants</span>
                <p className="text-2xl font-bold font-mono text-[#f0f6fc] mt-1">{analysis.total_invariants}</p>
              </div>
              <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d]">
                <span className="text-[11px] font-mono uppercase text-[#3fb950]">Covered by Tests</span>
                <p className="text-2xl font-bold font-mono text-[#3fb950] mt-1">{analysis.tested_count}</p>
              </div>
              <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d]">
                <span className="text-[11px] font-mono uppercase text-[#e3b341]">Untested Gaps</span>
                <p className="text-2xl font-bold font-mono text-[#e3b341] mt-1">{analysis.untested_gap_count}</p>
              </div>
              <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d]">
                <span className="text-[11px] font-mono uppercase text-[#58a6ff]">Coverage Rate</span>
                <p className="text-2xl font-bold font-mono text-[#58a6ff] mt-1">{analysis.coverage_percentage}%</p>
              </div>
            </div>

            {/* Invariants Grid */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-[#f0f6fc]">
                Contract Rules & Assertions ({analysis.invariants.length})
              </h3>

              <div className="space-y-3">
                {analysis.invariants.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-md bg-[#161b22] border border-[#30363d] space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#58a6ff] bg-[#1f6feb]/15 px-2 py-0.5 rounded border border-[#1f6feb]/40">
                          {inv.id}
                        </span>
                        <h4 className="text-sm font-semibold text-[#f0f6fc]">
                          {inv.title}
                        </h4>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#21262d] text-[#8b949e]">
                          {inv.severity}
                        </span>
                      </div>

                      <div>
                        {inv.test_coverage_status === "COVERED" ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold bg-[#238636]/15 text-[#3fb950] border border-[#238636]/40">
                            <span>✓</span>
                            <span>COVERED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold bg-[#d29922]/15 text-[#e3b341] border border-[#d29922]/40">
                            <span>▲</span>
                            <span>UNTESTED GAP</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#c9d1d9] font-mono bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
                      {inv.rule_statement}
                    </p>

                    {inv.associated_tests && inv.associated_tests.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-mono text-[#8b949e]">Associated Test Suites:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {inv.associated_tests.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[#58a6ff]"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {inv.suggested_test_sketch && (
                      <div className="space-y-1 mt-2">
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#e3b341]">
                          <span>Suggested Verification Test Sketch:</span>
                          <button
                            onClick={() => copySketch(inv.id, inv.suggested_test_sketch!)}
                            className="text-[#58a6ff] hover:underline"
                          >
                            {copiedId === inv.id ? "✓ Copied" : "Copy Sketch"}
                          </button>
                        </div>
                        <pre className="p-3 bg-[#0d1117] border border-[#30363d] rounded text-[11px] font-mono text-[#8b949e] overflow-x-auto">
                          {inv.suggested_test_sketch}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-[#8b949e]">
              <span>Path: {spec?.filePath}</span>
              <span>Lines: {spec?.content ? spec.content.split("\n").length : 0}</span>
            </div>
            <pre className="p-4 rounded-md bg-[#161b22] border border-[#30363d] text-xs font-mono text-[#c9d1d9] overflow-x-auto leading-relaxed">
              {spec?.content}
            </pre>
          </div>
        )}
      </div>

      <TriggerModal
        isOpen={isTriggerOpen}
        onClose={() => setIsTriggerOpen(false)}
      />
    </>
  );
}
