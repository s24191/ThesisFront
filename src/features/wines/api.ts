import type {Wine} from "./types";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export interface WineFilters {
  search?: string;
  country?: string;
  region?: string;
  sort?: "rating-desc" | "price-asc" | "price-desc";
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
