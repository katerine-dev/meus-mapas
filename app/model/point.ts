export interface Location {
  longitude: number;
  latitude: number;
}

export interface Point {
  id: string;
  mapId: string;
  name: string;
  location: Location;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
