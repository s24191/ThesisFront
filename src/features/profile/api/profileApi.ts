import {client,} from "@/shared/api/client";
import type {MyComment,} from "@/features/wines/types";
import type {FollowedWine} from "@/features/profile/types/types.ts";

export const profileApi = {
  async getFollowedWines(): Promise<
    FollowedWine[]
  > {
    const response = await client.get<
      FollowedWine[]
    >("/wines/me/followed");

    return response.data;
  },

  async getComments(): Promise<MyComment[]> {
    const response = await client.get<
      MyComment[]
    >("/wines/me/comments");

    return response.data;
  },
};