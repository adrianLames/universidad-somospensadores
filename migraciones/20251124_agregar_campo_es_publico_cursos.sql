-- Agregar campo es_publico a la tabla cursos
-- Este campo indica si el curso es accesible para usuarios públicos

ALTER TABLE cursos 
ADD COLUMN es_publico TINYINT(1) DEFAULT 0 AFTER es_prerequisito;

-- Comentario para el campo
ALTER TABLE cursos 
MODIFY COLUMN es_publico TINYINT(1) DEFAULT 0 COMMENT 'Indica si el curso es público (accesible para usuarios externos)';
