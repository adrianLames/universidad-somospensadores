<?php
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
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

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
        docente_id INT NOT NULL,
        curso_id INT NOT NULL,
        semestre VARCHAR(20) NOT NULL,
        anio YEAR NOT NULL,
        fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (docente_id) REFERENCES usuarios(id) ON DELETE CASCADE,
        FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
        UNIQUE KEY unique_asignacion (docente_id, curso_id, semestre, anio)
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
        
        echo json_encode(["message" => "Base de datos y datos iniciales creados exitosamente"]);
    } else {
        echo json_encode(["message" => "Base de datos ya existe y contiene datos"]);
    }
}

try {
    createDatabaseAndTables($conn);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}

$conn->close();
?>