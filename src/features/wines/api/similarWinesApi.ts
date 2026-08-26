import {client} from "@/shared/api/client";
import type {SimilarWine} from "@/features/wines/types";

const similarWineRoutes = {
  list: (
    wineId: number,
  ) => `/wines/${wineId}/similar`,
} as const;

export const fetchSimilarWines = async (
  wineId: number,
): Promise<SimilarWine[]> => {
  const response = await client.get<
    SimilarWine[]
  >(
    similarWineRoutes.list(wineId),
  );

  return response.data;
};