export type Country = {
  id: number;
  name: string;
};

export type Region = {
  id: number;
  name: string;
  country_id: number;
};

export type WineType = {
  id: number;
  name: string;
};

export type TasteProfile = {
  id: number;
  name: string;
};

export type Wine = {
  id: number;
  name: string;
  year: number | null;
  alc_perc: number | null;
  capacity_ml: number | null;

  country_id: number | null;
  region_id: number | null;
  wine_type_id: number | null;
  taste_profile_id: number | null;

  country: string | null;
  region: string | null;
  wine_type: string | null;
  taste_profile: string | null;

  taste_votes_count?: number | null;
  taste_average?: number | null;
  comments_count?: number | null;
  rating_average?: number | null;
};

export type AdminResource =
  | "countries"
  | "regions"
  | "wine-types"
  | "wines";

export type CreateCountryPayload = {
  name: string;
};

export type UpdateCountryPayload = {
  name?: string;
};

export type CreateRegionPayload = {
  name: string;
  country_id: number;
};

export type UpdateRegionPayload = {
  name?: string;
  country_id?: number;
};

export type CreateWineTypePayload = {
  name: string;
};

export type UpdateWineTypePayload = {
  name?: string;
};

export type WinePayload = {
  name?: string;
  year?: number | null;
  alc_perc?: number | null;
  capacity_ml?: number | null;
  country_id?: number | null;
  region_id?: number | null;
  wine_type_id?: number | null;
  taste_profile_id?: number | null;
};

export type CreateWinePayload =
  WinePayload & {
    name: string;
  };

export type UpdateWinePayload =
  WinePayload;