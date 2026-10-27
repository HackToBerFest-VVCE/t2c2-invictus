export type VerificationStatus =
  | "VERIFIED_PASS"
  | "VERIFIED_FAILURE"
  | "STATIC_WARNING"
  | "AI_HYPOTHESIS"
  | "CHECK_ERROR"
  | "UNSUPPORTED";

export interface Finding {
  id: string;
  run_id: string;
  invariant_id?: string | null;
  title: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
  verification_status: VerificationStatus;
  lifecycle_status?: "unconfirmed" | "confirmed" | "resolved" | "dismissed";
  confidence?: string;
  file_path?: string | null;
  line_number?: number | null;
  expected_behavior?: string;
  actual_behavior?: string;
  reproduction_command?: string | null;
  execution_trace?: string | null;
  suggested_fix?: string | null;
  reviewer_notes?: string | null;
  ai_assisted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VerificationRun {
  id: string;
  repository_id: string;
  commit_sha: string;
  branch: string;
  event_type: string;
  status: VerificationStatus;
  summary?: string;
  duration_ms: number;
  is_async?: boolean;
  plan_metadata?: string;
  created_at: string;
  completed_at?: string;
  findings?: Finding[];
}

export interface Repository {
  id: string;
  owner: string;
  name: string;
  full_name: string;
  default_branch: string;
  recent_runs?: VerificationRun[];
}

export interface ManualTriggerRequest {
  workspace_path?: string;
  spec_path?: string;
  repository_id?: string;
  commit_sha?: string;
  branch?: string;
  async_run?: boolean;
}

export interface BackendHealth {
  status: string;
  service: string;
  version?: string;
  environment?: string;
  connected?: boolean;
}

export interface SpecInvariant {
  id: string;
  title: string;
  rule_statement: string;
  formal_assertion?: string | null;
  severity: string;
  test_coverage_status: "COVERED" | "UNTESTED_GAP";
  associated_tests: string[];
  suggested_test_sketch?: string | null;
}

export interface SpecAnalysis {
  spec_path: string;
  spec_version: string;
  target_system: string;
  total_invariants: number;
  tested_count: number;
  untested_gap_count: number;
  coverage_percentage: number;
  invariants: SpecInvariant[];
  recommendations: string[];
}

export interface RunComparison {
  base_run_id: string;
  head_run_id: string;
  new_regressions: Finding[];
  resolved_findings: Finding[];
  persistent_findings: Finding[];
  total_regressions: number;
  total_resolved: number;
  total_persistent: number;
  summary: string;
}

