import React from "react";
import {useParams} from "react-router-dom";
import { WineComments } from "@/features/wines/components/WineComments.tsx";
import {WineRatingSummary} from "@/features/wines/components/WineRatingSummary.tsx";
import { useAuthStore } from "@/store/authStore.ts";
import {FollowWineButton} from "@/features/wines/components/FollowWineButton.tsx";
import { WineTasteSection } from "@/features/wines/components/WineTasteSection.tsx";
import { WineNotesSection } from "@/features/wines/components/WineNotesSection";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

type WineOffer = {
  shop_name: string;
  shop_url: string;
  price: number;
  image_url?: string | null;
};

type Wine = {
  id: number;
  name: string;
  year?: number | null;
  country: string;
  region?: string | null;
  type_of_wine: string;
  taste: string;
  grapes?: string | null;
  alc_perc?: number | null;
  capacity_ml?: number | null;
  rating?: number | null;
  ratings_count?: number | null;
  offers: WineOffer[];
};

type SimilarWine = {
  id: number;
  name: string;
  country: string;
  region?: string | null;
  type_of_wine?: string | null;
};


// --------- Static  for now ---------

const STATIC_TASTE = {
  food: ["grilled steak", "hard cheese", "roast lamb"],
};


// --------- Small UI components ---------

const WineImageCarousel: React.FC<{ wine: Wine }> = ({ wine }) => {
  const images = React.useMemo(
    () =>
      Array.from(
        new Set(
          (wine.offers || [])
            .map((o) => o.image_url)
            .filter((u): u is string => !!u)
        )
      ),
    [wine.offers]
  );

  const [index, setIndex] = React.useState(0);
  const [hoverZone, setHoverZone] = React.useState<"left" | "right" | null>(
    null
  );

  const FALLBACK =
    "https://via.placeholder.com/320x480?text=No+Image";

  if (images.length === 0) {
    return (
      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">
        No image
      </div>
    );
  }

  const goPrev = () =>
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const goNext = () =>
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 2) goPrev();
    else goNext();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const zone =
      x < rect.width / 3
        ? "left"
        : x > (2 * rect.width) / 3
        ? "right"
        : null;
    setHoverZone(zone);
  };

  return (
    <div
      className="relative w-full aspect-[2/3] overflow-hidden rounded-lg cursor-pointer"
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverZone(null)}
    >
      <img
        src={images[index]}
        alt={wine.name}
        className="h-full w-full object-cover"
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = FALLBACK;
        }}
      />
      {hoverZone === "left" && images.length > 1 && (
        <button
          type="button"
          className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white text-xl hover:bg-black/70 hover:scale-105"
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
        >
          ‹
        </button>
      )}
      {hoverZone === "right" && images.length > 1 && (
        <button
          type="button"
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white text-xl hover:bg-black/70 hover:scale-105"
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
        >
          ›
        </button>
      )}
    </div>
  );
};

// --------- Main page component ---------
type RatingBucket = { rating: number; count: number };

