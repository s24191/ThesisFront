import {client} from "@/shared/api/client";
import type {RatingBucket, WineDetails,} from "@/features/wines/types";

const wineDetailsRoutes = {
  detail: (
    wineId: number,
  ) => `/wines/${wineId}/detail`,

  ratingSummary: (
    wineId: number,
  ) => `/wines/${wineId}/rating-summary`,
} as const;

export const fetchWineDetails = async (
  wineId: number,
): Promise<WineDetails> => {
  const response = await client.get<
    WineDetails
  >(
    wineDetailsRoutes.detail(wineId),
  );

  return response.data;
};

export const fetchWineRatingSummary = async (
  wineId: number,
): Promise<RatingBucket[]> => {
  const response = await client.get<
    RatingBucket[]
  >(
    wineDetailsRoutes.ratingSummary(wineId),
  );

  return response.data;
};