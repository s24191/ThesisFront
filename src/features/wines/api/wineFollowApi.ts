import {client} from "@/shared/api/client";

const wineFollowRoutes = {
  status: (
    wineId: number,
  ) => `/wines/${wineId}/follow`,
} as const;

export const wineFollowApi = {
  async getStatus(
    wineId: number,
  ): Promise<boolean> {
    const response = await client.get<boolean>(
      wineFollowRoutes.status(wineId),
    );

    return response.data;
  },

  async follow(
    wineId: number,
  ): Promise<void> {
    await client.post(
      wineFollowRoutes.status(wineId),
    );
  },

  async unfollow(
    wineId: number,
  ): Promise<void> {
    await client.delete(
      wineFollowRoutes.status(wineId),
    );
  },
};