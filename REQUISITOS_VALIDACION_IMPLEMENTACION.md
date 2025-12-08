# Sistema de Requisitos y Validación de Calificaciones

## ✅ Implementación Completada

### 1. Base de Datos

#### Tablas Creadas:
- **`requisitos_evento`**: Define requisitos por evento/detalle
  - `id_req` (PK): ID del requisito
  - `id_det` (FK): Referencia a detalle_eventos
  - `tip_req`: Tipo de requisito (CEDULA, CUSTOM, etc.)
  - `des_req`: Descripción del requisito
  - `obligatorio`: Si es obligatorio (boolean)

- **`requisitos_persona`**: Almacena requisitos completados por estudiantes
  - `id_req_per` (PK): ID del registro
  - `num_reg_per` (FK): Referencia a registro_personas
  - `id_req` (FK): Referencia a requisitos_evento
  - `val_req`: Valor ingresado (cédula, texto custom)
  - `fec_val`: Fecha de validación

#### Campo Agregado:
- **`registro_personas.apr_evt_det`**: Estado de aprobación individual
  - `0`: Reprobado
  - `1`: Aprobado
  - `NULL`: Pendiente

### 2. Backend - API REST

#### Nuevos Servicios:

**requisitos.service.ts**:
- `crearRequisito(data)`: Crear requisito para un evento
  - Convierte "Documento de Identidad" → "CEDULA" automáticamente
- `obtenerRequisitosPorDetalle(idDetalle)`: Listar requisitos de un evento
- `completarRequisito(data)`: Registrar requisito completado por estudiante
- `verificarRequisitosCompletos(numRegPer, idDetalle)`: Verificar si todos están completos
- `obtenerRequisitosCompletados(numRegPer)`: Ver requisitos completados por estudiante
- `eliminarRequisito(idRequisito)`: Eliminar requisito

#### Servicio Actualizado:

**calificaciones.service.ts**:
- **Lógica de Auto-Aprobación** (líneas ~210-238):
  ```typescript
  // Validar nota mínima
  if (detalle?.not_min_evt && nota < detalle.not_min_evt) {
    aprobado = 0; // Reprobado por nota
  }
  
  // Validar asistencia requerida
  if (detalle?.asi_evt_det === 1 && (!asistencia || asistencia === 0)) {
    aprobado = 0; // Reprobado por falta de asistencia
  }
  ```
- Actualiza `apr_evt_det` automáticamente al asignar calificaciones
- Devuelve el estado de aprobación en las respuestas

#### Rutas Creadas:

**POST** `/api/requisitos` - Crear requisito (Admin/Responsable)
**GET** `/api/requisitos/detalle/:idDetalle` - Obtener requisitos de evento
**POST** `/api/requisitos/completar` - Completar requisito (Estudiante)
**GET** `/api/requisitos/verificar/:numRegPer/:idDetalle` - Verificar completitud
**GET** `/api/requisitos/completados/:numRegPer` - Ver requisitos completados
**DELETE** `/api/requisitos/:idRequisito` - Eliminar requisito

### 3. Frontend - Integración API

**api.ts** - Nuevo módulo `requisitosAPI`:
- `obtenerPorDetalle(idDetalle)`
- `crear(data)`
- `completar(data)` - Maneja CEDULA y texto custom
- `verificarCompletos(numRegPer, idDetalle)`
- `obtenerCompletados(numRegPer)`
- `eliminar(idRequisito)`

Exportado en el objeto default como `requisitos`

### 4. Validación Automática

#### Criterios de Aprobación:

1. **Nota Mínima** (`detalle_eventos.not_min_evt`):
   - Si existe y `registro_personas.not_fin_evt < not_min_evt` → **Reprobado**

2. **Asistencia Requerida** (`detalle_eventos.asi_evt_det`):
   - Si `asi_evt_det = 1` (requerida) y estudiante no asistió → **Reprobado**
   - `registro_personas.asi_evt_det`: 0 = ausente, 100 = presente

