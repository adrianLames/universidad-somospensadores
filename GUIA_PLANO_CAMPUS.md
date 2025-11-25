# 🏫 Guía Completa: Plano Interactivo del Campus

## ✅ ¿Qué se ha implementado?

He creado un sistema completo para mostrar el **plano del campus** con marcadores interactivos de los salones, reemplazando el mapa de Google Maps.

### Archivos Creados:

1. **`src/components/MapaSalonesPlano.js`** - Componente principal del plano
2. **`src/components/MapaSalonesPlano.css`** - Estilos del componente
3. **`migraciones/20251125_agregar_coordenadas_plano_salones.sql`** - Migración SQL
4. **`generador-plano-temporal.html`** - Herramienta para crear plano temporal
5. **`CONVERSION_PLANO.md`** - Guía de conversión del archivo DWG
6. **`public/images/`** - Carpeta creada para la imagen del plano

### Archivos Modificados:

- **`src/App.js`** - Actualizado para usar MapaSalonesPlano

---

## 📋 Pasos para Implementar

### Opción A: Usar el Plano Real (campusV1.dwg)

#### Paso 1: Convertir DWG a Imagen

**Si tienes AutoCAD:**
1. Abre `campusV1.dwg` en AutoCAD
2. Ve a **Archivo → Exportar → PNG**
3. Configura:
   - Resolución: **300 DPI**
   - Tamaño: **2000-4000 px** de ancho
   - Fondo: Blanco
4. Guarda como: `public/images/campus-plano.png`

**Si NO tienes AutoCAD:**
1. Descarga **Autodesk DWG TrueView** (gratis): https://www.autodesk.com/viewers
2. Abre `campusV1.dwg`
3. Exporta/Imprime a PDF
4. Convierte PDF a PNG usando:
   - https://www.pdf2png.com/
   - https://cloudconvert.com/pdf-to-png

#### Paso 2: Ejecutar Migración SQL

```sql
-- Ejecuta esto en phpMyAdmin o MySQL Workbench
USE universidad_somospensadores;

-- Agregar columnas de coordenadas
ALTER TABLE salones 
ADD COLUMN coord_x INT DEFAULT NULL COMMENT 'Coordenada X en el plano (píxeles desde la izquierda)',
ADD COLUMN coord_y INT DEFAULT NULL COMMENT 'Coordenada Y en el plano (píxeles desde arriba)';
```

#### Paso 3: Obtener Coordenadas de los Salones

**Opción Fácil - Usar Image Map Generator:**
1. Ve a: https://www.image-map.net/
2. Click en "Choose File" → Sube `campus-plano.png`
3. Selecciona tool "Circle" o "Rectangle"
4. Haz click en cada salón del plano
5. Copia las coordenadas (x, y)

**Opción Manual - Usar GIMP o Paint.NET:**
1. Abre `campus-plano.png` en GIMP/Paint.NET
2. Mueve el cursor sobre cada salón
3. Ve las coordenadas en la esquina inferior
4. Anota las coordenadas (x, y)

#### Paso 4: Actualizar Base de Datos con Coordenadas

```sql
-- Ejemplo: Actualiza cada salón con sus coordenadas reales
UPDATE salones SET coord_x = 245, coord_y = 380 WHERE codigo = 'A101';
UPDATE salones SET coord_x = 520, coord_y = 380 WHERE codigo = 'A102';
UPDATE salones SET coord_x = 795, coord_y = 380 WHERE codigo = 'A103';
-- ... etc para cada salón
```

#### Paso 5: Verificar

1. Reinicia React: `npm start`
2. Accede a: http://localhost:3000/mapa-salones
3. Deberías ver el plano con los marcadores

---

### Opción B: Crear Plano Temporal (Mientras Consigues el Real)

#### Paso 1: Usar el Generador de Plano Temporal

1. Abre en el navegador: `generador-plano-temporal.html`
2. Click en "Generar Plano de Ejemplo"
3. Para cada salón:
   - Escribe el código (ej: A101)
   - Click en el plano donde va ubicado
4. Click en "Descargar Imagen"
5. Guarda como: `public/images/campus-plano.png`
6. Copia las consultas SQL generadas

#### Paso 2: Ejecutar Migración y Coordenadas

```sql
USE universidad_somospensadores;

-- Ejecutar migración
SOURCE migraciones/20251125_agregar_coordenadas_plano_salones.sql;

-- Pegar las consultas SQL generadas por el generador
UPDATE salones SET coord_x = 210, coord_y = 340 WHERE codigo = 'A101';
-- ... etc
```

#### Paso 3: Verificar

```bash
npm start
```

