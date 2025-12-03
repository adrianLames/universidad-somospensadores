# Migración: Diferenciación de Cursos por Jornada

## Fecha: 2 de diciembre de 2025

## Problema Original
Existían **26 códigos de cursos duplicados** en la base de datos. Estos duplicados correspondían a la misma materia ofrecida en dos jornadas diferentes (diurna y nocturna). Por ejemplo:

- `111021C` - Cálculo (diurna)
- `111021C` - Cálculo (nocturna)

Esta duplicación causaba:
- Confusión en la interfaz de usuario
- Dificultad para identificar rápidamente la jornada de un curso
- Problemas de visualización en dashboards y reportes

## Solución Implementada

Se creó y ejecutó la migración `20251202_diferenciar_cursos_por_jornada.sql` que:

1. **Identificó todos los códigos duplicados** (26 códigos afectados)
2. **Agregó sufijos distintivos**:
   - `_D` para cursos de jornada **diurna**
   - `_N` para cursos de jornada **nocturna**

### Ejemplos de Cambios

| Código Original | Nombre | Jornada | Código Nuevo |
|----------------|--------|---------|--------------|
| 111021C | Cálculo | diurna | 111021C_D |
| 111021C | Cálculo | nocturna | 111021C_N |
| 111023C | Matemática Básica | diurna | 111023C_D |
| 111023C | Matemática Básica | nocturna | 111023C_N |
| 70101C | Programación OO | diurna | 70101C_D |
| 70101C | Programación OO | nocturna | 70101C_N |

## Resultados

### Antes de la Migración
- Total de cursos: **69**
- Códigos únicos: **43**
- Códigos duplicados: **26**

### Después de la Migración
- Total de cursos: **69**
- Códigos únicos: **69** ✅
- Códigos duplicados: **0** ✅

## Impacto en Otras Tablas

✅ **NO HAY IMPACTO** en las siguientes tablas porque usan relaciones por `ID`:
- `matriculas` - Usa `curso_id` (FK a cursos.id)
- `calificaciones` - Usa `curso_id` (FK a cursos.id)
- `asignacion_docentes` - Usa `curso_id` (FK a cursos.id)
- `semestres_activos` - Usa `curso_id` (FK a cursos.id)
- `prerequisitos` - Usa `curso_id` (FK a cursos.id)

## Beneficios

1. **Códigos únicos**: Cada curso tiene ahora un código único e identificable
2. **Mejor UX**: Los usuarios pueden identificar rápidamente la jornada por el código
3. **Menos confusión**: No hay duplicados en listas desplegables
4. **Facilita reportes**: Los reportes y dashboards son más claros
5. **Escalabilidad**: Si en el futuro se agregan más jornadas (ej: fin de semana), el sistema está preparado

## Notas Técnicas

- La migración es **idempotente**: No modifica cursos que ya tienen sufijos `_D` o `_N`
- Solo afecta el campo `codigo`, no el `nombre` de los cursos
- Las relaciones por ID garantizan integridad referencial
- Se puede revertir manualmente removiendo los sufijos si es necesario

## Archivo de Migración

```sql
migraciones/20251202_diferenciar_cursos_por_jornada.sql
```

## Ejecución

```bash
Get-Content "migraciones/20251202_diferenciar_cursos_por_jornada.sql" | mysql -u root
```
