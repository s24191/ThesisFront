export type SimilarWine = {
  id: number;
  name: string;
  country: string;
  region?: string | null;
  type_of_wine?: string | null;

  rating: number | string | null;
  ratings_count: number;
  best_price: number | string | null;
};