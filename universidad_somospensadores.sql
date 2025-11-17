-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-11-2025 a las 22:46:54
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `universidad_somospensadores`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administradores`
--

CREATE TABLE `administradores` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `codigo_empleado` varchar(20) DEFAULT NULL,
  `cargo` varchar(100) DEFAULT NULL,
  `departamento` varchar(100) DEFAULT NULL,
  `nivel_acceso` enum('super_admin','admin','admin_limitado') DEFAULT 'admin',
  `fecha_nombramiento` date DEFAULT NULL,
  `salario` decimal(10,2) DEFAULT 0.00,
  `supervisor_id` int(11) DEFAULT NULL,
  `permisos_especiales` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permisos_especiales`)),
  `estado_admin` enum('activo','inactivo','suspendido') DEFAULT 'activo',
  `observaciones` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `administradores`
--

INSERT INTO `administradores` (`id`, `usuario_id`, `codigo_empleado`, `cargo`, `departamento`, `nivel_acceso`, `fecha_nombramiento`, `salario`, `supervisor_id`, `permisos_especiales`, `estado_admin`, `observaciones`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 1, 'ADM-000001', 'Administrador del Sistema', NULL, 'admin', '2025-11-17', 0.00, NULL, NULL, 'activo', NULL, '2025-11-17 20:02:39', '2025-11-17 20:02:39'),
(2, 9, 'ADM-000009', 'Administrador del Sistema', NULL, 'admin', '2025-11-17', 0.00, NULL, NULL, 'activo', NULL, '2025-11-17 20:02:39', '2025-11-17 20:02:39'),
(3, 24, 'ADM-000024', 'Administrador', 'Administración', 'admin', '2025-11-17', 0.00, NULL, NULL, 'activo', NULL, '2025-11-17 21:06:39', '2025-11-17 21:06:39'),
(4, 27, 'ADM-000027', 'Director', 'Administración', '', '2025-11-17', 0.00, NULL, NULL, 'activo', NULL, '2025-11-17 21:09:11', '2025-11-17 21:09:11'),
(5, 28, 'ADM-000028', 'Administrador', 'Administración', 'admin', '2025-11-17', 0.00, NULL, NULL, 'activo', NULL, '2025-11-17 21:10:15', '2025-11-17 21:10:15');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignacion_docentes`
--

CREATE TABLE `asignacion_docentes` (
  `id` int(11) NOT NULL,
  `docente_id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `semestre` varchar(20) NOT NULL,
  `anio` year(4) NOT NULL,
  `fecha_asignacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `asignacion_docentes`
--

INSERT INTO `asignacion_docentes` (`id`, `docente_id`, `curso_id`, `semestre`, `anio`, `fecha_asignacion`) VALUES
(1, 3, 1, '2025-2', '2025', '2025-10-13 15:57:34'),
(15, 3, 2, '2025-1', '2025', '2025-11-16 02:40:36'),
(16, 3, 6, '1', '2025', '2025-11-16 02:41:00'),
(21, 4, 6, '2025-1', '2025', '2025-11-16 03:03:31');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencias`
--

