-- =====================================================
-- AGREGAR CAMPO JORNADA A USUARIOS (ESTUDIANTES)
-- =====================================================

-- Agregar columna jornada a la tabla usuarios
ALTER TABLE usuarios 
ADD COLUMN jornada ENUM('diurna', 'nocturna') DEFAULT 'diurna' AFTER tipo;

-- Actualizar estudiantes existentes (por defecto nocturna ya que son los que ya existen)
UPDATE usuarios 
SET jornada = 'nocturna' 
WHERE tipo = 'estudiante';

SELECT 'Campo jornada agregado a tabla usuarios' as Resultado;
