import { useState, useEffect } from "react";
import { VerificationRun } from "../types";
import { fetchRuns } from "../services/api";
import { ALL_DEMO_REPOSITORIES, ExtendedRepository } from "../data/demoData";

export function useRuns(selectedRepoId?: string) {
  const [runs, setRuns] = useState<VerificationRun[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadRuns = async () => {
    setLoading(true);
    try {
      const backendRuns = await fetchRuns().catch(() => []);

      // Gather demo runs for all repositories
      const allDemoRuns: VerificationRun[] = ALL_DEMO_REPOSITORIES.flatMap(
        (repo: ExtendedRepository) => repo.recent_runs || []
      );

      // Merge backend live runs with demo runs, deduplicating by run ID
      const runMap = new Map<string, VerificationRun>();
      backendRuns.forEach((r: VerificationRun) => runMap.set(r.id, r));
      allDemoRuns.forEach((r: VerificationRun) => {
        if (!runMap.has(r.id)) {
          runMap.set(r.id, r);
        }
      });

      const combined = Array.from(runMap.values());
      // Sort newest first
      combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (selectedRepoId && selectedRepoId !== "ALL") {
        setRuns(combined.filter((r) => r.repository_id.toLowerCase().includes(selectedRepoId.toLowerCase())));
      } else {
        setRuns(combined);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load runs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
  }, [selectedRepoId]);

  return { runs, loading, error, refresh: loadRuns };
}
