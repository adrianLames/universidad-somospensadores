-- =====================================================
-- MODIFICAR RESTRICCIÓN UNIQUE EN TABLA CURSOS
-- Permitir mismo código en diferentes jornadas
-- =====================================================

-- Eliminar el UNIQUE KEY actual en 'codigo'
ALTER TABLE cursos DROP INDEX codigo;

-- Crear UNIQUE KEY compuesto: codigo + jornada
ALTER TABLE cursos ADD UNIQUE KEY unique_codigo_jornada (codigo, jornada);

SELECT 'Restricción modificada: ahora codigo+jornada son únicos' as Resultado;
