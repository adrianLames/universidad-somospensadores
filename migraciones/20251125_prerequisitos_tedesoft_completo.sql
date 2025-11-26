-- =====================================================
-- PREREQUISITOS PROGRAMA TEDESOFT 
-- Basado en mallas curriculares oficiales
-- =====================================================

-- Jornada DIURNA

-- Semestre 2
INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '111021C' AND c1.jornada = 'diurna'
AND c2.codigo = '111023C' AND c2.jornada = 'diurna';

INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '111038C' AND c1.jornada = 'diurna'
AND c2.codigo = '111023C' AND c2.jornada = 'diurna';

-- Semestre 3
INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '761001C' AND c1.jornada = 'diurna'
AND c2.codigo = '111021C' AND c2.jornada = 'diurna';

INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '750004C' AND c1.jornada = 'diurna'
AND c2.codigo = '111038C' AND c2.jornada = 'diurna';

-- Jornada NOCTURNA

-- Semestre 2
INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '111021C' AND c1.jornada = 'nocturna'
AND c2.codigo = '111023C' AND c2.jornada = 'nocturna';

INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '111038C' AND c1.jornada = 'nocturna'
AND c2.codigo = '111023C' AND c2.jornada = 'nocturna';

-- Semestre 3
INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '761001C' AND c1.jornada = 'nocturna'
AND c2.codigo = '111021C' AND c2.jornada = 'nocturna';

INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '750004C' AND c1.jornada = 'nocturna'
AND c2.codigo = '111038C' AND c2.jornada = 'nocturna';

SELECT 'Prerequisitos básicos insertados' as Resultado;
