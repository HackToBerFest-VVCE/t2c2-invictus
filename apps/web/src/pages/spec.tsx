import React, { useState, useEffect } from "react";
import Head from "next/head";
import { TriggerModal } from "../components/TriggerModal";
import { analyzeSpecification } from "../services/api";
import { SpecAnalysis } from "../types";

interface SpecData {
  filePath: string;
  specVersion: string;
  targetScope: string;
  content: string;
}

export default function SpecPage() {
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
    // 1. Fetch raw spec
    fetch("/api/spec")
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to load specification file");
        }
        return res.json();
      })
      .then((data) => setSpec(data))
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoading(false));

    // 2. Fetch live test-gap analysis from backend
    analyzeSpecification("INVARIANT.md")
      .then((data) => setAnalysis(data))
      .catch((err) => {
        console.warn("Backend analysis not reachable, displaying raw spec only", err);
      });
  }, []);

  return (
    <>
      <Head>
        <title>INVARIANT.md Specification &bull; Invariant</title>
      </Head>

      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[#58a6ff]">
                spec_version: {analysis?.spec_version || spec?.specVersion || "1.0.0"}
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#238636]/15 text-[#3fb950] border border-[#238636]/40">
                scope: {analysis?.target_system || spec?.targetScope || "Root"}
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
            Test Gap & Verification Analysis
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "raw"
                ? "border-[#58a6ff] text-[#f0f6fc]"
                : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            Raw Specification (INVARIANT.md)
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#8b949e] border border-[#30363d] rounded-md bg-[#161b22] font-mono text-xs">
            <span className="animate-spin inline-block mr-2">↻</span>
            Reading INVARIANT.md from workspace...
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

            {/* Invariant Coverage Table */}
            <div className="border border-[#30363d] rounded-md bg-[#161b22] overflow-hidden">
              <div className="p-3 bg-[#21262d] border-b border-[#30363d] flex items-center justify-between text-xs font-mono">
                <span className="font-semibold text-[#f0f6fc]">Declarative Invariant Coverage Matrix</span>
                <span className="text-[#8b949e]">{analysis.invariants.length} Rules Parsed</span>
              </div>

              <div className="divide-y divide-[#30363d]">
                {analysis.invariants.map((inv) => (
                  <div key={inv.id} className="p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#388bfd]/15 text-[#58a6ff] border border-[#388bfd]/30">
                          {inv.id}
                        </span>
                        <h4 className="text-sm font-semibold text-[#f0f6fc]">{inv.title}</h4>
                        <span className="text-xs px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d] text-[#8b949e] font-mono">
                          {inv.severity}
                        </span>
                      </div>

                      <div>
                        {inv.test_coverage_status === "COVERED" ? (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold bg-[#238636]/15 text-[#3fb950] border border-[#238636]/40">
                            <span>✔</span>
                            <span>COVERED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold bg-[#d29922]/15 text-[#e3b341] border border-[#d29922]/40">
                            <span>⚠</span>
                            <span>UNTESTED GAP</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#c9d1d9] font-mono bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
                      {inv.rule_statement}
                    </p>

                    {inv.associated_tests.length > 0 && (
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
                            {copiedId === inv.id ? "✔ Copied" : "Copy Sketch"}
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

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div className="p-4 rounded-md bg-[#21262d]/40 border border-[#30363d] space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#f0f6fc]">
                  Recommendations & Insights
                </h4>
                <ul className="list-disc list-inside text-xs text-[#8b949e] space-y-1 font-mono">
                  {analysis.recommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-[#30363d] rounded-md bg-[#161b22] overflow-hidden">
            <div className="p-3 bg-[#21262d] border-b border-[#30363d] flex items-center justify-between text-xs font-mono text-[#8b949e]">
              <span className="text-[#58a6ff]">{spec?.filePath || "INVARIANT.md"}</span>
              <span>Raw Markdown Source</span>
            </div>
            <div className="p-5 overflow-x-auto">
              <pre className="font-mono text-xs text-[#c9d1d9] leading-relaxed whitespace-pre-wrap">
                {spec?.content || "No specification content available."}
              </pre>
            </div>
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
