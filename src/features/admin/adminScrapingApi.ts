import { useAuthStore } from "@/store/authStore";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

type RequestOptions = RequestInit & {
  bodyJson?: unknown;
};

async function adminRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = useAuthStore.getState().token;

  const headers: HeadersInit = {
    ...(options.bodyJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.bodyJson ? JSON.stringify(options.bodyJson) : options.body,
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const data = await response.json();
      message = (data as any).detail ?? message;
    } catch {
      const text = await response.text();
      if (text) message = text;
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

export type SiteKey = "sklep_wina" | "winapl" | "malawinnica";

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

export type ScrapeRun = {
  id: number;
  run_key: string;
  site_id: number;
  site_key: string;
  site_name: string;
  status: string;
  triggered_by: string;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  duration_seconds: number | null;
};

export type StartPersistResponse = {
  run_id: number;
  run_key: string;
  site: string;
  step_key: "persist";
  status: string;
};

export type ScrapeStepRun = {
  id: number;
  run_id: number;
  step_key:
  | "list"
  | "fetch"
  | "reconcile"
  | "persist";
  status:
    | "queued"
    | "running"
    | "succeeded"
    | "partial"
    | "failed"
    | "cancelled";
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

export type TranslationReviewItem = {
  id: number;
  field_name: string;
  source_value: string;
  status: string;
  translation_mapping_id: number | null;
  created_at: string;
  mapped_at: string | null;
  occurrence_count: number;
};

export type TranslationReviewOccurrence = {
  id: number;
  translation_review_item_id: number;
  source_url: string;
  status: string;
  created_at: string;

  original_step_run_id: number;
  original_run_id: number;
  site_key: string;
  site_name: string;

  reprocessed_at: string | null;
  reprocessed_step_run_id: number | null;
  reprocess_error: string | null;
};

export type TranslationReviewActionResponse = {
  id: number;
  field_name: string;
  source_value: string;
  status: string;
  translation_mapping_id: number | null;
  affected_occurrences: number;
};

export type ReconcileTranslationsResponse = {
  source_run_id: number;
  source_fetch_step_id: number;

  site: string;

  mode:
    | "merge_existing_csv"
    | "create_reprocess_run";

  resolved_occurrence_count: number;
  ignored_occurrence_count: number;

  status: string;
};

const SCRAPING_BASE_PATH = "/admin/scraping";
const TRANSLATION_BASE_PATH = "/admin/translation_reviews";

export const adminScrapingApi = {
  startList(site: SiteKey) {
    return adminRequest<StartListResponse>(
      `${SCRAPING_BASE_PATH}/start-list`,
      {
        method: "POST",
        bodyJson: {site},
      },
    );
  },

  startFetch(runId: number) {
    return adminRequest<StartFetchResponse>(
      `${SCRAPING_BASE_PATH}/runs/${runId}/start-fetch`,
      {
        method: "POST",
      },
    );
  },

  startPersist(runId: number) {
    return adminRequest<StartPersistResponse>(
      `${SCRAPING_BASE_PATH}/runs/${runId}/start-persist`,
      {
        method: "POST",
      },
    );
  },

  getRun(runId: number) {
    return adminRequest<ScrapeRun>(
      `${SCRAPING_BASE_PATH}/runs/${runId}`,
    );
  },

  getSteps(runId: number) {
    return adminRequest<ScrapeStepRun[]>(
      `${SCRAPING_BASE_PATH}/runs/${runId}/steps`,
    );
  },

  getLogs(runId: number) {
    return adminRequest<ScrapeLog[]>(
      `${SCRAPING_BASE_PATH}/runs/${runId}/logs`,
    );
  },

  listRuns(
    siteKey?: SiteKey,
    limit = 20,
  ) {
    const params = new URLSearchParams();

    if (siteKey) {
      params.set("site_key", siteKey);
    }

    params.set("limit", String(limit));

    return adminRequest<ScrapeRun[]>(
      `${SCRAPING_BASE_PATH}/runs?${params.toString()}`,
    );
  },
  listTranslationReviews(
    status?: string,
    fieldName?: string,
  ) {
    const params = new URLSearchParams();

    if (status) {
      params.set("status", status);
    }

    if (fieldName) {
      params.set("field_name", fieldName);
    }

    return adminRequest<TranslationReviewItem[]>(
      `${TRANSLATION_BASE_PATH}?${params.toString()}`,
    );
  },

  getTranslationReviewOccurrences(itemId: number) {
    return adminRequest<TranslationReviewOccurrence[]>(
      `${TRANSLATION_BASE_PATH}/${itemId}/occurrences`,
    );
  },

  resolveTranslationReview(
    itemId: number,
    targetValue: string,
  ) {
    return adminRequest<TranslationReviewActionResponse>(
      `${TRANSLATION_BASE_PATH}/${itemId}/resolve`,
      {
        method: "POST",
        bodyJson: {
          target_value: targetValue,
        },
      },
    );
  },

  ignoreTranslationReview(itemId: number) {
    return adminRequest<TranslationReviewActionResponse>(
      `${TRANSLATION_BASE_PATH}/${itemId}/ignore`,
      {
        method: "POST",
      },
    );
  },
  reconcileTranslations(runId: number) {
    return adminRequest<ReconcileTranslationsResponse>(
      `${SCRAPING_BASE_PATH}/runs/${runId}/reconcile-translations`,
      {
        method: "POST",
      },
    );
  },
};

