-- =====================================================
-- CORREGIR CODIFICACIÓN DE NOMBRES DE CURSOS
-- =====================================================

SET NAMES utf8mb4;
ALTER DATABASE universidad_somospensadores CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
ALTER TABLE cursos CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Actualizar nombres con tildes y caracteres especiales
UPDATE cursos SET nombre = 'Matemática Básica' WHERE codigo = '111023C';
UPDATE cursos SET nombre = 'Introducción a las Tecnologías' WHERE codigo = '711016C';
UPDATE cursos SET nombre = 'Taller Tecnológico I' WHERE codigo = '711008C';
UPDATE cursos SET nombre = 'Cálculo' WHERE codigo = '111021C';
UPDATE cursos SET nombre = 'Álgebra Lineal' WHERE codigo = '111038C';
UPDATE cursos SET nombre = 'Taller Tecnológico II' WHERE codigo = '711009C';
UPDATE cursos SET nombre = 'Programación de Textos Arquitectónicos' WHERE codigo = '70100C';
UPDATE cursos SET nombre = 'Fundamentos de Programación I' WHERE codigo = '111021C_PROG1';
UPDATE cursos SET nombre = 'Probabilidad y Estadística' WHERE codigo = '761001C';
UPDATE cursos SET nombre = 'Matemáticas Discretas I' WHERE codigo = '750004C';
UPDATE cursos SET nombre = 'Taller Tecnológico III' WHERE codigo = '711010C';
UPDATE cursos SET nombre = 'Programación Orientada a Objetos' WHERE codigo = '70101C';
UPDATE cursos SET nombre = 'Matemáticas Discretas II' WHERE codigo = '750005C';
UPDATE cursos SET nombre = 'Taller Tecnológico IV' WHERE codigo = '711011C';
UPDATE cursos SET nombre = 'Taller Tecnológico V' WHERE codigo = '711012C';
UPDATE cursos SET nombre = 'Taller Tecnológico VI' WHERE codigo = '711013C';

SELECT 'Nombres de cursos corregidos' as Resultado;
