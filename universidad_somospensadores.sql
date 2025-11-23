-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 22-11-2025 a las 23:38:36
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
(14, 2, 3, 5, 2, 2025, 1),
(15, 4, 2, 4, 1, 2025, 1);

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
  `es_prerequisito` tinyint(1) DEFAULT 1 COMMENT '1=puede ser prerequisito, 0=no puede'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cursos`
--

INSERT INTO `cursos` (`id`, `codigo`, `nombre`, `descripcion`, `creditos`, `programa_id`, `prerequisito_id`, `activo`, `fecha_creacion`, `facultad_id`, `jornada`, `es_prerequisito`) VALUES
(1, 'c01', 'Fundamentos de programacion ', 'esencial para aprender a programar ', 4, 4, NULL, 1, '2025-11-18 21:16:08', 1, 'diurna', 1),
(2, 'c02', 'base de datos ', 'base de datos ', 4, 4, NULL, 1, '2025-11-18 22:32:31', 1, 'diurna', 1),
(3, 'ec01', 'análisis económico ', 'análisis ', 4, 5, NULL, 1, '2025-11-18 22:34:34', 2, 'diurna', 0),
(4, 'c03', 'desarrollo de software', 'as', 4, 4, NULL, 1, '2025-11-20 01:41:40', 1, 'diurna', 0),
(5, 'Am1', 'analisis financiero', 'analisis', 4, 6, NULL, 1, '2025-11-21 23:04:21', 2, 'diurna', 0);

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
(2, 4, 1, 4),
(3, 6, 2, 5),
(4, 8, 1, 4),
(5, 11, 2, 5);

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
(1, 3, 1, 4),
(2, 5, 1, 4),
(3, 9, 2, 5),
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
(56, 2, 'Martes', '08:00:00', '10:00:00', 2, 1, '#dcedc8'),
(57, 1, 'Lunes', '08:00:00', '10:00:00', 4, 1, '#dcedc8'),
(59, 3, 'Miércoles', '01:00:00', '07:00:00', 4, 2, '#ffe0b2'),
(60, 3, 'Miércoles', '08:00:00', '10:00:00', 6, 5, '#f8bbd0'),
(61, 3, 'Miércoles', '14:00:00', '15:00:00', 8, 4, '#ffe0b2'),
(62, 3, 'Lunes', '08:00:00', '10:00:00', 4, 2, '#ffe0b2'),
(63, 2, 'Lunes', '08:00:00', '10:00:00', 8, 3, '#ffe0b2');

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
(7, 'estudiante', '7894516', 'jaide', 'lames ', 'jaider@gmail.com', '59874568', '2025-11-12', 2, 5, '$2y$10$pNWjOzrYSBjRIf6Cl9FpBOWIYZXzTkV3V5X.Ij296WpVPzfzDmQKC', 'calle', 'aprobado', '2025-11-22 00:51:34');

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
(7, 1, 2),
(9, 2, 1);

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
(6, 'a01', 'ADMINISTRACION DE EMPRESAS', 'ADMINISTRACION', 2, 10, 130, 1, '2025-11-18 23:33:15');

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
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `ubicacion` varchar(100) DEFAULT NULL,
  `recursos` varchar(200) DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'Disponible'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `salones`
--

INSERT INTO `salones` (`id`, `codigo`, `edificio`, `capacidad`, `tipo`, `equipamiento`, `activo`, `fecha_creacion`, `ubicacion`, `recursos`, `estado`) VALUES
(1, '1A', 'CENTRAL', 30, 'aula', '5 MESAS 5 ASIENTOS ', 1, '2025-11-21 19:17:52', NULL, NULL, 'Disponible'),
(2, '2A', 'bloque tecnico', 30, 'aula', '5 mesas 5 sillas ', 1, '2025-11-21 21:13:54', NULL, NULL, 'Disponible'),
(3, '3A', 'Campus carvajal', 30, 'aula', '5 mesas 5 Sillas', 1, '2025-11-21 21:42:47', NULL, NULL, 'Disponible');

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
  `facultad_id` int(11) DEFAULT NULL,
  `programa_id` int(11) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `tipo`, `identificacion`, `nombres`, `apellidos`, `email`, `telefono`, `fecha_nacimiento`, `direccion`, `facultad_id`, `programa_id`, `password_hash`, `activo`, `fecha_creacion`) VALUES
(1, 'admin', '1000000000', 'Administrador', 'Sistema', 'admin@universidad.edu', NULL, NULL, NULL, NULL, NULL, '$2y$10$z6/4w97w2wmrzWFiF2f1we9arFIaSx.OjIQnGOiHNLSssP4eAg4we', 1, '2025-11-18 21:12:43'),
(2, 'docente', '789', 'anjelo', 'lo', 'anjelo@gmail.com', '555', '2025-11-15', 'calle123', 1, 4, '$2y$10$6cBxhR951sMYbWqNX.vwhOpWAmrZtt5bOW5Pf2YfTq2Uxpu1pv5YO', 1, '2025-11-18 22:08:33'),
(3, 'estudiante', '123548', 'ca', 'mi', 'ca@gmail.com', '258', '2025-11-07', 'calle san', 1, 4, '$2y$10$YA8njxEnuvYZ8PVSMTHY/uEJuOS35R5b8e1TyH.IW3YQdMcZWxK.m', 1, '2025-11-18 22:09:34'),
(4, 'docente', '78987', 'Andres David', 'Villa Romero', 'andresd8888@gmail.com', '999888', '2025-10-16', 'calle 0', 1, 4, '$2y$10$gr0sS5vBcC8.8toC6.4GLeq1YD.IcKx9/e4C8/C20AdGHNbtLMczu', 1, '2025-11-18 22:31:53'),
(5, 'estudiante', '56', 'sa', 'si', 'sk@gmail.com', '7744558899', '2025-11-06', 'calle 8', 1, 4, '$2y$10$ukH7U55pmXwigx.kK9PWJ.Jl3m5bp6F3igcGfOnT/2v9e2xWjdrLi', 1, '2025-11-18 22:31:55'),
(6, 'docente', '9999', 'jaider', 'lames', 'lames@gmail.com', '87896', '2025-11-14', 'calle 8', 2, 5, '$2y$10$ftTJ0nEoBkpZ5XkREHjMh.cIgzcSYVX9iVLQICsMGMVHWQeSvQfby', 1, '2025-11-18 22:36:03'),
(8, 'docente', '9985', 'sdi', 'dsa', 'sda@gmail.com', '555', '2025-11-06', 'calle 156', 1, 4, '$2y$10$sGqqoCMnh5zoJZx7euudH.yyAPtoSUWt0.xXgqAHbJXGv63tqRLu.', 1, '2025-11-18 23:45:25'),
(9, 'estudiante', '5632563', 'so', 'sa', 'so@gmail.com', '8965', '2025-11-07', 'calle 569', 2, 5, '$2y$10$bLyzhXS5bACBVCOogdPNYOyNVFox4Kxe0Gn4kVzOcXeOJ4CcCPK6C', 1, '2025-11-18 23:47:19'),
(11, 'docente', '22222', 'ca', 'mi', 'mi@gmail.com', '558874', '2025-10-30', 'calle a', 2, 5, '$2y$10$/Mkv/FnZglw5H.RGhpyDW.xNDla0lDjIVVA22Nmb5zv.8NU/B2SOS', 1, '2025-11-21 22:25:33'),
(12, 'estudiante', '7894516', 'jaide', 'lames ', 'jaider@gmail.com', '59874568', '2025-11-12', 'calle', 2, 5, '$2y$10$pNWjOzrYSBjRIf6Cl9FpBOWIYZXzTkV3V5X.Ij296WpVPzfzDmQKC', 1, '2025-11-22 00:51:47');

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
  ADD KEY `curso_id` (`curso_id`);

--
-- Indices de la tabla `cursos`
--
ALTER TABLE `cursos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`),
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
  ADD UNIQUE KEY `codigo` (`codigo`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `asistencias`
--
ALTER TABLE `asistencias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `calificaciones`
--
ALTER TABLE `calificaciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cursos`
--
ALTER TABLE `cursos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `docentes`
--
ALTER TABLE `docentes`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pendientes`
--
ALTER TABLE `pendientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `prerequisitos`
--
ALTER TABLE `prerequisitos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `programas`
--
ALTER TABLE `programas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `salones`
--
ALTER TABLE `salones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

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
  ADD CONSTRAINT `calificaciones_ibfk_2` FOREIGN KEY (`curso_id`) REFERENCES `cursos` (`id`) ON DELETE CASCADE;

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
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`facultad_id`) REFERENCES `facultades` (`id`),
  ADD CONSTRAINT `usuarios_ibfk_2` FOREIGN KEY (`programa_id`) REFERENCES `programas` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
