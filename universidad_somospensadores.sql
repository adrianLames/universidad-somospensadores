-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-12-2025 a las 04:40:22
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
  `usuario_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignacion_docentes`
--

CREATE TABLE `asignacion_docentes` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `programa_id` int(11) DEFAULT NULL,
  `facultad_id` int(11) DEFAULT NULL,
  `anio` int(11) NOT NULL,
  `semestre` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `asignacion_docentes`
--

INSERT INTO `asignacion_docentes` (`id`, `usuario_id`, `curso_id`, `programa_id`, `facultad_id`, `anio`, `semestre`) VALUES
(22, 2, 11, 8, 1, 2025, 1),
(27, 2, 17, 8, 1, 2025, 1),
(28, 2, 18, 8, 1, 2025, 1),
(29, 2, 19, 8, 1, 2025, 1),
(30, 2, 20, 8, 1, 2025, 1),
(31, 2, 21, 8, 1, 2025, 1),
(32, 2, 22, 8, 1, 2025, 1),
(33, 2, 23, 8, 1, 2025, 1),
(34, 2, 24, 8, 1, 2025, 1),
(35, 2, 25, 8, 1, 2025, 1),
(36, 2, 26, 8, 1, 2025, 1),
(37, 2, 27, 8, 1, 2025, 1),
(38, 2, 28, 8, 1, 2025, 1),
(39, 2, 29, 8, 1, 2025, 1),
(40, 2, 30, 8, 1, 2025, 1),
(41, 2, 31, 8, 1, 2025, 1),
(42, 2, 32, 8, 1, 2025, 1),
(43, 2, 11, 5, 1, 2025, 2),
(44, 2, 17, 8, 1, 2025, 2),
(45, 2, 18, 8, 1, 2025, 2),
(46, 2, 19, 8, 1, 2025, 2),
(47, 2, 20, 8, 1, 2025, 2),
(48, 2, 21, 8, 1, 2025, 2),
(49, 2, 22, 8, 1, 2025, 2),
(50, 2, 23, 8, 1, 2025, 2),
(51, 2, 24, 8, 1, 2025, 2),
(52, 2, 25, 8, 1, 2025, 2),
(53, 2, 26, 8, 1, 2025, 2),
(54, 2, 27, 8, 1, 2025, 2),
(55, 2, 28, 8, 1, 2025, 2),
(56, 2, 29, 8, 1, 2025, 2),
(57, 2, 30, 8, 1, 2025, 2),
(58, 2, 31, 8, 1, 2025, 2),
(59, 2, 32, 8, 1, 2025, 2),
(74, 2, 90, 8, NULL, 2025, 1),
(75, 2, 64, 8, NULL, 2025, 1),
(76, 2, 90, 8, NULL, 2025, 2);

--
-- Disparadores `asignacion_docentes`
--
DELIMITER $$
CREATE TRIGGER `asignacion_docentes_before_insert` BEFORE INSERT ON `asignacion_docentes` FOR EACH ROW BEGIN
  DECLARE curso_programa_id INT;
  DECLARE curso_facultad_id INT;

  -- Obtener programa_id y facultad_id del curso relacionado
  SELECT programa_id, facultad_id
  INTO curso_programa_id, curso_facultad_id
  FROM cursos
  WHERE id = NEW.curso_id;

  -- Asignar los valores al nuevo registro
  SET NEW.programa_id = curso_programa_id;
  SET NEW.facultad_id = curso_facultad_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asistencias`
--

CREATE TABLE `asistencias` (
  `id` int(11) NOT NULL,
  `estudiante_id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `estado` enum('presente','ausente','justificado') DEFAULT 'ausente',
  `observaciones` text DEFAULT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `asistencias`
--

INSERT INTO `asistencias` (`id`, `estudiante_id`, `curso_id`, `fecha`, `estado`, `observaciones`, `fecha_registro`) VALUES
(1, 12, 90, '2025-12-03', 'presente', '', '2025-12-03 02:58:12'),
(2, 12, 90, '2025-12-02', 'presente', '', '2025-12-03 03:00:03');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `calificaciones`
--