3. **Auto-Aprobación**:
   - Si cumple ambos criterios → `apr_evt_det = 1` (Aprobado)
   - Si falla cualquiera → `apr_evt_det = 0` (Reprobado)
   - Se actualiza automáticamente al guardar notas/asistencia

### 5. Campos Especiales

#### Asistencia Mínima (Boolean):
- **Base de datos**: `SmallInt` (0 o 1)
- **Interpretación**:
  - En `detalle_eventos.asi_evt_det`: 0 = No requerida, 1 = Requerida
  - En `registro_personas.asi_evt_det`: 0 = Ausente, 100 = Presente
- **Frontend**: Se muestra como checkbox (sí/no)

#### Requisito "CEDULA":
- Cuando `tip_req = "Documento de Identidad"` → Se guarda como "CEDULA"
- `val_req` contiene el número de cédula ingresado
- Para otros requisitos → `tip_req = "CUSTOM"` y `val_req` contiene el texto

### 6. Escala de Notas

**Conversión Frontend ↔ Backend**:
- **Frontend**: 0-10 (decimal, 1 decimal)
- **Backend**: 0-100 (entero o decimal)
- **Conversión**:
  - Guardar: `not_fin_evt = Math.round(nota * 10)`
  - Mostrar: `nota = not_fin_evt / 10`

## 📋 Flujo de Trabajo

### Para Responsables/Administradores:

1. **Crear Evento** con detalles:
   - `not_min_evt`: Nota mínima para aprobar (ej: 70)
   - `asi_evt_det`: Asistencia requerida (0 = No, 1 = Sí)

2. **Definir Requisitos**:
   ```javascript
   await api.requisitos.crear({
     id_det: "DET-001",
     tip_req: "Documento de Identidad", // Se guarda como "CEDULA"
     des_req: "Cédula de identidad",
     obligatorio: true
   });
   ```

### Para Estudiantes:

3. **Inscribirse en Evento**

4. **Completar Requisitos**:
   ```javascript
   await api.requisitos.completar({
     num_reg_per: 123,
     id_req: 1,
     val_req: "1234567890" // Número de cédula
   });
   ```

### Para Docentes:

5. **Asignar Calificaciones**:
   ```javascript
   await api.calificaciones.asignarCalificacion(idDetalle, {
     id_reg_per: 123,
     not_fin_evt: 85, // Escala 0-100
     asi_evt_det: 100 // 0 = ausente, 100 = presente
   });
   ```

6. **Sistema Auto-Aprueba**:
   - Compara nota con `not_min_evt`
   - Verifica asistencia si es requerida
   - Actualiza `apr_evt_det` (0 = Reprobado, 1 = Aprobado)

## 🔍 Consultas Útiles

### Verificar Aprobación de Estudiante:
```sql
SELECT 
  rp.num_reg_per,
  rp.not_fin_evt AS nota_final,
  rp.asi_evt_det AS asistencia,
  rp.apr_evt_det AS aprobado,
  de.not_min_evt AS nota_minima,
  de.asi_evt_det AS asistencia_requerida
FROM registro_personas rp
JOIN registro_evento re ON rp.id_reg_evt = re.id_reg_evt
JOIN detalle_eventos de ON re.id_det = de.id_det
WHERE rp.num_reg_per = 123;
```

### Ver Requisitos Completados:
```sql
SELECT 
  req.tip_req,
  req.des_req,
  rp.val_req,
  rp.fec_val
FROM requisitos_persona rp
JOIN requisitos_evento req ON rp.id_req = req.id_req
WHERE rp.num_reg_per = 123;
```

## 📊 Estadísticas de Aprobación

