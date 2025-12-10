# 📋 PLAN: Implementación de Requisitos en Modal de Edición

## 🎯 Objetivo
Detectar correctamente qué requisitos van a `detalle_eventos` vs `requisitos_evento` y configurar front/back para guardar ambos correctamente.

## 📊 ANÁLISIS DE CAMPOS

### CAMPOS QUE VAN A `detalle_eventos`:
Estos son parámetros del evento que afectan a TODOS los inscritos:
```typescript
- not_min_evt: number      // Nota mínima para aprobar (0-10)
- asi_evt_det: number      // Asistencia mínima requerida (0-100 %)
- cer_evt_det: boolean     // ¿Es certificable?
- apr_evt_det: boolean     // ¿Es aprobable?
```

### CAMPOS QUE VAN A `requisitos_evento`:
Estos son requisitos específicos/documentos que ALGUNOS inscritos deben cumplir:
```typescript
- tip_req: string          // Tipo: "Carta de Motivación", "Diploma", "Experiencia", etc.
- des_req: string          // Descripción del requisito
- obligatorio: boolean     // ¿Es obligatorio?

Ejemplos:
1. Carta de Motivación (obligatorio)
2. Diploma de carrera (no obligatorio)
3. Certificado de experiencia (obligatorio)
4. Documentos adicionales específicos del evento
```

## 🔄 FLUJO ACTUAL EN FRONTEND

```
Modal Edición (ModalEditar.tsx)
├── requisitosPersonalizados[] = []
├── Cada requisito tiene:
│   ├── id: string
│   ├── tipo: "asistencia" | "nota" | "carta" | "documento" | "otro"
│   ├── valor?: string | number (para nota/asistencia)
│   └── activo: boolean
└── handleGuardar()
    ├── Filtra por activo=true
    ├── Mapea a getTextoRequisito()
    └── Envía como requisitosCategoria: string[]

PROBLEMA: Todos los requisitos se envían como TEXTO en un array
SOLUCIÓN: Separar en 2 tipos de datos diferentes
```

## 🛠️ CAMBIOS NECESARIOS

### 1. FRONTEND - ModalEditar.tsx

#### 1.1 Actualizar interfaz RequisitoPersonalizado
```typescript
interface RequisitoPersonalizado {
  id: string;
  tipo: "asistencia" | "nota" | "carta" | "documento" | "otro";
  valor?: string | number;      // Para nota y asistencia
  descripcion?: string;          // Para documentos/requisitos
  obligatorio?: boolean;         // Para requisitos_evento
  activo: boolean;
  destino: "detalle" | "requisito"; // NUEVO: Indicar dónde va
}
```

#### 1.2 En handleGuardar()
```typescript
// Separar los requisitos
const requisitoDetalle = {
  not_min_evt: requisitosPersonalizados
    .find(r => r.tipo === 'nota' && r.activo)?.valor || 0,
  asi_evt_det: requisitosPersonalizados
    .find(r => r.tipo === 'asistencia' && r.activo)?.valor || 0
};

const requisitoEventos = requisitosPersonalizados
  .filter(r => ['carta', 'documento', 'otro'].includes(r.tipo) && r.activo)
  .map(r => ({
    tip_req: r.tipo === 'carta' ? 'Carta de Motivación' : r.tipo === 'documento' ? r.descripcion : 'Otro',
    des_req: r.descripcion || '',
    obligatorio: r.obligatorio !== false
  }));

// Enviar en el payload:
const payload = {
  ...eventoData,
  detalles: {
    ...eventoData.detalles,
    not_min_evt: requisitoDetalle.not_min_evt,
    asi_evt_det: requisitoDetalle.asi_evt_det
  },
  requisitos: requisitoEventos  // NUEVO
};
```

### 2. BACKEND - eventos.service.ts

#### 2.1 Actualizar actualizarEventoCompleto()
```typescript
async actualizarEventoCompleto(
  idEvento: string,
  data: UpdateEventoDto & {
    detalles?: {
      cup_det?: number;
      hor_det?: number;
      tip_evt?: string;
      are_det?: string;
      cat_det?: string;
      not_min_evt?: number;    // NUEVO
      asi_evt_det?: number;    // NUEVO
    };
    requisitos?: Array<{        // NUEVO
      tip_req: string;
      des_req?: string;
      obligatorio?: boolean;
    }>;
    carreras?: string[];
    semestres?: string[];
    docentes?: string[];
  },
  userId: number
) {
  // ... código existente ...

  // AL GUARDAR DETALLES, agregar:
  const detalleData: any = {
    cup_det: Number(data.detalles!.cup_det) || 30,
    hor_det: Number(data.detalles!.hor_det) || 40,
    are_det: data.detalles!.are_det || 'TECNOLOGIA E INGENIERIA',
    cat_det: catDetValue,
    tip_evt: tipEvtValue,
    not_min_evt: data.detalles?.not_min_evt || 0,  // NUEVO
    asi_evt_det: data.detalles?.asi_evt_det || 0   // NUEVO
  };

  // DESPUÉS DE GUARDAR EL DETALLE, guardar requisitos:
  if (data.requisitos && data.requisitos.length > 0) {
    // Primero, borrar requisitos existentes
    await prisma.requisitos_evento.deleteMany({
      where: { id_det: id_det_final }
    });

    // Luego, crear los nuevos
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
    console.log(`✅ ${data.requisitos.length} requisitos guardados para evento ${idEvento}`);
  }
}
```

