export interface Map {
  id: string;
  name: string;
  description?: string;
  pointsCount: number;
  previewLocation?: { latitude: number; longitude: number };
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