```sql
SELECT 
  COUNT(*) FILTER (WHERE apr_evt_det = 1) AS aprobados,
  COUNT(*) FILTER (WHERE apr_evt_det = 0) AS reprobados,
  COUNT(*) FILTER (WHERE apr_evt_det IS NULL) AS pendientes,
  ROUND(AVG(not_fin_evt), 2) AS promedio_nota
FROM registro_personas rp
JOIN registro_evento re ON rp.id_reg_evt = re.id_reg_evt
WHERE re.id_det = 'DET-001';
```

## ✅ Validación Manual

Si necesitas modificar manualmente la aprobación:
```sql
UPDATE registro_personas
SET apr_evt_det = 1,
    comentarios_responsable = 'Aprobado por circunstancias especiales'
WHERE num_reg_per = 123;
```

## 🚀 Próximos Pasos (Pendientes)

1. **Frontend - UI de Requisitos**:
   - Formulario para definir requisitos al crear evento
   - Modal para estudiantes completen requisitos en inscripción
   - Mostrar estado de requisitos en perfil de estudiante

2. **Notificaciones**:
   - Email cuando estudiante completa requisitos
   - Email cuando es aprobado/reprobado automáticamente

3. **Reporte de Certificados**:
   - Generar certificado solo si `apr_evt_det = 1`
   - Incluir nota final y fecha de aprobación

4. **Override Manual**:
   - UI para responsable modificar aprobación
   - Historial de cambios manuales

## 📄 Archivos Modificados/Creados

### Backend:
- ✅ `backend/prisma/schema.prisma` - Modelos requisitos_evento y requisitos_persona
- ✅ `backend/prisma/migrations/20251205_requisitos_asistencia.sql` - Tablas requisitos
- ✅ `backend/prisma/migrations/20251205_add_apr_evt_det_registro.sql` - Campo aprobación
- ✅ `backend/src/services/requisitos.service.ts` - Lógica de negocio
- ✅ `backend/src/controllers/requisitos.controller.ts` - Controladores
- ✅ `backend/src/routes/requisitos.routes.ts` - Endpoints
- ✅ `backend/src/routes/index.ts` - Registro de rutas
- ✅ `backend/src/services/calificaciones.service.ts` - Validación y auto-aprobación

### Frontend:
- ✅ `frontend/src/services/api.ts` - API de requisitos

## 🎯 Funcionalidad Completa

### ✅ Implementado:
- [x] Tablas de requisitos en base de datos
- [x] Campo de aprobación individual (`apr_evt_det`)
- [x] Servicio completo de requisitos (CRUD)
- [x] Validación automática de nota mínima
- [x] Validación automática de asistencia requerida
- [x] Auto-aprobación al asignar calificaciones
- [x] Conversión "Documento de Identidad" → "CEDULA"
- [x] API REST completa para requisitos
- [x] Integración frontend (api.ts)
- [x] Asistencia como boolean en detalle (0/1)
- [x] Asistencia como porcentaje en registro (0/100)

### 🟡 Pendiente (UI):
- [ ] Formulario para crear requisitos (responsable)
- [ ] Modal para completar requisitos (estudiante)
- [ ] Indicador de estado de aprobación en listas
- [ ] Dashboard de estadísticas de aprobación

## 📞 Uso Desde Frontend

```typescript
import api from '@/services/api';

// Obtener requisitos de un evento
const requisitos = await api.requisitos.obtenerPorDetalle('DET-001');

// Completar requisito de cédula
await api.requisitos.completar({
  num_reg_per: 123,
  id_req: 1,
  val_req: '1234567890'
});

// Verificar si están completos
const { completos } = await api.requisitos.verificarCompletos(123, 'DET-001');

// Asignar nota (auto-aprueba si cumple requisitos)
await api.calificaciones.asignarCalificacion('DET-001', {
  id_reg_per: 123,
  not_fin_evt: 85,
  asi_evt_det: 100
});
```

---

**Fecha**: 2024-12-05  
**Estado**: ✅ Backend Completo | 🟡 Frontend API Listo | ⏳ UI Pendiente
