export interface Location {
  longitude: number;
  latitude: number;
}

export interface Point {
  id: string;
  map_id: string;
  name: string;
  description?: string;
  location: Location;
  created_at: Date;
  updated_at: Date;
}
