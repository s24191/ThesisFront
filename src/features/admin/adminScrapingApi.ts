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

export type ScrapeRun = {
  id: number;
  run_key: string;
  site_id: number;
  status: string;
  triggered_by: string;
  started_at: string | null;
  finished_at: string | null;
  items_count: number | null;
};

export type ScrapeLog = {
  id: number;
  run_id: number;
  level: string;
  message: string;
  created_at: string;
};

export const adminScrapingApi = {
  startList: (site: "sklep_wina" | "winapl" | "malawinnica") =>
    adminRequest<StartListResponse>("/admin/scraping/start-list", {
      method: "POST",
      bodyJson: { site },
    }),

  getRun: (runId: number) =>
    adminRequest<ScrapeRun>(`/admin/scraping/runs/${runId}`),

  listRuns: (site?: SiteKey, limit = 10) => {
    const search = new URLSearchParams();
    if (site) search.set("site_key", site);
    if (limit) search.set("limit", String(limit));
    const qs = search.toString();
    return adminRequest<ScrapeRun[]>(
      `/admin/scraping/runs${qs ? `?${qs}` : ""}`,
    );
  },

  getLogs: (runId: number) =>
    adminRequest<ScrapeLog[]>(`/admin/scraping/logs?run_id=${runId}`),
  
};