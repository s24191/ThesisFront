export type SiteKey =
  | "sklep_wina"
  | "winapl"
  | "malawinnica";

export type ScrapeRunStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "partial"
  | "failed"
  | "cancelled";

export type ScrapeStepKey =
  | "list"
  | "fetch"
  | "reconcile"
  | "persist";

export type StartListResponse = {
  run_id: number;
  run_key: string;
  site: string;
  status: string;
};

export type StartFetchResponse = {
  run_id: number;
  run_key: string;
  site: string;
  step_key: "fetch";
  status: string;
};

export type StartPersistResponse = {
  run_id: number;
  run_key: string;
  site: string;
  step_key: "persist";
  status: string;
};

export type ScrapeRun = {
  id: number;
  run_key: string;
  site_id: number;
  site_key: SiteKey;
  site_name: string;
  status: ScrapeRunStatus;
  triggered_by: string;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  duration_seconds: number | null;
};

export type ScrapeStepRun = {
  id: number;
  run_id: number;
  step_key: ScrapeStepKey;
  status: ScrapeRunStatus;
  started_at: string | null;
  finished_at: string | null;
  duration_seconds: number | null;
  fetched_count: number;
  changed_count: number;
  retries: number;
  input_blob_path: string | null;
  output_blob_path: string | null;
  error_message: string | null;
};

export type ScrapeLog = {
  id: number;
  run_id: number;
  step_run_id: number | null;
  timestamp: string;
  level: string;
  message: string;
};