import type {FollowedWine, MyComment, Wine, WineComment, WineNote, WineTasteSummary, WineTasteVote} from "./types";
import {api} from "@/lib/api.ts";

const API_URL = import.meta.env.VITE_API_URL;

export interface WineFilters {
  search?: string;
  country?: string;
  region?: string;
  sort?:
    | "year-desc"
    | "year-asc"
    | "alcohol-desc"
    | "alcohol-asc"
    | "volume-desc"
    | "volume-asc"
    | "comments-desc"
    | "comments-asc"
    | "rating-desc"
    | "rating-asc"
    | "body-desc"
    | "body-asc"
    | "tannin-desc"
    | "tannin-asc"
    | "sweetness-desc"
    | "sweetness-asc"
    | "acidity-desc"
    | "acidity-asc"
    | "price-desc"
    | "price-asc";
  page?: number;
  pageSize?: number;
}

export async function fetchWines(filters: WineFilters = {}): Promise<Wine[]> {
  const params = new URLSearchParams();

  if (filters.search) params.set("search", filters.search);
  if (filters.country) params.set("country", filters.country);
  if (filters.region) params.set("region", filters.region);
  if (filters.sort) params.set("sort", filters.sort);

  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 50;
  params.set("limit", String(pageSize));
  params.set("offset", String((page - 1) * pageSize));

  const query = params.toString();
  const res = await fetch(`${API_URL}/wines/${query ? `?${query}` : ""}`);
  if (!res.ok) {
    throw new Error(`Failed to load wines: ${res.status}`);
  }
  return (await res.json()) as Wine[];
}

export async function fetchCountries(): Promise<string[]> {
  const res = await fetch(`${API_URL}/wines/countries`);
  if (!res.ok) throw new Error("Failed to load countries");
  return (await res.json()) as string[];
}

export async function fetchRegions(country?: string): Promise<string[]> {
  const params = new URLSearchParams();
  if (country) params.set("country", country);
  const query = params.toString();
  const res = await fetch(
    `${API_URL}/wines/regions${query ? `?${query}` : ""}`,
  );
  if (!res.ok) throw new Error("Failed to load regions");
  return (await res.json()) as string[];
}

export async function fetchWineComments(wineId: number): Promise<WineComment[]> {
  const res = await fetch(`${API_URL}/wines/${wineId}/comments`);
  if (!res.ok) throw new Error("Failed to load comments");
  return res.json();
}

export async function fetchMyComments(token: string): Promise<MyComment[]> {
  const res = await fetch(`${API_URL}/wines/me/comments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Failed to load comments: ${res.status}`);
  }
  return res.json();
}

export async function createWineComment(
  wineId: number,
  data: { rating: number; text: string },
  token: string,
): Promise<WineComment> {
  const res = await fetch(`${API_URL}/wines/${wineId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add comment");
  return res.json();
}

export async function fetchFollowedWines(token: string): Promise<FollowedWine[]> {
  const res = await fetch(`${API_URL}/wines/me/followed`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to load followed wines: ${res.status}`);
  }
  return res.json();
}

export async function fetchTasteSummary(wineId: number): Promise<WineTasteSummary> {
  const res = await fetch(`${API_URL}/wines/${wineId}/taste-summary`);
  if (!res.ok) {
    throw new Error(`Failed to load taste summary: ${res.status}`);
  }
  return res.json();
}

export async function fetchMyTasteVote(
  wineId: number,
  token: string
): Promise<WineTasteVote | null> {
  const res = await fetch(`${API_URL}/wines/${wineId}/taste/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Failed to load my taste vote: ${res.status}`);
  }

  const data = await res.json();
  return data ?? null;
}

export async function upsertMyTasteVote(
  wineId: number,
  token: string,
  payload: WineTasteVote
): Promise<WineTasteVote> {
  const res = await fetch(`${API_URL}/wines/${wineId}/taste`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to save taste vote: ${res.status}`);
  }

  return res.json();
}

export async function fetchWineNotes(
  wineId: number,
  includeUserState: boolean
): Promise<WineNote[]> {
  const path = includeUserState
    ? `/wines/${wineId}/notes/me`
    : `/wines/${wineId}/notes`;

  const res = await api.get<{ notes: WineNote[] }>(path);
  return res.data.notes;
}

export async function addWineNote(
  wineId: number,
  text: string
): Promise<WineNote> {
  const res = await api.post<WineNote>(`/wines/${wineId}/notes`, { text });
  return res.data;
}

export async function toggleWineNote(
  wineId: number,
  noteId: number
): Promise<WineNote> {
  const res = await api.post<WineNote>(
    `/wines/${wineId}/notes/${noteId}/toggle`,
    {}
  );
  return res.data;
}