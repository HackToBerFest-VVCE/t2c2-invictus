import {
  VerificationRun,
  Repository,
  ManualTriggerRequest,
  BackendHealth,
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
