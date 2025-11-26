-- Migración CORREGIDA: Cargar todas las materias del programa TEDESOFT (2724)
-- Análisis detallado del pensum curricular - Tecnología en Desarrollo de Software
-- IMPORTANTE: Los prerequisitos se marcan con líneas en el diagrama - Se analizó con cuidado

-- ==================== SEMESTRE 1 ====================
-- Materias base sin prerequisitos
INSERT INTO cursos (codigo_curso, nombre_curso, creditos, semestre, programa_id, es_publico) 
VALUES 
('111021C', 'Fundamentos de Programación I', 4, 1, 1, 0),
('111023C', 'Cálculo Matemático', 3, 1, 1, 0),
('711008C', 'Taller Tecnológico I', 3, 1, 1, 0),
('711016C', 'Introducción a los Tecnologías', 3, 1, 1, 0);

-- ==================== SEMESTRE 2 ====================
-- Algebra Lineal (requisito: 111023C - Cálculo Matemático del S1)
-- Los demás son base
INSERT INTO cursos (codigo_curso, nombre_curso, creditos, semestre, programa_id, es_publico) 
VALUES 
('111023C', 'Algebra Lineal', 3, 2, 1, 0),
('204130C', 'Fundamentos de Textos Asignaciones (Competencias)', 3, 2, 1, 0),
('711009C', 'Taller Tecnológico II', 3, 2, 1, 0),
('40409C', 'Deporte y Salud', 2, 2, 1, 0);

-- ==================== SEMESTRE 3 ====================
-- Programación de Textos Arquitectónicos: prereq 111021C (Fund. Prog I)
-- Matemáticas Discretas I: prereq 111023C (Cálculo Matemático S1)
-- Matemáticas Discretas II: prereq 750004C (Matemáticas Discretas I) - LÍNEA DESCENDENTE
-- Análisis y Diseño de Algoritmos: prereq 111021C (Fund. Prog I)
INSERT INTO cursos (codigo_curso, nombre_curso, creditos, semestre, programa_id, es_publico) 
VALUES 
('70100C', 'Programación de Textos Arquitectónicos', 4, 3, 1, 0),
('750004C', 'Matemáticas Discretas I', 4, 3, 1, 0),
('750090C', 'Matemáticas Discretas II', 4, 3, 1, 0),
('750088C', 'Análisis y Diseño de Algoritmos', 3, 3, 1, 0);

-- ==================== SEMESTRE 4 ====================
-- Estructuras de Datos: prereq 750088C (Análisis y Diseño de Algoritmos S3)
-- Bases de Datos: prereq 70100C (Programación de Textos S3)
INSERT INTO cursos (codigo_curso, nombre_curso, creditos, semestre, programa_id, es_publico) 
VALUES 
('204130C', 'Estructuras de Datos', 3, 4, 1, 0),
('750042C', 'Bases de Datos', 4, 4, 1, 0);

-- ==================== SEMESTRE 5 ====================
-- Desarrollo de Software I: prereq 750042C (Bases de Datos S4)
-- Desarrollo de Software II: prereq 750042C (Bases de Datos S4)
-- Ingeniería Estructurada: prereq 750042C (Bases de Datos S4)
-- Sistemas Operacionales: No tiene línea visible de prerequisito específico
INSERT INTO cursos (codigo_curso, nombre_curso, creditos, semestre, programa_id, es_publico) 
VALUES 
('750092C', 'Desarrollo de Software I', 4, 5, 1, 0),
('750091C', 'Desarrollo de Software II', 3, 5, 1, 0),
('750090C', 'Ingeniería Estructurada', 3, 5, 1, 0),
('750089C', 'Sistemas Operacionales', 3, 5, 1, 0);

-- ==================== SEMESTRE 6 ====================
-- Desarrollo en Architectura Empresarial: prereq 750092C (Desarrollo SW I S5)
-- Proyección Integrada (E): prereq 750091C (Desarrollo SW II S5)
-- Desarrollo Avanzado de Interfaces: prereq 750091C (Desarrollo SW II S5)
INSERT INTO cursos (codigo_curso, nombre_curso, creditos, semestre, programa_id, es_publico) 
VALUES 
('750086C', 'Desarrollo en Architectura Empresarial', 2, 6, 1, 0),
('750087C', 'Proyección Integrada (E)', 4, 6, 1, 0),
('750084C', 'Desarrollo Avanzado de Interfaces', 3, 6, 1, 0);

-- ==================== SEMESTRE 7 ====================
-- Electivas Profesionales: prereq son todas las materias de Semestre 6
INSERT INTO cursos (codigo_curso, nombre_curso, creditos, semestre, programa_id, es_publico) 
VALUES 
('750081C', 'Electiva Profesional I', 3, 7, 1, 0),
('750082C', 'Electiva Profesional II', 3, 7, 1, 0),
('750083C', 'Electiva Profesional III', 3, 7, 1, 0);