CREATE TABLE `asistencias` (
  `id` int(11) NOT NULL,
  `estudiante_id` int(11) NOT NULL,
  `horario_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `estado` enum('presente','ausente','justificado') DEFAULT 'ausente',
  `observaciones` text DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `calificaciones`
--

CREATE TABLE `calificaciones` (
  `id` int(11) NOT NULL,
  `estudiante_id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `semestre` varchar(20) NOT NULL,
  `anio` year(4) NOT NULL,
  `nota_final` decimal(3,1) DEFAULT NULL,
  `estado` enum('aprobado','reprobado','en_proceso') DEFAULT 'en_proceso',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `calificaciones`
--

INSERT INTO `calificaciones` (`id`, `estudiante_id`, `curso_id`, `semestre`, `anio`, `nota_final`, `estado`, `fecha_registro`) VALUES
(1, 2, 1, '2025-1', '2025', 4.0, 'aprobado', '2025-11-15 17:17:26'),
(2, 2, 5, '2025-1', '2025', 3.0, 'aprobado', '2025-11-15 19:22:22'),
(3, 2, 1, '2026-1', '2025', 5.0, 'aprobado', '2025-11-16 00:43:40');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cursos`
--

CREATE TABLE `cursos` (
  `id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `creditos` int(11) NOT NULL,
  `programa_id` int(11) DEFAULT NULL,
  `prerequisito_id` int(11) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cursos`
--

INSERT INTO `cursos` (`id`, `codigo`, `nombre`, `descripcion`, `creditos`, `programa_id`, `prerequisito_id`, `activo`, `fecha_creacion`) VALUES
(1, 'PROG1', 'Programación Básica', 'Introducción a la programación', 4, 1, NULL, 1, '2025-10-13 15:27:10'),
(2, 'BASE1', 'Bases de Datos', 'Fundamentos de bases de datos', 4, 1, NULL, 1, '2025-10-13 15:27:10'),
(4, 'ADM1', 'Introducción a la Administración', 'Conceptos básicos de administración', 3, 2, NULL, 1, '2025-10-13 15:27:10'),
(5, 'MATBAS', 'Matemática Básica', 'Curso introductorio de matemáticas', 3, 1, NULL, 1, '2025-11-15 16:35:14'),
(6, 'CALCU', 'Cálculo 1', 'Matemáticas como suma, resta, multiplicación y división, o un procedimiento más complejo para obtener un resultado a partir de variables. \n', 4, 1, NULL, 1, '2025-11-15 19:38:45');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `docentes`
--

CREATE TABLE `docentes` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `codigo_docente` varchar(20) DEFAULT NULL,
  `titulo_profesional` varchar(200) DEFAULT NULL,
  `titulo_postgrado` varchar(200) DEFAULT NULL,
  `experiencia_anos` int(11) DEFAULT 0,
  `tipo_contrato` enum('tiempo_completo','tiempo_parcial','catedra','honorarios') DEFAULT 'catedra',
  `salario_base` decimal(10,2) DEFAULT 0.00,
  `fecha_vinculacion` date DEFAULT NULL,
  `fecha_retiro` date DEFAULT NULL,
  `estado_docente` enum('activo','inactivo','pensionado','licencia') DEFAULT 'activo',
  `horas_semanales` int(11) DEFAULT 0,
  `especialidad` varchar(200) DEFAULT NULL,
  `cv_url` varchar(500) DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `docentes`
--

INSERT INTO `docentes` (`id`, `usuario_id`, `codigo_docente`, `titulo_profesional`, `titulo_postgrado`, `experiencia_anos`, `tipo_contrato`, `salario_base`, `fecha_vinculacion`, `fecha_retiro`, `estado_docente`, `horas_semanales`, `especialidad`, `cv_url`, `observaciones`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 3, 'DOC-000003', NULL, NULL, 0, 'catedra', 0.00, '2025-11-17', NULL, 'activo', 0, NULL, NULL, NULL, '2025-11-17 20:02:39', '2025-11-17 20:02:39'),
(2, 4, 'DOC-000004', NULL, NULL, 0, 'catedra', 0.00, '2025-11-17', NULL, 'activo', 0, NULL, NULL, NULL, '2025-11-17 20:02:39', '2025-11-17 20:02:39'),
(3, 26, 'DOC-000026', 'Ingeniero', NULL, 5, '', 0.00, '2025-11-17', NULL, 'activo', 0, 'Desarrollo de Software', NULL, NULL, '2025-11-17 21:08:22', '2025-11-17 21:08:22'),
(4, 29, 'DOC-000029', '', NULL, 0, 'catedra', 0.00, '2025-11-17', NULL, 'activo', 0, '', NULL, NULL, '2025-11-17 21:11:14', '2025-11-17 21:11:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estudiantes`
--

CREATE TABLE `estudiantes` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `codigo_estudiante` varchar(20) DEFAULT NULL,
  `semestre_actual` int(11) DEFAULT 1,
  `creditos_cursados` int(11) DEFAULT 0,
  `promedio_acumulado` decimal(3,2) DEFAULT 0.00,
  `estado_estudiante` enum('activo','inactivo','graduado','retirado') DEFAULT 'activo',
  `fecha_ingreso` date DEFAULT NULL,
  `fecha_graduacion` date DEFAULT NULL,
  `observaciones` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estudiantes`
--

INSERT INTO `estudiantes` (`id`, `usuario_id`, `codigo_estudiante`, `semestre_actual`, `creditos_cursados`, `promedio_acumulado`, `estado_estudiante`, `fecha_ingreso`, `fecha_graduacion`, `observaciones`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 2, 'EST-000002', 1, 0, 0.00, 'activo', '2025-11-17', NULL, NULL, '2025-11-17 20:02:39', '2025-11-17 20:02:39'),
(2, 5, 'EST-000005', 1, 0, 0.00, 'activo', '2025-11-17', NULL, NULL, '2025-11-17 20:02:39', '2025-11-17 20:02:39'),
(3, 6, 'EST-000006', 1, 0, 0.00, 'activo', '2025-11-17', NULL, NULL, '2025-11-17 20:02:39', '2025-11-17 20:02:39'),
(4, 7, 'EST-000007', 1, 0, 0.00, 'activo', '2025-11-17', NULL, NULL, '2025-11-17 20:02:39', '2025-11-17 20:02:39'),
(5, 8, 'EST-000008', 1, 0, 0.00, 'activo', '2025-11-17', NULL, NULL, '2025-11-17 20:02:39', '2025-11-17 20:02:39'),
(6, 11, 'EST-000011', 1, 0, 0.00, 'activo', '2025-11-17', NULL, NULL, '2025-11-17 20:02:39', '2025-11-17 20:02:39'),
(8, 19, 'EST-000019', 1, 0, 0.00, 'activo', '2025-11-17', NULL, NULL, '2025-11-17 21:01:04', '2025-11-17 21:01:04'),
(9, 23, 'EST-000023', 1, 0, 0.00, 'activo', '2025-11-17', NULL, NULL, '2025-11-17 21:05:50', '2025-11-17 21:05:50');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE `horarios` (
  `id` int(11) NOT NULL,
  `asignacion_docente_id` int(11) NOT NULL,
  `salon_id` int(11) NOT NULL,
  `dia_semana` enum('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `horarios`
--

INSERT INTO `horarios` (`id`, `asignacion_docente_id`, `salon_id`, `dia_semana`, `hora_inicio`, `hora_fin`) VALUES
(1, 1, 1, 'Lunes', '08:00:00', '10:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `materias`
--

CREATE TABLE `materias` (
  `id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `creditos` int(11) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `horas_semanales` int(11) DEFAULT 0,
  `estado` enum('activa','inactiva') DEFAULT 'activa',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `materias`
--

INSERT INTO `materias` (`id`, `codigo`, `nombre`, `creditos`, `descripcion`, `horas_semanales`, `estado`, `created_at`, `updated_at`) VALUES
(1, 'MAT101', 'Cálculo I', 4, 'Fundamentos del cálculo diferencial e integral', 5, 'activa', '2025-10-13 15:46:03', '2025-10-13 15:46:03'),
(2, 'FIS101', 'Física General', 3, 'Principios fundamentales de la física', 4, 'activa', '2025-10-13 15:46:03', '2025-10-13 15:46:03'),
(3, 'PROG101', 'Programación I', 4, 'Introducción a la programación con Python', 5, 'activa', '2025-10-13 15:46:03', '2025-10-13 15:46:03'),
(4, 'BD101', 'Base de Datos', 3, 'Diseño e implementación de bases de datos', 4, 'activa', '2025-10-13 15:46:03', '2025-10-13 15:46:03'),
(5, 'MAT102', 'Álgebra Lineal', 3, 'Álgebra de matrices y espacios vectoriales', 4, 'activa', '2025-10-13 15:46:03', '2025-10-13 15:46:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `matriculas`
--

CREATE TABLE `matriculas` (
  `id` int(11) NOT NULL,
  `estudiante_id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `semestre` varchar(20) NOT NULL,
  `anio` year(4) NOT NULL,
  `fecha_matricula` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('activa','completada','cancelada') DEFAULT 'activa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `matriculas`
--

INSERT INTO `matriculas` (`id`, `estudiante_id`, `curso_id`, `semestre`, `anio`, `fecha_matricula`, `estado`) VALUES
(1, 2, 5, '2025-1', '2025', '2025-11-15 17:05:17', 'cancelada'),
(2, 2, 6, '2025-2', '2025', '2025-11-15 19:45:10', 'activa'),
(3, 2, 6, '2025-1', '2025', '2025-11-15 19:52:34', 'cancelada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programas`
--

CREATE TABLE `programas` (
  `id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `facultad` varchar(100) DEFAULT NULL,
  `duracion_semestres` int(11) DEFAULT NULL,
  `creditos_totales` int(11) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `programas`
--

INSERT INTO `programas` (`id`, `codigo`, `nombre`, `descripcion`, `facultad`, `duracion_semestres`, `creditos_totales`, `activo`, `fecha_creacion`) VALUES
(1, 'ING-SIS', 'Ingeniería de Sistemas', 'Programa de ingeniería de sistemas con enfoque en desarrollo de software', 'Ingeniería', 10, 160, 1, '2025-10-13 15:27:10'),
(2, 'ADM-EMP', 'Administración de Empresas', 'Programa de administración y gestión empresarial', 'Ciencias Administrativas', 8, 140, 1, '2025-10-13 15:27:10'),
(3, 'CON-PUB', 'Contaduría Pública', 'Programa de contaduría y finanzas', 'Ciencias Económicas', 9, 150, 1, '2025-10-13 15:27:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `salones`
--

CREATE TABLE `salones` (
  `id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `edificio` varchar(50) DEFAULT NULL,
  `capacidad` int(11) DEFAULT NULL,
  `tipo` enum('aula','laboratorio','auditorio') DEFAULT 'aula',
  `equipamiento` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `salones`
--

INSERT INTO `salones` (`id`, `codigo`, `edificio`, `capacidad`, `tipo`, `equipamiento`, `activo`, `fecha_creacion`) VALUES
(1, 'A101', 'Edificio A', 40, 'aula', NULL, 1, '2025-10-13 15:27:10'),
(2, 'A102', 'Edificio A', 35, 'aula', NULL, 1, '2025-10-13 15:27:10'),
(3, 'L201', 'Edificio B', 25, 'laboratorio', NULL, 1, '2025-10-13 15:27:10'),
(4, 'AUD1', 'Edificio Central', 100, 'auditorio', NULL, 1, '2025-10-13 15:27:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seguimiento_academico`
--

CREATE TABLE `seguimiento_academico` (
  `id` int(11) NOT NULL,
  `estudiante_id` int(11) NOT NULL,
  `programa_id` int(11) NOT NULL,
  `semestre_actual` int(11) DEFAULT NULL,
  `creditos_aprobados` int(11) DEFAULT 0,
  `promedio` decimal(3,2) DEFAULT NULL,
  `estado` enum('activo','graduado','retirado','suspendido') DEFAULT 'activo',
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `tipo` enum('admin','docente','estudiante') NOT NULL,
  `identificacion` varchar(20) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `facultad` varchar(100) DEFAULT NULL,
  `programa_id` int(11) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `tipo`, `identificacion`, `nombres`, `apellidos`, `email`, `telefono`, `fecha_nacimiento`, `direccion`, `facultad`, `programa_id`, `password_hash`, `activo`, `fecha_creacion`) VALUES
(1, 'admin', '1000000000', 'Administrador', 'Sistema', 'admin@universidad.edu', NULL, NULL, NULL, NULL, NULL, '$2y$10$728rAcxmaLW5vPXbAekgBu5nREFdcqSaZDkjtCbTGe/Y5n3fXDnJy', 1, '2025-10-13 15:27:10'),
(2, '', '2', 'jal', 'fahjsdjh', 'jal.es@correounivalle.co', '31100', '2025-10-14', '', 'Ingeniería', 1, '$2y$10$kgrieOP0kEXkd4un6rn5D.b4cVDKiJh7S0BA6a7YRdB9kWXf5UtJ2', 1, '2025-10-13 15:28:47'),
(3, 'docente', '235', 'anjelo', 'lo', 'anjelo.doc@gmail.com', '1344', '2025-10-15', '', NULL, NULL, '$2y$10$GnK5wVKQFdoYn78w8W7/4ud/EKugTR159MZxlJRryVyqniMjLwfNa', 1, '2025-10-13 15:31:33'),
(4, 'docente', '789', 'Andres David', 'Villa Romero', 'andres@universidad.edu', '3147060060', '2001-08-16', '', NULL, NULL, '$2y$10$U2gK2a/DTYvr0nZr2qJrXuaHwPRKVf00Gbm5i0rcX8KrSAImxQaEa', 1, '2025-11-16 02:42:03'),
(5, 'estudiante', '52645', 'fabianm', 'gsuhudfg', 'fabian@correo.edu.co', '32594784', '2015-06-12', '', NULL, NULL, '$2y$10$wFNPh5wS4vazUvKM3Dj6sO9lqTJ20AC.3WjGKm0rO73wRjx2e.jaS', 1, '2025-11-16 03:57:01'),
(6, 'estudiante', '245845', 'FUAG', 'YDTRYEWTHI', 'FKIA@correo.co', '123', '2015-01-11', '', NULL, NULL, '$2y$10$hmVP5lo4ycGpA9e09Biaiu8F.9Hn5n8Vj3WsceDAemkeygpPUMUAO', 1, '2025-11-16 04:05:30'),
(7, 'estudiante', '788', 'prueba', 'khjhf', 'prueba@correo.co', '123', '2003-02-02', '', NULL, NULL, '$2y$10$l5PuVgQXneZ.MqbXohPiyO/i00KDukp8Q/sTyxqVisWnvuLRFa7KC', 1, '2025-11-16 04:14:00'),
(8, 'estudiante', '123', 'degu', '132', 'sda@correo.edu', '115', '2003-02-02', '', NULL, NULL, '$2y$10$8AAt35yDalEW84kjARuxL.EWETn2DISnOW0srigcmB7foJq4CmbVa', 1, '2025-11-16 04:43:57'),
(9, 'admin', '84', 'sdaud', 'sdad', 'admin2@correo.co', '1234', '2003-02-02', '', NULL, NULL, '$2y$10$GYlb0wftF..3nkp3YJZgQe7vREh0TUZ5LgWtOY7.YwM02TfJWzrwO', 1, '2025-11-16 20:32:43'),
(11, 'estudiante', '1223', 'adrian', 'lames', 'adrian@correo.co', '123', '0000-00-00', '', NULL, NULL, '$2y$10$UcaOu1wvoJZVlceU4ywNeeJdJqzsmxcMtUO2gyPRcTm.76BREojrq', 1, '2025-11-16 20:46:34'),
(19, '', '589489', 'jaider', 'u', 'hjajderi.u@correosomso.edu.co', '321341', '2025-11-26', '', 'Ciencias Administrativas', 2, '$2y$10$icHy5Mw3GTm2hMUTsIaSqOSud51sdiPqzO9QMQJVDXvxcecD1Lfju', 1, '2025-11-17 21:01:04'),
(23, 'estudiante', '1323', 'nat', 'u', 'nat@correo.co', '12321', '2025-11-12', '', 'Ciencias Económicas', 3, '$2y$10$4cRcRFN7eUMuX8MzcRnG7OrMGae2qzcQ04lihHaR3kjjZI9MMCy/O', 1, '2025-11-17 21:05:50'),
(24, 'admin', '1342', 'jaider', 'estrada', 'jaider.estrada@correo.admin.co', '4324234', '2003-02-20', '', 'Ingeniería', 1, '$2y$10$u..wgKQBo6l3pRowdAMQwOVQtl8.LlDp4t5IVeDdsGGZf3xebps5a', 1, '2025-11-17 21:06:39'),
(26, 'docente', 'DOC123456', 'Juan', 'Profesor', 'juan.profesor@test.com', '3001234567', '1980-01-01', 'Calle 123', 'Ingeniería', 1, '$2y$10$SCxkjfmwpOwW8n5rWPs5bOT8pQ/mI5Yhb6INx3B4PRUh2Vj/ua20G', 1, '2025-11-17 21:08:22'),
(27, 'admin', 'ADMIN123456', 'María', 'Administradora', 'maria.admin@test.com', '3001234567', '1975-01-01', 'Calle 456', 'Ciencias Administrativas', 2, '$2y$10$QVa0RQH7FZjjDJ2SNtAmbucxv3Bvafely3IoQ1EL/iKZmruWMJ90.', 1, '2025-11-17 21:09:11'),
(28, 'admin', '10065', 'andres', 'villa', 'adnres.villa@correoadmin.co', '1345654', '2000-05-10', '', 'Ingeniería', 1, '$2y$10$CBFBniIhBd4jKoGE6qbqfO5JM4.UDhSxLuL2msugEvvnsxmeaSQI.', 1, '2025-11-17 21:10:15'),
(29, 'docente', '789456', 'anjelo', 'villamarin', 'anjelo.villamarin@correodoc.co', '21344531', '2000-05-20', '', 'Ingeniería', 1, '$2y$10$wEEx0zpTByC656Mqc29lvOo9za7ZgikryLss3CrQofIXdq/CbzZy2', 1, '2025-11-17 21:11:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_backup_emergency`
--

CREATE TABLE `usuarios_backup_emergency` (
  `id` int(11) NOT NULL DEFAULT 0,
  `tipo` enum('admin','docente','estudiante') NOT NULL,
  `identificacion` varchar(20) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `facultad` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `programa_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios_backup_emergency`
--

INSERT INTO `usuarios_backup_emergency` (`id`, `tipo`, `identificacion`, `nombres`, `apellidos`, `email`, `telefono`, `fecha_nacimiento`, `direccion`, `facultad`, `password_hash`, `activo`, `fecha_creacion`, `programa_id`) VALUES
(1, 'admin', '1000000000', 'Administrador', 'Sistema', 'admin@universidad.edu', NULL, NULL, NULL, NULL, '$2y$10$728rAcxmaLW5vPXbAekgBu5nREFdcqSaZDkjtCbTGe/Y5n3fXDnJy', 1, '2025-10-13 15:27:10', NULL),
(2, 'estudiante', '2', 'jal', 'fahjsdjh', 'jal.es@correounivalle.co', '31100', '2025-10-14', '', NULL, '$2y$10$kgrieOP0kEXkd4un6rn5D.b4cVDKiJh7S0BA6a7YRdB9kWXf5UtJ2', 1, '2025-10-13 15:28:47', NULL),
(3, 'docente', '235', 'anjelo', 'lo', 'anjelo.doc@gmail.com', '1344', '2025-10-15', '', NULL, '$2y$10$GnK5wVKQFdoYn78w8W7/4ud/EKugTR159MZxlJRryVyqniMjLwfNa', 1, '2025-10-13 15:31:33', NULL),
(4, 'docente', '789', 'Andres David', 'Villa Romero', 'andres@universidad.edu', '3147060060', '2001-08-16', '', NULL, '$2y$10$U2gK2a/DTYvr0nZr2qJrXuaHwPRKVf00Gbm5i0rcX8KrSAImxQaEa', 1, '2025-11-16 02:42:03', NULL),
(5, 'estudiante', '52645', 'fabianm', 'gsuhudfg', 'fabian@correo.edu.co', '32594784', '2015-06-12', '', NULL, '$2y$10$wFNPh5wS4vazUvKM3Dj6sO9lqTJ20AC.3WjGKm0rO73wRjx2e.jaS', 1, '2025-11-16 03:57:01', NULL),
(6, 'estudiante', '245845', 'FUAG', 'YDTRYEWTHI', 'FKIA@correo.co', '123', '2015-01-11', '', NULL, '$2y$10$hmVP5lo4ycGpA9e09Biaiu8F.9Hn5n8Vj3WsceDAemkeygpPUMUAO', 1, '2025-11-16 04:05:30', NULL),
(7, 'estudiante', '788', 'prueba', 'khjhf', 'prueba@correo.co', '123', '2003-02-02', '', NULL, '$2y$10$l5PuVgQXneZ.MqbXohPiyO/i00KDukp8Q/sTyxqVisWnvuLRFa7KC', 1, '2025-11-16 04:14:00', NULL),
(8, 'estudiante', '123', 'degu', '132', 'sda@correo.edu', '115', '2003-02-02', '', NULL, '$2y$10$8AAt35yDalEW84kjARuxL.EWETn2DISnOW0srigcmB7foJq4CmbVa', 1, '2025-11-16 04:43:57', NULL),
(9, 'admin', '84', 'sdaud', 'sdad', 'admin2@correo.co', '1234', '2003-02-02', '', NULL, '$2y$10$GYlb0wftF..3nkp3YJZgQe7vREh0TUZ5LgWtOY7.YwM02TfJWzrwO', 1, '2025-11-16 20:32:43', NULL),
(11, 'estudiante', '1223', 'adrian', 'lames', 'adrian@correo.co', '123', '0000-00-00', '', NULL, '$2y$10$UcaOu1wvoJZVlceU4ywNeeJdJqzsmxcMtUO2gyPRcTm.76BREojrq', 1, '2025-11-16 20:46:34', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_backup_final`
--

CREATE TABLE `usuarios_backup_final` (
  `id` int(11) NOT NULL DEFAULT 0,
  `tipo` enum('admin','docente','estudiante') NOT NULL,
  `identificacion` varchar(20) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `programa_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios_backup_final`
--

INSERT INTO `usuarios_backup_final` (`id`, `tipo`, `identificacion`, `nombres`, `apellidos`, `email`, `telefono`, `fecha_nacimiento`, `direccion`, `password_hash`, `activo`, `fecha_creacion`, `programa_id`) VALUES
(1, 'admin', '1000000000', 'Administrador', 'Sistema', 'admin@universidad.edu', NULL, NULL, NULL, '$2y$10$728rAcxmaLW5vPXbAekgBu5nREFdcqSaZDkjtCbTGe/Y5n3fXDnJy', 1, '2025-10-13 15:27:10', NULL),
(2, 'estudiante', '2', 'jal', 'fahjsdjh', 'jal.es@correounivalle.co', '31100', '2025-10-14', '', '$2y$10$kgrieOP0kEXkd4un6rn5D.b4cVDKiJh7S0BA6a7YRdB9kWXf5UtJ2', 1, '2025-10-13 15:28:47', NULL),
(3, 'docente', '235', 'anjelo', 'lo', 'anjelo.doc@gmail.com', '1344', '2025-10-15', '', '$2y$10$GnK5wVKQFdoYn78w8W7/4ud/EKugTR159MZxlJRryVyqniMjLwfNa', 1, '2025-10-13 15:31:33', NULL),
(4, 'docente', '789', 'Andres David', 'Villa Romero', 'andres@universidad.edu', '3147060060', '2001-08-16', '', '$2y$10$U2gK2a/DTYvr0nZr2qJrXuaHwPRKVf00Gbm5i0rcX8KrSAImxQaEa', 1, '2025-11-16 02:42:03', NULL),
(5, 'estudiante', '52645', 'fabianm', 'gsuhudfg', 'fabian@correo.edu.co', '32594784', '2015-06-12', '', '$2y$10$wFNPh5wS4vazUvKM3Dj6sO9lqTJ20AC.3WjGKm0rO73wRjx2e.jaS', 1, '2025-11-16 03:57:01', NULL),
(6, 'estudiante', '245845', 'FUAG', 'YDTRYEWTHI', 'FKIA@correo.co', '123', '2015-01-11', '', '$2y$10$hmVP5lo4ycGpA9e09Biaiu8F.9Hn5n8Vj3WsceDAemkeygpPUMUAO', 1, '2025-11-16 04:05:30', NULL),
(7, 'estudiante', '788', 'prueba', 'khjhf', 'prueba@correo.co', '123', '2003-02-02', '', '$2y$10$l5PuVgQXneZ.MqbXohPiyO/i00KDukp8Q/sTyxqVisWnvuLRFa7KC', 1, '2025-11-16 04:14:00', NULL),
(8, 'estudiante', '123', 'degu', '132', 'sda@correo.edu', '115', '2003-02-02', '', '$2y$10$8AAt35yDalEW84kjARuxL.EWETn2DISnOW0srigcmB7foJq4CmbVa', 1, '2025-11-16 04:43:57', NULL),
(9, 'admin', '84', 'sdaud', 'sdad', 'admin2@correo.co', '1234', '2003-02-02', '', '$2y$10$GYlb0wftF..3nkp3YJZgQe7vREh0TUZ5LgWtOY7.YwM02TfJWzrwO', 1, '2025-11-16 20:32:43', NULL),
(11, 'estudiante', '1223', 'adrian', 'lames', 'adrian@correo.co', '123', '0000-00-00', '', '$2y$10$UcaOu1wvoJZVlceU4ywNeeJdJqzsmxcMtUO2gyPRcTm.76BREojrq', 1, '2025-11-16 20:46:34', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_backup_real`
--

CREATE TABLE `usuarios_backup_real` (
  `id` int(11) NOT NULL DEFAULT 0,
  `tipo` enum('admin','docente','estudiante') NOT NULL,
  `identificacion` varchar(20) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `programa_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios_backup_real`
--

INSERT INTO `usuarios_backup_real` (`id`, `tipo`, `identificacion`, `nombres`, `apellidos`, `email`, `telefono`, `fecha_nacimiento`, `direccion`, `password_hash`, `activo`, `fecha_creacion`, `programa_id`) VALUES
(1, 'admin', '1000000000', 'Administrador', 'Sistema', 'admin@universidad.edu', NULL, NULL, NULL, '$2y$10$728rAcxmaLW5vPXbAekgBu5nREFdcqSaZDkjtCbTGe/Y5n3fXDnJy', 1, '2025-10-13 15:27:10', NULL),
(2, 'estudiante', '2', 'jal', 'fahjsdjh', 'jal.es@correounivalle.co', '31100', '2025-10-14', '', '$2y$10$kgrieOP0kEXkd4un6rn5D.b4cVDKiJh7S0BA6a7YRdB9kWXf5UtJ2', 1, '2025-10-13 15:28:47', NULL),
(3, 'docente', '235', 'anjelo', 'lo', 'anjelo.doc@gmail.com', '1344', '2025-10-15', '', '$2y$10$GnK5wVKQFdoYn78w8W7/4ud/EKugTR159MZxlJRryVyqniMjLwfNa', 1, '2025-10-13 15:31:33', NULL),
(4, 'docente', '789', 'Andres David', 'Villa Romero', 'andres@universidad.edu', '3147060060', '2001-08-16', '', '$2y$10$U2gK2a/DTYvr0nZr2qJrXuaHwPRKVf00Gbm5i0rcX8KrSAImxQaEa', 1, '2025-11-16 02:42:03', NULL),
(5, 'estudiante', '52645', 'fabianm', 'gsuhudfg', 'fabian@correo.edu.co', '32594784', '2015-06-12', '', '$2y$10$wFNPh5wS4vazUvKM3Dj6sO9lqTJ20AC.3WjGKm0rO73wRjx2e.jaS', 1, '2025-11-16 03:57:01', NULL),
(6, 'estudiante', '245845', 'FUAG', 'YDTRYEWTHI', 'FKIA@correo.co', '123', '2015-01-11', '', '$2y$10$hmVP5lo4ycGpA9e09Biaiu8F.9Hn5n8Vj3WsceDAemkeygpPUMUAO', 1, '2025-11-16 04:05:30', NULL),
(7, 'estudiante', '788', 'prueba', 'khjhf', 'prueba@correo.co', '123', '2003-02-02', '', '$2y$10$l5PuVgQXneZ.MqbXohPiyO/i00KDukp8Q/sTyxqVisWnvuLRFa7KC', 1, '2025-11-16 04:14:00', NULL),
(8, 'estudiante', '123', 'degu', '132', 'sda@correo.edu', '115', '2003-02-02', '', '$2y$10$8AAt35yDalEW84kjARuxL.EWETn2DISnOW0srigcmB7foJq4CmbVa', 1, '2025-11-16 04:43:57', NULL),
(9, 'admin', '84', 'sdaud', 'sdad', 'admin2@correo.co', '1234', '2003-02-02', '', '$2y$10$GYlb0wftF..3nkp3YJZgQe7vREh0TUZ5LgWtOY7.YwM02TfJWzrwO', 1, '2025-11-16 20:32:43', NULL),
(11, 'estudiante', '1223', 'adrian', 'lames', 'adrian@correo.co', '123', '0000-00-00', '', '$2y$10$UcaOu1wvoJZVlceU4ywNeeJdJqzsmxcMtUO2gyPRcTm.76BREojrq', 1, '2025-11-16 20:46:34', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios_old_backup`
--

CREATE TABLE `usuarios_old_backup` (
  `id` int(11) NOT NULL,
  `tipo` enum('admin','docente','estudiante') NOT NULL,
  `identificacion` varchar(20) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `facultad` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `programa_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios_old_backup`
--

INSERT INTO `usuarios_old_backup` (`id`, `tipo`, `identificacion`, `nombres`, `apellidos`, `email`, `telefono`, `fecha_nacimiento`, `direccion`, `facultad`, `password_hash`, `activo`, `fecha_creacion`, `programa_id`) VALUES
(1, 'admin', '1000000000', 'Administrador', 'Sistema', 'admin@universidad.edu', NULL, NULL, NULL, NULL, '$2y$10$728rAcxmaLW5vPXbAekgBu5nREFdcqSaZDkjtCbTGe/Y5n3fXDnJy', 1, '2025-10-13 15:27:10', NULL),
(2, 'estudiante', '2', 'jal', 'fahjsdjh', 'jal.es@correounivalle.co', '31100', '2025-10-14', '', NULL, '$2y$10$kgrieOP0kEXkd4un6rn5D.b4cVDKiJh7S0BA6a7YRdB9kWXf5UtJ2', 1, '2025-10-13 15:28:47', NULL),
(3, 'docente', '235', 'anjelo', 'lo', 'anjelo.doc@gmail.com', '1344', '2025-10-15', '', NULL, '$2y$10$GnK5wVKQFdoYn78w8W7/4ud/EKugTR159MZxlJRryVyqniMjLwfNa', 1, '2025-10-13 15:31:33', NULL),
(4, 'docente', '789', 'Andres David', 'Villa Romero', 'andres@universidad.edu', '3147060060', '2001-08-16', '', NULL, '$2y$10$U2gK2a/DTYvr0nZr2qJrXuaHwPRKVf00Gbm5i0rcX8KrSAImxQaEa', 1, '2025-11-16 02:42:03', NULL),
(5, 'estudiante', '52645', 'fabianm', 'gsuhudfg', 'fabian@correo.edu.co', '32594784', '2015-06-12', '', NULL, '$2y$10$wFNPh5wS4vazUvKM3Dj6sO9lqTJ20AC.3WjGKm0rO73wRjx2e.jaS', 1, '2025-11-16 03:57:01', NULL),
(6, 'estudiante', '245845', 'FUAG', 'YDTRYEWTHI', 'FKIA@correo.co', '123', '2015-01-11', '', NULL, '$2y$10$hmVP5lo4ycGpA9e09Biaiu8F.9Hn5n8Vj3WsceDAemkeygpPUMUAO', 1, '2025-11-16 04:05:30', NULL),
(7, 'estudiante', '788', 'prueba', 'khjhf', 'prueba@correo.co', '123', '2003-02-02', '', NULL, '$2y$10$l5PuVgQXneZ.MqbXohPiyO/i00KDukp8Q/sTyxqVisWnvuLRFa7KC', 1, '2025-11-16 04:14:00', NULL),
(8, 'estudiante', '123', 'degu', '132', 'sda@correo.edu', '115', '2003-02-02', '', NULL, '$2y$10$8AAt35yDalEW84kjARuxL.EWETn2DISnOW0srigcmB7foJq4CmbVa', 1, '2025-11-16 04:43:57', NULL),
(9, 'admin', '84', 'sdaud', 'sdad', 'admin2@correo.co', '1234', '2003-02-02', '', NULL, '$2y$10$GYlb0wftF..3nkp3YJZgQe7vREh0TUZ5LgWtOY7.YwM02TfJWzrwO', 1, '2025-11-16 20:32:43', NULL),
(11, 'estudiante', '1223', 'adrian', 'lames', 'adrian@correo.co', '123', '0000-00-00', '', NULL, '$2y$10$UcaOu1wvoJZVlceU4ywNeeJdJqzsmxcMtUO2gyPRcTm.76BREojrq', 1, '2025-11-16 20:46:34', NULL);

--
-- Disparadores `usuarios_old_backup`
--
DELIMITER $$
CREATE TRIGGER `after_usuario_insert_admin` AFTER INSERT ON `usuarios_old_backup` FOR EACH ROW BEGIN
    IF NEW.tipo = 'admin' THEN
        INSERT INTO admins (usuario_id) VALUES (NEW.id);
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_usuario_insert_docente` AFTER INSERT ON `usuarios_old_backup` FOR EACH ROW BEGIN
    IF NEW.tipo = 'docente' THEN
        INSERT INTO docentes (usuario_id, facultad) VALUES (NEW.id, NEW.facultad);
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_usuario_insert_estudiante` AFTER INSERT ON `usuarios_old_backup` FOR EACH ROW BEGIN
    IF NEW.tipo = 'estudiante' THEN
        INSERT INTO estudiantes (usuario_id, facultad) VALUES (NEW.id, NEW.facultad);
    END IF;
END
$$
DELIMITER ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administradores`
--
ALTER TABLE `administradores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`),
  ADD UNIQUE KEY `codigo_empleado` (`codigo_empleado`),
  ADD KEY `fk_admin_supervisor` (`supervisor_id`);

--
-- Indices de la tabla `asignacion_docentes`
--
ALTER TABLE `asignacion_docentes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_asignacion` (`docente_id`,`curso_id`,`semestre`,`anio`),
  ADD KEY `curso_id` (`curso_id`);

--
-- Indices de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_asistencia` (`estudiante_id`,`horario_id`,`fecha`),
  ADD KEY `horario_id` (`horario_id`);

--
-- Indices de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_calificacion` (`estudiante_id`,`curso_id`,`semestre`,`anio`),
  ADD KEY `curso_id` (`curso_id`);

--
-- Indices de la tabla `cursos`
--
ALTER TABLE `cursos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `programa_id` (`programa_id`),
  ADD KEY `prerequisito_id` (`prerequisito_id`);

--
-- Indices de la tabla `docentes`
--
ALTER TABLE `docentes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`),
  ADD UNIQUE KEY `codigo_docente` (`codigo_docente`);

--
-- Indices de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`),
  ADD UNIQUE KEY `codigo_estudiante` (`codigo_estudiante`);

--
-- Indices de la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `asignacion_docente_id` (`asignacion_docente_id`),
  ADD KEY `salon_id` (`salon_id`);

--
-- Indices de la tabla `materias`
--
ALTER TABLE `materias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `matriculas`
--
ALTER TABLE `matriculas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_matricula` (`estudiante_id`,`curso_id`,`semestre`,`anio`),
  ADD KEY `curso_id` (`curso_id`);

--
-- Indices de la tabla `programas`
--
ALTER TABLE `programas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `salones`
--
ALTER TABLE `salones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `seguimiento_academico`
--
ALTER TABLE `seguimiento_academico`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_seguimiento` (`estudiante_id`,`programa_id`),
  ADD KEY `programa_id` (`programa_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `identificacion` (`identificacion`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_usuario_programa` (`programa_id`);

--
-- Indices de la tabla `usuarios_old_backup`
--
ALTER TABLE `usuarios_old_backup`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `identificacion` (`identificacion`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_usuario_programa` (`programa_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administradores`
--
ALTER TABLE `administradores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `asignacion_docentes`
--
ALTER TABLE `asignacion_docentes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `cursos`
--
ALTER TABLE `cursos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `docentes`
--
ALTER TABLE `docentes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `materias`
--
ALTER TABLE `materias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `matriculas`
--
ALTER TABLE `matriculas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `programas`
--
ALTER TABLE `programas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `salones`
--
ALTER TABLE `salones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `seguimiento_academico`
--
ALTER TABLE `seguimiento_academico`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT de la tabla `usuarios_old_backup`
--
ALTER TABLE `usuarios_old_backup`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `administradores`
--
ALTER TABLE `administradores`
  ADD CONSTRAINT `fk_admin_supervisor` FOREIGN KEY (`supervisor_id`) REFERENCES `administradores` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_admin_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `asignacion_docentes`
--
ALTER TABLE `asignacion_docentes`
  ADD CONSTRAINT `asignacion_docentes_ibfk_1` FOREIGN KEY (`docente_id`) REFERENCES `usuarios_old_backup` (`id`),
  ADD CONSTRAINT `asignacion_docentes_ibfk_2` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`);

--
-- Filtros para la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`estudiante_id`) REFERENCES `usuarios_old_backup` (`id`),
  ADD CONSTRAINT `asistencias_ibfk_2` FOREIGN KEY (`horario_id`) REFERENCES `horarios` (`id`);

--
-- Filtros para la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD CONSTRAINT `calificaciones_ibfk_1` FOREIGN KEY (`estudiante_id`) REFERENCES `usuarios_old_backup` (`id`),
  ADD CONSTRAINT `calificaciones_ibfk_2` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`);

--
-- Filtros para la tabla `cursos`
--
ALTER TABLE `cursos`
  ADD CONSTRAINT `cursos_ibfk_1` FOREIGN KEY (`programa_id`) REFERENCES `programas` (`id`),
  ADD CONSTRAINT `cursos_ibfk_2` FOREIGN KEY (`prerequisito_id`) REFERENCES `cursos` (`id`);

--
-- Filtros para la tabla `docentes`
--
ALTER TABLE `docentes`
  ADD CONSTRAINT `fk_docente_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD CONSTRAINT `fk_estudiante_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD CONSTRAINT `horarios_ibfk_1` FOREIGN KEY (`asignacion_docente_id`) REFERENCES `asignacion_docentes` (`id`),
  ADD CONSTRAINT `horarios_ibfk_2` FOREIGN KEY (`salon_id`) REFERENCES `salones` (`id`);

--
-- Filtros para la tabla `matriculas`
--
ALTER TABLE `matriculas`
  ADD CONSTRAINT `matriculas_ibfk_1` FOREIGN KEY (`estudiante_id`) REFERENCES `usuarios_old_backup` (`id`),
  ADD CONSTRAINT `matriculas_ibfk_2` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`);

--
-- Filtros para la tabla `seguimiento_academico`
--
ALTER TABLE `seguimiento_academico`
  ADD CONSTRAINT `seguimiento_academico_ibfk_1` FOREIGN KEY (`estudiante_id`) REFERENCES `usuarios_old_backup` (`id`),
  ADD CONSTRAINT `seguimiento_academico_ibfk_2` FOREIGN KEY (`programa_id`) REFERENCES `programas` (`id`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuario_programa` FOREIGN KEY (`programa_id`) REFERENCES `programas` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
