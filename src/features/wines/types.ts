export interface WineOffer {
  shop_name: string;
  shop_url: string;
  price: number;
}

export interface Wine {
  id: number;
  name: string;
  country: string;
  region: string | null;
  rating: number | null;
  ratings_count: number | null;
  best_price: number | null;
  offers: WineOffer[];
}

export type WineComment = {
  id: number;
  user_id: string;
  username: string;
  rating: number;
  text: string;
  created_at: string;
};
