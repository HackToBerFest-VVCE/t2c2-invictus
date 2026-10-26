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
  file_path?: string | null;
  line_number?: number | null;
  expected_behavior?: string;
  actual_behavior?: string;
  reproduction_command?: string | null;
  execution_trace?: string | null;
  ai_assisted: boolean;
  created_at?: string;
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
  created_at: string;
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
}

export interface BackendHealth {
  status: string;
  service: string;
  version?: string;
  environment?: string;
  connected: boolean;
}
