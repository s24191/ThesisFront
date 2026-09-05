import {client} from "@/shared/api/client";
import type {WineCardWine, WineFilters} from "@/features/wines/types";


const WINE_ROUTES = {
  list: "/wines",

  countries:
    "/wines/countries",

  regions:
    "/wines/regions",
} as const;

export const fetchWines = async (
  filters: WineFilters = {},
): Promise<WineCardWine[]> => {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 50;
  const normalizedSearch =
  filters.search?.trim() || undefined;
  const response = await client.get<
    WineCardWine[]
  >(
    WINE_ROUTES.list,
    {
      params: {
        search: normalizedSearch,
        country: filters.country,
        region: filters.region,
        sort: filters.sort,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      },
    },
  );

  return response.data;
};

export const fetchCountries = async (): Promise<
  string[]
> => {
  const response = await client.get<string[]>(
    WINE_ROUTES.countries,
  );

  return response.data;
};

export const fetchRegions = async (
  country?: string,
): Promise<string[]> => {
  const response = await client.get<string[]>(
    WINE_ROUTES.regions,
    {
      params: {
        country,
      },
    },
  );

  return response.data;
};