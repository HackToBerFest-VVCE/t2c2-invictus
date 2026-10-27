import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Script from "next/script";
import { fetchMcpTools, executeMcpTool } from "../services/api";

declare global {
  interface Window {
    SwaggerUIBundle?: any;
    SwaggerUIStandalonePreset?: any;
    ui?: any;
  }
}

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"swagger" | "mcp">("swagger");
  const [swaggerTheme, setSwaggerTheme] = useState<"light" | "dark">("light");
  const [swaggerLoaded, setSwaggerLoaded] = useState<boolean>(false);
  const [swaggerError, setSwaggerError] = useState<string | null>(null);

  // MCP Playground state
  const [mcpTools, setMcpTools] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>("invariant_verify");
  const [toolArgsText, setToolArgsText] = useState<string>("{}");
  const [mcpLoading, setMcpLoading] = useState<boolean>(false);
  const [mcpOutput, setMcpOutput] = useState<any>(null);
  const [mcpError, setMcpError] = useState<string | null>(null);
  const [copiedInspector, setCopiedInspector] = useState<boolean>(false);

  const swaggerInitializedRef = useRef<boolean>(false);

  // Sample arguments for MCP playground
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
      failure_trace:
        "AssertionError: Expected balance >= 0, but received -3 during concurrent reserve.",
      file_path: "examples/inventory-api/src/inventory.py",
    },
    invariant_create_fix_branch: {
      invariant_id: "INV-01",
      finding_title: "Concurrent Reservation Race Condition Underflow",
      file_path: "examples/inventory-api/src/inventory.py",
      workspace_path: ".",
    },
  };

  // Fetch MCP tools
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

  // Initialize Swagger UI
  const initSwaggerUI = () => {
    if (typeof window === "undefined") return;

    if (window.SwaggerUIBundle) {
      try {
        const domNode = document.getElementById("swagger-ui");
        if (!domNode) return;

        domNode.innerHTML = ""; // Clear existing

        const ui = window.SwaggerUIBundle({
          url: "/openapi.json",
          dom_id: "#swagger-ui",
          deepLinking: true,
          presets: [
            window.SwaggerUIBundle.presets.apis,
            window.SwaggerUIStandalonePreset ||
              window.SwaggerUIBundle.SwaggerUIStandalonePreset,
          ],
          plugins: [
            window.SwaggerUIBundle.plugins.DownloadUrl ||
              (() => ({})),
          ],
          layout: "BaseLayout",
          docExpansion: "list",
          filter: true,
          showExtensions: true,
          showCommonExtensions: true,
          displayRequestDuration: true,
          tryItOutEnabled: true,
          persistAuthorization: true,
          defaultModelsExpandDepth: 1,
          defaultModelExpandDepth: 1,
        });

        window.ui = ui;
        swaggerInitializedRef.current = true;
        setSwaggerLoaded(true);
        setSwaggerError(null);
      } catch (err: any) {
        console.error("Error initializing Swagger UI:", err);
        setSwaggerError(err.message || "Failed to initialize Swagger UI");
      }
    }
  };

  useEffect(() => {
    if (activeTab === "swagger" && window.SwaggerUIBundle) {
      initSwaggerUI();
    }
  }, [activeTab]);

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
    const cmd =
      "npx @modelcontextprotocol/inspector python -m packages.mcp_server.server";
    if (typeof window !== "undefined" && navigator?.clipboard) {
      navigator.clipboard.writeText(cmd);
      setCopiedInspector(true);
      setTimeout(() => setCopiedInspector(false), 2000);
    }
  };

  return (
    <>
      <Head>
        <title>Invariant Continuous Verification API &bull; Swagger UI</title>
        <meta
          name="description"
          content="Interactive Swagger UI and Model Context Protocol (MCP) tooling for Invariant continuous verification platform."
        />
        {/* Official Swagger UI CSS */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"
        />
      </Head>

      {/* External Swagger Scripts via Next.js Script */}
      <Script
        src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"
        strategy="afterInteractive"
        onLoad={() => {
          initSwaggerUI();
        }}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"
        strategy="afterInteractive"
        onLoad={() => {
          initSwaggerUI();
        }}
      />

      {/* Full-Bleed Container replacing nested iframe */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-6 flex flex-col min-h-[calc(100vh-64px)]">
        {/* Swagger Top Control Bar */}
        <div className="bg-[#1b1b1b] border-b border-[#30363d] px-4 sm:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-sm text-[#f0f6fc]">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-[#49cc90] inline-block animate-pulse" />
              <span className="font-mono font-bold tracking-tight text-white text-base">
                swagger<span className="text-[#85ea2d]">.io</span>
              </span>
            </div>
            <span className="text-[#8b949e] hidden sm:inline">&bull;</span>
            <span className="font-semibold text-xs text-[#c9d1d9] hidden sm:inline">
              Invariant Continuous Verification API
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#238636]/30 text-[#3fb950] border border-[#238636]/50 font-mono font-bold">
              OAS 3.1
            </span>
          </div>

          {/* Quick Actions & Navigation Tabs */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab("swagger")}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                activeTab === "swagger"
                  ? "bg-[#238636] text-white shadow-sm"
                  : "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]"
              }`}
            >
              ⚡ Live Swagger UI
            </button>

            <button
              onClick={() => setActiveTab("mcp")}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                activeTab === "mcp"
                  ? "bg-[#8957e5] text-white shadow-sm"
                  : "bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]"
              }`}
            >
              <span>🤖</span>
              <span>MCP Tools Playground</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/20">
                5 Tools
              </span>
            </button>

            {/* Swagger Light/Dark Theme Switcher */}
            {activeTab === "swagger" && (
              <button
                onClick={() =>
                  setSwaggerTheme((prev) => (prev === "light" ? "dark" : "light"))
                }
                className="px-2.5 py-1.5 rounded text-xs bg-[#21262d] border border-[#30363d] text-[#c9d1d9] hover:bg-[#30363d] transition-colors"
                title={`Switch to ${
                  swaggerTheme === "light" ? "Dark" : "Classic Light"
                } Theme`}
              >
                {swaggerTheme === "light" ? "🌙 Dark" : "☀️ Classic Light"}
              </button>
            )}

            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded text-xs bg-[#21262d] border border-[#30363d] text-[#58a6ff] hover:bg-[#30363d] transition-colors hidden md:inline-block"
              title="Open standalone Swagger on port 8000"
            >
              Backend :8000 ↗
            </a>

            <a
              href="/openapi.json"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded text-xs bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d] transition-colors hidden sm:inline-block"
            >
              openapi.json ↗
            </a>
          </div>
        </div>

        {/* VIEW 1: AUTHENTIC NATIVE SWAGGER UI */}
        {activeTab === "swagger" && (
          <div
            className={`flex-1 w-full transition-colors duration-200 ${
              swaggerTheme === "light"
                ? "bg-[#fafafa] text-[#3b4151]"
                : "bg-[#0d1117] text-[#c9d1d9] swagger-dark"
            }`}
          >
            {/* Loading / Error States */}
            {!swaggerLoaded && !swaggerError && (
              <div className="flex flex-col items-center justify-center p-16 space-y-4">
                <div className="w-10 h-10 border-4 border-[#238636] border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-mono text-[#8b949e]">
                  Initializing Swagger UI bundle from /openapi.json...
                </p>
              </div>
            )}

            {swaggerError && (
              <div className="p-6 m-6 rounded-md bg-[#da3633]/10 border border-[#da3633]/30 text-[#f85149] text-sm">
                <h3 className="font-bold">Failed to load Swagger UI</h3>
                <p className="mt-1 font-mono text-xs">{swaggerError}</p>
                <button
                  onClick={initSwaggerUI}
                  className="mt-3 px-3 py-1.5 rounded bg-[#da3633] text-white text-xs font-semibold"
                >
                  Retry Initialization
                </button>
              </div>
            )}

            {/* Native Swagger UI Container (No Iframe, No Scroll Cutoffs) */}
            <div id="swagger-ui" className="swagger-ui-wrapper" />
          </div>
        )}

        {/* VIEW 2: MCP TOOLS PLAYGROUND */}
        {activeTab === "mcp" && (
          <div className="flex-1 bg-[#0d1117] text-[#c9d1d9] p-6 space-y-6 max-w-7xl w-full mx-auto">
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
                  Just like Swagger UI for REST, Anthropic provides an official
                  browser-based inspector for MCP servers. Run this command in
                  your terminal:
                </p>
                <code className="block mt-2 p-2 rounded bg-[#0d1117] border border-[#30363d] text-xs font-mono text-[#58a6ff] select-all">
                  npx @modelcontextprotocol/inspector python -m
                  packages.mcp_server.server
                </code>
              </div>
              <button
                onClick={copyInspectorCommand}
                className="btn-apple-liquid btn-apple-purple px-4 py-2 text-xs font-semibold whitespace-nowrap shrink-0"
              >
                {copiedInspector ? "✓ Command Copied!" : "📋 Copy Command"}
              </button>
            </div>

            {/* Playground Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Tool Selector & Arguments */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-md border border-[#30363d] bg-[#161b22]">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#8b949e] mb-2">
                    Select MCP Tool
                  </label>
                  <select
                    value={selectedTool}
                    onChange={(e) => handleToolSelect(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-xs font-mono text-[#58a6ff] focus:outline-none focus:border-[#58a6ff]"
                  >
                    {mcpTools.map((tool) => (
                      <option key={tool.name} value={tool.name}>
                        {tool.name}
                      </option>
                    ))}
                  </select>

                  {/* Tool Description */}
                  {selectedTool && (
                    <div className="mt-3 p-2.5 rounded bg-[#0d1117]/60 border border-[#30363d] text-xs text-[#c9d1d9]">
                      <p className="font-semibold text-[#f0f6fc]">
                        {selectedTool}
                      </p>
                      <p className="mt-1 text-[11px] text-[#8b949e]">
                        {mcpTools.find((t) => t.name === selectedTool)
                          ?.description || "Executes verification tool."}
                      </p>
                    </div>
                  )}

                  {/* Arguments JSON Input */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">
                        Arguments (JSON)
                      </label>
                      <button
                        onClick={() =>
                          setToolArgsText(
                            JSON.stringify(sampleArgs[selectedTool] || {}, null, 2)
                          )
                        }
                        className="text-[10px] text-[#58a6ff] hover:underline"
                      >
                        Reset to Sample
                      </button>
                    </div>
                    <textarea
                      rows={9}
                      value={toolArgsText}
                      onChange={(e) => setToolArgsText(e.target.value)}
                      className="w-full bg-[#0d1117] border border-[#30363d] rounded p-2.5 text-xs font-mono text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
                    />
                  </div>

                  {/* Run Button */}
                  <button
                    onClick={handleRunMcp}
                    disabled={mcpLoading}
                    className="w-full mt-4 btn-apple-liquid btn-apple-green py-2 text-xs font-semibold flex items-center justify-center space-x-2"
                  >
                    {mcpLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Executing Tool...</span>
                      </>
                    ) : (
                      <>
                        <span>▶</span>
                        <span>Execute {selectedTool}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: Execution Output */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-md border border-[#30363d] bg-[#161b22] min-h-[420px] flex flex-col">
                  <div className="flex items-center justify-between border-b border-[#30363d] pb-2.5 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">
                      Execution Response
                    </span>
                    {mcpOutput && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#238636]/20 text-[#3fb950] font-mono">
                        status: {mcpOutput.status || "success"}
                      </span>
                    )}
                  </div>

                  {mcpError && (
                    <div className="p-3 rounded bg-[#da3633]/15 border border-[#da3633]/40 text-[#f85149] text-xs font-mono">
                      {mcpError}
                    </div>
                  )}

                  {!mcpOutput && !mcpError && !mcpLoading && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#8b949e]">
                      <span className="text-3xl mb-2">⚡</span>
                      <p className="text-xs font-medium text-[#c9d1d9]">
                        Ready to execute
                      </p>
                      <p className="text-[11px] mt-1 max-w-sm">
                        Select an MCP tool and click Execute to test live
                        verification, test-gap analysis, or AI fix branch
                        generation.
                      </p>
                    </div>
                  )}

                  {mcpLoading && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#8b949e]">
                      <div className="w-8 h-8 border-3 border-[#58a6ff] border-t-transparent rounded-full animate-spin mb-3" />
                      <p className="text-xs font-medium text-[#c9d1d9]">
                        Running {selectedTool}...
                      </p>
                    </div>
                  )}

                  {mcpOutput && (
                    <div className="flex-1 overflow-auto">
                      <pre className="p-3 rounded bg-[#0d1117] border border-[#30363d] text-xs font-mono text-[#c9d1d9] overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(mcpOutput, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles for Swagger Dark Theme & Container Fluidity */}
      <style jsx global>{`
        /* Base Swagger UI adjustments */
        .swagger-ui-wrapper {
          padding: 16px 24px 60px 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        /* Swagger Dark Theme */
        .swagger-dark {
          background-color: #0d1117 !0important;
        }
        .swagger-dark .swagger-ui {
          color: #c9d1d9;
        }
        .swagger-dark .swagger-ui .info .title,
        .swagger-dark .swagger-ui .info h1,
        .swagger-dark .swagger-ui .info h2,
        .swagger-dark .swagger-ui .info h3,
        .swagger-dark .swagger-ui .info h4,
        .swagger-dark .swagger-ui .info h5 {
          color: #f0f6fc;
        }
        .swagger-dark .swagger-ui .info p,
        .swagger-dark .swagger-ui .info li {
          color: #8b949e;
        }
        .swagger-dark .swagger-ui .opblock-tag {
          color: #f0f6fc;
          border-bottom: 1px solid #30363d;
        }
        .swagger-dark .swagger-ui .opblock-tag small {
          color: #8b949e;
        }
        .swagger-dark .swagger-ui .opblock {
          background-color: #161b22;
          border-color: #30363d;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
        }
        .swagger-dark .swagger-ui .opblock-summary-path {
          color: #f0f6fc;
        }
        .swagger-dark .swagger-ui .opblock-summary-description {
          color: #8b949e;
        }
        .swagger-dark .swagger-ui .opblock-body {
          background-color: #0d1117;
        }
        .swagger-dark .swagger-ui .tab li button.tablinks {
          color: #8b949e;
        }
        .swagger-dark .swagger-ui .tab li button.tablinks.active {
          color: #58a6ff;
        }
        .swagger-dark .swagger-ui .parameters-col_name {
          color: #f0f6fc;
        }
        .swagger-dark .swagger-ui .parameter__name {
          color: #f0f6fc;
        }
        .swagger-dark .swagger-ui .parameter__type {
          color: #8b949e;
        }
        .swagger-dark .swagger-ui table thead tr th,
        .swagger-dark .swagger-ui table thead tr td {
          color: #8b949e;
          border-bottom: 1px solid #30363d;
        }
        .swagger-dark .swagger-ui select {
          background-color: #161b22;
          color: #f0f6fc;
          border: 1px solid #30363d;
        }
        .swagger-dark .swagger-ui input[type="text"] {
          background-color: #161b22;
          color: #f0f6fc;
          border: 1px solid #30363d;
        }
        .swagger-dark .swagger-ui textarea {
          background-color: #161b22;
          color: #f0f6fc;
          border: 1px solid #30363d;
        }
        .swagger-dark .swagger-ui .response-col_status {
          color: #f0f6fc;
        }
        .swagger-dark .swagger-ui .response-col_description {
          color: #c9d1d9;
        }
        .swagger-dark .swagger-ui .model-title {
          color: #f0f6fc;
        }
        .swagger-dark .swagger-ui .model {
          color: #c9d1d9;
        }
        .swagger-dark .swagger-ui section.models {
          border: 1px solid #30363d;
          background-color: #161b22;
        }
        .swagger-dark .swagger-ui section.models h4 {
          color: #f0f6fc;
          border-bottom: 1px solid #30363d;
        }
        .swagger-dark .swagger-ui .model-box {
          background-color: #0d1117;
        }
        .swagger-dark .swagger-ui .btn.try-out__btn {
          color: #58a6ff;
          border-color: #58a6ff;
        }
        .swagger-dark .swagger-ui .btn.execute {
          background-color: #238636;
          border-color: #238636;
          color: #ffffff;
        }
        .swagger-dark .swagger-ui .responses-inner h4,
        .swagger-dark .swagger-ui .responses-inner h5 {
          color: #f0f6fc;
        }
        .swagger-dark .swagger-ui .highlight-code {
          background-color: #0d1117;
        }
        .swagger-dark .swagger-ui .microlight {
          background-color: #0d1117 !important;
          color: #58a6ff !important;
        }
        .swagger-dark .swagger-ui .download-contents {
          background-color: #21262d;
          color: #c9d1d9;
        }
      `}</style>
    </>
  );
}
