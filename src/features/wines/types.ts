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

export type WineCardWine = {
  id: number;
  name: string;
  country: string;
  region: string | null;
  rating: number | null;
  ratings_count: number | null;
  best_price: number | null;
  image_url?: string | null;
  offers?: (WineOffer & { image_url?: string | null })[];
};

export type WineComment = {
  id: number;
  user_id: string;
  username: string;
  rating: number;
  text: string;
  created_at: string;
};

export type MyComment = {
  id: number;
  wine_id: number;
  wine_name: string;
  rating: number;
  text: string;
  created_at: string;
};

export type FollowedWine = {
  id: number;
  name: string;
  country: string;
  region?: string | null;
  rating?: number | null;
  ratings_count?: number | null;
  best_price?: number | null;
  image_url?: string | null;
};

export type WineTasteSummary = {
  body: number;
  tannin: number;
  sweetness: number;
  acidity: number;
  votes_count: number;
};

export type WineTasteVote = {
  body: number;
  tannin: number;
  sweetness: number;
  acidity: number;
};

export interface WineNote {
  id: number;
  wine_id: number;
  text: string;
  votes_count: number;
  created_at: string;
  user_voted: boolean;
}