export const WinePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const wineId = Number(id);

  const [wine, setWine] = React.useState<Wine | null>(null);
  const [similar, setSimilar] = React.useState<SimilarWine[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [ratingSummary, setRatingSummary] = React.useState<RatingBucket[]>([]);
  const token = useAuthStore((s) => s.token);
  const isLoggedIn = !!token;

  React.useEffect(() => {
    if (!wineId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);


        const [wineRes, similarRes] = await Promise.all([
          fetch(`${API_URL}/wines/${wineId}/detail`),
          fetch(`${API_URL}/wines/${wineId}/similar`),
        ]);

        if (!wineRes.ok) {
          throw new Error(`Wine request failed: ${wineRes.status}`);
        }
        const wineJson = (await wineRes.json()) as Wine;

        let similarJson: SimilarWine[] = [];
        if (similarRes.ok) {
          similarJson = (await similarRes.json()) as SimilarWine[];
        }

        setWine(wineJson);
        setSimilar(similarJson);
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [wineId]);

  React.useEffect(() => {
  if (!wineId) return;

  const loadSummary = async () => {
    try {
      const res = await fetch(`${API_URL}/wines/${wineId}/rating-summary`);
      if (!res.ok) return;
      const data = (await res.json()) as RatingBucket[];
      setRatingSummary(data);
    } catch (e) {
      console.error(e);
    }
  };

  loadSummary();
}, [wineId]);

  if (loading) {
    return <div className="p-4 text-sm">Loading…</div>;
  }

  if (error || !wine) {
    return (
      <div className="p-4 text-sm text-red-600">
        Failed to load wine: {error ?? "not found"}
      </div>
    );
  }

  const hasOffers = Array.isArray(wine.offers) && wine.offers.length > 0;
const cheapest =
  hasOffers
    ? wine.offers!.reduce(
        (min, o) => (min === null || o.price < min ? o.price : min),
        null as number | null
      )
    : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Top: image + main details */}
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="md:w-1/3">
          <WineImageCarousel wine={wine} />
        </div>

        <div className="md:w-2/3 flex flex-col gap-3">
          <h1 className="text-2xl font-semibold mb-2">
            {wine.name}
          </h1>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-gray-600">
              {wine.year ? `${wine.year} • ` : ""}
              {wine.country}
              {wine.region ? `, ${wine.region}` : ""}
            </span>
            {wine.id && <FollowWineButton wineId={wine.id} isLoggedIn={isLoggedIn} token={token} />}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
            <div>
              <span className="font-medium">Style: </span>
              <span>
                {wine.type_of_wine}, {wine.taste}
              </span>
            </div>
            {wine.grapes && (
              <div>
                <span className="font-medium">Grapes: </span>
                <span>{wine.grapes}</span>
              </div>
            )}
            {wine.alc_perc && (
              <div>
                <span className="font-medium">Alcohol: </span>
                <span>{wine.alc_perc}%</span>
              </div>
            )}
            {wine.capacity_ml && (
              <div>
                <span className="font-medium">Volume: </span>
                <span>{wine.capacity_ml} ml</span>
              </div>
            )}
            {wine.rating && (
              <div>
                <span className="font-medium">Rating: </span>
                <span>
                  {wine.rating.toFixed(1)} ({wine.ratings_count ?? 0} ratings)
                </span>
              </div>
            )}
          </div>

          <div className="mt-3">
            <h2 className="text-sm font-semibold">Where to buy</h2>
            {!hasOffers ? (
              <p className="mt-1 text-xs text-gray-500">No offers available.</p>
            ) : (
              <ul className="mt-1 space-y-1 text-sm">
                {wine.offers!.map((offer) => (
                  <li
                    key={offer.shop_name + offer.shop_url}
                    className="flex items-center justify-between"
                  >
                    <span>{offer.shop_name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">
                        {offer.price.toFixed(2)} zł
                      </span>
                      <a
                        href={offer.shop_url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
                      >
                        Go to shop
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {cheapest !== null && (
              <p className="mt-1 text-xs text-gray-500">
                Best price: {cheapest.toFixed(2)} zł
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Taste profile */}
      <section className="mt-8 border-t pt-6">
        <WineTasteSection wineId={wine.id} />
        <WineNotesSection wineId={wine.id} />
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-1">Food pairings</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {STATIC_TASTE.food.map((f) => (
              <span
                key={f}
                className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-900"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Similar wines */}
      <section className="mt-8 border-t pt-6">
        <h2 className="text-lg font-semibold mb-3">Similar wines</h2>
        {similar.length === 0 ? (
          <p className="text-sm text-gray-500">
            We do not have similar wines yet.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {similar.map((w) => (
              <a
                key={w.id}
                href={`/wines/${w.id}`}
                className="group rounded-xl border border-slate-700/70 bg-slate-900/60 p-3 text-sm shadow-sm
                           hover:border-emerald-400 hover:bg-slate-900 hover:shadow-md transition-colors"
              >
                <div className="font-semibold text-slate-50 group-hover:text-emerald-200 line-clamp-2">
                  {w.name}
                </div>
                <div className="mt-1 text-xs text-slate-300/80">
                  {w.country}
                  {w.region && <> · {w.region}</>}
                </div>
                {w.type_of_wine && (
                  <div className="mt-2 inline-flex items-center rounded-full bg-slate-800/80 px-2 py-0.5 text-[11px] text-emerald-200">
                    {w.type_of_wine}
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </section>
      {wine && (
        <>
          <WineRatingSummary buckets={ratingSummary} />
          <WineComments wineId={wine.id} />
        </>
      )}
    </div>
  );
};
