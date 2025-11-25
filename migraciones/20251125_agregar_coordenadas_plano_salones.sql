-- Migración: Agregar coordenadas para el plano del campus
-- Fecha: 2025-11-25
-- Descripción: Agrega campos coord_x y coord_y a la tabla salones para ubicar cada salón en el plano de imagen

-- Agregar columnas de coordenadas
ALTER TABLE salones 
ADD COLUMN coord_x INT DEFAULT NULL COMMENT 'Coordenada X en el plano (píxeles desde la izquierda)',
ADD COLUMN coord_y INT DEFAULT NULL COMMENT 'Coordenada Y en el plano (píxeles desde arriba)';

-- Ejemplos de cómo actualizar las coordenadas
-- IMPORTANTE: Estos valores son de ejemplo. Debes obtener las coordenadas reales del plano.
-- Usa una herramienta como https://www.image-map.net/ para obtener las coordenadas exactas

-- Ejemplo para Edificio A - Primer piso (salones A101-A105)
-- UPDATE salones SET coord_x = 245, coord_y = 380 WHERE codigo = 'A101';
-- UPDATE salones SET coord_x = 520, coord_y = 380 WHERE codigo = 'A102';
-- UPDATE salones SET coord_x = 795, coord_y = 380 WHERE codigo = 'A103';

-- Ejemplo para Edificio A - Segundo piso (salones A201-A205)
-- UPDATE salones SET coord_x = 245, coord_y = 220 WHERE codigo = 'A201';
-- UPDATE salones SET coord_x = 520, coord_y = 220 WHERE codigo = 'A202';

-- Ejemplo para Edificio B - Laboratorios
-- UPDATE salones SET coord_x = 1100, coord_y = 450 WHERE codigo = 'LAB01';
-- UPDATE salones SET coord_x = 1100, coord_y = 550 WHERE codigo = 'LAB02';

-- Ejemplo para Edificio C - Auditorios
-- UPDATE salones SET coord_x = 1500, coord_y = 300 WHERE codigo = 'AUD01';

-- Verificar los cambios
SELECT codigo, edificio, coord_x, coord_y 
FROM salones 
ORDER BY edificio, codigo;

-- INSTRUCCIONES PARA OBTENER COORDENADAS:
-- 
-- 1. Convierte el archivo campusV1.dwg a imagen PNG
-- 2. Abre la imagen en: https://www.image-map.net/
-- 3. Selecciona "Rectangle" o "Circle" tool
-- 4. Haz click en la ubicación de cada salón
-- 5. Copia las coordenadas (x, y) que aparecen
-- 6. Ejecuta UPDATE para cada salón con sus coordenadas
-- 
-- Ejemplo de herramientas para obtener coordenadas:
-- - https://www.image-map.net/ (recomendado)
-- - GIMP: Abre imagen, mueve cursor, ve coordenadas en esquina inferior
-- - Paint.NET: Similar a GIMP
-- - Photoshop: Info panel muestra coordenadas del cursor
--
-- Formato de las coordenadas:
-- coord_x = píxeles desde el borde izquierdo de la imagen
-- coord_y = píxeles desde el borde superior de la imagen
--
-- IMPORTANTE: 
-- - El punto (0, 0) está en la esquina SUPERIOR IZQUIERDA
-- - coord_x aumenta hacia la DERECHA
-- - coord_y aumenta hacia ABAJO
