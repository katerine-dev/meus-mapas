export interface Map {
  id: string;
  name: string;
  description?: string;
  pointsCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
