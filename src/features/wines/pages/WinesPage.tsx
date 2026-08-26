import {useEffect, useState,} from "react";
import {useSearchParams,} from "react-router-dom";
import {fetchWines,} from "@/features/wines/api";
import {WineFiltersBar,} from "@/features/wines/components/WineFiltersBar";
import {WineList,} from "@/features/wines/components/WineList";
import type {WineCardWine, WineFilters,} from "@/features/wines/types";

const PAGE_SIZE_OPTIONS = [
  10,
  25,
  50,
  100,
] as const;

type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

const isPageSize = (
  value: number,
): value is PageSize =>
  PAGE_SIZE_OPTIONS.includes(
    value as PageSize,
  );

const getPositiveInteger = (
  value: string | null,
  fallback: number,
): number => {
  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) &&
    parsedValue > 0
    ? parsedValue
    : fallback;
};

const getPageSize = (
  value: string | null,
): PageSize => {
  const parsedValue = Number(value);

  return isPageSize(parsedValue)
    ? parsedValue
    : 25;
};

export const WinesPage = () => {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [wines, setWines] = useState<
    WineCardWine[]
  >([]);

  const [filters, setFilters] = useState<
    WineFilters
  >(() => ({
    search:
      searchParams.get("search") ?? undefined,

    sort:
      searchParams.get("sort") ?? undefined,

    country:
      searchParams.get("country") ?? undefined,

    region:
      searchParams.get("region") ?? undefined,
  }));

  const [page, setPage] = useState(() =>
    getPositiveInteger(
      searchParams.get("page"),
      1,
    ),
  );

  const [pageSize, setPageSize] = useState<
    PageSize
  >(() =>
    getPageSize(
      searchParams.get("pageSize"),
    ),
  );

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    const nextSearchParams =
      new URLSearchParams();

    if (filters.search) {
      nextSearchParams.set(
        "search",
        filters.search,
      );
    }

    if (filters.sort) {
      nextSearchParams.set(
        "sort",
        filters.sort,
      );
    }

    if (filters.country) {
      nextSearchParams.set(
        "country",
        filters.country,
      );
    }

    if (filters.region) {
      nextSearchParams.set(
        "region",
        filters.region,
      );
    }

    nextSearchParams.set(
      "page",
      String(page),
    );

    nextSearchParams.set(
      "pageSize",
      String(pageSize),
    );

    setSearchParams(
      nextSearchParams,
      {
        replace: true,
      },
    );
  }, [
    filters,
    page,
    pageSize,
    setSearchParams,
  ]);

  useEffect(() => {
    let isCurrent = true;

    const loadWines = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchWines({
          ...filters,
          page,
          pageSize,
        });

        if (isCurrent) {
          setWines(data);
        }
      } catch {
        if (isCurrent) {
          setError(
            "We couldn’t load the wines. Please try again.",
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    void loadWines();

    return () => {
      isCurrent = false;
    };
  }, [
    filters,
    page,
    pageSize,
  ]);

  const retryLoadWines = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await fetchWines({
        ...filters,
        page,
        pageSize,
      });

      setWines(data);
    } catch {
      setError(
        "We couldn’t load the wines. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isFirstPage = page === 1;
  const isLastPage =
    wines.length < pageSize;
  const hasWines = wines.length > 0;
  const handleFiltersChange = (
    nextFilters: WineFilters,
  ) => {
    setPage(1);
    setFilters(nextFilters);
  };
  const handlePageSizeChange = (
    nextPageSize: PageSize,
  ) => {
    setPage(1);
    setPageSize(nextPageSize);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
              Explore the collection
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
              Wines
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Browse wines, compare offers, and sort
              the collection around the details that
              matter to you.
            </p>
          </div>

          {!isLoading && !error && (
            <div className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-400">
              <span className="font-semibold text-slate-100">
                {wines.length}
              </span>
              {" "}
              {wines.length === 1
                ? "wine on this page"
                : "wines on this page"}
            </div>
          )}
        </header>

        <WineFiltersBar
          value={filters}
          onChange={handleFiltersChange}
        />

        <section
          aria-label="Wine list controls"
          className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-3 sm:mt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <span>
              Wines per page
            </span>

            <select
              value={pageSize}
              onChange={(event) => {
                handlePageSizeChange(
                  Number(
                    event.target.value,
                  ) as PageSize,
                );
              }}
              className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-sm font-medium text-slate-100 transition focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            >
              {PAGE_SIZE_OPTIONS.map(
                (option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ),
              )}
            </select>
          </label>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <p className="text-sm text-slate-400">
              Page{" "}

              <span className="font-semibold text-slate-100">
                {page}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={
                  isFirstPage ||
                  isLoading
                }
                onClick={() => {
                  setPage((currentPage) =>
                    Math.max(
                      1,
                      currentPage - 1,
                    ),
                  );
                }}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm font-semibold text-slate-200 transition hover:border-teal-400/60 hover:bg-slate-700 hover:text-teal-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Previous
              </button>

              <button
                type="button"
                disabled={
                  isLoading ||
                  !hasWines ||
                  isLastPage
                }
                onClick={() => {
                  setPage(
                    (currentPage) =>
                      currentPage + 1,
                  );
                }}
                className="rounded-lg border border-teal-400/50 bg-teal-400/10 px-3 py-1.5 text-sm font-semibold text-teal-200 transition hover:border-teal-300 hover:bg-teal-400 hover:text-slate-950 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:opacity-60"
              >
                Next →
              </button>
            </div>
          </div>
        </section>

        {error && (
          <section
            role="alert"
            className="mt-6 rounded-2xl border border-rose-400/40 bg-rose-950/40 p-4 text-sm text-rose-100"
          >
            <p className="font-semibold">
              We couldn’t load the wines.
            </p>

            <p className="mt-1 text-rose-200/80">
              {error}
            </p>

            <button
              type="button"
              onClick={() => {
                void retryLoadWines();
              }}
              className="mt-3 rounded-lg border border-rose-300/50 px-3 py-1.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-400 hover:text-slate-950"
            >
              Try again
            </button>
          </section>
        )}

        {isLoading && (
          <section
            aria-live="polite"
            className="mt-6 grid min-h-60 place-items-center rounded-2xl border border-slate-700 bg-slate-900/50 p-6"
          >
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span
                aria-hidden="true"
                className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-teal-300"
              />

              Loading wines…
            </div>
          </section>
        )}

        {!isLoading && !error && (
          <section className="mt-6">
            <WineList wines={wines} />
          </section>
        )}
      </div>
    </main>
  );
};