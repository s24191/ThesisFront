import {client} from "@/shared/api/client";
import type {WineComment} from "@/features/wines/types";
import {AxiosError} from "axios";

export type SaveWineCommentPayload = {
  rating: number;
  text: string;
};

const wineCommentRoutes = {
  list: (
    wineId: number,
  ) => `/wines/${wineId}/comments`,

  mine: (
    wineId: number,
  ) => `/wines/${wineId}/comments/me`,
} as const;

export const fetchWineComments = async (
  wineId: number,
): Promise<WineComment[]> => {
  const response = await client.get<
    WineComment[]
  >(
    wineCommentRoutes.list(wineId),
  );

  return response.data;
};

export const saveWineComment = async (
  wineId: number,
  payload: SaveWineCommentPayload,
): Promise<WineComment> => {
  const response = await client.post<
    WineComment
  >(
    wineCommentRoutes.list(wineId),
    payload,
  );

  return response.data;
};

export const deleteMyWineComment = async (
  wineId: number,
): Promise<void> => {
  try {
    await client.delete(
      wineCommentRoutes.mine(wineId),
    );
  } catch (error) {
    if (
      error instanceof AxiosError &&
      error.response?.status === 404
    ) {
      return;
    }

    throw error;
  }
};