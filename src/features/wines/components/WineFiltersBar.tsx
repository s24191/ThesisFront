import {type FC, type ChangeEvent, useMemo} from "react";
import { useEffect, useState } from "react";
import type { WineFilters } from "../api";
import { fetchCountries, fetchRegions } from "../api";

interface WineFiltersBarProps {
  value: WineFilters;
  onChange: (filters: WineFilters) => void;
}

type SortKey =
  | "year"
  | "alcohol"
  | "volume"
  | "comments"
  | "rating"
  | "body"
  | "tannin"
  | "sweetness"
  | "acidity"
  | "price"
  | null;

type SortDir = "default" | "asc" | "desc";

const SORT_CONFIG: Record<
  Exclude<SortKey, null>,
  { label: string; defaultDir: Exclude<SortDir, "default"> }
> = {
  year: { label: "Year", defaultDir: "desc" },
  alcohol: { label: "Alcohol", defaultDir: "desc" },
  volume: { label: "Volume", defaultDir: "desc" },
  comments: { label: "Comments", defaultDir: "desc" },
  rating: { label: "Rating", defaultDir: "desc" },
  body: { label: "Body", defaultDir: "desc" },
  tannin: { label: "Tannin", defaultDir: "desc" },
  sweetness: { label: "Sweetness", defaultDir: "desc" },
  acidity: { label: "Acidity", defaultDir: "desc" },
  price: { label: "Price", defaultDir: "desc" },
};

function parseSort(sort: WineFilters["sort"] | undefined): {
  key: SortKey;
  dir: SortDir;
} {
  if (!sort) return { key: null, dir: "default" };

  const [rawKey, rawDir] = sort.split("-") as [string, "asc" | "desc" | undefined];
  const key = rawKey as SortKey;
  if (!key || !(key in SORT_CONFIG)) return { key: null, dir: "default" };

  return { key, dir: rawDir ?? SORT_CONFIG[key].defaultDir };
}

function encodeSort(key: SortKey, dir: SortDir): WineFilters["sort"] | undefined {
  if (!key || dir === "default") return undefined;
  return `${key}-${dir}` as WineFilters["sort"];
}

export const WineFiltersBar: FC<WineFiltersBarProps> = ({ value, onChange }) => {
  const [filters, setFilters] = useState<WineFilters>(value);
  const [countries, setCountries] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
 useEffect(() => {
    setFilters(value);
  }, [value]);

  useEffect(() => {
    fetchCountries().then(setCountries).catch(() => setCountries([]));
  }, []);

  useEffect(() => {
  setRegions([]);
  fetchRegions(filters.country)
    .then((data) => setRegions(data))
    .catch(() => setRegions([]));
}, [filters.country]);

  const { key: sortKey, dir: sortDir } = useMemo(
    () => parseSort(filters.sort),
    [filters.sort]
  );

  const updateFilters = (patch: Partial<WineFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    onChange(next);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value.trim();
  updateFilters({ search: value || undefined });
  };

  const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
  const value = e.target.value || undefined;
  updateFilters({ country: value, region: undefined });
};

  const handleRegionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ region: e.target.value || undefined });
  };

  const uniqueRegions = useMemo(
    () => Array.from(new Set(regions)),
    [regions],
  );

  const toggleSort = (key: Exclude<SortKey, null>) => {
    const defaultDir = SORT_CONFIG[key].defaultDir;

    if (sortKey !== key) {
      updateFilters({ sort: encodeSort(key, defaultDir) });
      return;
    }

    let nextDir: SortDir;
    if (sortDir === "default") {
      nextDir = defaultDir;
    } else if (sortDir === defaultDir) {
      nextDir = defaultDir === "asc" ? "desc" : "asc";
    } else {
      nextDir = "default";
    }

    updateFilters({ sort: encodeSort(key, nextDir) });
  };

  const sortButtonClass = (key: Exclude<SortKey, null>) =>
    [
      "rounded-full border px-3 py-1 text-xs font-medium transition",
      sortKey === key && sortDir !== "default"
        ? "border-teal-500 bg-teal-50 text-teal-700"
        : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100",
    ].join(" ");

  const sortLabel = (key: Exclude<SortKey, null>) => {
    const label = SORT_CONFIG[key].label;
    if (sortKey !== key || sortDir === "default") return label;
    return `${label} ${sortDir === "asc" ? "↑" : "↓"}`;
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
      <div className="min-w-[220px] flex-1">
        <input
          type="text"
          value={filters.search ?? ""}
          onChange={handleSearchChange}
          placeholder="Search wines…"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Sort by</span>
        <button type="button" onClick={() => toggleSort("year")} className={sortButtonClass("year")}>{sortLabel("year")}</button>
        <button type="button" onClick={() => toggleSort("alcohol")} className={sortButtonClass("alcohol")}>{sortLabel("alcohol")}</button>
        <button type="button" onClick={() => toggleSort("volume")} className={sortButtonClass("volume")}>{sortLabel("volume")}</button>
        <button type="button" onClick={() => toggleSort("comments")} className={sortButtonClass("comments")}>{sortLabel("comments")}</button>
        <button type="button" onClick={() => toggleSort("rating")} className={sortButtonClass("rating")}>{sortLabel("rating")}</button>
        <button type="button" onClick={() => toggleSort("body")} className={sortButtonClass("body")}>{sortLabel("body")}</button>
        <button type="button" onClick={() => toggleSort("tannin")} className={sortButtonClass("tannin")}>{sortLabel("tannin")}</button>
        <button type="button" onClick={() => toggleSort("sweetness")} className={sortButtonClass("sweetness")}>{sortLabel("sweetness")}</button>
        <button type="button" onClick={() => toggleSort("acidity")} className={sortButtonClass("acidity")}>{sortLabel("acidity")}</button>
        <button type="button" onClick={() => toggleSort("price")} className={sortButtonClass("price")}>{sortLabel("price")}</button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filters.country ?? ""}
          onChange={handleCountryChange}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={filters.region ?? ""}
          onChange={handleRegionChange}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
          disabled={!filters.country}
        >
          <option value="">
            {filters.country ? "All regions" : "Select country first"}
          </option>
          {uniqueRegions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}