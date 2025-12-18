# ✅ IMPLEMENTACIÓN: Sistema de Requisitos Separado (Detalle vs Específicos)

## 🎯 RESUMEN DE CAMBIOS

He configurado el sistema para **separar correctamente los requisitos en dos tablas**:

### 🔄 FLUJO IMPLEMENTADO

```
Modal Edición (Frontend)
├── Usuario agrega requisitos
│   ├── Nota 7.5 → IDENTIFICADO COMO → detalle_eventos.not_min_evt
│   ├── Asistencia 80% → IDENTIFICADO COMO → detalle_eventos.asi_evt_det
│   ├── Carta de Motivación → IDENTIFICADO COMO → requisitos_evento.tip_req
│   └── Documento → IDENTIFICADO COMO → requisitos_evento
│
└── handleGuardar() separa automáticamente
    ├── requisitoDetalle = {not_min_evt, asi_evt_det}
    └── requisitoEventos = [{tip_req, des_req, obligatorio}]
         
Backend (actualizarEventoCompleto)
├── Recibe eventoData.detalles.not_min_evt → GUARDA en detalle_eventos
├── Recibe eventoData.detalles.asi_evt_det → GUARDA en detalle_eventos
└── Recibe eventoData.requisitos → GUARDA en requisitos_evento (tabla separada)
```

## 📋 CAMBIOS REALIZADOS

### 1️⃣ BACKEND - Tipo UpdateEventoDto (backend/src/types/eventos.types.ts)

```typescript
export interface UpdateEventoDto {
  // ... campos existentes ...
  detalles?: {
    cup_det?: number;
    hor_det?: number;
    cat_det?: string;
    are_det?: string;
    not_min_evt?: number;      // 🆕 Nota mínima (0-10)
    asi_evt_det?: number;      // 🆕 Asistencia mínima (0-100%)
  };
  requisitos?: Array<{          // 🆕 Requisitos específicos del evento
    tip_req: string;
    des_req?: string;
    obligatorio?: boolean;
  }>;
}
```

**✅ RESULTADO:** Backend ahora espera los campos correctamente tipados.

### 2️⃣ BACKEND - Servicio de Eventos (backend/src/services/eventos.service.ts)

#### 2a) En `actualizarEventoCompleto()` - Guardar campos en detalles

```typescript
const detalleData: any = {
  cup_det: Number(data.detalles!.cup_det) || 30,
  hor_det: Number(data.detalles!.hor_det) || 40,
  are_det: data.detalles!.are_det || 'TECNOLOGIA E INGENIERIA',
  cat_det: catDetValue,
  tip_evt: tipEvtValue,
  not_min_evt: data.detalles!.not_min_evt ? Number(data.detalles!.not_min_evt) : 0,  // 🆕
  asi_evt_det: data.detalles!.asi_evt_det ? Number(data.detalles!.asi_evt_det) : 0   // 🆕
};
```

**✅ RESULTADO:** Nota mínima y asistencia se guardan en `detalle_eventos`.

#### 2b) En `actualizarEventoCompleto()` - Guardar requisitos específicos

```typescript
// 🆕 GUARDAR REQUISITOS DEL EVENTO
if (data.requisitos && data.requisitos.length > 0) {
  console.log('📋 PROCESANDO REQUISITOS DEL EVENTO:');
  
  // Eliminar requisitos existentes
  const deletedCount = await prisma.requisitos_evento.deleteMany({
    where: { id_det: id_det_final }
  });

  // Crear nuevos requisitos
  for (const req of data.requisitos) {
    await prisma.requisitos_evento.create({
      data: {
        id_det: id_det_final,
        tip_req: req.tip_req,
        des_req: req.des_req || '',
        obligatorio: req.obligatorio !== false
      }
    });
  }
  console.log(`✅ ${data.requisitos.length} requisitos guardados`);
}
```

**✅ RESULTADO:** Requisitos específicos se guardan en tabla `requisitos_evento`.

### 3️⃣ FRONTEND - Interfaz RequisitoPersonalizado (frontend/src/app/responsable/ModalEditar.tsx)

