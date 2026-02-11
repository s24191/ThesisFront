import React, { useEffect, useState } from "react";
import { fetchFollowedWines } from "@/features/wines/api";
import type { FollowedWine } from "@/features/wines/types";
import { useAuthStore } from "@/store/authStore";
import { WineCard } from "@/features/wines/components/WineCard";

export const MyFollowedWinesPage: React.FC = () => {
  const token = useAuthStore((s) => s.token);
  const [wines, setWines] = useState<FollowedWine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await fetchFollowedWines(token);
        setWines(data);
      } catch (e: any) {
        setError(e.message ?? "Failed to load followed wines");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [token]);

  if (!token) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">My followed wines</h1>
        <p className="text-sm text-gray-600">
          Please log in to see wines you follow.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-4">My followed wines</h1>

      {isLoading && <p className="mt-2 text-sm">Loading...</p>}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {!isLoading && !error && wines.length === 0 && (
        <p className="mt-2 text-sm text-gray-600">
          You are not following any wines yet.
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {wines.map((wine) => (
          <WineCard
            key={wine.id}
            wine={{
              id: wine.id,
              name: wine.name,
              country: wine.country,
              region: wine.region ?? undefined,
              rating: wine.rating ?? undefined,
              ratings_count: wine.ratings_count ?? undefined,
              best_price: wine.best_price ?? undefined,
              image_url: wine.image_url ?? undefined,
            }}
          />
        ))}
      </div>
    </div>
  );
};
