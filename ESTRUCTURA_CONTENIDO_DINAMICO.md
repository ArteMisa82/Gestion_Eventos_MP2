# 📋 Estructura de Contenido Dinámico

Este documento describe las tablas creadas para gestionar el contenido dinámico del sitio web desde el panel de administración.

## 🎯 Objetivo

Permitir que los administradores editen el contenido del sitio web (imágenes, textos, estadísticas, etc.) sin necesidad de modificar código.

---

## 📊 Tablas Creadas

### 1️⃣ **contenido_inicio**
Gestiona el contenido de la página de **Inicio**.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_inicio` | SERIAL (PK) | Identificador único |
| `img_hero` | TEXT | URL de la imagen principal (hero) |
| `fec_actualizacion` | TIMESTAMP | Última actualización (automático) |
| `activo` | BOOLEAN | Indica si este registro está activo |

**Relaciones:**
- Tiene muchas `estadisticas_inicio`

**Nota:** Solo debe haber UN registro con `activo = true`.

---

### 2️⃣ **estadisticas_inicio**
Almacena las estadísticas mostradas en la página de inicio (ej: "5,000+ Estudiantes activos").

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_estadistica` | SERIAL (PK) | Identificador único |
| `id_inicio` | INTEGER (FK) | Referencia a contenido_inicio |
| `valor` | VARCHAR(50) | Valor a mostrar (ej: "5,000+", "85%") |
| `etiqueta` | VARCHAR(100) | Descripción (ej: "Estudiantes activos") |
| `orden` | INTEGER | Orden de visualización (0, 1, 2, 3) |

**Ejemplo de datos:**
```sql
| id | id_inicio | valor   | etiqueta                   | orden |
|----|-----------|---------|----------------------------|-------|
| 1  | 1         | 5,000+  | Estudiantes activos        | 0     |
| 2  | 1         | 120+    | Eventos realizados         | 1     |
| 3  | 1         | 85%     | Nivel de satisfacción      | 2     |
| 4  | 1         | 40+     | Conferencistas invitados   | 3     |
```

---

### 3️⃣ **contenido_nosotros**
Gestiona el contenido de la página **Nosotros**.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_nosotros` | SERIAL (PK) | Identificador único |
| `img_banner` | TEXT | URL del banner superior |
| `mision` | TEXT | Texto de la misión institucional |
| `vision` | TEXT | Texto de la visión institucional |
| `fec_actualizacion` | TIMESTAMP | Última actualización (automático) |
| `activo` | BOOLEAN | Indica si este registro está activo |

**Nota:** Solo debe haber UN registro con `activo = true`.

**Para Autoridades:**
Las autoridades se gestionan con las tablas existentes `personas` y `autoridades`, pero se agregaron campos:
- `uni_aut` (VARCHAR(50)): Unidad/Dependencia (ej: "FISEI")
- `img_aut` (TEXT): URL de la foto
- `ord_aut` (INTEGER): Orden de visualización
- `act_aut` (BOOLEAN): Activo/Inactivo

---

### 4️⃣ **contenido_cursos**
Gestiona el contenido de la página **Cursos**.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_cursos` | SERIAL (PK) | Identificador único |
| `img_default` | TEXT | URL de imagen por defecto para cursos sin imagen |
| `descripcion` | TEXT | Descripción general de los cursos |
| `fec_actualizacion` | TIMESTAMP | Última actualización (automático) |
| `activo` | BOOLEAN | Indica si este registro está activo |

**Nota:** Solo debe haber UN registro con `activo = true`.

---

### 5️⃣ **contenido_contacto**
Gestiona el contenido de la página **Contacto**.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_contacto` | SERIAL (PK) | Identificador único |
| `img_banner` | TEXT | URL del banner superior |
| `titulo` | VARCHAR(100) | Título de la sección |
| `email` | VARCHAR(100) | Email de contacto principal |
| `telefono` | VARCHAR(20) | Teléfono de contacto (opcional) |
| `direccion` | TEXT | Dirección física (opcional) |
| `fec_actualizacion` | TIMESTAMP | Última actualización (automático) |
| `activo` | BOOLEAN | Indica si este registro está activo |

**Nota:** Solo debe haber UN registro con `activo = true`.

---

## 🔄 Flujo de Actualización

### Para Secciones Simples (Nosotros, Cursos, Contacto):
```sql
-- Obtener contenido actual
SELECT * FROM contenido_nosotros WHERE activo = true;

-- Actualizar contenido
UPDATE contenido_nosotros 
SET mision = 'Nueva misión...', 
    vision = 'Nueva visión...'
