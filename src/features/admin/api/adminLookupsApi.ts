import type {
  Country,
  CreateCountryPayload,
  CreateRegionPayload, CreateWinePayload, CreateWineTypePayload,
  Region, TasteProfile,
  UpdateCountryPayload, UpdateRegionPayload, UpdateWinePayload, UpdateWineTypePayload,
  Wine,
  WineType
} from "@/features/admin/types";
import {client} from "@/shared/api/client.ts";
import type {WineFilters} from "@/features/wines/types";

export const adminLookupsApi = {
  listCountries: async (): Promise<Country[]> => {
    const response = await client.get<Country[]>(
      "/admin/countries",
    );

    return response.data;
  },

  createCountry: async (
    payload: CreateCountryPayload,
  ): Promise<Country> => {
    const response = await client.post<Country>(
      "/admin/countries",
      payload,
    );

    return response.data;
  },

  updateCountry: async (
    id: number,
    payload: UpdateCountryPayload,
  ): Promise<Country> => {
    const response = await client.patch<Country>(
      `/admin/countries/${id}`,
      payload,
    );

    return response.data;
  },

  deleteCountry: async (
    id: number,
  ): Promise<void> => {
    await client.delete(
      `/admin/countries/${id}`,
    );
  },

  listRegions: async (): Promise<Region[]> => {
    const response = await client.get<Region[]>(
      "/admin/regions",
    );

    return response.data;
  },

  createRegion: async (
    payload: CreateRegionPayload,
  ): Promise<Region> => {
    const response = await client.post<Region>(
      "/admin/regions",
      payload,
    );

    return response.data;
  },

  updateRegion: async (
    id: number,
    payload: UpdateRegionPayload,
  ): Promise<Region> => {
    const response = await client.patch<Region>(
      `/admin/regions/${id}`,
      payload,
    );

    return response.data;
  },

  deleteRegion: async (
    id: number,
  ): Promise<void> => {
    await client.delete(
      `/admin/regions/${id}`,
    );
  },

  listWineTypes: async (): Promise<WineType[]> => {
    const response = await client.get<WineType[]>(
      "/admin/wine-types",
    );

    return response.data;
  },

  createWineType: async (
    payload: CreateWineTypePayload,
  ): Promise<WineType> => {
    const response = await client.post<WineType>(
      "/admin/wine-types",
      payload,
    );

    return response.data;
  },

  updateWineType: async (
    id: number,
    payload: UpdateWineTypePayload,
  ): Promise<WineType> => {
    const response = await client.patch<WineType>(
      `/admin/wine-types/${id}`,
      payload,
    );

    return response.data;
  },

  deleteWineType: async (
    id: number,
  ): Promise<void> => {
    await client.delete(
      `/admin/wine-types/${id}`,
    );
  },

  listTasteProfiles: async (): Promise<
    TasteProfile[]
  > => {
    const response = await client.get<
      TasteProfile[]
    >("/admin/taste-profiles");

    return response.data;
  },

  listWines: async (
    params?: WineFilters & {
      limit?: number;
      offset?: number;
    },
  ): Promise<Wine[]> => {
    const response = await client.get<Wine[]>(
      "/admin/wines",
      {
        params,
      },
    );

    return response.data;
  },

  createWine: async (
    payload: CreateWinePayload,
  ): Promise<Wine> => {
    const response = await client.post<Wine>(
      "/admin/wines",
      payload,
    );

    return response.data;
  },

  updateWine: async (
    id: number,
    payload: UpdateWinePayload,
  ): Promise<Wine> => {
    const response = await client.patch<Wine>(
      `/admin/wines/${id}`,
      payload,
    );

    return response.data;
  },

  deleteWine: async (
    id: number,
  ): Promise<void> => {
    await client.delete(
      `/admin/wines/${id}`,
    );
  },
};