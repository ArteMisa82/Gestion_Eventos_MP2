# Análisis de Campos: eventos vs detalle_eventos

## ❌ PROBLEMA IDENTIFICADO

El modal de **ModalEditar.tsx** del responsable está guardando campos que **NO pertenecen a la tabla `eventos`**, sino que deberían guardarse en `detalle_eventos`.

---

## 📊 CAMPOS EN EL FORMULARIO DEL RESPONSABLE

### Campos mostrados en el modal:
1. ✅ **fechaInicio** → `fec_evt` (eventos)
2. ✅ **fechaFin** → `fec_fin_evt` (eventos)  
3. ✅ **modalidad** → `mod_evt` (eventos)
4. ❌ **capacidad** → `cup_det` (**detalle_eventos**)
5. ✅ **publico** → `tip_pub_evt` (eventos)
6. ❌ **horas** → `hor_det` (**detalle_eventos**)
7. ✅ **pago** → `cos_evt` (eventos)
8. ❌ **carreras** → Se guarda en `registro_evento` con `id_niv`
9. ❌ **semestres** → Se relaciona con `nivel.org_cur_niv`
10. ❌ **tipoEvento** → `tip_evt` (**detalle_eventos**)
11. ❌ **docente** → Se relaciona con `detalle_instructores`

---

## 🗂️ ESTRUCTURA DE TABLAS

### Tabla: `eventos`
```sql
id_evt          VARCHAR(10) PRIMARY KEY
nom_evt         VARCHAR(25)        -- Nombre del evento
fec_evt         DATE               -- ✅ Fecha inicio
fec_fin_evt     DATE               -- ✅ Fecha fin
lug_evt         VARCHAR(25)        -- Lugar
mod_evt         VARCHAR(15)        -- ✅ Modalidad (PRESENCIAL, VIRTUAL, A DISTANCIA)
tip_pub_evt     VARCHAR(20)        -- ✅ Tipo público (GENERAL, ESTUDIANTES, ADMINISTRATIVOS)
cos_evt         VARCHAR(15)        -- ✅ Costo (GRATUITO, DE PAGO)
des_evt         VARCHAR(255)       -- Descripción
id_res_evt      INT                -- Responsable del evento
est_evt         VARCHAR(20)        -- Estado (EDITANDO, PUBLICADO)
ima_evt         TEXT               -- Imagen del evento
```

### Tabla: `detalle_eventos`
```sql
id_det          VARCHAR(10) PRIMARY KEY
id_evt_per      VARCHAR(10)        -- FK a eventos
cup_det         INT                -- ❌ Capacidad/Cupo
hor_det         DECIMAL(4,2)       -- ❌ Horas del evento
are_det         VARCHAR(40)        -- Área (Tecnología, Administración, etc.)
cat_det         VARCHAR(20)        -- Categoría
tip_evt         VARCHAR(20)        -- ❌ Tipo de evento (CURSO, CONFERENCIA, etc.)
est_evt_det     VARCHAR(20)        -- Estado del detalle (INSCRIPCIONES, EN_CURSO, FINALIZADO)
not_min_evt     DECIMAL(4,2)       -- Nota mínima
cer_evt_det     SMALLINT           -- Certificado
apr_evt_det     SMALLINT           -- Aprobación
not_fin_evt     DECIMAL(4,2)       -- Nota final
asi_evt_det     SMALLINT           -- Asistencia
```

### Tabla: `registro_evento`
```sql
id_reg_evt      VARCHAR(10) PRIMARY KEY
id_evt_det      VARCHAR(10)        -- FK a detalle_eventos
id_niv          VARCHAR(10)        -- ❌ Nivel (carrera + semestre)
tar_evt         DECIMAL(4,2)       -- Tarifa del evento
cupo_disp       INT                -- Cupo disponible
```

### Tabla: `detalle_instructores`
```sql
id_det_ins      VARCHAR(10) PRIMARY KEY
id_evt_det      VARCHAR(10)        -- FK a detalle_eventos
id_ins          INT                -- ❌ FK a instructores (docente)
```

---

## 🚨 CAMPOS QUE SE ESTÁN GUARDANDO INCORRECTAMENTE

