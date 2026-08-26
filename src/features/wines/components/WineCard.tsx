
import {
  WineImageCarousel,
} from "./WineImageCarousel";

import {
  Link,
} from "react-router-dom";
import type {WineCardWine} from "@/features/wines/types";

type WineCardProps = {
  wine: WineCardWine;
};

function toDisplayNumber(
  value: number | string | null | undefined,
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const numberValue =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(numberValue)
    ? numberValue
    : null;
}

export const WineCard = ({
  wine,
}: WineCardProps) => {

  const cheapest = toDisplayNumber(
    wine.best_price,
  );

  const rating = toDisplayNumber(
    wine.rating,
  );

  const ratingsCount = Number(
    wine.ratings_count ?? 0,
  );

  const hasRatings =
    rating !== null &&
    ratingsCount > 0;

  return (
    <article className="h-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70 shadow-sm transition hover:border-teal-400/70 hover:shadow-md">
      <Link
        to={`/wines/${wine.id}`}
        className="group flex h-full min-h-48"
      >
        <div className="w-28 shrink-0 border-r border-slate-700 sm:w-32">
          <WineImageCarousel
            wine={wine}
            className="h-full rounded-none"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-100 transition group-hover:text-teal-200 sm:text-base">
                {wine.name}
              </h2>

              <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                {wine.country}

                {wine.region && (
                  <>
                    {" · "}
                    {wine.region}
                  </>
                )}
              </p>

              {(wine.wine_type || wine.taste) && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {wine.wine_type && (
                    <span className="rounded-full border border-teal-400/25 bg-teal-400/10 px-2 py-0.5 text-[10px] font-semibold capitalize text-teal-200">
                      {wine.wine_type}
                    </span>
                  )}

                  {wine.taste && (
                    <span className="rounded-full border border-slate-600 bg-slate-800 px-2 py-0.5 text-[10px] font-medium capitalize text-slate-300">
                      {wine.taste}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="shrink-0 text-right">
              {hasRatings ? (
                <>
                  <div className="flex items-center justify-end gap-1 text-sm font-bold text-amber-300 sm:text-base">
                    <span aria-hidden="true">
                      ★
                    </span>

                    <span>
                      {rating.toFixed(2)}
                    </span>
                  </div>

                  <p className="mt-0.5 text-[10px] text-slate-500">
                    {ratingsCount}{" "}
                    {ratingsCount === 1
                      ? "rating"
                      : "ratings"}
                  </p>
                </>
              ) : (
                <div className="text-sm text-slate-500">
                  ★ –
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto pt-4">
            {cheapest !== null ? (
              <div className="flex items-end justify-between gap-3 border-t border-slate-700 pt-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Best price
                  </p>

                  <p className="mt-0.5 text-sm font-semibold text-teal-200">
                    {cheapest.toFixed(2)} zł
                  </p>
                </div>

                <span className="text-xs font-medium text-slate-400 transition group-hover:text-teal-200">
                  View wine →
                </span>
              </div>
            ) : (
              <div className="border-t border-slate-700 pt-3">
                <p className="text-xs text-slate-500">
                  No offers available
                </p>
              </div>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
};