-- ==================== ASIGNATURAS EXTRACURRICULARES ====================
INSERT INTO cursos (codigo_curso, nombre_curso, creditos, semestre, programa_id, es_publico) 
VALUES 
('204829C', 'Inglés con Fines Específicos y Académicos', 4, 0, 1, 0),
('204830C', 'Inglés con Fines Generales y Académicos', 4, 0, 1, 0);

-- ==================== PREREQUISITOS - CONEXIONES EXACTAS ====================

-- SEMESTRE 2
-- Algebra Lineal (S2) requiere Cálculo Matemático (S1)
INSERT INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo_curso = '111023C' AND c1.semestre = 2
AND c2.codigo_curso = '111023C' AND c2.semestre = 1;

-- SEMESTRE 3
-- Programación de Textos (S3) requiere Fundamentos de Prog I (S1)
INSERT INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo_curso = '70100C' AND c1.semestre = 3
AND c2.codigo_curso = '111021C' AND c2.semestre = 1;

-- Matemáticas Discretas I (S3) requiere Cálculo Matemático (S1)
INSERT INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo_curso = '750004C' AND c1.semestre = 3
AND c2.codigo_curso = '111023C' AND c2.semestre = 1;

-- Matemáticas Discretas II (S3) requiere Matemáticas Discretas I (S3) - LÍNEA DESCENDENTE
INSERT INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo_curso = '750090C' AND c1.semestre = 3
AND c2.codigo_curso = '750004C' AND c2.semestre = 3;

-- Análisis y Diseño de Algoritmos (S3) requiere Fundamentos de Prog I (S1)
INSERT INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo_curso = '750088C' AND c1.semestre = 3
AND c2.codigo_curso = '111021C' AND c2.semestre = 1;

-- SEMESTRE 4
-- Estructuras de Datos (S4) requiere Análisis y Diseño (S3)
INSERT INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo_curso = '204130C' AND c1.semestre = 4
AND c2.codigo_curso = '750088C' AND c2.semestre = 3;

-- Bases de Datos (S4) requiere Programación de Textos (S3)
INSERT INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo_curso = '750042C' AND c1.semestre = 4
AND c2.codigo_curso = '70100C' AND c2.semestre = 3;

-- SEMESTRE 5
-- Desarrollo de Software I (S5) requiere Bases de Datos (S4)
INSERT INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo_curso = '750092C' AND c1.semestre = 5
AND c2.codigo_curso = '750042C' AND c2.semestre = 4;

-- Desarrollo de Software II (S5) requiere Bases de Datos (S4)
INSERT INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo_curso = '750091C' AND c1.semestre = 5
AND c2.codigo_curso = '750042C' AND c2.semestre = 4;

-- Ingeniería Estructurada (S5) requiere Bases de Datos (S4)
INSERT INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo_curso = '750090C' AND c1.semestre = 5
AND c2.codigo_curso = '750042C' AND c2.semestre = 4;

-- SEMESTRE 6
-- Desarrollo en Architectura Empresarial (S6) requiere Desarrollo SW I (S5)
INSERT INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo_curso = '750086C' AND c1.semestre = 6
AND c2.codigo_curso = '750092C' AND c2.semestre = 5;

-- Proyección Integrada (S6) requiere Desarrollo SW II (S5)
INSERT INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo_curso = '750087C' AND c1.semestre = 6
AND c2.codigo_curso = '750091C' AND c2.semestre = 5;

-- Desarrollo Avanzado de Interfaces (S6) requiere Desarrollo SW II (S5)
INSERT INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo_curso = '750084C' AND c1.semestre = 6
AND c2.codigo_curso = '750091C' AND c2.semestre = 5;

-- SEMESTRE 7
-- Electiva Profesional I (S7) requiere todas las materias de S6
INSERT INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo_curso = '750081C' AND c1.semestre = 7
AND c2.codigo_curso IN ('750086C', '750087C', '750084C') AND c2.semestre = 6;

-- Electiva Profesional II (S7) requiere todas las materias de S6
INSERT INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo_curso = '750082C' AND c1.semestre = 7
AND c2.codigo_curso IN ('750086C', '750087C', '750084C') AND c2.semestre = 6;

-- Electiva Profesional III (S7) requiere todas las materias de S6
INSERT INTO prerequisitos (curso_id, prerequisito_id) 
SELECT c1.id, c2.id FROM cursos c1, cursos c2
WHERE c1.codigo_curso = '750083C' AND c1.semestre = 7
AND c2.codigo_curso IN ('750086C', '750087C', '750084C') AND c2.semestre = 6;
