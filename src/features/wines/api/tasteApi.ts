import {client} from "@/shared/api/client";
import type {WineTasteSummary, WineTasteVote,} from "@/features/wines/types";

const wineTasteRoutes = {
  summary: (
    wineId: number,
  ) => `/wines/${wineId}/taste-summary`,

  mine: (
    wineId: number,
  ) => `/wines/${wineId}/taste/me`,

  vote: (
    wineId: number,
  ) => `/wines/${wineId}/taste`,
} as const;

export const fetchTasteSummary = async (
  wineId: number,
): Promise<WineTasteSummary> => {
  const response = await client.get<
    WineTasteSummary
  >(
    wineTasteRoutes.summary(wineId),
  );

  return response.data;
};

export const fetchMyTasteVote = async (
  wineId: number,
): Promise<WineTasteVote | null> => {

  const response = await client.get<
    WineTasteVote | null
  >(
    wineTasteRoutes.mine(wineId),
  );

  return response.data;
};

export const upsertMyTasteVote = async (
  wineId: number,
  payload: WineTasteVote,
): Promise<WineTasteVote> => {
  const response = await client.put<
    WineTasteVote
  >(
    wineTasteRoutes.vote(wineId),
    payload,
  );

  return response.data;
};