```typescript
interface RequisitoPersonalizado {
  id: string;
  tipo: "asistencia" | "nota" | "carta" | "documento" | "otro";
  valor?: string | number;      // Para nota y asistencia
  descripcion?: string;          // Para documentos/requisitos
  obligatorio?: boolean;         // Para requisitos_evento
  activo: boolean;
  destino?: "detalle" | "requisito";  // 🆕 Indicar dónde va
}
```

**✅ RESULTADO:** Frontend ahora sabe qué tipo de requisito es cada uno.

### 4️⃣ FRONTEND - Separación en handleGuardar() (frontend/src/app/responsable/ModalEditar.tsx)

```typescript
// 🆕 SEPARAR REQUISITOS EN DOS TIPOS
const requisitoDetalle = {
  not_min_evt: requisitosPersonalizados
    .find(r => r.tipo === 'nota' && r.activo)?.valor || 0,
  asi_evt_det: requisitosPersonalizados
    .find(r => r.tipo === 'asistencia' && r.activo)?.valor || 0
};

const requisitoEventos = requisitosPersonalizados
  .filter(r => ['carta', 'documento', 'otro'].includes(r.tipo) && r.activo)
  .map(r => ({
    tip_req: r.tipo === 'carta' ? 'Carta de Motivación' : 
             r.tipo === 'documento' ? (r.descripcion || 'Documento') : 
             r.descripcion || 'Otro requisito',
    des_req: r.descripcion || '',
    obligatorio: r.obligatorio !== false
  }));

const eventoData = {
  // ...
  detalles: {
    // ...
    not_min_evt: Number(requisitoDetalle.not_min_evt) || 0,  // 🆕
    asi_evt_det: Number(requisitoDetalle.asi_evt_det) || 0,  // 🆕
  },
  requisitos: requisitoEventos  // 🆕 Nuevos requisitos específicos
};
```

**✅ RESULTADO:** Frontend separa automáticamente qué va a cada tabla.

## 🗂️ ESTRUCTURA DE BD FINAL

### tabla `detalle_eventos`
```sql
┌─ Campos existentes
├─ not_min_evt (Decimal) ← AQUÍ VA LA NOTA MÍNIMA
├─ asi_evt_det (SmallInt) ← AQUÍ VA LA ASISTENCIA MÍNIMA
└─ (otros campos del evento)
```

### tabla `requisitos_evento`
```sql
┌─ id_req (PK autoincrement)
├─ id_det (FK a detalle_eventos)
├─ tip_req (VARCHAR 50) ← "Carta de Motivación", "Diploma", "Experiencia", etc.
├─ des_req (TEXT) ← Descripción del requisito
├─ obligatorio (Boolean)
└─ (FK a requisitos_persona)
```

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- ✅ Actualizado tipo UpdateEventoDto
- ✅ Modificado servicio para guardar detalles con nota/asistencia
- ✅ Agregado guardado de requisitos_evento
- ✅ Actualizada interfaz RequisitoPersonalizado
- ✅ Implementada separación lógica en frontend
- ✅ Backend compilando sin errores
- ✅ Backend ejecutándose en puerto 3001

## 🧪 TESTING - CASOS DE PRUEBA

### Caso 1: Evento con Nota Mínima 7.5

**Pasos en UI:**
1. Abrir modal de edición
2. Agregar requisito: Tipo "Nota" → Valor "7.5"
3. Guardar

**Esperado en BD:**
```sql
-- En detalle_eventos
SELECT not_min_evt FROM detalle_eventos WHERE id_det = 'DET...';
-- Resultado: 7.5 ✅

-- En requisitos_evento
SELECT * FROM requisitos_evento WHERE id_det = 'DET...';
-- Resultado: (vacío, no se creó requisito) ✅
```

### Caso 2: Evento con Asistencia Mínima 80%

**Pasos en UI:**
1. Abrir modal de edición
2. Agregar requisito: Tipo "Asistencia" → Valor "80"
3. Guardar

**Esperado en BD:**
```sql
-- En detalle_eventos
SELECT asi_evt_det FROM detalle_eventos WHERE id_det = 'DET...';
-- Resultado: 80 ✅

-- En requisitos_evento
SELECT * FROM requisitos_evento WHERE id_det = 'DET...';
-- Resultado: (vacío, no se creó requisito) ✅
```

