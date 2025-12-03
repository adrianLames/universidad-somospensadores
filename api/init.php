<?php
include_once __DIR__ . '/init_api.php';
include 'config.php';

function createDatabaseAndTables($conn) {
    // Crear base de datos si no existe
    $conn->query("CREATE DATABASE IF NOT EXISTS universidad_somospensadores CHARACTER SET utf8 COLLATE utf8_spanish_ci");
    $conn->select_db("universidad_somospensadores");

    // Tabla de usuarios
    $conn->query("CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tipo ENUM('admin', 'docente', 'estudiante') NOT NULL,
        identificacion VARCHAR(20) UNIQUE NOT NULL,
        nombres VARCHAR(100) NOT NULL,
        apellidos VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        telefono VARCHAR(15),
        fecha_nacimiento DATE,
        direccion TEXT,
        password_hash VARCHAR(255) NOT NULL,
        activo BOOLEAN DEFAULT TRUE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Tabla de programas
    $conn->query("CREATE TABLE IF NOT EXISTS programas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(20) UNIQUE NOT NULL,
        nombre VARCHAR(200) NOT NULL,
        descripcion TEXT,
        duracion_semestres INT,
        creditos_totales INT,
        activo BOOLEAN DEFAULT TRUE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Tabla de cursos
    $conn->query("CREATE TABLE IF NOT EXISTS cursos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(20) UNIQUE NOT NULL,
        nombre VARCHAR(200) NOT NULL,
        descripcion TEXT,
        creditos INT NOT NULL,
        programa_id INT,
        prerequisito_id INT,
        activo BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (programa_id) REFERENCES programas(id) ON DELETE SET NULL,
        FOREIGN KEY (prerequisito_id) REFERENCES cursos(id) ON DELETE SET NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Tabla de salones
    $conn->query("CREATE TABLE IF NOT EXISTS salones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(20) UNIQUE NOT NULL,
        edificio VARCHAR(50),
        capacidad INT,
        tipo ENUM('aula', 'laboratorio', 'auditorio') DEFAULT 'aula',
        equipamiento TEXT,
        activo BOOLEAN DEFAULT TRUE,
        latitud DOUBLE DEFAULT 3.022922,
        longitud DOUBLE DEFAULT -76.482656,
        visible TINYINT DEFAULT 1,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Agregar columnas faltantes si no existen (para migración)
    $result = $conn->query("SHOW COLUMNS FROM salones LIKE 'latitud'");
    if ($result->num_rows == 0) {
        $conn->query("ALTER TABLE salones ADD COLUMN latitud DOUBLE DEFAULT 3.022922 AFTER activo");
        $conn->query("ALTER TABLE salones ADD COLUMN longitud DOUBLE DEFAULT -76.482656 AFTER latitud");
        $conn->query("ALTER TABLE salones ADD COLUMN visible TINYINT DEFAULT 1 AFTER longitud");
    }

    // Agregar índices para salones (solo si las columnas existen)
    $conn->query("ALTER TABLE salones ADD INDEX IF NOT EXISTS idx_visible (visible)");
    $conn->query("ALTER TABLE salones ADD INDEX IF NOT EXISTS idx_latitud_longitud (latitud, longitud)");

    // Tabla de matrículas
    $conn->query("CREATE TABLE IF NOT EXISTS matriculas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        estudiante_id INT NOT NULL,
        curso_id INT NOT NULL,
        semestre VARCHAR(20) NOT NULL,
        anio YEAR NOT NULL,
        fecha_matricula TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        estado ENUM('activa', 'completada', 'cancelada') DEFAULT 'activa',
        FOREIGN KEY (estudiante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
        UNIQUE KEY unique_matricula (estudiante_id, curso_id, semestre, anio)
    )");

    // Tabla de asignación de docentes a cursos
    $conn->query("CREATE TABLE IF NOT EXISTS asignacion_docentes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        curso_id INT NOT NULL,
        semestre VARCHAR(20) NOT NULL,
        anio YEAR NOT NULL,
        fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
        UNIQUE KEY unique_asignacion (usuario_id, curso_id, semestre, anio)
    )");

    // Tabla de horarios
    $conn->query("CREATE TABLE IF NOT EXISTS horarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        asignacion_docente_id INT,
        salon_id INT NOT NULL,
        dia_semana ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado') NOT NULL,
        hora_inicio TIME NOT NULL,
        hora_fin TIME NOT NULL,
        FOREIGN KEY (asignacion_docente_id) REFERENCES asignacion_docentes(id) ON DELETE SET NULL,
        FOREIGN KEY (salon_id) REFERENCES salones(id) ON DELETE CASCADE
    )");

    // Tabla de asistencias
    $conn->query("CREATE TABLE IF NOT EXISTS asistencias (
        id INT AUTO_INCREMENT PRIMARY KEY,
        estudiante_id INT NOT NULL,
        curso_id INT NOT NULL,
        fecha DATE NOT NULL,
        estado ENUM('presente', 'ausente', 'justificado') DEFAULT 'ausente',
        observaciones TEXT,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (estudiante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
        UNIQUE KEY unique_asistencia (estudiante_id, curso_id, fecha)
    )");

    // Tabla de calificaciones
    $conn->query("CREATE TABLE IF NOT EXISTS calificaciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        estudiante_id INT NOT NULL,
        curso_id INT NOT NULL,
        semestre VARCHAR(20) NOT NULL,
        anio YEAR NOT NULL,
        nota_final DECIMAL(3,1),
        estado ENUM('aprobado', 'reprobado', 'en_proceso') DEFAULT 'en_proceso',
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (estudiante_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
        UNIQUE KEY unique_calificacion (estudiante_id, curso_id, semestre, anio)
    )");

    // Insertar datos iniciales si las tablas están vacías
    $result = $conn->query("SELECT COUNT(*) as count FROM usuarios");
    $row = $result->fetch_assoc();

    if ($row['count'] == 0) {
        // Insertar usuario admin por defecto
        $password_hash = password_hash('admin123', PASSWORD_DEFAULT);
        $conn->query("INSERT INTO usuarios (tipo, identificacion, nombres, apellidos, email, password_hash) 
                     VALUES ('admin', '1000000000', 'Administrador', 'Sistema', 'admin@universidad.edu', '$password_hash')");

        // Insertar programas de ejemplo
        $conn->query("INSERT INTO programas (codigo, nombre, descripcion, duracion_semestres, creditos_totales) VALUES 
                     ('ING-SIS', 'Ingeniería de Sistemas', 'Programa de ingeniería de sistemas con enfoque en desarrollo de software', 10, 160),
                     ('ADM-EMP', 'Administración de Empresas', 'Programa de administración y gestión empresarial', 8, 140),
                     ('CON-PUB', 'Contaduría Pública', 'Programa de contaduría y finanzas', 9, 150)");

        // Insertar cursos de ejemplo
        $conn->query("INSERT INTO cursos (codigo, nombre, descripcion, creditos, programa_id) VALUES 
                     ('PROG1', 'Programación Básica', 'Introducción a la programación', 4, 1),
                     ('BASE1', 'Bases de Datos', 'Fundamentos de bases de datos', 4, 1),
                     ('MATE1', 'Matemáticas Básicas', 'Matemáticas fundamentales', 3, 1),
                     ('ADM1', 'Introducción a la Administración', 'Conceptos básicos de administración', 3, 2)");

        // Insertar salones de ejemplo
        $conn->query("INSERT INTO salones (codigo, edificio, capacidad, tipo) VALUES 
                     ('A101', 'Edificio A', 40, 'aula'),
                     ('A102', 'Edificio A', 35, 'aula'),
                     ('L201', 'Edificio B', 25, 'laboratorio'),
                     ('AUD1', 'Edificio Central', 100, 'auditorio')");

        // Insertar la materia "Matemática Básica" si no existe
        $result = $conn->query("SELECT COUNT(*) as count FROM cursos WHERE codigo = 'MATBAS'");
        $row = $result->fetch_assoc();

        if ($row['count'] == 0) {
            $conn->query("INSERT INTO cursos (codigo, nombre, descripcion, creditos, programa_id) VALUES 
                     ('MATBAS', 'Matemática Básica', 'Curso introductorio de matemáticas', 3, 1)");

            // Actualizar "Cálculo 1" para que tenga como prerequisito "Matemática Básica"
            $conn->query("UPDATE cursos SET prerequisito_id = (SELECT id FROM cursos WHERE codigo = 'MATBAS') WHERE codigo = 'MAT101'");
        }

        // Activar la materia "Matemática Básica" si no está activa
        $conn->query("UPDATE cursos SET activo = 1 WHERE codigo = 'MATBAS'");

        // Insertar datos iniciales de asignación de docentes

        $conn->query("INSERT INTO asignacion_docentes (usuario_id, curso_id, semestre, anio) VALUES 
                     (1, 1, '2025-1', 2025),
                     (2, 2, '2025-1', 2025),
                     (3, 3, '2025-1', 2025),
                     (4, 4, '2025-1', 2025)");

        // Insertar asignaciones de docentes para 2025-2 (semestre actual)
        $conn->query("INSERT INTO asignacion_docentes (usuario_id, curso_id, semestre, anio)
            SELECT usuario_id, curso_id, '2025-2', 2025 FROM asignacion_docentes WHERE semestre = '2025-1' AND anio = 2025");

        // Insertar estudiantes de ejemplo
        $password_hash_est = password_hash('estudiante123', PASSWORD_DEFAULT);
        $conn->query("INSERT INTO usuarios (tipo, identificacion, nombres, apellidos, email, password_hash) VALUES
            ('estudiante', '2000000001', 'Juan', 'Pérez', 'juan.perez@universidad.edu', '$password_hash_est'),
            ('estudiante', '2000000002', 'Ana', 'García', 'ana.garcia@universidad.edu', '$password_hash_est')");

        // Insertar matrículas activas para 2025-2 (para los cursos y estudiantes de ejemplo)
        $conn->query("INSERT INTO matriculas (estudiante_id, curso_id, semestre, anio, estado) VALUES
            (2, 1, '2025-2', 2025, 'activa'),
            (2, 2, '2025-2', 2025, 'activa'),
            (3, 1, '2025-2', 2025, 'activa'),
            (3, 3, '2025-2', 2025, 'activa')");

        echo json_encode(["message" => "Base de datos y datos iniciales creados exitosamente"]);
    } else {
        echo json_encode(["message" => "Base de datos ya existe y contiene datos"]);
    }
}

try {
    $conn = new mysqli("localhost", "root", "", "universidad_somospensadores");
    if ($conn->connect_error) {
        die("Error de conexión: " . $conn->connect_error);
    }
    createDatabaseAndTables($conn);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}

$conn->close();
?>