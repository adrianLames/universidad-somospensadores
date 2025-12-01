-- =====================================================
-- INSERTAR CURSOS JORNADA DIURNA - TEDESOFT
-- Basado en malla curricular TECNOLOGIA EN DESARROLLO DE SOFTWARE
-- =====================================================

-- Obtener el ID del programa TEDESOFT
SET @programa_id = (SELECT id FROM programas WHERE nombre LIKE '%TECNOLOGIA EN DESARROLLO DE SOFTWARE%' LIMIT 1);

-- PRIMER SEMESTRE - DIURNA
INSERT INTO cursos (codigo, nombre, creditos, jornada, programa_id, es_prerequisito, activo) VALUES
('111023C', 'Matemática Básica', 3, 'diurna', @programa_id, 1, 1),
('711016C', 'Introducción a las Tecnologías', 3, 'diurna', @programa_id, 0, 1),
('711008C', 'Taller Tecnológico I', 3, 'diurna', @programa_id, 0, 1),
('204130C', 'Fundamentos de Textos Asignaciones', 3, 'diurna', @programa_id, 0, 1),
('40409C', 'Deporte y Salud', 2, 'diurna', @programa_id, 0, 1);

-- SEGUNDO SEMESTRE - DIURNA  
INSERT INTO cursos (codigo, nombre, creditos, jornada, programa_id, es_prerequisito, activo) VALUES
('111021C', 'Cálculo', 3, 'diurna', @programa_id, 1, 1),
('111038C', 'Álgebra Lineal', 3, 'diurna', @programa_id, 1, 1),
('711009C', 'Taller Tecnológico II', 3, 'diurna', @programa_id, 0, 1),
('70100C', 'Programación de Textos Arquitectónicos', 4, 'diurna', @programa_id, 0, 1),
('111021C_PROG1', 'Fundamentos de Programación I', 4, 'diurna', @programa_id, 1, 1);

-- TERCER SEMESTRE - DIURNA
INSERT INTO cursos (codigo, nombre, creditos, jornada, programa_id, es_prerequisito, activo) VALUES
('761001C', 'Probabilidad y Estadística', 4, 'diurna', @programa_id, 1, 1),
('750004C', 'Matemáticas Discretas I', 4, 'diurna', @programa_id, 1, 1),
('711010C', 'Taller Tecnológico III', 3, 'diurna', @programa_id, 0, 1),
('70101C', 'Programación Orientada a Objetos', 4, 'diurna', @programa_id, 1, 1);

-- CUARTO SEMESTRE - DIURNA
INSERT INTO cursos (codigo, nombre, creditos, jornada, programa_id, es_prerequisito, activo) VALUES
('750005C', 'Matemáticas Discretas II', 4, 'diurna', @programa_id, 1, 1),
('711011C', 'Taller Tecnológico IV', 3, 'diurna', @programa_id, 0, 1),
('70102C', 'Estructura de Datos', 4, 'diurna', @programa_id, 1, 1),
('70103C', 'Base de Datos I', 4, 'diurna', @programa_id, 1, 1);

-- QUINTO SEMESTRE - DIURNA
INSERT INTO cursos (codigo, nombre, creditos, jornada, programa_id, es_prerequisito, activo) VALUES
('711012C', 'Taller Tecnológico V', 3, 'diurna', @programa_id, 0, 1),
('70104C', 'Algoritmos', 4, 'diurna', @programa_id, 1, 1),
('70105C', 'Base de Datos II', 4, 'diurna', @programa_id, 1, 1),
('70106C', 'Ingeniería de Software I', 4, 'diurna', @programa_id, 1, 1);

-- SEXTO SEMESTRE - DIURNA
INSERT INTO cursos (codigo, nombre, creditos, jornada, programa_id, es_prerequisito, activo) VALUES
('711013C', 'Taller Tecnológico VI', 3, 'diurna', @programa_id, 0, 1),
('70107C', 'Arquitectura de Software', 4, 'diurna', @programa_id, 1, 1),
('70108C', 'Ingeniería de Software II', 4, 'diurna', @programa_id, 1, 1),
('70109C', 'Redes de Computadores', 4, 'diurna', @programa_id, 0, 1);

SELECT CONCAT('Cursos de jornada diurna insertados: ', COUNT(*), ' cursos') as Resultado 
FROM cursos 
WHERE jornada = 'diurna' AND programa_id = @programa_id;
