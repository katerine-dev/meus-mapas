-- Up Migration
CREATE TABLE points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id UUID NOT NULL REFERENCES maps(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location POINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cria índice na coluna map_id para otimizar consultas de pontos por mapa
CREATE INDEX idx_points_map_id ON points(map_id);

-- Down Migration
-- Remove o índice criado
DROP INDEX IF EXISTS idx_points_map_id;
-- Remove a tabela de pontos
DROP TABLE IF EXISTS points;
