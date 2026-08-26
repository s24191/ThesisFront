export interface WineNote {
  id: number;
  wine_id: number;
  text: string;
  votes_count: number;
  created_at: string;
  user_voted: boolean;
}