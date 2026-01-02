-- Up Migration
CREATE TABLE maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL
);

-- Índice parcial para otimizar consultas de registros ativos (deleted_at IS NULL)
CREATE INDEX idx_maps_active ON maps(deleted_at) WHERE deleted_at IS NULL;

-- Down Migration
