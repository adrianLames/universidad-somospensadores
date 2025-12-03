-- Migración: Diferenciar cursos duplicados por jornada
-- Fecha: 2025-12-02
-- Descripción: Agregar sufijo _D (diurna) o _N (nocturna) a los códigos de cursos duplicados

USE universidad_somospensadores;

-- Primero, crear una tabla temporal para identificar códigos duplicados
CREATE TEMPORARY TABLE codigos_duplicados AS
SELECT codigo, COUNT(*) as cantidad
FROM cursos
GROUP BY codigo
HAVING cantidad > 1;

-- Mostrar estadísticas antes de la migración
SELECT 
    'ANTES DE LA MIGRACIÓN' as Estado,
    COUNT(DISTINCT codigo) as Codigos_Unicos,
    COUNT(*) as Total_Cursos,
    (SELECT COUNT(*) FROM codigos_duplicados) as Codigos_Duplicados
FROM cursos;

-- Actualizar códigos de cursos DIURNOS agregando sufijo _D
UPDATE cursos c
INNER JOIN codigos_duplicados cd ON c.codigo = cd.codigo
SET c.codigo = CONCAT(c.codigo, '_D')
WHERE c.jornada = 'diurna'
AND c.codigo NOT LIKE '%_D'
AND c.codigo NOT LIKE '%_N';

-- Actualizar códigos de cursos NOCTURNOS agregando sufijo _N
UPDATE cursos c
INNER JOIN codigos_duplicados cd ON c.codigo = cd.codigo
SET c.codigo = CONCAT(c.codigo, '_N')
WHERE c.jornada = 'nocturna'
AND c.codigo NOT LIKE '%_D'
AND c.codigo NOT LIKE '%_N';

-- Verificar resultados después de la migración
SELECT 
    'DESPUÉS DE LA MIGRACIÓN' as Estado,
    COUNT(DISTINCT codigo) as Codigos_Unicos,
    COUNT(*) as Total_Cursos,
    (SELECT COUNT(*) FROM (SELECT codigo FROM cursos GROUP BY codigo HAVING COUNT(*) > 1) as dups) as Codigos_Duplicados
FROM cursos;

-- Mostrar algunos ejemplos de códigos actualizados
SELECT 
    CASE 
        WHEN codigo LIKE '%_D' THEN 'Diurna'
        WHEN codigo LIKE '%_N' THEN 'Nocturna'
        ELSE 'Sin sufijo'
    END as Tipo_Sufijo,
    codigo, 
    nombre, 
    jornada
FROM cursos
WHERE codigo LIKE '%_D' OR codigo LIKE '%_N'
ORDER BY codigo
LIMIT 20;

-- Limpiar tabla temporal
DROP TEMPORARY TABLE IF EXISTS codigos_duplicados;

-- NOTA IMPORTANTE:
-- Esta migración modifica los códigos de los cursos.
-- Si ya existen registros en otras tablas (matriculas, calificaciones, etc.)
-- que referencian estos códigos, NO se verán afectados porque las relaciones
-- son por ID, no por código.