WHERE activo = true;
```

### Para Inicio (con estadísticas):
```sql
-- Actualizar imagen hero
UPDATE contenido_inicio 
SET img_hero = '/nueva-imagen.jpg'
WHERE activo = true;

-- Actualizar una estadística
UPDATE estadisticas_inicio 
SET valor = '6,000+', etiqueta = 'Estudiantes registrados'
WHERE id_estadistica = 1;

-- Agregar nueva estadística
INSERT INTO estadisticas_inicio (id_inicio, valor, etiqueta, orden)
VALUES (1, '50+', 'Convenios internacionales', 4);
```

### Para Autoridades:
```sql
-- Obtener autoridades activas ordenadas
SELECT p.nom_per, p.ape_per, a.car_aut, a.uni_aut, a.img_aut
FROM autoridades a
INNER JOIN personas p ON a.ced_per = p.ced_per
WHERE a.act_aut = true
ORDER BY a.ord_aut;

-- Actualizar imagen de una autoridad
UPDATE autoridades 
SET img_aut = '/autoridades/decano.jpg'
WHERE id_aut = 'AUT001';

-- Desactivar autoridad (cuando ya no está en el cargo)
UPDATE autoridades 
SET act_aut = false
WHERE id_aut = 'AUT001';
```

---

## 🚀 Pasos Siguientes

### 1. Ejecutar migración en PostgreSQL:
```bash
# Desde la carpeta del proyecto
psql -U postgres -d nombre_base_datos -f backend/prisma/migrations/add_contenido_dinamico.sql
```

### 2. Regenerar Prisma Client:
```bash
cd backend
npx prisma generate
```

### 3. Crear servicios backend:
- `contenido.service.ts`: CRUD para cada tabla
- `contenido.controller.ts`: Endpoints para el frontend
- `contenido.routes.ts`: Rutas API

### 4. Crear tipos TypeScript:
```typescript
// backend/src/types/contenido.types.ts
export interface ContenidoInicioDto {
  img_hero?: string;
}

export interface EstadisticaDto {
  valor: string;
  etiqueta: string;
  orden: number;
}

export interface ContenidoNosotrosDto {
  img_banner?: string;
  mision: string;
  vision: string;
}

export interface ContenidoCursosDto {
  img_default?: string;
  descripcion: string;
}

export interface ContenidoContactoDto {
  img_banner?: string;
  titulo: string;
  email: string;
  telefono?: string;
  direccion?: string;
}

export interface AutoridadDto {
  id_aut: string;
  ced_per: string;
  nom_per: string;
  ape_per: string;
  car_aut: string;
  uni_aut?: string;
  img_aut?: string;
  ord_aut: number;
  act_aut: boolean;
}
```

### 5. Conectar frontend:
- Crear métodos en `frontend/src/services/api.ts`
- Actualizar `EditorContenido.tsx` para usar datos reales del backend
- Reemplazar localStorage por llamadas API

---

## 📌 Notas Importantes

1. **Un solo registro activo:** Cada tabla de contenido debe tener solo UN registro con `activo = true`. Esto evita confusiones sobre qué contenido mostrar.

2. **Histórico:** El campo `activo` permite mantener histórico sin eliminar datos. Si quieres guardar versión anterior, marca `activo = false` y crea nuevo registro.

3. **Actualización automática:** El campo `fec_actualizacion` se actualiza automáticamente con el timestamp actual cada vez que modificas el registro.

4. **Estadísticas dinámicas:** Puedes tener cualquier cantidad de estadísticas en la página de inicio. Usa el campo `orden` para controlar su posición.

5. **Autoridades:** Se reutilizan las tablas existentes `personas` y `autoridades`. Solo se agregaron campos adicionales para imagen, unidad y orden de visualización.

6. **Validaciones:**
   - `email` debe ser válido
   - `telefono` debe tener formato correcto
   - URLs de imágenes deben ser accesibles
   - `orden` debe ser único por sección

---

## 🔗 Relaciones del Sistema

```
contenido_inicio (1) ←→ (N) estadisticas_inicio

personas (1) ←→ (1) autoridades
```

---

## ✅ Datos Iniciales Incluidos

La migración incluye datos iniciales para que el sistema funcione inmediatamente:
- ✅ 1 registro de contenido_inicio con imagen hero
- ✅ 4 estadísticas predeterminadas
- ✅ 1 registro de contenido_nosotros con misión/visión
- ✅ 1 registro de contenido_cursos con descripción
- ✅ 1 registro de contenido_contacto con datos de contacto

---

**Fecha de creación:** 11 de noviembre de 2025  
**Autor:** Sistema de Gestión de Eventos - FISEI UTA
