import { Location } from './point';

export interface Map {
  id: string;
  name: string;
  description?: string;
  pointsCount: number;
  previewLocation?: Location;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
