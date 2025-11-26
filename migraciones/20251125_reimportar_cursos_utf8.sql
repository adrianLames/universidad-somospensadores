-- Reimportar cursos con codificación UTF-8 correcta
-- Se eliminan y reinsertan para garantizar la integridad de los caracteres

SET NAMES utf8mb4;
SET CHARACTER_SET_CLIENT = utf8mb4;
SET CHARACTER_SET_CONNECTION = utf8mb4;
SET CHARACTER_SET_RESULTS = utf8mb4;

-- Obtener ID del programa TEDESOFT
SET @programa_id = (SELECT id FROM programas WHERE codigo = 'TEDESOFT' LIMIT 1);

-- Eliminar cursos con problemas de codificación
DELETE FROM cursos WHERE codigo IN (
    '111023C', '711016C', '711008C', '111021C', '111038C', '711009C',
    '70100C', '111021C_PROG1', '761001C', '750004C', '711010C', '70101C',
    '750005C', '711011C', '70102C', '70103C', '711012C', '70104C',
    '70105C', '70106C', '711013C', '70107C', '70108C', '70109C',
    '204130C', '40409C'
);

-- Reinsertar cursos DIURNA con codificación correcta
INSERT INTO cursos (programa_id, codigo, nombre, creditos, jornada) VALUES
-- Semestre 1
(@programa_id, '111023C', 'Matemática Básica', 4, 'diurna'),
(@programa_id, '711016C', 'Introducción a las Tecnologías', 3, 'diurna'),
(@programa_id, '711008C', 'Taller Tecnológico I', 2, 'diurna'),

-- Semestre 2
(@programa_id, '111021C', 'Cálculo', 4, 'diurna'),
(@programa_id, '111038C', 'Álgebra Lineal', 3, 'diurna'),
(@programa_id, '711009C', 'Taller Tecnológico II', 2, 'diurna'),
(@programa_id, '70100C', 'Programación de Textos Arquitectónicos', 3, 'diurna'),

-- Semestre 3
(@programa_id, '111021C_PROG1', 'Fundamentos de Programación I', 4, 'diurna'),
(@programa_id, '761001C', 'Probabilidad y Estadística', 3, 'diurna'),
(@programa_id, '750004C', 'Matemáticas Discretas I', 3, 'diurna'),
(@programa_id, '711010C', 'Taller Tecnológico III', 2, 'diurna'),

-- Semestre 4
(@programa_id, '70101C', 'Programación Orientada a Objetos', 4, 'diurna'),
(@programa_id, '750005C', 'Matemáticas Discretas II', 3, 'diurna'),
(@programa_id, '711011C', 'Taller Tecnológico IV', 2, 'diurna'),

-- Semestre 5
(@programa_id, '70102C', 'Estructura de Datos', 4, 'diurna'),
(@programa_id, '70103C', 'Base de Datos I', 3, 'diurna'),
(@programa_id, '711012C', 'Taller Tecnológico V', 2, 'diurna'),
(@programa_id, '70104C', 'Algoritmos', 4, 'diurna'),

-- Semestre 6
(@programa_id, '70105C', 'Base de Datos II', 3, 'diurna'),
(@programa_id, '70106C', 'Ingeniería de Software I', 4, 'diurna'),
(@programa_id, '711013C', 'Taller Tecnológico VI', 2, 'diurna'),
(@programa_id, '70107C', 'Arquitectura de Software', 3, 'diurna'),

-- Semestre 7
(@programa_id, '70108C', 'Ingeniería de Software II', 4, 'diurna'),
(@programa_id, '70109C', 'Redes de Computadores', 3, 'diurna'),

-- Electivas
(@programa_id, '204130C', 'Fundamentos de Textos Asignaciones', 2, 'diurna'),
(@programa_id, '40409C', 'Deporte y Salud', 2, 'diurna');

-- Reinsertar cursos NOCTURNA con codificación correcta
INSERT INTO cursos (programa_id, codigo, nombre, creditos, jornada) VALUES
-- Semestre 1
(@programa_id, '111023C', 'Matemática Básica', 4, 'nocturna'),
(@programa_id, '711016C', 'Introducción a las Tecnologías', 3, 'nocturna'),
(@programa_id, '711008C', 'Taller Tecnológico I', 2, 'nocturna'),

-- Semestre 2
(@programa_id, '111021C', 'Cálculo', 4, 'nocturna'),
(@programa_id, '111038C', 'Álgebra Lineal', 3, 'nocturna'),
(@programa_id, '711009C', 'Taller Tecnológico II', 2, 'nocturna'),
(@programa_id, '70100C', 'Programación de Textos Arquitectónicos', 3, 'nocturna'),

-- Semestre 3
(@programa_id, '111021C_PROG1', 'Fundamentos de Programación I', 4, 'nocturna'),
(@programa_id, '761001C', 'Probabilidad y Estadística', 3, 'nocturna'),
(@programa_id, '750004C', 'Matemáticas Discretas I', 3, 'nocturna'),
(@programa_id, '711010C', 'Taller Tecnológico III', 2, 'nocturna'),

-- Semestre 4
(@programa_id, '70101C', 'Programación Orientada a Objetos', 4, 'nocturna'),
(@programa_id, '750005C', 'Matemáticas Discretas II', 3, 'nocturna'),
(@programa_id, '711011C', 'Taller Tecnológico IV', 2, 'nocturna'),

-- Semestre 5
(@programa_id, '70102C', 'Estructura de Datos', 4, 'nocturna'),
(@programa_id, '70103C', 'Base de Datos I', 3, 'nocturna'),
(@programa_id, '711012C', 'Taller Tecnológico V', 2, 'nocturna'),
(@programa_id, '70104C', 'Algoritmos', 4, 'nocturna'),

-- Semestre 6
(@programa_id, '70105C', 'Base de Datos II', 3, 'nocturna'),
(@programa_id, '70106C', 'Ingeniería de Software I', 4, 'nocturna'),
(@programa_id, '711013C', 'Taller Tecnológico VI', 2, 'nocturna'),
(@programa_id, '70107C', 'Arquitectura de Software', 3, 'nocturna'),

-- Semestre 7
(@programa_id, '70108C', 'Ingeniería de Software II', 4, 'nocturna'),
(@programa_id, '70109C', 'Redes de Computadores', 3, 'nocturna'),

-- Electivas
(@programa_id, '204130C', 'Fundamentos de Textos Asignaciones', 2, 'nocturna'),
(@programa_id, '40409C', 'Deporte y Salud', 2, 'nocturna');

SELECT 'Cursos reimportados con codificación UTF-8 correcta' AS resultado;
