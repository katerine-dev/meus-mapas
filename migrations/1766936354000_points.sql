-- Up Migration
CREATE TABLE points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location POINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL,
  UNIQUE(map_id, name)
);

-- Cria índice na coluna map_id para otimizar consultas de pontos por mapa
CREATE INDEX idx_points_map_id ON points(map_id);

-- Índice parcial para otimizar consultas de registros ativos (deleted_at IS NULL)
CREATE INDEX idx_points_active ON points(deleted_at) WHERE deleted_at IS NULL;

-- Índice composto para buscar pontos ativos de um mapa específico
CREATE INDEX idx_points_map_id_active ON points(map_id, deleted_at) WHERE deleted_at IS NULL;

-- Down Migration

