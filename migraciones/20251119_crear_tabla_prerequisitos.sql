-- Tabla de prerequisitos para cursos con la misma estructura que cursos, sin columna prerequisito_id
CREATE TABLE IF NOT EXISTS prerequisitos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curso_id INT NOT NULL,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    creditos INT NOT NULL,
    programa_id INT,
    facultad_id INT,
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Puedes agregar más campos si tu tabla cursos tiene otros
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    FOREIGN KEY (programa_id) REFERENCES programas(id),
    FOREIGN KEY (facultad_id) REFERENCES facultades(id)
);