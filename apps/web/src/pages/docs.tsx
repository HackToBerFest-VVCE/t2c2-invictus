import React, { useState } from "react";
import Head from "next/head";

export default function DocsPage() {
  const [activeView, setActiveView] = useState<"embedded" | "catalog">("embedded");

  const endpoints = [
    {
      group: "Verification Runs",
      items: [
        {
          method: "GET",
          path: "/api/v1/runs",
          desc: "List past verification runs with optional repository filter and limit.",
        },
        {
          method: "POST",
          path: "/api/v1/runs/trigger",
          desc: "Trigger a verification run synchronously or asynchronously via background tasks.",
        },
        {
          method: "POST",
          path: "/api/v1/seed",
          desc: "Seed baseline, regression, and resolution verification runs for live demonstration.",
        },
        {
          method: "GET",
          path: "/api/v1/runs/{run_id}",
          desc: "Retrieve detailed verification run results, timings, and findings.",
        },
        {
          method: "GET",
          path: "/api/v1/runs/compare",
          desc: "Compare base and head verification runs to detect regressions and resolved issues.",
        },
        {
          method: "PATCH",
          path: "/api/v1/findings/{finding_id}/status",
          desc: "Update finding lifecycle status (unconfirmed, confirmed, resolved, dismissed) and reviewer notes.",
        },
        {
          method: "GET",
          path: "/api/v1/runs/{run_id}/export/markdown",
          desc: "Download GitHub-Flavored Markdown verification report.",
        },
        {
          method: "GET",
          path: "/api/v1/runs/{run_id}/export/json",
          desc: "Download machine-readable JSON verification report.",
        },
        {
          method: "GET",
          path: "/api/v1/runs/{run_id}/export/github-issue",
          desc: "Download pre-filled GitHub Issue draft for verified invariant failures.",
        },
      ],
    },
    {
      group: "Specifications & Test-Gap Analysis",
      items: [
        {
          method: "GET",
          path: "/api/v1/specs",
          desc: "Parse and inspect declarative INVARIANT.md specification metadata, contracts, and edge cases.",
        },
        {
          method: "GET",
          path: "/api/v1/specs/analyze",
          desc: "Perform automated test gap analysis cross-referencing INVARIANT.md rules against project test suites.",
        },
      ],
    },
    {
      group: "Webhooks",
      items: [
        {
          method: "POST",
          path: "/api/v1/webhooks/github",
          desc: "Ingest GitHub push and pull_request webhook events with HMAC-SHA256 signature verification.",
        },
      ],
    },
    {
      group: "Health & System",
      items: [
        {
          method: "GET",
          path: "/health",
          desc: "Service health check, environment status, and API version.",
        },
      ],
    },
  ];

  const getMethodBadge = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-[#1f6feb]/20 text-[#58a6ff] border-[#388bfd]/40";
      case "POST":
        return "bg-[#238636]/20 text-[#3fb950] border-[#2ea043]/40";
      case "PATCH":
        return "bg-[#d29922]/20 text-[#e3b341] border-[#d29922]/40";
      case "DELETE":
        return "bg-[#da3633]/20 text-[#f85149] border-[#da3633]/40";
      default:
        return "bg-[#21262d] text-[#8b949e] border-[#30363d]";
    }
  };

  return (
    <>
      <Head>
        <title>Swagger API Documentation &bull; Invariant</title>
      </Head>

      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1f6feb]/15 text-[#58a6ff] border border-[#1f6feb]/40">
                OpenAPI 3.1 &bull; Swagger UI
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#238636]/15 text-[#3fb950] border border-[#238636]/40">
                FastAPI :8000
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#f0f6fc] mt-2">
              API Documentation & Swagger UI
            </h1>
            <p className="text-xs text-[#8b949e] mt-1">
              Interactive API explorer powered by FastAPI, OpenAPI specifications, and Swagger UI.
            </p>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="btn-apple-liquid btn-apple-blue px-3.5 py-1.5 text-xs font-semibold"
            >
              ⚡ Open Swagger in New Tab ↗
            </a>
            <a
              href="http://localhost:8000/redoc"
              target="_blank"
              rel="noreferrer"
              className="btn-apple-liquid btn-apple-secondary px-3.5 py-1.5 text-xs font-medium"
            >
              ReDoc ↗
            </a>
            <a
              href="http://localhost:8000/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="btn-apple-liquid btn-apple-secondary px-3.5 py-1.5 text-xs font-medium"
            >
              openapi.json ↗
            </a>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center space-x-2 border-b border-[#30363d]">
          <button
            onClick={() => setActiveView("embedded")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeView === "embedded"
                ? "border-[#58a6ff] text-[#f0f6fc]"
                : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            Live Swagger UI Frame
          </button>
          <button
            onClick={() => setActiveView("catalog")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeView === "catalog"
                ? "border-[#58a6ff] text-[#f0f6fc]"
                : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            REST Endpoints Catalog
          </button>
        </div>

        {activeView === "embedded" ? (
          <div className="border border-[#30363d] rounded-md overflow-hidden bg-[#161b22]">
            <div className="p-3 bg-[#21262d] border-b border-[#30363d] flex items-center justify-between text-xs font-mono text-[#8b949e]">
              <span>http://localhost:8000/docs</span>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className="text-[#58a6ff] hover:underline"
              >
                Open Fullscreen ↗
              </a>
            </div>
            <iframe
              src="http://localhost:8000/docs"
              className="w-full h-[850px] border-0 bg-white"
              title="FastAPI Swagger UI"
            />
          </div>
        ) : (
          <div className="space-y-6">
            {endpoints.map((group, gIdx) => (
              <div
                key={gIdx}
                className="border border-[#30363d] rounded-md bg-[#161b22] overflow-hidden"
              >
                <div className="p-3 bg-[#21262d] border-b border-[#30363d] text-xs font-mono font-semibold text-[#f0f6fc]">
                  {group.group}
                </div>
                <div className="divide-y divide-[#30363d]">
                  {group.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#21262d]/20 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${getMethodBadge(
                            item.method
                          )}`}
                        >
                          {item.method}
                        </span>
                        <span className="font-mono text-xs text-[#f0f6fc] font-semibold">
                          {item.path}
                        </span>
                      </div>
                      <span className="text-xs text-[#8b949e] sm:text-right max-w-xl">
                        {item.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
