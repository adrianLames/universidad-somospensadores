-- =====================================================
-- PREREQUISITOS JORNADA DIURNA - TEDESOFT
-- Basado en malla curricular 
-- =====================================================

-- SEGUNDO SEMESTRE - Diurna
-- Cálculo requiere Matemática Básica
INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '111021C' AND c1.jornada = 'diurna'
AND c2.codigo = '111023C' AND c2.jornada = 'diurna';

-- Álgebra Lineal requiere Matemática Básica  
INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '111038C' AND c1.jornada = 'diurna'
AND c2.codigo = '111023C' AND c2.jornada = 'diurna';

-- TERCER SEMESTRE - Diurna
-- Probabilidad y Estadística requiere Cálculo
INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '761001C' AND c1.jornada = 'diurna'
AND c2.codigo = '111021C' AND c2.jornada = 'diurna';

-- Matemáticas Discretas I requiere Álgebra Lineal
INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '750004C' AND c1.jornada = 'diurna'
AND c2.codigo = '111038C' AND c2.jornada = 'diurna';

-- Programación OOP requiere Fundamentos de Programación I
INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '70101C' AND c1.jornada = 'diurna'
AND c2.codigo = '111021C_PROG1' AND c2.jornada = 'diurna';

-- CUARTO SEMESTRE - Diurna
-- Matemáticas Discretas II requiere Matemáticas Discretas I
INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '750005C' AND c1.jornada = 'diurna'
AND c2.codigo = '750004C' AND c2.jornada = 'diurna';

-- Estructura de Datos requiere POO
INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '70102C' AND c1.jornada = 'diurna'
AND c2.codigo = '70101C' AND c2.jornada = 'diurna';

-- Base de Datos I requiere POO
INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '70103C' AND c1.jornada = 'diurna'
AND c2.codigo = '70101C' AND c2.jornada = 'diurna';

-- QUINTO SEMESTRE - Diurna
-- Algoritmos requiere Estructura de Datos
INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '70104C' AND c1.jornada = 'diurna'
AND c2.codigo = '70102C' AND c2.jornada = 'diurna';

-- Base de Datos II requiere Base de Datos I
INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '70105C' AND c1.jornada = 'diurna'
AND c2.codigo = '70103C' AND c2.jornada = 'diurna';

-- Ingeniería de Software I requiere POO
INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '70106C' AND c1.jornada = 'diurna'
AND c2.codigo = '70101C' AND c2.jornada = 'diurna';

-- SEXTO SEMESTRE - Diurna
-- Arquitectura de Software requiere Ingeniería de Software I
INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '70107C' AND c1.jornada = 'diurna'
AND c2.codigo = '70106C' AND c2.jornada = 'diurna';

-- Ingeniería de Software II requiere Ingeniería de Software I
INSERT IGNORE INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo = '70108C' AND c1.jornada = 'diurna'
AND c2.codigo = '70106C' AND c2.jornada = 'diurna';

SELECT 'Prerequisitos de jornada diurna insertados correctamente' as Resultado;
