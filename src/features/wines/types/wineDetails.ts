import type {
  WineOffer,
} from "./offer";

export type WineDetails = {
  id: number;
  name: string;
  year: number | null;

  country: string;
  region: string | null;

  type_of_wine: string | null;
  taste: string | null;

  grapes: string | null;
  alc_perc: number | string | null;
  capacity_ml: number | string | null;

  rating: number | string | null;
  ratings_count: number | null;
  available: boolean;
  offers: WineOffer[];
};