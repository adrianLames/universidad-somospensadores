-- Migración: Cambiar docente_id a usuario_id en asignacion_docentes
-- Fecha: 2025-12-02
-- Descripción: Estandarizar el nombre del campo para que sea consistente con la tabla usuarios

USE universidad_somospensadores;

-- Verificar si existe la columna docente_id
SET @column_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'universidad_somospensadores' 
    AND TABLE_NAME = 'asignacion_docentes' 
    AND COLUMN_NAME = 'docente_id'
);

-- Si existe docente_id, renombrarla a usuario_id
SET @sql = IF(@column_exists > 0,
    'ALTER TABLE asignacion_docentes 
     DROP FOREIGN KEY IF EXISTS asignacion_docentes_ibfk_1,
     CHANGE COLUMN docente_id usuario_id INT NOT NULL,
     ADD CONSTRAINT asignacion_docentes_ibfk_1 
     FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE',
    'SELECT "La columna docente_id no existe, no se requiere migración" AS mensaje'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar el índice único si existe
SET @index_exists = (
    SELECT COUNT(*) 
    FROM INFORMATION_SCHEMA.STATISTICS 
    WHERE TABLE_SCHEMA = 'universidad_somospensadores' 
    AND TABLE_NAME = 'asignacion_docentes' 
    AND INDEX_NAME = 'unique_asignacion'
);

SET @sql_index = IF(@index_exists > 0,
    'ALTER TABLE asignacion_docentes 
     DROP INDEX unique_asignacion,
     ADD UNIQUE KEY unique_asignacion (usuario_id, curso_id, semestre, anio)',
    'SELECT "El índice no requiere actualización" AS mensaje'
);

PREPARE stmt FROM @sql_index;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT 'Migración completada exitosamente' AS resultado;