### 3. BACKEND - UpdateEventoDto

Actualizar el tipo en `tipos/eventos.types.ts`:

```typescript
export interface UpdateEventoDto {
  nom_evt?: string;
  fec_evt?: string;
  fec_fin_evt?: string;
  lug_evt?: string;
  mod_evt?: string;
  tip_pub_evt?: string;
  cos_evt?: string;
  ima_evt?: string;
  des_evt?: string;
  carreras?: string[];
  semestres?: string[];
  docentes?: string[];
  categoria?: string;
  requisitosCategoria?: string[];
  detalles?: {
    cup_det?: number;
    hor_det?: number;
    tip_evt?: string;
    are_det?: string;
    cat_det?: string;
    not_min_evt?: number;    // NUEVO
    asi_evt_det?: number;    // NUEVO
  };
  requisitos?: Array<{        // NUEVO
    tip_req: string;
    des_req?: string;
    obligatorio?: boolean;
  }>;
}
```

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Actualizar interfaz RequisitoPersonalizado en ModalEditar.tsx
- [ ] Separar lógica en handleGuardar() para requisitos detalle vs evento
- [ ] Actualizar payload enviado al backend
- [ ] Actualizar UpdateEventoDto en tipos
- [ ] Modificar actualizarEventoCompleto() para guardar requisitos_evento
- [ ] Probar en Postman/Insomnia
- [ ] Verificar en BD que se guarden correctamente
- [ ] Actualizar GET del evento para retornar requisitos
- [ ] Testing end-to-end en modal

## 📝 TESTING

### Caso 1: Evento con nota mínima 7.5 y asistencia 80%
```json
{
  "detalles": {
    "not_min_evt": 7.5,
    "asi_evt_det": 80
  },
  "requisitos": []
}
```
✅ Debe guardar en `detalle_eventos.not_min_evt` y `detalle_eventos.asi_evt_det`

### Caso 2: Evento con Carta de Motivación obligatoria
```json
{
  "detalles": {
    "not_min_evt": 0,
    "asi_evt_det": 0
  },
  "requisitos": [
    {
      "tip_req": "Carta de Motivación",
      "des_req": "Explicar motivación para participar",
      "obligatorio": true
    }
  ]
}
```
✅ Debe guardar en `requisitos_evento` con 1 fila

### Caso 3: Evento complejo
```json
{
  "detalles": {
    "not_min_evt": 6.0,
    "asi_evt_det": 75
  },
  "requisitos": [
    {
      "tip_req": "Carta de Motivación",
      "obligatorio": true
    },
    {
      "tip_req": "Diploma",
      "des_req": "Diploma de carrera universitaria",
      "obligatorio": false
    }
  ]
}
```
✅ Debe guardar en ambas tablas

## 🔍 VERIFICACIÓN EN BD

```sql
-- Ver detalles del evento
SELECT id_det, not_min_evt, asi_evt_det FROM detalle_eventos
WHERE id_evt_per = 'REG123456';

-- Ver requisitos del evento
SELECT id_req, tip_req, des_req, obligatorio FROM requisitos_evento
WHERE id_det = 'DET001';
```

## 🚀 IMPACTO EN OTROS MÓDULOS

- ✅ Inscripción: Leerá requisitos_evento para mostrar qué documentos se necesitan
- ✅ Validación: Responsable validará contra requisitos_evento
- ✅ Dashboard: Mostrará nota/asistencia desde detalle_eventos
- ✅ No afecta modelos existentes de inscripción/pagos

## ⚠️ IMPORTANTE

**NO modificar:**
- `requisitos_persona` (registros de validación por usuario)
- `requisitos_evento.obligatorio` existentes (mantener compatibilidad)
- Campos calculados en `detalle_eventos` como `cer_evt_det`, `apr_evt_det`

**Sí modificar:**
- Front: Separar lógica de requisitos
- Back: Guardar en tabla correcta según tipo
- DTO: Agregar campos faltantes
