-- Agregar campo es_publico a la tabla cursos si no existe
ALTER TABLE cursos 
ADD COLUMN IF NOT EXISTS es_publico TINYINT(1) DEFAULT 0 COMMENT 'Indica si el curso es público (visible para usuarios no autenticados)';

-- Actualizar el curso PUB01 para que sea público
UPDATE cursos SET es_publico = 1 WHERE codigo = 'PUB01';
