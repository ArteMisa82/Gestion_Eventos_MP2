# CORRECCIÓN: FLUJO DE INSCRIPCIONES Y PAGOS

## 📋 PROBLEMA IDENTIFICADO

El sistema permitía inscripciones inmediatas sin validar:
- ❌ Si el evento requiere pago
- ❌ Si se subió comprobante de pago
- ❌ Si el responsable validó el pago
- ❌ Estados intermedios de la inscripción

## ✅ SOLUCIÓN IMPLEMENTADA

### 1. NUEVOS CAMPOS EN BASE DE DATOS

**Tabla `registro_personas`:**
- `estado_registro`: VARCHAR(30) - Estados: PENDIENTE, PAGO_PENDIENTE, VALIDACION_PENDIENTE, COMPLETADO, RECHAZADO
- `responsable_valida`: BOOLEAN - Indica si el responsable aprobó
- `fecha_validacion`: TIMESTAMP - Cuándo se validó
- `comentarios_responsable`: TEXT - Comentarios del responsable

**Tabla `detalle_eventos`:**
- `requisitos_completos`: BOOLEAN - Si se completaron requisitos del evento

### 2. NUEVO FLUJO DE INSCRIPCIÓN

```
EVENTO GRATUITO:
Usuario → Inscripción → estado: COMPLETADO ✅

EVENTO DE PAGO:
Usuario → Inscripción → estado: PAGO_PENDIENTE
       ↓
Sube comprobante → estado: VALIDACION_PENDIENTE  
       ↓
Responsable valida → estado: COMPLETADO ✅
```

### 3. ESTADOS DEL REGISTRO

| Estado | Descripción | Puede acceder al evento |
|--------|-------------|------------------------|
| `PENDIENTE` | Inscripción inicial | ❌ No |
| `PAGO_PENDIENTE` | Esperando pago | ❌ No |
| `VALIDACION_PENDIENTE` | Comprobante subido, esperando validación | ❌ No |
| `COMPLETADO` | Pago validado o evento gratuito | ✅ Sí |
| `RECHAZADO` | Pago rechazado | ❌ No |

### 4. ESTADOS DEL PAGO (`pag_o_no`)

| Valor | Significado |
|-------|-------------|
| `0` | Pendiente de validación |
| `1` | Aprobado ✅ |
| `-1` | Rechazado ❌ |

## 🚀 PASOS PARA APLICAR LOS CAMBIOS

### Paso 1: Ejecutar migración de base de datos

```bash
cd backend
psql -U postgres -d gestion_eventos -f prisma/migrations/add_estado_inscripcion.sql
```

O manualmente en pgAdmin ejecutar el archivo:
`backend/prisma/migrations/add_estado_inscripcion.sql`

### Paso 2: Regenerar Prisma Client

```bash
cd backend
npx prisma generate
```

### Paso 3: Reiniciar el backend

```bash
cd backend
npm run dev
```

El servidor se reiniciará automáticamente si ya está corriendo con `ts-node-dev`.

## 📝 CAMBIOS EN EL CÓDIGO

### Backend - Servicios Modificados

1. **`inscripciones.service.ts`**
   - ✅ Ahora crea inscripción con `estado_registro` apropiado
   - ✅ Crea registro de pago si el evento es de pago
   - ✅ Auto-aprueba eventos gratuitos

2. **`pagos.service.ts`**
   - ✅ `registrarComprobante()`: Actualiza estado a VALIDACION_PENDIENTE
   - ✅ `validarComprobante()`: Completa o rechaza la inscripción
   - ✅ Agrega comentarios del responsable

## 🔍 VERIFICACIÓN

### Verificar que la migración se aplicó:

```sql
-- Ver estructura de registro_personas
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'registro_personas';

-- Ver inscripciones pendientes
SELECT num_reg_per, id_usu, estado_registro, responsable_valida, fec_reg_per
FROM registro_personas 
WHERE estado_registro IN ('PAGO_PENDIENTE', 'VALIDACION_PENDIENTE');
```

### Probar flujo completo:

1. **Inscripción en evento de pago:**
   ```
   POST /api/inscripciones
   {
     "id_usu": 1,
     "id_reg_evt": "REG001"
   }
   ```
   Resultado: `estado_registro = "PAGO_PENDIENTE"`

2. **Subir comprobante:**
   ```
   POST /api/pagos/comprobante
   {
     "num_reg_per": 1,
     "archivo": <file>,
     "met_pag": "TRANSFERENCIA"
   }
   ```
   Resultado: `estado_registro = "VALIDACION_PENDIENTE"`

3. **Validar pago (Responsable):**
   ```
   PUT /api/pagos/validar
   {
     "num_reg_per": 1,
     "aprobado": true,
     "comentarios": "Pago verificado"
   }
   ```
   Resultado: `estado_registro = "COMPLETADO"`, `responsable_valida = true`

## 📱 FRONTEND - CAMBIOS PENDIENTES

**NOTA**: Los archivos del frontend NO fueron modificados aún. Necesitas:

1. **Mostrar estado de inscripción** en la UI del usuario
2. **Deshabilitar acceso** a eventos si `estado_registro !== "COMPLETADO"`
3. **Interfaz para subir comprobante** cuando esté en `PAGO_PENDIENTE`
4. **Panel del responsable** para validar pagos pendientes

### Ejemplo de componente para mostrar estado:

```typescript
const EstadoBadge = ({ estado }: { estado: string }) => {
  const config = {
    'PAGO_PENDIENTE': { color: 'orange', text: 'Pendiente de Pago' },
    'VALIDACION_PENDIENTE': { color: 'blue', text: 'Esperando Validación' },
    'COMPLETADO': { color: 'green', text: 'Inscripción Completa' },
    'RECHAZADO': { color: 'red', text: 'Pago Rechazado' }
  };
  
  const { color, text } = config[estado] || { color: 'gray', text: estado };
  
  return <span className={`badge-${color}`}>{text}</span>;
};
```

## ⚠️ NOTAS IMPORTANTES

1. **Registros existentes** se migran a `estado_registro = "COMPLETADO"` para mantener compatibilidad
2. **Eventos gratuitos** se auto-completan sin pasar por validación
3. **Comprobantes rechazados** permiten al usuario volver a subir un nuevo comprobante
4. **El responsable** debe tener permisos para validar pagos (verificar en `auth.middleware.ts`)

## 🎯 PRÓXIMOS PASOS

1. ✅ Aplicar migración SQL
2. ✅ Reiniciar backend
3. 🔄 Actualizar frontend para mostrar estados
4. 🔄 Crear panel de validación para responsables
5. 🔄 Agregar notificaciones por email cuando cambie el estado