Accede a: http://localhost:3000/mapa-salones

---

## 🎨 Características del Componente

### ✅ Funcionalidades Implementadas:

1. **Visualización del Plano**
   - Imagen del campus como fondo
   - Zoom in/out (botones + y -)
   - Arrastrar (drag) para moverse por el plano
   - Botón "Reset" para volver a la vista inicial

2. **Marcadores de Salones**
   - Círculos de colores sobre cada salón
   - Colores según estado:
     - 🔴 Rojo: Salón con clases hoy
     - 🔵 Azul: Salón disponible
     - 🟡 Amarillo: En mantenimiento
     - ⚪ Gris: Inactivo

3. **Información Interactiva**
   - Click en marcador → muestra popup con:
     - Código y edificio
     - Tipo y capacidad
     - Estado actual
     - Horarios del día seleccionado
     - Profesor asignado

4. **Filtros Inteligentes**
   - Por edificio
   - Por tipo de salón
   - Por día de la semana

5. **Panel Lateral**
   - Lista de todos los salones filtrados
   - Contador de salones
   - Indicador de clases programadas
   - Click para seleccionar salón

6. **Responsive**
   - Funciona en desktop y móvil
   - Controles adaptativos

---

## 🔧 Comandos Útiles

### Verificar que la imagen existe:
```powershell
Test-Path public\images\campus-plano.png
```

### Ver salones sin coordenadas:
```sql
SELECT codigo, edificio 
FROM salones 
WHERE coord_x IS NULL OR coord_y IS NULL;
```

### Ver todos los salones con coordenadas:
```sql
SELECT codigo, edificio, coord_x, coord_y 
FROM salones 
WHERE coord_x IS NOT NULL 
ORDER BY edificio, codigo;
```

---

## 📝 Estructura de Coordenadas

```
Imagen del plano:
┌────────────────────────────────┐
│ (0,0)                          │  ← Esquina superior izquierda
│                                │
│         🔴 Salón A101          │
│         (x: 245, y: 380)       │
│                                │
│                                │
│                   (2000, 1200) │  ← Esquina inferior derecha
└────────────────────────────────┘

coord_x = píxeles desde la IZQUIERDA
coord_y = píxeles desde ARRIBA
```

---

## ⚠️ Solución de Problemas

### Problema: No aparece la imagen del plano

**Solución:**
1. Verifica que la imagen existe en `public/images/campus-plano.png`
2. Verifica el nombre exacto del archivo
3. Recarga la página (Ctrl + F5)
4. Abre consola del navegador (F12) para ver errores

### Problema: Marcadores no aparecen

**Solución:**
1. Verifica que los salones tienen coordenadas en la BD:
   ```sql
   SELECT * FROM salones WHERE coord_x IS NOT NULL;
   ```
2. Verifica que las coordenadas están dentro del tamaño de la imagen

### Problema: Imagen muy grande o muy pequeña

**Solución:**
1. Ajusta el tamaño de la imagen a 2000-3000px de ancho
2. Usa la función de zoom del componente

---

## 🚀 Próximos Pasos

1. **Convertir campusV1.dwg** a imagen PNG
2. **Guardar en** `public/images/campus-plano.png`
3. **Ejecutar migración** SQL para agregar coordenadas
4. **Marcar ubicaciones** de los salones usando image-map.net
5. **Actualizar BD** con las coordenadas
6. **Probar** el mapa en http://localhost:3000/mapa-salones

---

## 📚 Recursos Adicionales

- **Convertidor DWG online:** https://www.cadconverter.org/
- **Image Map Generator:** https://www.image-map.net/
- **PDF to PNG:** https://www.pdf2png.com/
- **GIMP (gratis):** https://www.gimp.org/

---

## 💡 Alternativas si no tienes el plano DWG

1. **Toma una foto** del plano si lo tienes físico
2. **Dibuja un plano simple** en:
   - PowerPoint / Google Slides
   - Draw.io (gratis): https://draw.io
   - Canva (gratis): https://canva.com
3. **Usa el generador temporal** incluido en `generador-plano-temporal.html`

---

## ✅ Checklist de Implementación

- [ ] Convertir campusV1.dwg a PNG
- [ ] Guardar imagen en `public/images/campus-plano.png`
- [ ] Ejecutar migración SQL para coordenadas
- [ ] Obtener coordenadas de cada salón
- [ ] Actualizar BD con coordenadas
- [ ] Probar en navegador
- [ ] Verificar que los marcadores aparecen
- [ ] Probar filtros y zoom
- [ ] Verificar en móvil

---

**¡El sistema está listo!** Solo falta la imagen del plano y las coordenadas. 🎉
