# Conversión del Plano campusV1.dwg a Imagen Web

## Paso 1: Convertir DWG a Imagen

El archivo `campusV1.dwg` es un archivo de AutoCAD que necesita convertirse a imagen para usarlo en la web.

### Opción A: Usar AutoCAD (Recomendado)
1. Abre `campusV1.dwg` en AutoCAD
2. Ve a **Archivo → Exportar → PNG** o **JPG**
3. Configura:
   - Resolución: **300 DPI** mínimo (para buena calidad)
   - Tamaño: **2000-4000 px** de ancho
   - Fondo: **Blanco** o **Transparente**
4. Guarda como: `public/images/campus-plano.png`

### Opción B: Usar DWG TrueView (Gratis)
1. Descarga **Autodesk DWG TrueView** (gratis)
2. Abre `campusV1.dwg`
3. Imprime a PDF: **DWG to PDF.pc3**
4. Convierte el PDF a imagen usando:
   - Photoshop
   - GIMP (gratis)
   - Convertidor online: https://www.pdf2png.com/

### Opción C: Convertidores Online
- https://www.cadconverter.org/ (DWG a imagen)
- https://cloudconvert.com/dwg-to-png

## Paso 2: Optimizar la Imagen

Después de convertir:
1. Recorta espacios en blanco innecesarios
2. Ajusta el contraste para que se vea claro
3. Guarda en formato **PNG** (mejor calidad) o **WebP** (menor tamaño)
4. Tamaño recomendado: **2000-3000 px de ancho**

## Paso 3: Ubicación del Archivo

Guarda la imagen convertida en:
```
public/images/campus-plano.png
```

Si la carpeta `public/images/` no existe, créala.

## Paso 4: Configuración de Coordenadas

Después de tener la imagen, necesitas marcar las coordenadas de cada salón en el plano:

```json
{
  "salon_id": 1,
  "x": 245,  // Píxeles desde la izquierda
  "y": 380,  // Píxeles desde arriba
  "codigo": "A101"
}
```

Usa una herramienta como:
- https://www.image-map.net/ (genera coordenadas)
- Paint / GIMP (ver coordenadas del cursor)

## Paso 5: Actualizar Base de Datos

Ejecuta este SQL para agregar coordenadas a los salones:

```sql
ALTER TABLE salones 
ADD COLUMN coord_x INT DEFAULT NULL COMMENT 'Coordenada X en el plano (px)',
ADD COLUMN coord_y INT DEFAULT NULL COMMENT 'Coordenada Y en el plano (px)';

-- Ejemplo: actualizar coordenadas de salones
UPDATE salones SET coord_x = 245, coord_y = 380 WHERE codigo = 'A101';
UPDATE salones SET coord_x = 520, coord_y = 380 WHERE codigo = 'A102';
-- ... etc para cada salón
```

## ¿No tienes AutoCAD?

Si no puedes convertir el archivo DWG, hay alternativas:

1. **Toma una foto/captura del plano** si lo tienes impreso
2. **Dibuja un plano simple** en:
   - PowerPoint
   - Google Drawings
   - Draw.io (gratis)
3. **Usa un plano genérico** mientras consigues el real

## Próximo Paso

Una vez tengas la imagen `campus-plano.png`, avísame y actualizaré el componente MapaSalones para usarla.
