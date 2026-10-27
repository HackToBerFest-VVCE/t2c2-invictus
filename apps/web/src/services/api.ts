import {
  VerificationRun,
  Repository,
  ManualTriggerRequest,
  BackendHealth,
  Finding,
  SpecAnalysis,
  RunComparison,
} from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const ROOT_API_URL =
  process.env.NEXT_PUBLIC_ROOT_URL || "http://localhost:8000";

/**
 * Check connectivity and status of the FastAPI backend service.
 */
export async function checkBackendHealth(): Promise<BackendHealth> {
  try {
    const res = await fetch(`${ROOT_API_URL}/health`, {
      method: "GET",
      cache: "no-store",
    });
    if (res.ok) {
      const data = await res.json();
      return {
        status: data.status || "healthy",
        service: data.service || "invariant-api",
        version: data.version,
        environment: data.environment,
        connected: true,
      };
    }
    return {
      status: "degraded",
      service: "invariant-api",
      connected: false,
    };
  } catch (err) {
    return {
      status: "offline",
      service: "invariant-api",
      connected: false,
    };
  }
}

/**
 * Fetch connected repositories from backend database.
 */
export async function fetchRepositories(): Promise<Repository[]> {
  const res = await fetch(`${API_BASE_URL}/v1/repositories`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch repositories (${res.status} ${res.statusText})`);
  }
  return await res.json();
}

/**
 * Fetch verification runs from backend database.
 */
export async function fetchRuns(repositoryId?: string): Promise<VerificationRun[]> {
  let url = `${API_BASE_URL}/v1/runs?limit=50`;
  if (repositoryId) {
    url += `&repository_id=${encodeURIComponent(repositoryId)}`;
  }
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch verification runs (${res.status} ${res.statusText})`);
  }
  return await res.json();
}

/**
 * Fetch a single verification run and its evaluated findings.
 */
export async function fetchRun(runId: string): Promise<VerificationRun | null> {
  const res = await fetch(`${API_BASE_URL}/v1/runs/${runId}`, {
    cache: "no-store",
  });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error(`Failed to fetch run '${runId}' (${res.status} ${res.statusText})`);
  }
  return await res.json();
}

/**
 * Manually trigger a verification run through the FastAPI backend orchestrator.
 */
export async function triggerManualRun(
  payload: ManualTriggerRequest
): Promise<VerificationRun> {
  const res = await fetch(`${API_BASE_URL}/v1/runs/trigger`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      workspace_path: payload.workspace_path || "examples/inventory-api",
      spec_path: payload.spec_path || "examples/inventory-api/INVARIANT.md",
      repository_id: payload.repository_id || "t2c2-invictus",
      commit_sha: payload.commit_sha || "HEAD",
      branch: payload.branch || "main",
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to trigger verification run: ${errText || res.statusText}`);
  }

  return await res.json();
}

/**
 * Fetch specification analysis and test-gap coverage.
 */
export async function analyzeSpecification(
  specPath: string = "INVARIANT.md",
  workspacePath: string = "."
): Promise<SpecAnalysis> {
  const url = `${API_BASE_URL}/v1/specs/analyze?spec_path=${encodeURIComponent(
    specPath
  )}&workspace_path=${encodeURIComponent(workspacePath)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to analyze specification (${res.status} ${res.statusText})`);
  }
  return await res.json();
}

/**
 * Compare two verification runs to detect regressions and resolved issues.
 */
export async function compareRuns(
  baseRunId: string,
  headRunId: string
): Promise<RunComparison> {
  const url = `${API_BASE_URL}/v1/runs/compare?base_run_id=${encodeURIComponent(
    baseRunId
  )}&head_run_id=${encodeURIComponent(headRunId)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to compare runs (${res.status} ${res.statusText})`);
  }
  return await res.json();
}

/**
 * Update the lifecycle status of a finding (e.g. unconfirmed -> confirmed -> resolved).
 */
export async function updateFindingStatus(
  findingId: string,
  lifecycleStatus: "unconfirmed" | "confirmed" | "resolved" | "dismissed",
  reviewerNotes?: string
): Promise<Finding> {
  const res = await fetch(`${API_BASE_URL}/v1/findings/${findingId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lifecycle_status: lifecycleStatus,
      reviewer_notes: reviewerNotes,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update finding status: ${errText || res.statusText}`);
  }

  return await res.json();
}

/**
 * Get direct download link for verification run reports.
 */
export function getExportUrl(
  runId: string,
  format: "markdown" | "json" | "github-issue"
): string {
  return `${API_BASE_URL}/v1/runs/${encodeURIComponent(runId)}/export/${format}`;
}

/**
 * Seed demonstration verification runs (baseline, regression, fixed).
 */
export async function seedDemoRuns(): Promise<{
  status: string;
  message: string;
  runs: Array<{ id: string; status: string; commit: string }>;
}> {
  const res = await fetch(`${API_BASE_URL}/v1/seed`, {
    method: "POST",
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to seed demo runs: ${errText || res.statusText}`);
  }
  return await res.json();
}

/**
 * Fetch available Model Context Protocol (MCP) tools and schemas.
 */
export async function fetchMcpTools(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/v1/mcp/tools`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch MCP tools: ${res.statusText}`);
  }
  return await res.json();
}

/**
 * Execute an MCP tool via the FastAPI backend runner.
 */
export async function executeMcpTool(
  toolName: string,
  args: Record<string, any>
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/v1/mcp/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tool_name: toolName,
      arguments: args,
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`MCP tool execution failed: ${errText || res.statusText}`);
  }
  return await res.json();
}



