import type { FC, ChangeEvent } from "react";
import { useEffect, useState } from "react";
import type { WineFilters } from "../api";
import { fetchCountries, fetchRegions } from "../api";

interface WineFiltersBarProps {
  onChange: (filters: WineFilters) => void;
}

export const WineFiltersBar: FC<WineFiltersBarProps> = ({ onChange }) => {
  const [filters, setFilters] = useState<WineFilters>({});
  const [countries, setCountries] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);

 useEffect(() => {
    fetchCountries().then(setCountries).catch(() => setCountries([]));
  }, []);

  useEffect(() => {
  setRegions([]);

  fetchRegions(filters.country)
    .then((data) => setRegions(data))
    .catch(() => setRegions([]));
}, [filters.country]);

  const updateFilters = (patch: Partial<WineFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    onChange(next);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value.trim();
  updateFilters({ search: value || undefined });
  };

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as WineFilters["sort"] | "";
    updateFilters({ sort: value || undefined });
  };

  const handleCountryChange = (e: ChangeEvent<HTMLSelectElement>) => {
  const value = e.target.value || undefined;
  updateFilters({ country: value, region: undefined });
};

  const handleRegionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateFilters({ region: e.target.value || undefined });
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {/* search */}
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          placeholder="Search wines..."
          className="w-full rounded-md border border-gray-300 bg-white text-gray-900
             placeholder:text-gray-400 px-3 py-2 text-sm
             focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={filters.search ?? ""}
          onChange={handleSearchChange}
        />
      </div>

      {/* sort */}
      <div>
        <select
          className="rounded-md border border-gray-300 bg-white text-gray-900
             px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={filters.sort ?? ""}
          onChange={handleSortChange}
        >
          <option value="">Sort by</option>
          <option value="rating-desc">Rating (high → low)</option>
          <option value="price-asc">Price (low → high)</option>
          <option value="price-desc">Price (high → low)</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          className="rounded-md border border-gray-300 bg-white text-gray-900
                     px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={filters.country ?? ""}
          onChange={handleCountryChange}
        >
          <option value="">All countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="rounded-md border border-gray-300 bg-white text-gray-900
                     px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={filters.region ?? ""}
          onChange={handleRegionChange}
          disabled={!regions.length}
        >
          <option value="">
            {filters.country ? "All regions" : "Select country first"}
          </option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};