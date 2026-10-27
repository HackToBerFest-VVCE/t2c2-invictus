import React, { useState, useEffect } from "react";
import Head from "next/head";
import { fetchMcpTools, executeMcpTool } from "../services/api";

export default function DocsPage() {
  const [activeView, setActiveView] = useState<"embedded" | "mcp" | "catalog">("embedded");

  // MCP Playground state
  const [mcpTools, setMcpTools] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>("invariant_verify");
  const [toolArgsText, setToolArgsText] = useState<string>("{}");
  const [mcpLoading, setMcpLoading] = useState<boolean>(false);
  const [mcpOutput, setMcpOutput] = useState<any>(null);
  const [mcpError, setMcpError] = useState<string | null>(null);
  const [copiedInspector, setCopiedInspector] = useState<boolean>(false);

  // Pre-filled sample arguments for each tool
  const sampleArgs: Record<string, any> = {
    invariant_verify: {
      workspace_path: "examples/inventory-api",
      spec_path: "examples/inventory-api/INVARIANT.md",
    },
    invariant_get_spec: {
      spec_path: "examples/inventory-api/INVARIANT.md",
      workspace_path: "examples/inventory-api",
    },
    invariant_test_gaps: {
      spec_path: "examples/inventory-api/INVARIANT.md",
      workspace_path: "examples/inventory-api",
    },
    invariant_suggest_fix: {
      invariant_rule: "Stock quantity for any SKU must never drop below 0.",
      failure_trace: "AssertionError: Expected balance >= 0, but received -3 during concurrent reserve.",
      file_path: "examples/inventory-api/src/inventory.py",
    },
    invariant_create_fix_branch: {
      invariant_id: "INV-01",
      finding_title: "Concurrent Reservation Race Condition Underflow",
      file_path: "examples/inventory-api/src/inventory.py",
      workspace_path: ".",
    },
  };

  useEffect(() => {
    fetchMcpTools()
      .then((tools) => {
        setMcpTools(tools);
        if (tools.length > 0) {
          const first = tools[0].name;
          setSelectedTool(first);
          setToolArgsText(JSON.stringify(sampleArgs[first] || {}, null, 2));
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch MCP tools:", err);
      });
  }, []);

  const handleToolSelect = (toolName: string) => {
    setSelectedTool(toolName);
    setToolArgsText(JSON.stringify(sampleArgs[toolName] || {}, null, 2));
    setMcpOutput(null);
    setMcpError(null);
  };

  const handleRunMcp = async () => {
    setMcpLoading(true);
    setMcpError(null);
    try {
      let parsedArgs = {};
      if (toolArgsText.trim()) {
        parsedArgs = JSON.parse(toolArgsText);
      }
      const res = await executeMcpTool(selectedTool, parsedArgs);
      setMcpOutput(res);
    } catch (err: any) {
      setMcpError(err.message || "Failed to execute MCP tool.");
    } finally {
      setMcpLoading(false);
    }
  };

  const copyInspectorCommand = () => {
    const cmd = "npx @modelcontextprotocol/inspector python -m packages.mcp_server.server";
    if (typeof window !== "undefined" && navigator?.clipboard) {
      navigator.clipboard.writeText(cmd);
      setCopiedInspector(true);
      setTimeout(() => setCopiedInspector(false), 2000);
    }
  };

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
      group: "Model Context Protocol (MCP)",
      items: [
        {
          method: "GET",
          path: "/api/v1/mcp/tools",
          desc: "List all 5 Model Context Protocol (MCP) tools and JSON schemas for IDE integration.",
        },
        {
          method: "POST",
          path: "/api/v1/mcp/execute",
          desc: "Execute any MCP tool in real-time through the web playground runner.",
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

  const activeToolObj = mcpTools.find((t) => t.name === selectedTool);

  return (
    <>
      <Head>
        <title>API Documentation & MCP Tools &bull; Invariant</title>
      </Head>

      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#30363d] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#1f6feb]/15 text-[#58a6ff] border border-[#1f6feb]/40">
                OpenAPI 3.1 &bull; Swagger UI
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#bc8cff]/15 text-[#bc8cff] border border-[#bc8cff]/40">
                MCP Protocol :stdio
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#238636]/15 text-[#3fb950] border border-[#238636]/40">
                FastAPI :8000
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#f0f6fc] mt-2">
              API Documentation & MCP Playground
            </h1>
            <p className="text-xs text-[#8b949e] mt-1">
              Interactive API explorer powered by FastAPI Swagger UI and real-time Model Context Protocol (MCP) tooling.
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
            ⚡ Live Swagger UI
          </button>
          <button
            onClick={() => setActiveView("mcp")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeView === "mcp"
                ? "border-[#bc8cff] text-[#f0f6fc]"
                : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            <span>🤖</span>
            <span>MCP Tools Playground</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#bc8cff]/20 text-[#bc8cff]">
              5 Tools
            </span>
          </button>
          <button
            onClick={() => setActiveView("catalog")}
            className={`px-4 py-2 text-xs font-semibold border-b-2 transition-colors ${
              activeView === "catalog"
                ? "border-[#58a6ff] text-[#f0f6fc]"
                : "border-transparent text-[#8b949e] hover:text-[#c9d1d9]"
            }`}
          >
            📖 REST Endpoints Catalog
          </button>
        </div>

        {/* Tab 1: Live Swagger UI Frame */}
        {activeView === "embedded" && (
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
        )}

        {/* Tab 2: MCP Tools Playground */}
        {activeView === "mcp" && (
          <div className="space-y-6">
            {/* Anthropic Official Inspector Banner */}
            <div className="p-4 rounded-md border border-[#bc8cff]/40 bg-[#bc8cff]/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-[#bc8cff] uppercase tracking-wider">
                    Official Anthropic MCP Inspector UI
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#bc8cff]/20 text-[#bc8cff] font-mono">
                    Interactive Web UI
                  </span>
                </div>
                <p className="text-xs text-[#c9d1d9] mt-1">
                  Just like Swagger UI for REST, Anthropic provides an official browser-based inspector for MCP servers. Run this command in your terminal to open it:
                </p>
                <code className="block mt-2 p-2 rounded bg-[#0d1117] border border-[#30363d] text-xs font-mono text-[#58a6ff] select-all">
                  npx @modelcontextprotocol/inspector python -m packages.mcp_server.server
                </code>
              </div>
              <button
                onClick={copyInspectorCommand}
                className="btn-apple-liquid btn-apple-secondary px-3 py-1.5 text-xs font-mono shrink-0"
              >
                {copiedInspector ? "✓ Copied!" : "📋 Copy Inspector Command"}
              </button>
            </div>

            {/* In-Dashboard Interactive MCP Tool Runner */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Tool Selector List */}
              <div className="lg:col-span-4 space-y-2">
                <label className="text-xs font-mono font-semibold text-[#8b949e] uppercase tracking-wider block">
                  Select MCP Tool:
                </label>
                <div className="space-y-1.5">
                  {[
                    {
                      name: "invariant_verify",
                      title: "invariant_verify",
                      desc: "Execute isolated test run against INVARIANT.md in sandbox.",
                    },
                    {
                      name: "invariant_get_spec",
                      title: "invariant_get_spec",
                      desc: "Inspect active invariants, formal assertions & contracts.",
                    },
                    {
                      name: "invariant_test_gaps",
                      title: "invariant_test_gaps",
                      desc: "AST test-gap matrix and starter test sketch generation.",
                    },
                    {
                      name: "invariant_suggest_fix",
                      title: "invariant_suggest_fix",
                      desc: "AI-driven root-cause diagnosis & code patch suggestion.",
                    },
                    {
                      name: "invariant_create_fix_branch",
                      title: "invariant_create_fix_branch",
                      desc: "Create local fix branch, apply patch & prepare PR metadata.",
                    },
                  ].map((tool) => (
                    <button
                      key={tool.name}
                      onClick={() => handleToolSelect(tool.name)}
                      className={`w-full text-left p-3 rounded-md border transition-all ${
                        selectedTool === tool.name
                          ? "bg-[#1f6feb]/15 border-[#1f6feb] text-[#f0f6fc]"
                          : "bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-[#8b949e] hover:text-[#c9d1d9]"
                      }`}
                    >
                      <div className="font-mono text-xs font-bold text-[#58a6ff]">
                        {tool.title}
                      </div>
                      <div className="text-[11px] text-[#8b949e] mt-1 line-clamp-2">
                        {tool.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tool Arguments & Execution */}
              <div className="lg:col-span-8 space-y-4">
                <div className="p-4 rounded-md bg-[#161b22] border border-[#30363d] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold font-mono text-[#f0f6fc]">
                        Tool: {selectedTool}
                      </h3>
                      <p className="text-xs text-[#8b949e] mt-0.5">
                        {activeToolObj?.description || "Execute this tool against your workspace."}
                      </p>
                    </div>
                    <button
                      onClick={handleRunMcp}
                      disabled={mcpLoading}
                      className="btn-apple-liquid btn-apple-green px-4 py-2 text-xs font-semibold space-x-1.5"
                    >
                      <span>{mcpLoading ? "↻" : "▶"}</span>
                      <span>{mcpLoading ? "Executing..." : "Execute MCP Tool"}</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono text-[#8b949e] block mb-1">
                      Arguments (JSON):
                    </label>
                    <textarea
                      value={toolArgsText}
                      onChange={(e) => setToolArgsText(e.target.value)}
                      rows={6}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded p-3 text-xs font-mono text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {mcpError && (
                  <div className="p-4 rounded-md bg-[#da3633]/15 border border-[#da3633]/40 text-[#f85149] text-xs font-mono">
                    <span className="font-bold">Execution Error: </span>
                    {mcpError}
                  </div>
                )}

                {/* Output Panel */}
                {mcpOutput && (
                  <div className="border border-[#30363d] rounded-md bg-[#161b22] overflow-hidden">
                    <div className="p-3 bg-[#21262d] border-b border-[#30363d] flex items-center justify-between text-xs font-mono">
                      <span className="text-[#3fb950] font-semibold">
                        ✓ Execution Output ({mcpOutput.status})
                      </span>
                      <span className="text-[#8b949e]">Tool: {mcpOutput.tool_name}</span>
                    </div>
                    <pre className="p-4 bg-[#0d1117] text-[#c9d1d9] text-xs font-mono overflow-x-auto max-h-[500px]">
                      {JSON.stringify(mcpOutput.result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: REST Catalog */}
        {activeView === "catalog" && (
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
