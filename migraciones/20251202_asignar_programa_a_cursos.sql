-- Migración: Asignar programa a cursos sin programa
-- Fecha: 2025-12-02
-- Descripción: Asignar todos los cursos sin programa al programa "TECNOLOGIA EN DESARROLLO DE SOFTWARE"

USE universidad_somospensadores;

-- Ver cursos antes de la actualización
SELECT 
    'ANTES DE LA ACTUALIZACIÓN' as Estado,
    COUNT(*) as Total_Cursos_Sin_Programa
FROM cursos 
WHERE programa_id IS NULL OR programa_id = 0;

-- Actualizar todos los cursos sin programa asignándolos a Tecnología en Desarrollo de Software
UPDATE cursos 
SET programa_id = 8
WHERE programa_id IS NULL OR programa_id = 0;

-- Ver resultados después de la actualización
SELECT 
    'DESPUÉS DE LA ACTUALIZACIÓN' as Estado,
    COUNT(*) as Total_Cursos_Sin_Programa,
    (SELECT COUNT(*) FROM cursos WHERE programa_id = 8) as Total_Cursos_TEDESOFT
FROM cursos 
WHERE programa_id IS NULL OR programa_id = 0;

-- Mostrar algunos ejemplos de cursos actualizados
SELECT 
    id, 
    codigo, 
    nombre, 
    jornada,
    programa_id,
    (SELECT nombre FROM programas WHERE id = 8) as programa_nombre
FROM cursos 
WHERE programa_id = 8
ORDER BY jornada, codigo
LIMIT 20;

-- Resumen por jornada
SELECT 
    jornada,
    COUNT(*) as cantidad_cursos,
    p.nombre as programa_nombre
FROM cursos c
LEFT JOIN programas p ON c.programa_id = p.id
WHERE c.programa_id = 8
GROUP BY jornada, p.nombre;
