import {useEffect, useState,} from "react";
import {useParams,} from "react-router-dom";
import {useAuthStore,} from "@/features/auth/store/authStore";
import {fetchWineDetails, fetchWineRatingSummary,} from "@/features/wines/api/wineDetailsApi";
import {FollowWineButton,} from "@/features/wines/components/FollowWineButton";
import {SimilarWines,} from "@/features/wines/components/SimilarWines";
import {WineComments,} from "@/features/wines/components/WineComments";
import {WineImageCarousel,} from "@/features/wines/components/WineImageCarousel";
import {WineNotesSection,} from "@/features/wines/components/WineNotesSection";
import {WineRatingSummary,} from "@/features/wines/components/WineRatingSummary";
import {WineTasteSection,} from "@/features/wines/components/WineTasteSection";
import type {RatingBucket, WineDetails,} from "@/features/wines/types";

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

export const WineDetailsPage = () => {
  const {
    id,
  } = useParams<{
    id: string;
  }>();

  const wineId = Number(id);

  const user = useAuthStore(
    (state) => state.user,
  );

  const isAuthenticated = Boolean(user);

  const [wine, setWine] = useState<
    WineDetails | null
  >(null);

  const [ratingSummary, setRatingSummary] =
    useState<RatingBucket[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (
      !Number.isInteger(wineId) ||
      wineId <= 0
    ) {
      setWine(null);
      setRatingSummary([]);
      setError("This wine address is invalid.");
      setIsLoading(false);

      return;
    }

    let isCurrent = true;

    const loadWine = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [
          wineDetails,
          ratingSummaryResult,
        ] = await Promise.all([
          fetchWineDetails(wineId),
          fetchWineRatingSummary(wineId).catch(
            () => [],
          ),
        ]);

        if (!isCurrent) {
          return;
        }

        setWine(wineDetails);
        setRatingSummary(ratingSummaryResult);
      } catch {
        if (isCurrent) {
          setWine(null);
          setRatingSummary([]);

          setError(
            "We couldn’t load this wine. It may no longer be available.",
          );
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    };

    void loadWine();

    return () => {
      isCurrent = false;
    };
  }, [
    wineId,
  ]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto grid min-h-[calc(100vh-65px)] max-w-5xl place-items-center px-4 py-10">
          <div
            aria-live="polite"
            className="flex items-center gap-3 text-sm text-slate-400"
          >
            <span
              aria-hidden="true"
              className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-teal-300"
            />

            Loading wine…
          </div>
        </div>
      </main>
    );
  }

  if (error || !wine) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-5xl px-4 py-10">
          <section
            role="alert"
            className="rounded-2xl border border-rose-400/40 bg-rose-950/40 p-5 text-sm text-rose-100"
          >
            <h1 className="text-lg font-bold">
              Wine unavailable
            </h1>

            <p className="mt-2 leading-6 text-rose-200/80">
              {error ??
                "We couldn’t find this wine."}
            </p>
          </section>
        </div>
      </main>
    );
  }

  const offers = Array.isArray(wine.offers)
    ? wine.offers
    : [];

  const availableOffers = offers.filter(
    (offer) => offer.available,
  );

  const cheapestPrice = availableOffers.reduce<number | null>(
    (currentLowestPrice, offer) => {
      const offerPrice = toDisplayNumber(offer.price);

      if (offerPrice === null) {
        return currentLowestPrice;
      }

      return currentLowestPrice === null || offerPrice < currentLowestPrice
        ? offerPrice
        : currentLowestPrice;
    },
    null,
  );

  const hasRetailerOffers = offers.length > 0;
  const isAvailable = availableOffers.length > 0;

  const wineRating = toDisplayNumber(
    wine.rating,
  );

  const ratingsCount = Number(
    wine.ratings_count ?? 0,
  );

  const hasRating =
    wineRating !== null &&
    ratingsCount > 0;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-5 md:flex-row">
            <div className="w-full shrink-0 md:w-72">
              <WineImageCarousel
                wine={wine}
                className="border border-slate-700 shadow-sm"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h1 className="text-2xl font-semibold leading-tight text-slate-50 sm:text-3xl">
                      {wine.name}
                    </h1>

                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-400">
                      {wine.year && (
                        <span>
                          {wine.year}
                        </span>
                      )}

                      {wine.year && (
                        <span
                          aria-hidden="true"
                          className="text-slate-600"
                        >
                          •
                        </span>
                      )}

                      <span>
                        {wine.country}
                      </span>

                      {wine.region && (
                        <>
                          <span
                            aria-hidden="true"
                            className="text-slate-600"
                          >
                            •
                          </span>

                          <span>
                            {wine.region}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <FollowWineButton
                      wineId={wine.id}
                      isLoggedIn={isAuthenticated}
                    />

                    {hasRating && (
                      <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-right">
                        <div className="flex items-center justify-end gap-1 text-lg font-bold text-amber-300">
                          <span aria-hidden="true">
                            ★
                          </span>

                          <span>
                            {wineRating.toFixed(2)}
                          </span>
                        </div>

                        <p className="mt-0.5 text-[10px] text-amber-100/70">
                          {ratingsCount}{" "}
                          {ratingsCount === 1
                            ? "rating"
                            : "ratings"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-5 grid gap-2 sm:grid-cols-2">
                {(wine.type_of_wine || wine.taste) && (
                  <div className="rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2">
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Style
                    </span>

                    <span className="mt-1 block text-sm font-medium text-slate-200">
                      {wine.type_of_wine ?? "–"}

                      {wine.taste
                        ? ` · ${wine.taste}`
                        : ""}
                    </span>
                  </div>
                )}

                {wine.grapes && (
                  <div className="rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2">
                    <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      Grapes
                    </span>

                    <span className="mt-1 block text-sm font-medium text-slate-200">
                      {wine.grapes}
                    </span>
                  </div>
                )}

                {wine.alc_perc !== null &&
                  wine.alc_perc !== undefined && (
                    <div className="rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2">
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Alcohol
                      </span>

                      <span className="mt-1 block text-sm font-medium text-slate-200">
                        {wine.alc_perc}%
                      </span>
                    </div>
                  )}

                {wine.capacity_ml !== null &&
                  wine.capacity_ml !== undefined && (
                    <div className="rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2">
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Volume
                      </span>

                      <span className="mt-1 block text-sm font-medium text-slate-200">
                        {wine.capacity_ml} ml
                      </span>
                    </div>
                  )}
              </div>

              <div className="border-t border-slate-700 pt-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-100">
                      Where to buy
                    </h2>

                    {isAvailable ? (
                      <p className="mt-0.5 text-xs text-slate-500">
                        Best price{" "}

                        <span className="font-semibold text-teal-200">
                          {cheapestPrice?.toFixed(2)} zł
                        </span>
                      </p>
                    ): hasRetailerOffers ? (
                      <p className="font-semibold text-slate-400">
                        Unavailable
                      </p>) : null}
                  </div>

                  {hasRetailerOffers && (
                    <span className="rounded-full border border-slate-600 bg-slate-800 px-2.5 py-1 text-xs text-slate-400">
                      {offers.length}{" "}
                      {offers.length === 1 ? "offer" : "offers"}
                    </span>
                  )}
                </div>

                {!offers.length ? (
                  <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-4 py-4 text-center">
                    <p className="text-sm text-slate-400">
                      No offers are available for this wine.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {offers.map((offer) => {
                      const offerPrice =
                        toDisplayNumber(
                          offer.price,
                        );

                      return (
                        <li
                          key={`${offer.shop_name}-${offer.shop_url}`}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2.5"
                        >
                          <span className="text-sm font-medium text-slate-200">
                            {offer.shop_name}
                          </span>

                          <div className="flex items-center gap-3">
                            {offer.available ? (
                              <>
                                {offerPrice !== null && (
                                  <span className="text-sm font-semibold text-teal-200">
                                    {offerPrice.toFixed(2)} zł
                                  </span>
                                )}

                                <a
                                  href={offer.shop_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center rounded-full border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:border-teal-400 hover:bg-teal-400 hover:text-slate-950"
                                >
                                  Go to shop
                                </a>
                              </>
                            ) : (
                              <span className="text-sm font-semibold text-slate-400">
                                Unavailable
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 border-t border-slate-700 pt-6">
          <WineTasteSection
            wineId={wine.id}
          />

          <WineNotesSection
            wineId={wine.id}
          />
        </section>

        <SimilarWines
          wineId={wine.id}
        />

        <WineRatingSummary
          buckets={ratingSummary}
        />

        <WineComments
          wineId={wine.id}
        />
      </div>
    </main>
  );
};