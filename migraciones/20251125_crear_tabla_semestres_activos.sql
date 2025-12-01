-- =====================================================
-- TABLA: semestres_activos
-- Control de cursos disponibles para matrícula
-- =====================================================

CREATE TABLE IF NOT EXISTS semestres_activos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    curso_id INT NOT NULL,
    semestre_academico VARCHAR(10) NOT NULL COMMENT '2025-1, 2025-2, etc',
    anio INT NOT NULL,
    periodo ENUM('1', '2') NOT NULL COMMENT '1=Primer semestre, 2=Segundo semestre',
    fecha_inicio_matricula DATE NOT NULL,
    fecha_fin_matricula DATE NOT NULL,
    cupos_disponibles INT DEFAULT NULL COMMENT 'NULL = sin límite',
    activo TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_curso_semestre (curso_id, semestre_academico),
    INDEX idx_semestre (semestre_academico, activo),
    INDEX idx_fechas (fecha_inicio_matricula, fecha_fin_matricula)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índice compuesto para búsquedas rápidas
CREATE INDEX idx_semestre_activo ON semestres_activos(semestre_academico, activo, fecha_inicio_matricula, fecha_fin_matricula);

SELECT 'Tabla semestres_activos creada correctamente' as Resultado;
