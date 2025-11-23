-- Tabla de cursos
CREATE TABLE cursos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  creditos INT NOT NULL,
  programa_id INT,
  facultad_id INT,
  jornada ENUM('diurna','nocturna') NOT NULL DEFAULT 'diurna',
  activo TINYINT(1) DEFAULT 1,
  es_prerequisito TINYINT(1) DEFAULT 1, -- 1=puede ser prerequisito, 0=no puede
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (programa_id) REFERENCES programas(id),
  FOREIGN KEY (facultad_id) REFERENCES facultades(id)
);
-- SCRIPT: CREAR BASE DE DATOS UNIVERSITARIA DESDE CERO (NORMALIZADA)

DROP DATABASE IF EXISTS universidad_somospensadores;
CREATE DATABASE universidad_somospensadores;
USE universidad_somospensadores;

-- Tabla de facultades
CREATE TABLE facultades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL
);

-- Tabla de programas
CREATE TABLE programas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  facultad_id INT NOT NULL,
  duracion_semestres INT,
  creditos_totales INT,
  activo TINYINT(1) DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (facultad_id) REFERENCES facultades(id)
);

-- Tabla de usuarios
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('admin','docente','estudiante') NOT NULL,
  identificacion VARCHAR(20) NOT NULL UNIQUE,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telefono VARCHAR(15),
  fecha_nacimiento DATE,
  direccion TEXT,
  facultad_id INT,
  programa_id INT,
  password_hash VARCHAR(255) NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (facultad_id) REFERENCES facultades(id),
  FOREIGN KEY (programa_id) REFERENCES programas(id)
);

-- Tabla de docentes
CREATE TABLE docentes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL UNIQUE,
  facultad_id INT,
  programa_id INT,
  codigo_docente VARCHAR(20) UNIQUE,
  titulo_profesional VARCHAR(200),
  titulo_postgrado VARCHAR(200),
  experiencia_anos INT DEFAULT 0,
  tipo_contrato ENUM('tiempo_completo','tiempo_parcial','catedra','honorarios') DEFAULT 'catedra',
  salario_base DECIMAL(10,2) DEFAULT 0.00,
  fecha_vinculacion DATE,
  fecha_retiro DATE,
  estado_docente ENUM('activo','inactivo','pensionado','licencia') DEFAULT 'activo',
  horas_semanales INT DEFAULT 0,
  especialidad VARCHAR(200),
  cv_url VARCHAR(500),
  observaciones TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (facultad_id) REFERENCES facultades(id),
  FOREIGN KEY (programa_id) REFERENCES programas(id)
);

-- Tabla de estudiantes
CREATE TABLE estudiantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL UNIQUE,
  facultad_id INT,
  programa_id INT,
  codigo_estudiante VARCHAR(20) UNIQUE,
  semestre_actual INT DEFAULT 1,
  creditos_cursados INT DEFAULT 0,
  promedio_acumulado DECIMAL(3,2) DEFAULT 0.00,
  estado_estudiante ENUM('activo','inactivo','graduado','retirado') DEFAULT 'activo',
  fecha_ingreso DATE,
  fecha_graduacion DATE,
  observaciones TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (facultad_id) REFERENCES facultades(id),
  FOREIGN KEY (programa_id) REFERENCES programas(id)
);

-- Tabla de pendientes (registro público)
CREATE TABLE pendientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('admin','docente','estudiante') NOT NULL DEFAULT 'estudiante',
  identificacion VARCHAR(20) NOT NULL UNIQUE,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100),
  email VARCHAR(150) NOT NULL UNIQUE,
  telefono VARCHAR(20),
  fecha_nacimiento DATE,
  facultad_id INT,
  programa_id INT,
  password_hash VARCHAR(255) NOT NULL,
  direccion TEXT,
  estado ENUM('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (facultad_id) REFERENCES facultades(id),
  FOREIGN KEY (programa_id) REFERENCES programas(id)
);


-- Tabla de prerequisitos (relación N a N entre cursos)
CREATE TABLE prerequisitos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  curso_id INT NOT NULL,
  prerequisito_id INT NOT NULL,
  FOREIGN KEY (curso_id) REFERENCES cursos(id) ON DELETE CASCADE,
  FOREIGN KEY (prerequisito_id) REFERENCES cursos(id) ON DELETE CASCADE
);
