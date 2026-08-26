import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  fetchSimilarWines,
} from "@/features/wines/api/similarWinesApi";

import type {
  SimilarWine,
} from "@/features/wines/types";

type SimilarWinesProps = {
  wineId: number;
};

function toDisplayNumber(
  value: number | string | null | undefined,
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const parsedValue =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : null;
}

function formatRatingCount(
  ratingsCount: number,
): string {
  return `${ratingsCount} ${
    ratingsCount === 1
      ? "rating"
      : "ratings"
  }`;
}

export const SimilarWines = ({
  wineId,
}: SimilarWinesProps) => {
  const [similarWines, setSimilarWines] =
    useState<SimilarWine[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!wineId) {
      setSimilarWines([]);
      setIsLoading(false);
      return;
    }

    let isCurrent = true;

    const loadSimilarWines = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const wines = await fetchSimilarWines(
          wineId,
        );

        if (isCurrent) {
          setSimilarWines(wines);
        }
      } catch {
        if (isCurrent) {
          setError(
            "Failed to load similar wines.",
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    void loadSimilarWines();

    return () => {
      isCurrent = false;
    };
  }, [
    wineId,
  ]);

  if (isLoading) {
    return (
      <section className="mt-8 border-t border-slate-700 pt-6">
        <h2 className="text-lg font-semibold text-slate-100">
          Similar wines
        </h2>

        <p className="mt-3 text-sm text-slate-400">
          Looking for similar wines…
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-8 border-t border-slate-700 pt-6">
        <h2 className="text-lg font-semibold text-slate-100">
          Similar wines
        </h2>

        <p className="mt-3 text-sm text-slate-500">
          Similar wine suggestions are unavailable right now.
        </p>
      </section>
    );
  }

  if (!similarWines.length) {
    return (
      <section className="mt-8 border-t border-slate-700 pt-6">
        <h2 className="text-lg font-semibold text-slate-100">
          Similar wines
        </h2>

        <p className="mt-3 text-sm text-slate-500">
          We do not have similar wines yet.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-8 border-t border-slate-700 pt-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-100">
          Similar wines
        </h2>

        <span className="text-xs text-slate-500">
          {similarWines.length}{" "}
          {similarWines.length === 1
            ? "suggestion"
            : "suggestions"}
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {similarWines.map((wine) => {
          const rating = toDisplayNumber(
            wine.rating,
          );

          const bestPrice = toDisplayNumber(
            wine.best_price,
          );

          const ratingsCount = Number(
            wine.ratings_count ?? 0,
          );

          const hasRating =
            rating !== null &&
            ratingsCount > 0;

          return (
            <Link
              key={wine.id}
              to={`/wines/${wine.id}`}
              className="group rounded-xl border border-slate-700/70 bg-slate-900/60 p-3 text-sm shadow-sm transition-colors hover:border-teal-400 hover:bg-slate-900 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="line-clamp-2 font-semibold text-slate-50 transition group-hover:text-teal-200">
                    {wine.name}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    {hasRating ? (
                      <>
                        <span className="font-semibold text-amber-300">
                          ★ {rating.toFixed(2)}
                        </span>

                        <span className="text-slate-500">
                          {formatRatingCount(
                            ratingsCount,
                          )}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-500">
                        No ratings yet
                      </span>
                    )}
                  </div>
                </div>

                {bestPrice !== null && (
                  <div className="shrink-0 text-right">
                    <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                      From
                    </span>

                    <span className="block text-sm font-semibold text-teal-200">
                      {bestPrice.toFixed(2)} zł
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs text-slate-300/80">
                {wine.country}

                {wine.region && (
                  <>
                    {" · "}
                    {wine.region}
                  </>
                )}
              </div>

              {wine.type_of_wine && (
                <div className="mt-2 inline-flex items-center rounded-full bg-slate-800/80 px-2 py-0.5 text-[11px] text-teal-200">
                  {wine.type_of_wine}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
};