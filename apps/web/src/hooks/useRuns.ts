import { useState, useEffect } from "react";
import { VerificationRun } from "../types";
import { fetchRuns } from "../services/api";

export function useRuns() {
  const [runs, setRuns] = useState<VerificationRun[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadRuns = async () => {
    setLoading(true);
    try {
      const data = await fetchRuns();
      setRuns(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load runs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  return { runs, loading, error, refresh: loadRuns };
}
