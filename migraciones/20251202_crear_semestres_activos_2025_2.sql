-- Script para crear semestres activos para el periodo 2025-2
-- Fecha: 2025-12-02

USE universidad_somospensadores;

-- Primero verificar si existen cursos activos
-- Insertar semestres activos para el periodo 2025-2 (diciembre 2025)
-- Periodo de matrícula: del 1 al 15 de diciembre de 2025

-- Obtener cursos de jornada nocturna (ya que el estudiante jaide es nocturna)
INSERT INTO semestres_activos (curso_id, semestre_academico, anio, periodo, fecha_inicio_matricula, fecha_fin_matricula, cupos_disponibles, activo)
SELECT 
    id as curso_id,
    '2025-2' as semestre_academico,
    2025 as anio,
    '2' as periodo,
    '2025-12-01' as fecha_inicio_matricula,
    '2025-12-15' as fecha_fin_matricula,
    30 as cupos_disponibles,
    1 as activo
FROM cursos 
WHERE jornada = 'nocturna' 
AND activo = 1
AND id NOT IN (SELECT DISTINCT curso_id FROM semestres_activos WHERE semestre_academico = '2025-2')
LIMIT 20;

-- Verificar lo que se insertó
SELECT COUNT(*) as total_semestres_activos FROM semestres_activos WHERE semestre_academico = '2025-2' AND activo = 1;

-- Mostrar algunos ejemplos
SELECT sa.*, c.codigo, c.nombre 
FROM semestres_activos sa 
INNER JOIN cursos c ON sa.curso_id = c.id 
WHERE sa.semestre_academico = '2025-2' 
AND sa.activo = 1
LIMIT 10;