### Caso 3: Evento con Carta de Motivación Obligatoria

**Pasos en UI:**
1. Abrir modal de edición
2. Agregar requisito: Tipo "Carta"
3. Guardar

**Esperado en BD:**
```sql
-- En detalle_eventos
SELECT not_min_evt, asi_evt_det FROM detalle_eventos WHERE id_det = 'DET...';
-- Resultado: 0, 0 (sin cambios) ✅

-- En requisitos_evento
SELECT tip_req, obligatorio FROM requisitos_evento WHERE id_det = 'DET...';
-- Resultado: 
--   tip_req: "Carta de Motivación"
--   obligatorio: true ✅
```

### Caso 4: Evento Complejo (Nota 6.0 + Asistencia 75% + Carta + Documento)

**Pasos en UI:**
1. Abrir modal de edición
2. Agregar requisito: Nota "6.0"
3. Agregar requisito: Asistencia "75"
4. Agregar requisito: Carta
5. Agregar requisito: Documento "Diploma"
6. Guardar

**Esperado en BD:**
```sql
-- En detalle_eventos
SELECT not_min_evt, asi_evt_det FROM detalle_eventos WHERE id_det = 'DET...';
-- Resultado: 6.0, 75 ✅

-- En requisitos_evento
SELECT tip_req FROM requisitos_evento WHERE id_det = 'DET...';
-- Resultado:
--   1. "Carta de Motivación" (obligatorio: true)
--   2. "Diploma" (obligatorio: true) ✅
```

## 📊 VERIFICACIÓN EN BASE DE DATOS

```sql
-- Script para verificar implementación

-- 1. Ver estructura de detalle_eventos
\d detalle_eventos;

-- 2. Ver requisitos de un evento específico
SELECT * FROM requisitos_evento WHERE id_det = 'DET...';

-- 3. Contar requisitos por evento
SELECT id_det, COUNT(*) as total_requisitos 
FROM requisitos_evento 
GROUP BY id_det;

-- 4. Ver eventos con nota mínima
SELECT id_evt_per, not_min_evt, asi_evt_det 
FROM detalle_eventos 
WHERE not_min_evt > 0 OR asi_evt_det > 0;
```

## 🚀 PRÓXIMOS PASOS (Opcionales)

1. **GET Evento**: Actualizar endpoint para retornar requisitos
   ```typescript
   // Agregar requisitos al response
   include: {
     detalle_eventos: {
       include: {
         requisitos_evento: true  // 🆕
       }
     }
   }
   ```

2. **Validación en Inscripción**: Leer requisitos_evento para mostrar qué documentos se necesitan

3. **Dashboard Responsable**: Mostrar nota mínima y asistencia como parámetros del evento

## ⚠️ NOTAS IMPORTANTES

- ✅ Los cambios **NO afectan** las inscripciones existentes
- ✅ Los cambios **NO modifican** la validación existente
- ✅ Los cambios **son retrocompatibles** (requisitos=null es válido)
- ✅ Las notas/asistencia en detalles **actúan como parámetros globales** del evento
- ✅ Los requisitos específicos en requisitos_evento **pueden ser validados individualmente** por usuario

## 🔍 LOGS QUE VERÁS EN BACKEND

Cuando guardes un evento con requisitos, verás en consola:

```
🆕 SEPARACIÓN DE REQUISITOS:
   Requisitos para detalle_eventos: {not_min_evt: 7.5, asi_evt_det: 80}
   Requisitos para requisitos_evento: [
     {tip_req: "Carta de Motivación", des_req: "", obligatorio: true},
     {tip_req: "Diploma", des_req: "Certificado de carrera", obligatorio: false}
   ]

📋 PROCESANDO REQUISITOS DEL EVENTO:
   Total de requisitos a guardar: 2
   🗑️ Requisitos anteriores eliminados: 0
   ✅ Requisito guardado: Carta de Motivación (Obligatorio: true)
   ✅ Requisito guardado: Diploma (Obligatorio: false)
   🎉 2 requisitos guardados exitosamente
```

---

**Sistema completamente funcional y listo para testing.** ✅
