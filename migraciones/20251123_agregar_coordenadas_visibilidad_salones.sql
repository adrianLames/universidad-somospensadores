-- Migración: Agregar columnas latitud, longitud, visible a tabla salones
-- Fecha: 2024-11-23

ALTER TABLE salones ADD COLUMN IF NOT EXISTS latitud DOUBLE DEFAULT 3.022922 AFTER estado;
ALTER TABLE salones ADD COLUMN IF NOT EXISTS longitud DOUBLE DEFAULT -76.482656 AFTER latitud;
ALTER TABLE salones ADD COLUMN IF NOT EXISTS visible TINYINT DEFAULT 1 AFTER longitud;

-- Agregar índices para mejor rendimiento
ALTER TABLE salones ADD INDEX IF NOT EXISTS idx_visible (visible);
ALTER TABLE salones ADD INDEX IF NOT EXISTS idx_latitud_longitud (latitud, longitud);
