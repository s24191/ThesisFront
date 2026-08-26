import type {
  WineCardOffer,
} from "./offer";

export type WineCardWine = {
  id: number;
  name: string;
  year: number | null;

  country: string;
  region: string | null;
  wine_type: string;
  taste: string | null;

  rating: number | string | null;
  ratings_count: number | null;

  best_price: number | string | null;
  offers: WineCardOffer[];
  image_url: string | null;
};

export type WineFilters = {
  search?: string;
  country?: string;
  region?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
}