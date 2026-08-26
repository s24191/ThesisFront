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