-- Up Migration
CREATE TABLE maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL
);

-- Índice parcial UNIQUE: nomes únicos apenas entre registros ativos (não deletados)
CREATE UNIQUE INDEX idx_maps_name_unique_active ON maps(name) WHERE deleted_at IS NULL;

-- Índice parcial para otimizar consultas de registros ativos (deleted_at IS NULL)
CREATE INDEX idx_maps_active ON maps(deleted_at) WHERE deleted_at IS NULL;

-- Down Migration
