-- Eliminar tablas si existen
DROP TABLE IF EXISTS docentes;
DROP TABLE IF EXISTS estudiantes;

-- Crear tabla docentes simplificada
CREATE TABLE docentes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL UNIQUE,
  facultad_id INT,
  programa_id INT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (facultad_id) REFERENCES facultades(id),
  FOREIGN KEY (programa_id) REFERENCES programas(id)
);

-- Crear tabla estudiantes simplificada
CREATE TABLE estudiantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL UNIQUE,
  facultad_id INT,
  programa_id INT,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (facultad_id) REFERENCES facultades(id),
  FOREIGN KEY (programa_id) REFERENCES programas(id)
);