CREATE TABLE `calificaciones` (
  `id` int(11) NOT NULL,
  `estudiante_id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `tarea_id` int(11) DEFAULT NULL,
  `semestre` varchar(20) NOT NULL,
  `anio` year(4) NOT NULL,
  `nota_final` decimal(3,1) DEFAULT NULL,
  `estado` enum('aprobado','reprobado','en_proceso') DEFAULT 'en_proceso',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `comentarios` text DEFAULT NULL,
  `fecha_calificacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `calificaciones`
--

INSERT INTO `calificaciones` (`id`, `estudiante_id`, `curso_id`, `tarea_id`, `semestre`, `anio`, `nota_final`, `estado`, `fecha_registro`, `comentarios`, `fecha_calificacion`) VALUES
(3, 12, 90, NULL, '2025-1', '2025', 4.5, 'aprobado', '2025-12-03 03:13:48', NULL, '2025-12-02 22:13:48');

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
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `facultad_id` int(11) DEFAULT NULL,
  `jornada` enum('diurna','nocturna') NOT NULL DEFAULT 'diurna',
  `es_prerequisito` tinyint(1) DEFAULT 1 COMMENT '1=puede ser prerequisito, 0=no puede',
  `es_publico` tinyint(1) DEFAULT 0 COMMENT 'Indica si el curso es p??blico (visible para usuarios no autenticados)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `cursos`
--

INSERT INTO `cursos` (`id`, `codigo`, `nombre`, `descripcion`, `creditos`, `programa_id`, `prerequisito_id`, `activo`, `fecha_creacion`, `facultad_id`, `jornada`, `es_prerequisito`, `es_publico`) VALUES
(11, '111023C_AL', 'Algebra Lineal', NULL, 3, 5, NULL, 1, '2025-11-25 22:52:40', 1, 'nocturna', 1, 0),
(17, '750090C', 'Matemáticas Discretas II', NULL, 4, 8, NULL, 1, '2025-11-25 22:52:40', 1, 'nocturna', 1, 0),
(18, '750088C', 'Análisis y Diseño de Algoritmos', NULL, 3, 8, NULL, 1, '2025-11-25 22:52:40', 1, 'nocturna', 1, 0),
(19, '204130C_ED', 'Estructuras de Datos', NULL, 3, 8, NULL, 1, '2025-11-25 22:52:40', 1, 'nocturna', 1, 0),
(20, '750042C', 'Bases de Datos', NULL, 4, 8, NULL, 1, '2025-11-25 22:52:40', 1, 'nocturna', 1, 0),
(21, '750092C', 'Desarrollo de Software I', NULL, 4, 8, NULL, 1, '2025-11-25 22:52:40', 1, 'nocturna', 1, 0),
(22, '750091C', 'Desarrollo de Software II', NULL, 3, 8, NULL, 1, '2025-11-25 22:52:40', 1, 'nocturna', 1, 0),
(23, '750090C_IE', 'Ingeniería Estructurada', NULL, 3, 8, NULL, 1, '2025-11-25 22:52:40', 1, 'nocturna', 1, 0),
(24, '750089C', 'Sistemas Operacionales', NULL, 3, 8, NULL, 1, '2025-11-25 22:52:40', 1, 'nocturna', 1, 0),
(25, '750086C', 'Desarrollo en Arquitectura Empresarial', NULL, 2, 8, NULL, 1, '2025-11-25 22:52:40', 1, 'nocturna', 1, 0),
(26, '750087C', 'Proyección Integrada', NULL, 4, 8, NULL, 1, '2025-11-25 22:52:40', 1, 'nocturna', 1, 0),
(27, '750084C', 'Desarrollo Avanzado de Interfaces', NULL, 3, 8, NULL, 1, '2025-11-25 22:52:40', 1, 'nocturna', 1, 0),
(28, '750081C', 'Electiva Profesional I', NULL, 3, 8, NULL, 1, '2025-11-25 22:52:40', 1, 'nocturna', 1, 0),
(29, '750082C', 'Electiva Profesional II', NULL, 3, 8, NULL, 1, '2025-11-25 22:52:40', 1, 'nocturna', 1, 0),
(30, '750083C', 'Electiva Profesional III', NULL, 3, 8, NULL, 1, '2025-11-25 22:52:40', 1, 'nocturna', 1, 0),
(31, '204829C', 'Inglés con Fines Específicos y Académicos', NULL, 4, 8, NULL, 1, '2025-11-25 22:52:40', 1, 'nocturna', 1, 0),
(32, '204830C', 'Inglés con Fines Generales y Académicos', NULL, 4, 8, NULL, 1, '2025-11-25 22:52:40', 1, 'nocturna', 1, 0),
(64, '111023C_D', 'Matemática Básica', NULL, 4, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(65, '711016C_D', 'Introducción a las Tecnologías', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(66, '711008C_D', 'Taller Tecnológico I', NULL, 2, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(67, '111021C_D', 'Cálculo', NULL, 4, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(68, '111038C_D', 'Álgebra Lineal', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(69, '711009C_D', 'Taller Tecnológico II', NULL, 2, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(70, '70100C_D', 'Programación de Textos Arquitectónicos', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(71, '111021C_PROG1_D', 'Fundamentos de Programación I', NULL, 4, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(72, '761001C_D', 'Probabilidad y Estadística', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(73, '750004C_D', 'Matemáticas Discretas I', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(74, '711010C_D', 'Taller Tecnológico III', NULL, 2, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(75, '70101C_D', 'Programación Orientada a Objetos', NULL, 4, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(76, '750005C_D', 'Matemáticas Discretas II', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(77, '711011C_D', 'Taller Tecnológico IV', NULL, 2, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(78, '70102C_D', 'Estructura de Datos', NULL, 4, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(79, '70103C_D', 'Base de Datos I', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(80, '711012C_D', 'Taller Tecnológico V', NULL, 2, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(81, '70104C_D', 'Algoritmos', NULL, 4, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(82, '70105C_D', 'Base de Datos II', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(83, '70106C_D', 'Ingeniería de Software I', NULL, 4, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(84, '711013C_D', 'Taller Tecnológico VI', NULL, 2, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(85, '70107C_D', 'Arquitectura de Software', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(86, '70108C_D', 'Ingeniería de Software II', NULL, 4, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(87, '70109C_D', 'Redes de Computadores', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(88, '204130C_D', 'Fundamentos de Textos Asignaciones', NULL, 2, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(89, '40409C_D', 'Deporte y Salud', NULL, 2, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'diurna', 1, 0),
(90, '111023C_N', 'Matemática Básica', NULL, 4, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(91, '711016C_N', 'Introducción a las Tecnologías', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(92, '711008C_N', 'Taller Tecnológico I', NULL, 2, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(93, '111021C_N', 'Cálculo', NULL, 4, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(94, '111038C_N', 'Álgebra Lineal', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(95, '711009C_N', 'Taller Tecnológico II', NULL, 2, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(96, '70100C_N', 'Programación de Textos Arquitectónicos', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(97, '111021C_PROG1_N', 'Fundamentos de Programación I', NULL, 4, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(98, '761001C_N', 'Probabilidad y Estadística', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(99, '750004C_N', 'Matemáticas Discretas I', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(100, '711010C_N', 'Taller Tecnológico III', NULL, 2, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(101, '70101C_N', 'Programación Orientada a Objetos', NULL, 4, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(102, '750005C_N', 'Matemáticas Discretas II', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(103, '711011C_N', 'Taller Tecnológico IV', NULL, 2, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(104, '70102C_N', 'Estructura de Datos', NULL, 4, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(105, '70103C_N', 'Base de Datos I', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(106, '711012C_N', 'Taller Tecnológico V', NULL, 2, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(107, '70104C_N', 'Algoritmos', NULL, 4, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(108, '70105C_N', 'Base de Datos II', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(109, '70106C_N', 'Ingeniería de Software I', NULL, 4, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(110, '711013C_N', 'Taller Tecnológico VI', NULL, 2, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(111, '70107C_N', 'Arquitectura de Software', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(112, '70108C_N', 'Ingeniería de Software II', NULL, 4, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(113, '70109C_N', 'Redes de Computadores', NULL, 3, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(114, '204130C_N', 'Fundamentos de Textos Asignaciones', NULL, 2, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(115, '40409C_N', 'Deporte y Salud', NULL, 2, 8, NULL, 1, '2025-11-26 03:40:31', NULL, 'nocturna', 1, 0),
(116, 'PUB01', 'matematica', '', 2, 8, NULL, 1, '2025-12-03 03:26:38', 1, 'diurna', 0, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `docentes`
--

CREATE TABLE `docentes` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `facultad_id` int(11) DEFAULT NULL,
  `programa_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `docentes`
--

INSERT INTO `docentes` (`id`, `usuario_id`, `facultad_id`, `programa_id`) VALUES
(1, 2, 1, 4),
(2, 4, 1, 4);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entregas`
--

CREATE TABLE `entregas` (
  `id` int(11) NOT NULL,
  `tarea_id` int(11) NOT NULL,
  `estudiante_id` int(11) NOT NULL,
  `fecha_entrega` datetime DEFAULT current_timestamp(),
  `archivo_url` varchar(500) DEFAULT NULL,
  `comentario` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estudiantes`
--

CREATE TABLE `estudiantes` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `facultad_id` int(11) DEFAULT NULL,
  `programa_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `estudiantes`
--

INSERT INTO `estudiantes` (`id`, `usuario_id`, `facultad_id`, `programa_id`) VALUES
(4, 12, 2, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facultades`
--

CREATE TABLE `facultades` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `facultades`
--

INSERT INTO `facultades` (`id`, `nombre`) VALUES
(2, 'ECONOMIA'),
(1, 'INGENIERIA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE `horarios` (
  `id` int(11) NOT NULL,
  `salon_id` int(11) NOT NULL,
  `dia_semana` enum('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL,
  `docente_id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `color` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `horarios`
--

INSERT INTO `horarios` (`id`, `salon_id`, `dia_semana`, `hora_inicio`, `hora_fin`, `docente_id`, `curso_id`, `color`) VALUES
(56, 2, 'Martes', '08:00:00', '10:00:00', 2, 11, '#dcedc8'),
(57, 1, 'Lunes', '08:00:00', '10:00:00', 4, 1, '#dcedc8'),
(59, 3, 'Miércoles', '01:00:00', '07:00:00', 4, 2, '#ffe0b2'),
(62, 3, 'Lunes', '08:00:00', '10:00:00', 4, 2, '#ffe0b2');

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
(17, 13, 11, '1', '2025', '2025-11-25 23:04:31', 'activa'),
(18, 14, 11, '1', '2025', '2025-11-25 23:04:31', 'activa'),
(19, 15, 11, '1', '2025', '2025-11-25 23:04:31', 'activa'),
(52, 12, 11, '1', '2025', '2025-12-02 17:06:40', 'activa'),
(53, 12, 90, '2', '2025', '2025-12-03 01:42:52', 'cancelada'),
(54, 12, 90, '1', '2025', '2025-12-03 02:37:13', 'activa');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pendientes`
--

CREATE TABLE `pendientes` (
  `id` int(11) NOT NULL,
  `tipo` enum('admin','docente','estudiante') NOT NULL DEFAULT 'estudiante',
  `identificacion` varchar(20) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `facultad_id` int(11) DEFAULT NULL,
  `programa_id` int(11) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `direccion` text DEFAULT NULL,
  `estado` enum('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
  `fecha_solicitud` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pendientes`
--

INSERT INTO `pendientes` (`id`, `tipo`, `identificacion`, `nombres`, `apellidos`, `email`, `telefono`, `fecha_nacimiento`, `facultad_id`, `programa_id`, `password_hash`, `direccion`, `estado`, `fecha_solicitud`) VALUES
(1, 'docente', '789', 'anjelo', 'lo', 'anjelo@gmail.com', '555', '2025-11-15', 1, 4, '$2y$10$6cBxhR951sMYbWqNX.vwhOpWAmrZtt5bOW5Pf2YfTq2Uxpu1pv5YO', 'calle123', 'aprobado', '2025-11-18 21:17:09'),
(2, 'estudiante', '123548', 'ca', 'mi', 'ca@gmail.com', '258', '2025-11-07', 1, 4, '$2y$10$YA8njxEnuvYZ8PVSMTHY/uEJuOS35R5b8e1TyH.IW3YQdMcZWxK.m', 'calle san', 'aprobado', '2025-11-18 21:47:18'),
(4, 'estudiante', '56', 'sa', 'si', 'sk@gmail.com', '7744558899', '2025-11-06', 1, 4, '$2y$10$ukH7U55pmXwigx.kK9PWJ.Jl3m5bp6F3igcGfOnT/2v9e2xWjdrLi', 'calle 8', 'aprobado', '2025-11-18 22:18:01'),
(5, 'docente', '78987', 'Andres David', 'Villa Romero', 'andresd8888@gmail.com', '999888', '2025-10-16', 1, 4, '$2y$10$gr0sS5vBcC8.8toC6.4GLeq1YD.IcKx9/e4C8/C20AdGHNbtLMczu', 'calle 0', 'aprobado', '2025-11-18 22:31:14'),
(6, 'docente', '9999', 'jaider', 'lames', 'lames@gmail.com', '87896', '2025-11-14', 2, 5, '$2y$10$ftTJ0nEoBkpZ5XkREHjMh.cIgzcSYVX9iVLQICsMGMVHWQeSvQfby', 'calle 8', 'aprobado', '2025-11-18 22:35:37'),
(7, 'estudiante', '7894516', 'jaide', 'lames ', 'jaider@gmail.com', '59874568', '2025-11-12', 2, 5, '$2y$10$pNWjOzrYSBjRIf6Cl9FpBOWIYZXzTkV3V5X.Ij296WpVPzfzDmQKC', 'calle', 'aprobado', '2025-11-22 00:51:34'),
(8, '', '465488', 'prueba', 'mart', 'prueba@gmail.com', '', NULL, NULL, NULL, '$2y$10$A9BFuBWJ80/ZpfR0Nxtncu2yzcuGIZzcFwetPcAmB/oNpJ5paqbMe', NULL, 'aprobado', '2025-11-26 19:29:18'),
(9, '', '987435', 'an', 'lo', 'an@correo.com', '123443123', NULL, NULL, NULL, '$2y$10$YZGidC4k.V66f3OY3bz1NeuEAi8b5npcrtaXc40ykB2.6cTgKERgi', NULL, 'pendiente', '2025-12-03 03:23:13');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prerequisitos`
--

CREATE TABLE `prerequisitos` (
  `id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `prerequisito_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `prerequisitos`
--

INSERT INTO `prerequisitos` (`id`, `curso_id`, `prerequisito_id`) VALUES
(16, 19, 18),
(18, 21, 20),
(19, 22, 20),
(20, 23, 21),
(21, 24, 22),
(22, 25, 21),
(23, 26, 22),
(24, 27, 22),
(25, 28, 25),
(26, 28, 26),
(27, 28, 27),
(28, 29, 25),
(29, 29, 26),
(30, 29, 27),
(31, 30, 25),
(32, 30, 26),
(33, 30, 27),
(35, 20, 25),
(36, 20, 22);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `programas`
--

CREATE TABLE `programas` (
  `id` int(11) NOT NULL,
  `codigo` varchar(20) NOT NULL,
  `nombre` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `facultad_id` int(11) NOT NULL,
  `duracion_semestres` int(11) DEFAULT NULL,
  `creditos_totales` int(11) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `programas`
--

INSERT INTO `programas` (`id`, `codigo`, `nombre`, `descripcion`, `facultad_id`, `duracion_semestres`, `creditos_totales`, `activo`, `fecha_creacion`) VALUES
(4, '01', 'DESARROLLO DE SOFTWARE ', 'desarrollo de software ', 1, 10, 160, 1, '2025-11-18 21:15:19'),
(5, 'e01', 'Contaduria publica ', 'contaduría publica ', 2, 10, 4, 1, '2025-11-18 22:33:37'),
(6, 'a01', 'ADMINISTRACION DE EMPRESAS', 'ADMINISTRACION', 2, 10, 130, 1, '2025-11-18 23:33:15'),
(8, '2724', 'TECNOLOGIA EN DESARROLLO DE SOFTWARE', 'Programa nocturno de tecnología en desarrollo de software', 1, 7, 96, 1, '2025-11-25 22:52:40');

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
  `latitud` double DEFAULT 3.022922,
  `longitud` double DEFAULT -76.482656,
  `visible` tinyint(4) DEFAULT 1,
  `coord_x` int(11) DEFAULT NULL,
  `coord_y` int(11) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `ubicacion` varchar(100) DEFAULT NULL,
  `recursos` varchar(200) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'Disponible'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `salones`
--

INSERT INTO `salones` (`id`, `codigo`, `edificio`, `capacidad`, `tipo`, `equipamiento`, `activo`, `latitud`, `longitud`, `visible`, `coord_x`, `coord_y`, `fecha_creacion`, `ubicacion`, `recursos`, `estado`) VALUES
(1, '1A', 'CENTRAL', 30, 'aula', '5 MESAS 5 ASIENTOS ', 1, 3.023001713123767, -76.48312032102758, 1, 300, 400, '2025-11-21 19:17:52', NULL, NULL, 'Disponible'),
(2, '2A', 'bloque tecnico', 30, 'aula', '5 mesas 5 sillas ', 1, 3.0226856468017056, -76.48314178594288, 1, 200, 150, '2025-11-21 21:13:54', NULL, NULL, 'Ocupado'),
(3, '3A', 'Campus carvajal', 30, 'aula', '5 mesas 5 Sillas', 1, 3.023119389696045, -76.48310702600438, 1, 600, 200, '2025-11-21 21:42:47', NULL, NULL, 'Disponible'),
(4, 'A4', 'Ingenieria', 36, 'aula', '36 sillas 36 mesas', 1, 3.0228329292176555, -76.48311763263227, 1, 450, 350, '2025-11-25 20:40:59', '', 'Proyector, WiFi', 'Disponible'),
(5, 'Biblioteca', 'Central', 30, '', '', 1, 3.022922, -76.482656, 1, 800, 500, '2025-12-02 16:17:42', '', '', 'Disponible');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `semestres_activos`
--

CREATE TABLE `semestres_activos` (
  `id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `semestre_academico` varchar(10) NOT NULL COMMENT '2025-1, 2025-2, etc',
  `anio` int(11) NOT NULL,
  `periodo` enum('1','2') NOT NULL COMMENT '1=Primer semestre, 2=Segundo semestre',
  `fecha_inicio_matricula` date NOT NULL,
  `fecha_fin_matricula` date NOT NULL,
  `cupos_disponibles` int(11) DEFAULT NULL COMMENT 'NULL = sin l??mite',
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `semestres_activos`
--

INSERT INTO `semestres_activos` (`id`, `curso_id`, `semestre_academico`, `anio`, `periodo`, `fecha_inicio_matricula`, `fecha_fin_matricula`, `cupos_disponibles`, `activo`, `created_at`, `updated_at`) VALUES
(1, 11, '2025-2', 2025, '2', '2025-12-01', '2025-12-15', 30, 1, '2025-12-03 01:28:31', '2025-12-03 01:28:31'),
(2, 17, '2025-2', 2025, '2', '2025-12-01', '2025-12-15', 30, 1, '2025-12-03 01:28:31', '2025-12-03 01:28:31'),
(3, 18, '2025-2', 2025, '2', '2025-12-01', '2025-12-15', 30, 1, '2025-12-03 01:28:31', '2025-12-03 01:28:31'),
(4, 19, '2025-2', 2025, '2', '2025-12-02', '2025-12-04', NULL, 1, '2025-12-03 01:28:31', '2025-12-03 01:42:12'),
(5, 20, '2025-2', 2025, '2', '2025-12-01', '2025-12-15', 30, 1, '2025-12-03 01:28:31', '2025-12-03 01:28:31'),
(6, 21, '2025-2', 2025, '2', '2025-12-01', '2025-12-15', 30, 1, '2025-12-03 01:28:31', '2025-12-03 01:28:31'),
(7, 22, '2025-2', 2025, '2', '2025-12-01', '2025-12-15', 30, 1, '2025-12-03 01:28:31', '2025-12-03 01:28:31'),
(8, 23, '2025-2', 2025, '2', '2025-12-01', '2025-12-15', 30, 1, '2025-12-03 01:28:31', '2025-12-03 01:28:31'),
(9, 24, '2025-2', 2025, '2', '2025-12-01', '2025-12-15', 30, 1, '2025-12-03 01:28:31', '2025-12-03 01:28:31'),
(10, 25, '2025-2', 2025, '2', '2025-12-01', '2025-12-15', 30, 1, '2025-12-03 01:28:31', '2025-12-03 01:28:31'),
(11, 26, '2025-2', 2025, '2', '2025-12-01', '2025-12-15', 30, 1, '2025-12-03 01:28:31', '2025-12-03 01:28:31'),
(12, 27, '2025-2', 2025, '2', '2025-12-01', '2025-12-15', 30, 1, '2025-12-03 01:28:31', '2025-12-03 01:28:31'),
(13, 28, '2025-2', 2025, '2', '2025-12-01', '2025-12-15', 30, 1, '2025-12-03 01:28:31', '2025-12-03 01:28:31'),
(14, 29, '2025-2', 2025, '2', '2025-12-01', '2025-12-15', 30, 1, '2025-12-03 01:28:31', '2025-12-03 01:28:31'),
(15, 30, '2025-2', 2025, '2', '2025-12-01', '2025-12-15', 30, 1, '2025-12-03 01:28:31', '2025-12-03 01:28:31'),
(16, 31, '2025-2', 2025, '2', '2025-12-01', '2025-12-15', 30, 1, '2025-12-03 01:28:31', '2025-12-03 01:28:31'),
(17, 32, '2025-2', 2025, '2', '2025-12-01', '2025-12-15', 30, 1, '2025-12-03 01:28:31', '2025-12-03 01:28:31'),
(18, 90, '2025-2', 2025, '2', '2025-12-01', '2025-12-15', 30, 0, '2025-12-03 01:28:31', '2025-12-03 02:27:24'),
(19, 91, '2025-2', 2025, '2', '2025-12-01', '2025-12-15', 30, 1, '2025-12-03 01:28:31', '2025-12-03 01:28:31'),
(20, 92, '2025-2', 2025, '2', '2025-12-01', '2025-12-15', 30, 1, '2025-12-03 01:28:31', '2025-12-03 01:28:31'),
(32, 67, '2025-1', 2025, '1', '2025-01-02', '2025-05-05', NULL, 0, '2025-12-03 01:39:55', '2025-12-03 01:40:21'),
(33, 71, '2025-1', 2025, '1', '2025-02-02', '2025-05-06', NULL, 1, '2025-12-03 01:39:55', '2025-12-03 01:41:00'),
(35, 64, '2025-1', 2025, '1', '2025-02-02', '2025-05-06', NULL, 1, '2025-12-03 01:41:00', '2025-12-03 01:41:00'),
(37, 114, '2025-2', 2025, '2', '2025-12-02', '2025-12-04', NULL, 1, '2025-12-03 01:42:12', '2025-12-03 01:42:12'),
(38, 90, '2025-1', 2025, '1', '2025-12-02', '2025-12-10', NULL, 1, '2025-12-03 02:25:26', '2025-12-03 02:36:49');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tareas`
--

CREATE TABLE `tareas` (
  `id` int(11) NOT NULL,
  `curso_id` int(11) NOT NULL,
  `docente_id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_entrega` date NOT NULL,
  `puntos_maximos` decimal(5,2) DEFAULT 100.00,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tareas`
--

INSERT INTO `tareas` (`id`, `curso_id`, `docente_id`, `titulo`, `descripcion`, `fecha_entrega`, `puntos_maximos`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, 90, 2, 'tarea 1', '', '2025-12-05', 5.00, '2025-12-02 21:43:10', '2025-12-02 21:43:10');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `tipo` enum('admin','docente','estudiante') NOT NULL,
  `jornada` enum('diurna','nocturna') DEFAULT 'diurna',
  `identificacion` varchar(20) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefono` varchar(15) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `facultad_id` int(11) DEFAULT NULL,
  `programa_id` int(11) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `tipo`, `jornada`, `identificacion`, `nombres`, `apellidos`, `email`, `telefono`, `fecha_nacimiento`, `direccion`, `facultad_id`, `programa_id`, `password_hash`, `activo`, `fecha_creacion`) VALUES
(1, 'admin', 'diurna', '1000000000', 'Administrador', 'Sistema', 'admin@universidad.edu', NULL, NULL, NULL, NULL, NULL, '$2y$10$z6/4w97w2wmrzWFiF2f1we9arFIaSx.OjIQnGOiHNLSssP4eAg4we', 1, '2025-11-18 21:12:43'),
(2, 'docente', 'diurna', '789', 'anjelo', 'lo', 'anjelo@gmail.com', '555', '2025-11-15', 'calle123', 1, 4, '$2y$10$6cBxhR951sMYbWqNX.vwhOpWAmrZtt5bOW5Pf2YfTq2Uxpu1pv5YO', 1, '2025-11-18 22:08:33'),
(4, 'docente', 'diurna', '78987', 'Andres David', 'Villa Romero', 'andresd8888@gmail.com', '999888', '2025-10-16', 'calle 0', 1, 4, '$2y$10$gr0sS5vBcC8.8toC6.4GLeq1YD.IcKx9/e4C8/C20AdGHNbtLMczu', 1, '2025-11-18 22:31:53'),
(12, 'estudiante', 'nocturna', '7894516', 'jaide', 'lames ', 'jaider@gmail.com', '59874568', '2025-11-12', 'calle', 2, 5, '$2y$10$pNWjOzrYSBjRIf6Cl9FpBOWIYZXzTkV3V5X.Ij296WpVPzfzDmQKC', 1, '2025-11-22 00:51:47'),
(13, 'estudiante', 'nocturna', '2000001', 'Carlos', 'López', 'carlos.lopez@uni.edu', NULL, NULL, NULL, 1, 8, '$2y$10$tUpmfvEw5o.OG0gjujtLoOEoAesBamc82z0ZaiuWVvRuviz9.65qW', 1, '2025-11-25 23:04:31'),
(14, 'estudiante', 'nocturna', '2000002', 'María', 'García', 'maria.garcia@uni.edu', NULL, NULL, NULL, 1, 8, '$2y$10$dKVTR1pB/A296MlOj49dtONvomhYlm4IAOKw4BtKJZZKX4UlImHQe', 1, '2025-11-25 23:04:31'),
(15, 'estudiante', 'nocturna', '2000003', 'Juan', 'Rodríguez', 'juan.rodriguez@uni.edu', NULL, NULL, NULL, 1, 8, '$2y$10$dKVTR1pB/A296MlOj49dtONvomhYlm4IAOKw4BtKJZZKX4UlImHQe', 1, '2025-11-25 23:04:31'),
(16, 'estudiante', 'nocturna', '2000004', 'Ana', 'Martínez', 'ana.martinez@uni.edu', NULL, NULL, NULL, 1, 8, '$2y$10$dKVTR1pB/A296MlOj49dtONvomhYlm4IAOKw4BtKJZZKX4UlImHQe', 1, '2025-11-25 23:04:31'),
(17, 'estudiante', 'nocturna', '2000005', 'Pedro', 'Silva', 'pedro.silva@uni.edu', NULL, NULL, NULL, 1, 8, '$2y$10$dKVTR1pB/A296MlOj49dtONvomhYlm4IAOKw4BtKJZZKX4UlImHQe', 1, '2025-11-25 23:04:31'),
(18, '', 'diurna', '465488', 'prueba', 'mart', 'prueba@gmail.com', '', NULL, NULL, NULL, NULL, '$2y$10$A9BFuBWJ80/ZpfR0Nxtncu2yzcuGIZzcFwetPcAmB/oNpJ5paqbMe', 1, '2025-11-26 19:30:08');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administradores`
--
ALTER TABLE `administradores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `asignacion_docentes`
--
ALTER TABLE `asignacion_docentes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `curso_id` (`curso_id`),
  ADD KEY `programa_id` (`programa_id`),
  ADD KEY `facultad_id` (`facultad_id`);

--
-- Indices de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_asistencia` (`estudiante_id`,`curso_id`,`fecha`),
  ADD KEY `curso_id` (`curso_id`);

--
-- Indices de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_calificacion` (`estudiante_id`,`curso_id`,`semestre`,`anio`),
  ADD KEY `curso_id` (`curso_id`),
  ADD KEY `idx_tarea` (`tarea_id`);

--
-- Indices de la tabla `cursos`
--
ALTER TABLE `cursos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_codigo_jornada` (`codigo`,`jornada`),
  ADD KEY `programa_id` (`programa_id`),
  ADD KEY `prerequisito_id` (`prerequisito_id`),
  ADD KEY `facultad_id` (`facultad_id`);

--
-- Indices de la tabla `docentes`
--
ALTER TABLE `docentes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`),
  ADD KEY `facultad_id` (`facultad_id`),
  ADD KEY `programa_id` (`programa_id`);

--
-- Indices de la tabla `entregas`
--
ALTER TABLE `entregas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_entrega` (`tarea_id`,`estudiante_id`),
  ADD KEY `idx_tarea` (`tarea_id`),
  ADD KEY `idx_estudiante` (`estudiante_id`);

--
-- Indices de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `usuario_id` (`usuario_id`),
  ADD KEY `facultad_id` (`facultad_id`),
  ADD KEY `programa_id` (`programa_id`);

--
-- Indices de la tabla `facultades`
--
ALTER TABLE `facultades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `salon_id` (`salon_id`);

--
-- Indices de la tabla `matriculas`
--
ALTER TABLE `matriculas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_matricula` (`estudiante_id`,`curso_id`,`semestre`,`anio`),
  ADD KEY `curso_id` (`curso_id`);

--
-- Indices de la tabla `pendientes`
--
ALTER TABLE `pendientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `identificacion` (`identificacion`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `facultad_id` (`facultad_id`),
  ADD KEY `programa_id` (`programa_id`);

--
-- Indices de la tabla `prerequisitos`
--
ALTER TABLE `prerequisitos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `curso_id` (`curso_id`),
  ADD KEY `prerequisito_id` (`prerequisito_id`);

--
-- Indices de la tabla `programas`
--
ALTER TABLE `programas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `facultad_id` (`facultad_id`);

--
-- Indices de la tabla `salones`
--
ALTER TABLE `salones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
  ADD KEY `idx_visible` (`visible`),
  ADD KEY `idx_latitud_longitud` (`latitud`,`longitud`);

--
-- Indices de la tabla `semestres_activos`
--
ALTER TABLE `semestres_activos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_curso_semestre` (`curso_id`,`semestre_academico`),
  ADD KEY `idx_semestre` (`semestre_academico`,`activo`),
  ADD KEY `idx_fechas` (`fecha_inicio_matricula`,`fecha_fin_matricula`),
  ADD KEY `idx_semestre_activo` (`semestre_academico`,`activo`,`fecha_inicio_matricula`,`fecha_fin_matricula`);

--
-- Indices de la tabla `tareas`
--
ALTER TABLE `tareas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_curso` (`curso_id`),
  ADD KEY `idx_docente` (`docente_id`),
  ADD KEY `idx_fecha_entrega` (`fecha_entrega`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `identificacion` (`identificacion`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `facultad_id` (`facultad_id`),
  ADD KEY `programa_id` (`programa_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administradores`
--
ALTER TABLE `administradores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `asignacion_docentes`
--
ALTER TABLE `asignacion_docentes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `cursos`
--
ALTER TABLE `cursos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=117;

--
-- AUTO_INCREMENT de la tabla `docentes`
--
ALTER TABLE `docentes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `entregas`
--
ALTER TABLE `entregas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `facultades`
--
ALTER TABLE `facultades`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT de la tabla `matriculas`
--
ALTER TABLE `matriculas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=55;

--
-- AUTO_INCREMENT de la tabla `pendientes`
--
ALTER TABLE `pendientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `prerequisitos`
--
ALTER TABLE `prerequisitos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT de la tabla `programas`
--
ALTER TABLE `programas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `salones`
--
ALTER TABLE `salones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `semestres_activos`
--
ALTER TABLE `semestres_activos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT de la tabla `tareas`
--
ALTER TABLE `tareas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `administradores`
--
ALTER TABLE `administradores`
  ADD CONSTRAINT `administradores_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `asignacion_docentes`
--
ALTER TABLE `asignacion_docentes`
  ADD CONSTRAINT `asignacion_docentes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `asignacion_docentes_ibfk_2` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `asignacion_docentes_ibfk_3` FOREIGN KEY (`programa_id`) REFERENCES `programas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `asignacion_docentes_ibfk_4` FOREIGN KEY (`facultad_id`) REFERENCES `facultades` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `asistencias`
--
ALTER TABLE `asistencias`
  ADD CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`estudiante_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `asistencias_ibfk_2` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  ADD CONSTRAINT `calificaciones_ibfk_1` FOREIGN KEY (`estudiante_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `calificaciones_ibfk_2` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `calificaciones_ibfk_3` FOREIGN KEY (`tarea_id`) REFERENCES `tareas` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `cursos`
--
ALTER TABLE `cursos`
  ADD CONSTRAINT `cursos_ibfk_1` FOREIGN KEY (`programa_id`) REFERENCES `programas` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cursos_ibfk_2` FOREIGN KEY (`prerequisito_id`) REFERENCES `cursos` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `cursos_ibfk_3` FOREIGN KEY (`facultad_id`) REFERENCES `facultades` (`id`);

--
-- Filtros para la tabla `docentes`
--
ALTER TABLE `docentes`
  ADD CONSTRAINT `docentes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `docentes_ibfk_2` FOREIGN KEY (`facultad_id`) REFERENCES `facultades` (`id`),
  ADD CONSTRAINT `docentes_ibfk_3` FOREIGN KEY (`programa_id`) REFERENCES `programas` (`id`);

--
-- Filtros para la tabla `entregas`
--
ALTER TABLE `entregas`
  ADD CONSTRAINT `entregas_ibfk_1` FOREIGN KEY (`tarea_id`) REFERENCES `tareas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `entregas_ibfk_2` FOREIGN KEY (`estudiante_id`) REFERENCES `estudiantes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `estudiantes`
--
ALTER TABLE `estudiantes`
  ADD CONSTRAINT `estudiantes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `estudiantes_ibfk_2` FOREIGN KEY (`facultad_id`) REFERENCES `facultades` (`id`),
  ADD CONSTRAINT `estudiantes_ibfk_3` FOREIGN KEY (`programa_id`) REFERENCES `programas` (`id`);

--
-- Filtros para la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD CONSTRAINT `horarios_ibfk_2` FOREIGN KEY (`salon_id`) REFERENCES `salones` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `matriculas`
--
ALTER TABLE `matriculas`
  ADD CONSTRAINT `matriculas_ibfk_1` FOREIGN KEY (`estudiante_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `matriculas_ibfk_2` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `pendientes`
--
ALTER TABLE `pendientes`
  ADD CONSTRAINT `pendientes_ibfk_1` FOREIGN KEY (`facultad_id`) REFERENCES `facultades` (`id`),
  ADD CONSTRAINT `pendientes_ibfk_2` FOREIGN KEY (`programa_id`) REFERENCES `programas` (`id`);

--
-- Filtros para la tabla `prerequisitos`
--
ALTER TABLE `prerequisitos`
  ADD CONSTRAINT `prerequisitos_ibfk_1` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `prerequisitos_ibfk_2` FOREIGN KEY (`prerequisito_id`) REFERENCES `cursos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `programas`
--
ALTER TABLE `programas`
  ADD CONSTRAINT `programas_ibfk_1` FOREIGN KEY (`facultad_id`) REFERENCES `facultades` (`id`);

--
-- Filtros para la tabla `semestres_activos`
--
ALTER TABLE `semestres_activos`
  ADD CONSTRAINT `semestres_activos_ibfk_1` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tareas`
--
ALTER TABLE `tareas`
  ADD CONSTRAINT `tareas_ibfk_1` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tareas_ibfk_2` FOREIGN KEY (`docente_id`) REFERENCES `docentes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`facultad_id`) REFERENCES `facultades` (`id`),
  ADD CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`programa_id`) REFERENCES `programas` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
