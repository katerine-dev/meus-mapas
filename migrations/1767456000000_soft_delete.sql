-- Up Migration
-- Adiciona coluna deleted_at nas tabelas maps e points para suportar soft delete
-- NULL = registro ativo, valor preenchido = registro deletado

-- Adiciona deleted_at na tabela maps
ALTER TABLE maps ADD COLUMN deleted_at TIMESTAMPTZ NULL;

-- Adiciona deleted_at na tabela points
ALTER TABLE points ADD COLUMN deleted_at TIMESTAMPTZ NULL;

-- Índices parciais para otimizar consultas de registros ativos (deleted_at IS NULL)
-- Esses índices são mais eficientes porque indexam apenas registros não deletados
CREATE INDEX idx_maps_active ON maps(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_points_active ON points(deleted_at) WHERE deleted_at IS NULL;

-- Índice composto para buscar pontos ativos de um mapa específico
CREATE INDEX idx_points_map_id_active ON points(map_id, deleted_at) WHERE deleted_at IS NULL;

-- Down Migration
-- Remove os índices criados
DROP INDEX IF EXISTS idx_points_map_id_active;
DROP INDEX IF EXISTS idx_points_active;
DROP INDEX IF EXISTS idx_maps_active;

-- Remove as colunas deleted_at
ALTER TABLE points DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE maps DROP COLUMN IF EXISTS deleted_at;
