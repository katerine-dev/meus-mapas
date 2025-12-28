export interface Point {
  id: string;
  map_id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  created_at: Date;
  updated_at: Date;
}
