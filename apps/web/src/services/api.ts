import { VerificationRun, Repository } from "../types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchRepositories(): Promise<Repository[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/repositories`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch repositories");
    return await res.json();
  } catch (err) {
    // Fallback mock data if backend is offline during frontend preview
    return [
      {
        id: "t2c2-invictus",
        owner: "HackToBerFest-VVCE",
        name: "t2c2-invictus",
        full_name: "HackToBerFest-VVCE/t2c2-invictus",
        default_branch: "main",
      },
    ];
  }
}

export async function fetchRuns(): Promise<VerificationRun[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/runs`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch verification runs");
    return await res.json();
  } catch (err) {
    // Fallback mock run
    return [
      {
        id: "run_sample_01",
        repository_id: "t2c2-invictus",
        commit_sha: "422ab52a9af5",
        branch: "main",
        event_type: "push",
        status: "VERIFIED_PASS",
        summary: "All 5 invariant checks passed successfully.",
        duration_ms: 340,
        created_at: new Date().toISOString(),
      },
    ];
  }
}

export async function fetchRun(runId: string): Promise<VerificationRun | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/v1/runs/${runId}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch run details");
    return await res.json();
  } catch (err) {
    return null;
  }
}
