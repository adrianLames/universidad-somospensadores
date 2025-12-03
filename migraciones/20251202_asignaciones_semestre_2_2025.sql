-- Script para insertar asignaciones de docentes al semestre 2-2025
-- Fecha: 2025-12-02

USE universidad_somospensadores;

-- Copiar todas las asignaciones del semestre 1-2025 al semestre 2-2025
-- Solo si no existen ya
INSERT INTO asignacion_docentes (usuario_id, curso_id, programa_id, facultad_id, anio, semestre)
SELECT usuario_id, curso_id, programa_id, facultad_id, 2025, 2
FROM asignacion_docentes 
WHERE anio = 2025 AND semestre = 1
AND NOT EXISTS (
    SELECT 1 FROM asignacion_docentes ad2 
    WHERE ad2.usuario_id = asignacion_docentes.usuario_id 
    AND ad2.curso_id = asignacion_docentes.curso_id 
    AND ad2.anio = 2025 
    AND ad2.semestre = 2
);

SELECT 'Asignaciones copiadas al semestre 2-2025' AS resultado;

-- Verificar las asignaciones
SELECT COUNT(*) as total_asignaciones_2_2025 
FROM asignacion_docentes 
WHERE anio = 2025 AND semestre = 2;
