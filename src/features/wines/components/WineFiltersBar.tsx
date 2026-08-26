import {
  type ChangeEvent,
  type FC,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  fetchCountries,
  fetchRegions,
} from "@/features/wines/api";

import type {
  WineFilters,
} from "@/features/wines/types";

import {
  encodeSorts,
  parseSorts,
  SORT_CONFIG,
  SORT_KEYS,
  type SortKey,
} from "@/features/wines/utils/wineSorts";

interface WineFiltersBarProps {
  value: WineFilters;
  onChange: (filters: WineFilters) => void;
}

/*
 * API representation:
 *
 *   price-asc,volume-asc
 *
 * The order in this string is the sort precedence.
 */

export const WineFiltersBar: FC<
  WineFiltersBarProps
> = ({
  value,
  onChange,
}) => {
  const [filters, setFilters] =
    useState<WineFilters>(value);

  const [countries, setCountries] =
    useState<string[]>([]);

  const [regions, setRegions] =
    useState<string[]>([]);

  useEffect(() => {
    setFilters(value);
  }, [value]);

  useEffect(() => {
    fetchCountries()
      .then(setCountries)
      .catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    let isCurrent = true;

    setRegions([]);

    if (!filters.country) {
      return () => {
        isCurrent = false;
      };
    }

    const loadRegions = async () => {
      try {
        const nextRegions = await fetchRegions(
          filters.country,
        );

        if (isCurrent) {
          setRegions(nextRegions);
        }
      } catch {
        if (isCurrent) {
          setRegions([]);
        }
      }
    };

    void loadRegions();

    return () => {
      isCurrent = false;
    };
  }, [
    filters.country,
  ]);
  const activeSorts = useMemo(
    () => parseSorts(filters.sort),
    [filters.sort],
  );

  const updateFilters = (
    patch: Partial<WineFilters>,
  ) => {
    const next = {
      ...filters,
      ...patch,
    };

    setFilters(next);
    onChange(next);
  };

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const search = event.target.value;

    updateFilters({
      search: search || undefined,
    });
  };

  const handleCountryChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const country = event.target.value || undefined;

    updateFilters({
      country,
      region: undefined,
    });
  };

  const handleRegionChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    updateFilters({
      region: event.target.value || undefined,
    });
  };

  const uniqueRegions = useMemo(
    () => Array.from(new Set(regions)),
    [regions],
  );

  /*
   * Click cycle:
   *
   * Not selected → add using default direction
   * Default direction → reverse direction
   * Reverse direction → remove from multi-sort
   */
  const toggleSort = (
    key: SortKey,
  ) => {
    const existingIndex = activeSorts.findIndex(
      (sort) => sort.key === key,
    );

    if (existingIndex === -1) {
      updateFilters({
        sort: encodeSorts([
          ...activeSorts,
          {
            key,
            dir: SORT_CONFIG[key].defaultDir,
          },
        ]),
      });

      return;
    }

    const existing = activeSorts[existingIndex];
    const defaultDir =
      SORT_CONFIG[key].defaultDir;

    if (existing.dir === defaultDir) {
      const nextSorts = [...activeSorts];

      nextSorts[existingIndex] = {
        ...existing,
        dir:
          defaultDir === "asc"
            ? "desc"
            : "asc",
      };

      updateFilters({
        sort: encodeSorts(nextSorts),
      });

      return;
    }

    updateFilters({
      sort: encodeSorts(
        activeSorts.filter(
          (sort) => sort.key !== key,
        ),
      ),
    });
  };

  const clearFilters = () => {
    updateFilters({
      search: undefined,
      country: undefined,
      region: undefined,
      sort: undefined,
    });
  };

  const getSort = (
    key: SortKey,
  ) =>
    activeSorts.find(
      (sort) => sort.key === key,
    );

  const sortButtonClass = (
    key: SortKey,
  ) => {
    const activeSort = getSort(key);

    return [
      "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
      activeSort
        ? "border-teal-400/60 bg-teal-400/10 text-teal-200 hover:border-teal-300 hover:bg-teal-400/20"
        : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500 hover:bg-slate-700 hover:text-slate-100",
    ].join(" ");
  };

  const sortButtonLabel = (
    key: SortKey,
  ) => {
    const activeSort = getSort(key);

    if (!activeSort) {
      return SORT_CONFIG[key].label;
    }

    const priority =
      activeSorts.findIndex(
        (sort) => sort.key === key,
      ) + 1;

    const direction =
      activeSort.dir === "asc"
        ? "↑"
        : "↓";

    return `${priority} ${SORT_CONFIG[key].label} ${direction}`;
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.country) ||
    Boolean(filters.region) ||
    activeSorts.length > 0;

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="min-w-0 flex-1">
            <span className="sr-only">
              Search wines
            </span>

            <input
              type="search"
              value={filters.search ?? ""}
              onChange={handleSearchChange}
              placeholder="Search wines, regions, producers…"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            />
          </label>

          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              value={filters.country ?? ""}
              onChange={handleCountryChange}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            >
              <option value="">
                All countries
              </option>

              {countries.map((country) => (
                <option
                  key={country}
                  value={country}
                >
                  {country}
                </option>
              ))}
            </select>

            <select
              value={filters.region ?? ""}
              onChange={handleRegionChange}
              disabled={!filters.country}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 disabled:cursor-not-allowed disabled:opacity-45"
            >
              <option value="">
                {filters.country
                  ? "All regions"
                  : "Select country first"}
              </option>

              {uniqueRegions.map((region) => (
                <option
                  key={region}
                  value={region}
                >
                  {region}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-xl border border-slate-700 px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-rose-400/70 hover:bg-rose-950 hover:text-rose-100"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-slate-700 pt-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Sort wines
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Choose multiple fields. Their number sets
                the sorting priority.
              </p>
            </div>

            {activeSorts.length > 0 && (
              <span className="shrink-0 rounded-full border border-teal-400/25 bg-teal-400/10 px-2.5 py-1 text-[10px] font-semibold text-teal-200">
                {activeSorts.length}{" "}
                {activeSorts.length === 1
                  ? "sort active"
                  : "sorts active"}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {SORT_KEYS.map((key) => {
                const activeSort = getSort(key);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleSort(key)}
                    aria-pressed={Boolean(activeSort)}
                    className={sortButtonClass(key)}
                  >
                    {activeSort && (
                      <span
                        aria-hidden="true"
                        className="grid h-4 w-4 place-items-center rounded-full bg-teal-400 text-[9px] font-bold text-slate-950"
                      >
                        {activeSorts.findIndex(
                          (sort) =>
                            sort.key === key,
                        ) + 1}
                      </span>
                    )}

                    <span>
                      {sortButtonLabel(key)}
                    </span>
                  </button>
                );
              },
            )}
          </div>
        </div>
      </div>
    </section>
  );
};