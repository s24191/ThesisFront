export type FollowedWine = {
  id: number;
  name: string;
  year: number | null;

  country: string;
  region: string | null;
  wine_type: string;
  taste: string | null;

  rating: number | string | null;
  ratings_count: number;

  best_price: number | string | null;
  offers: WineCardOffer[];
  image_url: string | null;
};

export type WineCardOffer = {
  shop_name: string;
  shop_url: string;
  price: number | string;
  image_url: string | null;
};