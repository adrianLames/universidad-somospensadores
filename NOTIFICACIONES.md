# Sistema de Notificaciones y Cambios Importantes

## 🔔 Cambios Recientes (2 de diciembre de 2025)

### ✅ Diferenciación de Cursos por Jornada

Se implementó un sistema para diferenciar cursos duplicados que se ofrecen en diferentes jornadas:

**Problema resuelto:**
- 26 códigos de cursos estaban duplicados (misma materia en jornada diurna y nocturna)
- Causaba confusión en interfaces y reportes

**Solución:**
- Se agregaron sufijos distintivos a los códigos:
  - `_D` para cursos de jornada **diurna**
  - `_N` para cursos de jornada **nocturna**

**Ejemplos:**
- `111021C` → `111021C_D` (diurna) y `111021C_N` (nocturna)
- `111023C` → `111023C_D` (diurna) y `111023C_N` (nocturna)

**Resultado:**
- ✅ 69 códigos únicos (antes: 43 únicos, 26 duplicados)
- ✅ Sin impacto en tablas relacionadas (usan FK por ID)
- ✅ Mejor experiencia de usuario

Ver detalles en: `migraciones/README_migracion_jornadas.md`

---

# Sistema de Notificaciones Personalizado

Se ha implementado un sistema de notificaciones personalizado y elegante para toda la aplicación.

## Características

- **4 tipos de notificaciones**: Éxito, Error, Advertencia, Info
- **Diseño acorde al tema**: Colores oscuros con acentos dorados
- **Animaciones suaves**: Entrada, salida y barra de progreso
- **Auto-cierre configurable**: Por defecto 4 segundos
- **Apilamiento inteligente**: Múltiples notificaciones se muestran en cola
- **Responsive**: Se adapta a dispositivos móviles

## Uso

### Método 1: Función global (Recomendado)

```javascript
// Éxito
window.mostrarNotificacion('exito', 'Operación completada exitosamente');

// Error
window.mostrarNotificacion('error', 'Error al procesar la solicitud');

// Advertencia
window.mostrarNotificacion('advertencia', 'Por favor complete todos los campos');

// Información
window.mostrarNotificacion('info', 'Se ha guardado automáticamente');

// Con duración personalizada (en milisegundos)
window.mostrarNotificacion('exito', 'Guardado', 6000); // 6 segundos
```

### Método 2: Utilidades helpers

```javascript
import { mostrarExito, mostrarError, mostrarAdvertencia, mostrarInfo } from '../utils/notificaciones';

// Uso
mostrarExito('Salón creado correctamente');
mostrarError('Error de conexión');
mostrarAdvertencia('Campo requerido');
mostrarInfo('Procesando solicitud...');
```

## Implementado en

✅ App.js (Provider global)
✅ AdminMapaSalonesPlano.js
✅ DetalleCurso.js (importado)
✅ utils/notificaciones.js (helpers)

## Pendiente de implementar

Los siguientes componentes aún usan `alert()` y pueden ser actualizados:

- Salones.js
- GestionPrerequisitos.js
- ProfesorMaterias.js
- NuevaGestionUsuarios.js
- Reportes.js

### Ejemplo de migración

**Antes:**
```javascript
alert('Salón creado exitosamente');
```

**Después:**
```javascript
window.mostrarNotificacion('exito', 'Salón creado exitosamente');
```

## Personalización

Los estilos se encuentran en `src/components/Notificacion.css` y pueden ser ajustados según necesidad.

### Colores actuales:
- **Éxito**: Verde (#22c55e)
- **Error**: Rojo (#ef4444)
- **Advertencia**: Naranja (#f59e0b)
- **Info**: Azul (#3b82f6)
