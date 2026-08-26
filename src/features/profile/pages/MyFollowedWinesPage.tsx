import {
  useEffect,
  useState,
} from "react";

import {
  WineCard,
} from "@/features/wines/components/WineCard";

import {
  profileApi,
} from "@/features/profile/api/profileApi";

import type {
  WineCardWine,
} from "@/features/wines/types";

export const MyFollowedWinesPage = () => {
  const [wines, setWines] = useState<
    WineCardWine[]
  >([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const loadFollowedWines = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await profileApi.getFollowedWines();

        setWines(data);
      } catch {
        setError(
          "Failed to load followed wines.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadFollowedWines();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="mb-6 sm:mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">
            Your collection
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl">
            Followed wines
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Keep an eye on bottles you want to revisit,
            compare, or buy later.
          </p>
        </header>

        {isLoading && (
          <section className="grid min-h-60 place-items-center rounded-2xl border border-slate-700 bg-slate-900/50 p-6">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span
                aria-hidden="true"
                className="h-5 w-5 animate-spin rounded-full border-2 border-slate-600 border-t-teal-300"
              />

              Loading followed wines…
            </div>
          </section>
        )}

        {error && (
          <section
            role="alert"
            className="rounded-2xl border border-rose-400/40 bg-rose-950/40 p-4 text-sm text-rose-100"
          >
            <p className="font-semibold">
              We couldn’t load your wines.
            </p>

            <p className="mt-1 text-rose-200/80">
              {error}
            </p>
          </section>
        )}

        {!isLoading && !error && wines.length === 0 && (
          <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 px-6 py-14 text-center">
            <p className="text-base font-semibold text-slate-200">
              No followed wines yet
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Browse the catalogue and follow wines you
              want to find again.
            </p>
          </section>
        )}

        {!isLoading && !error && wines.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {wines.map((wine) => (
              <WineCard
                key={wine.id}
                wine={wine}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};