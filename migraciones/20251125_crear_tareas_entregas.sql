-- Migración para crear tablas de tareas y entregas
-- Fecha: 2025-11-25

-- Tabla de tareas
CREATE TABLE IF NOT EXISTS tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curso_id INT NOT NULL,
    docente_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_entrega DATE NOT NULL,
    puntos_maximos DECIMAL(5,2) DEFAULT 100.00,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    FOREIGN KEY (docente_id) REFERENCES docentes(id) ON DELETE CASCADE,
    INDEX idx_curso (curso_id),
    INDEX idx_docente (docente_id),
    INDEX idx_fecha_entrega (fecha_entrega)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de entregas de tareas
CREATE TABLE IF NOT EXISTS entregas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tarea_id INT NOT NULL,
    estudiante_id INT NOT NULL,
    fecha_entrega DATETIME DEFAULT CURRENT_TIMESTAMP,
    archivo_url VARCHAR(500),
    comentario TEXT,
    FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE CASCADE,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_entrega (tarea_id, estudiante_id),
    INDEX idx_tarea (tarea_id),
    INDEX idx_estudiante (estudiante_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Modificar tabla de calificaciones para incluir referencia a tareas
ALTER TABLE calificaciones 
ADD COLUMN IF NOT EXISTS tarea_id INT NULL AFTER curso_id,
ADD COLUMN IF NOT EXISTS comentarios TEXT NULL,
ADD COLUMN IF NOT EXISTS fecha_calificacion DATETIME DEFAULT CURRENT_TIMESTAMP,
ADD FOREIGN KEY (tarea_id) REFERENCES tareas(id) ON DELETE SET NULL;

-- Índices adicionales para calificaciones
ALTER TABLE calificaciones
ADD INDEX IF NOT EXISTS idx_tarea (tarea_id);