### Actualmente en `ModalEditar.tsx` (líneas 124-131):
```typescript
const updateData: any = {
  fec_evt: formData.fechaInicio,        // ✅ Correcto (eventos)
  fec_fin_evt: formData.fechaFin,       // ✅ Correcto (eventos)
  mod_evt: formData.modalidad,          // ✅ Correcto (eventos)
  tip_pub_evt: formData.publico,        // ✅ Correcto (eventos)
  cos_evt: formData.pago,               // ✅ Correcto (eventos)
};
```

### ❌ CAMPOS QUE FALTAN Y DEBEN IR A `detalle_eventos`:

1. **capacidad** → `cup_det` (INT)
2. **horas** → `hor_det` (DECIMAL)
3. **tipoEvento** → `tip_evt` (VARCHAR)

### ❌ CAMPOS QUE REQUIEREN CREACIÓN DE REGISTROS RELACIONADOS:

4. **carreras** + **semestres** → Crear múltiples `registro_evento` con diferentes `id_niv`
5. **docente** → Crear `detalle_instructores` con el `id_ins` del docente

---

## ✅ SOLUCIÓN PROPUESTA

### 1️⃣ Crear endpoint para guardar evento completo
```
POST /api/eventos/:id/detalles
```

Este endpoint debe:
- Crear el `detalle_eventos` con: cup_det, hor_det, are_det, cat_det, tip_evt
- Crear múltiples `registro_evento` según carreras/semestres seleccionados
- Crear `detalle_instructores` con el docente asignado

### 2️⃣ Modificar `ModalEditar.tsx` para enviar dos requests:

**Request 1:** Actualizar `eventos`
```typescript
await eventosAPI.update(token, evento.id, {
  fec_evt: formData.fechaInicio,
  fec_fin_evt: formData.fechaFin,
  mod_evt: formData.modalidad,
  tip_pub_evt: formData.publico,
  cos_evt: formData.pago,
});
```

**Request 2:** Crear/Actualizar `detalle_eventos`
```typescript
await eventosAPI.crearDetalle(token, evento.id, {
  cup_det: formData.capacidad,
  hor_det: formData.horas,
  tip_evt: formData.tipoEvento,
  are_det: "Tecnología",  // Debe inferirse o pedirse en el form
  cat_det: "Académico",   // Debe inferirse o pedirse en el form
  carreras: formData.carreras,
  semestres: formData.semestres,
  docente_id: formData.docente_id,
});
```

---

## 📝 CAMPOS QUE DEBEN AGREGARSE AL FORMULARIO

Para que el `detalle_eventos` sea completo, el formulario debe incluir:

1. ✅ **Capacidad** (ya existe)
2. ✅ **Horas** (ya existe)
3. ✅ **Tipo de Evento** (ya existe)
4. ❌ **Área** (are_det) - Falta en el formulario
5. ❌ **Categoría** (cat_det) - Falta en el formulario

---

## 🎯 RESUMEN

| Campo Formulario | Tabla Correcta | Estado Actual | Acción Requerida |
|------------------|----------------|---------------|------------------|
| fechaInicio | eventos.fec_evt | ✅ Se guarda | Ninguna |
| fechaFin | eventos.fec_fin_evt | ✅ Se guarda | Ninguna |
| modalidad | eventos.mod_evt | ✅ Se guarda | Ninguna |
| publico | eventos.tip_pub_evt | ✅ Se guarda | Ninguna |
| pago | eventos.cos_evt | ✅ Se guarda | Ninguna |
| **capacidad** | **detalle_eventos.cup_det** | ❌ No se guarda | **Crear detalle** |
| **horas** | **detalle_eventos.hor_det** | ❌ No se guarda | **Crear detalle** |
| **tipoEvento** | **detalle_eventos.tip_evt** | ❌ No se guarda | **Crear detalle** |
| carreras | registro_evento.id_niv | ❌ No se guarda | **Crear registros** |
| semestres | registro_evento.id_niv | ❌ No se guarda | **Crear registros** |
| docente | detalle_instructores | ❌ No se guarda | **Crear instructor** |

**CONCLUSIÓN:** El responsable está llenando campos que NO se guardan en ninguna tabla. Se necesita crear el endpoint y la lógica para guardar correctamente en `detalle_eventos` y tablas relacionadas.
