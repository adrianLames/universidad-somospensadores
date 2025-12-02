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
