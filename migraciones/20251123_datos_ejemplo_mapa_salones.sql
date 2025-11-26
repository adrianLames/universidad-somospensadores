-- Insertar datos de ejemplo para salones
INSERT INTO salones (codigo, edificio, ubicacion, capacidad, tipo, recursos, equipamiento, estado, activo) VALUES
('A-101', 'Bloque A', 'Primer piso', 30, 'Aula', 'Proyector, Pizarra', 'Sillas, Mesas', 'Disponible', 1),
('A-102', 'Bloque A', 'Primer piso', 40, 'Aula', 'Proyector, Pizarra digital', 'Sillas, Mesas', 'Disponible', 1),
('A-103', 'Bloque A', 'Primer piso', 50, 'Aula Magna', 'Proyector, Sonido', 'Butacas', 'Disponible', 1),
('B-201', 'Bloque B', 'Segundo piso', 25, 'Laboratorio', 'Computadoras, Proyector', 'Sillas, Escritorios', 'Disponible', 1),
('B-202', 'Bloque B', 'Segundo piso', 35, 'Aula', 'Proyector, Pizarra', 'Sillas, Mesas', 'Disponible', 1),
('C-301', 'Bloque C', 'Tercer piso', 30, 'Aula', 'Proyector', 'Sillas, Mesas', 'Disponible', 1),
('C-302', 'Bloque C', 'Tercer piso', 20, 'Sala de reuniones', 'Proyector, Videoconferencia', 'Sillas de conferencia', 'Disponible', 1),
('LAB-1', 'Bloque B', 'Segundo piso', 15, 'Laboratorio de Computación', 'Computadoras, Proyector', 'Sillas', 'Disponible', 1),
('BIB-1', 'Biblioteca', 'Planta baja', 100, 'Sala de lectura', 'Iluminación LED', 'Escritorios, Sillas', 'Disponible', 1),
('AUD-1', 'Auditorio', 'Planta baja', 200, 'Auditorio', 'Sistema de sonido, Proyectores múltiples', 'Butacas', 'Disponible', 1);

-- Insertar horarios de ejemplo
-- Para que funcione correctamente, primero asegúrate de que los usuarios (docentes) y cursos existan

-- Ejemplo de horarios (ajusta los IDs según tu base de datos)
-- Necesitarás IDs existentes de docentes, cursos y salones

-- Si tienes docentes con ID 1, 2, 3 y cursos con ID 1, 2, 3
INSERT INTO horarios (docente_id, curso_id, salon_id, dia_semana, hora_inicio, hora_fin, color) VALUES
-- Lunes
(1, 1, 1, 'LUNES', '08:00', '10:00', '#FF6B6B'),
(2, 2, 2, 'LUNES', '10:00', '12:00', '#4ECDC4'),
(3, 3, 3, 'LUNES', '14:00', '16:00', '#45B7D1'),

-- Martes
(1, 2, 2, 'MARTES', '08:00', '10:00', '#FF6B6B'),
(2, 3, 1, 'MARTES', '10:00', '12:00', '#4ECDC4'),
(3, 1, 4, 'MARTES', '14:00', '16:00', '#45B7D1'),

-- Miércoles
(1, 3, 3, 'MIÉRCOLES', '08:00', '10:00', '#FF6B6B'),
(2, 1, 5, 'MIÉRCOLES', '10:00', '12:00', '#4ECDC4'),
(3, 2, 1, 'MIÉRCOLES', '14:00', '16:00', '#45B7D1'),

-- Jueves
(1, 1, 2, 'JUEVES', '08:00', '10:00', '#FF6B6B'),
(2, 2, 3, 'JUEVES', '10:00', '12:00', '#4ECDC4'),
(3, 3, 4, 'JUEVES', '14:00', '16:00', '#45B7D1'),

-- Viernes
(1, 2, 1, 'VIERNES', '08:00', '10:00', '#FF6B6B'),
(2, 3, 2, 'VIERNES', '10:00', '12:00', '#4ECDC4'),
(3, 1, 5, 'VIERNES', '14:00', '16:00', '#45B7D1');

-- Insertar datos de ejemplo en docentes (si la tabla está vacía)
INSERT INTO docentes (user_id, especialidad, titulacion, departamento) VALUES
(1, 'Matemáticas', 'Ingeniero', 'Ciencias Exactas'),
(2, 'Programación', 'Ingeniero de Sistemas', 'Tecnología'),
(3, 'Física', 'Licenciado', 'Ciencias Naturales');

-- Si necesitas crear usuarios docentes también
-- INSERT INTO usuarios (nombres, apellidos, email, contraseña, tipo, activo) VALUES
-- ('Juan', 'Pérez', 'juan.perez@universidad.edu', MD5('password123'), 'docente', 1),
-- ('María', 'González', 'maria.gonzalez@universidad.edu', MD5('password123'), 'docente', 1),
-- ('Carlos', 'López', 'carlos.lopez@universidad.edu', MD5('password123'), 'docente', 1);

-- Insertar cursos de ejemplo
INSERT INTO cursos (codigo, nombre, descripcion, creditos, programa_id) VALUES
('MAT-101', 'Matemáticas I', 'Curso introductorio de matemáticas', 3, 1),
('PRG-101', 'Programación I', 'Introducción a la programación', 4, 1),
('FIS-101', 'Física I', 'Fundamentos de física', 3, 1);
