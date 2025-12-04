# Resumen de Cambios - Sesión de Desarrollo

**Fecha**: Noviembre 26 - Diciembre 4, 2025  
**Proyecto**: Gestión de Eventos MP2  
**Branch**: `feature/Cambios-Registro-Eventos` → `feature/categorias-Prueba`

---

## 1. Sistema de Tarifas para Eventos

### Problema
- Los eventos de pago no tenían tarifas registradas en la base de datos
- Al intentar realizar pagos, ocurrían errores por falta de tarifas (`Missing tariff`)
- No existía un endpoint para gestionar las tarifas de eventos

### Solución Implementada

#### Backend
**Archivos creados:**
- `backend/src/controllers/tarifas-evento.controller.ts`
  - Controlador para crear/actualizar tarifas
  - Endpoint: `POST /api/tarifas-evento`
  - Maneja tarifas para tipos: `ESTUDIANTE` y `PERSONA`

- `backend/src/routes/tarifas-evento.routes.ts`
  - Ruta protegida con autenticación
  - Integrada en el router principal

**Archivos modificados:**
- `backend/src/routes/index.ts`
  - Agregada ruta `/tarifas-evento`

#### Frontend
**Archivos modificados:**
- `frontend/src/services/api.ts`
  - Agregado servicio `tarifasAPI` con método `createOrUpdate`
  - Función para crear/actualizar tarifas de eventos

- `frontend/src/app/responsable/ModalEditar.tsx`
  - Importado `tarifasAPI`
  - Integrada llamada a API de tarifas después de actualizar evento
  - Actualiza tarifas para `ESTUDIANTE` y `PERSONA` automáticamente
  - Manejo de errores específico para tarifas

### Funcionalidad
Cuando un responsable edita un evento desde el modal:
1. Se actualiza el evento y sus detalles (PUT `/api/eventos/:id`)
2. Se actualizan las tarifas automáticamente (POST `/api/tarifas-evento` x2)
3. Se guarda en BD: `precioEstudiantes` y `precioGeneral`

---

## 2. Corrección de Errores de Pago

### Problema
```
ConnectorError: el nuevo registro para la relación «pagos» viola la restricción «check» «pagos_met_pag_check»
```
- La tabla `pagos` tiene restricción: `met_pag` solo acepta `'EFECTIVO'` o `'TARJETA'`
- El backend intentaba crear pagos con `met_pag` vacío

### Análisis Realizado
- Identificada la ubicación del flujo de pago en `frontend/src/app/cursos/inscripcion/[id]/page.tsx`
- Componente `ModalPago` maneja la selección de método de pago
- Funciones clave:
  - `handleInscripcionGratis`: POST a `/api/inscripciones`
  - `handlePagarCurso`: POST a `/api/inscripciones` 
  - `generarOrdenPago`: GET `/api/pagos/orden_pago/:numRegPer`
  - `subirComprobante`: POST `/api/pagos/subir-comprobante/:numRegPer`

### Recomendación Propuesta
**Opción A (recomendada)**: Mover la creación de inscripción al momento de confirmar método de pago
- El usuario elige método → confirma → se crea inscripción con `met_pag` válido
- Evita registros inválidos en BD

**Opción B**: Backend asigna `met_pag` por defecto (`EFECTIVO`)

---

## 3. Corrección de Errores Post-Merge

### Problema
```
TSError: Property 'niv_usu' does not exist on type 'usuarios'
```
- Después de un merge, el campo `niv_usu` fue eliminado del schema de Prisma
- `auth.service.ts` seguía referenciando este campo

### Solución
**Archivo modificado:**
- `backend/src/services/auth.service.ts`
  - Eliminadas todas las referencias a `niv_usu`
  - Interface `AuthResult` actualizada
  - Métodos actualizados: `identifyUser`, `register`, `getProfile`
  - Removido del `select` de Prisma

### Campos de rol mantenidos
- `adm_usu`: Usuario administrativo (0 o 1)
- `stu_usu`: Estudiante (0 o 1)
- `Administrador`: Super admin (boolean)

---

## 4. Configuración del Entorno de Desarrollo

### Problema
```
"nodemon" no se reconoce como un comando interno o externo
```

### Solución
**Archivo modificado:**
- `backend/package.json`
  - Script `dev` cambiado de `nodemon src/main.ts` a `ts-node-dev --respawn --transpile-only src/main.ts`
  - Utiliza `ts-node-dev` (ya en devDependencies)
  - Mejor soporte para TypeScript sin configuración adicional

### Comando actualizado
```powershell
npm run dev
```

---

## 5. Validación de Datos en Actualización de Eventos

### Mejoras Implementadas
**Archivo:** `frontend/src/app/responsable/ModalEditar.tsx`

- Validación de tipos TypeScript para evitar errores de `message` en objetos
- Manejo seguro de respuestas del servidor
- Verificación de existencia de propiedades antes de acceder
- Mensajes de error más descriptivos para el usuario

### Ejemplo de validación
```typescript
if (tarifaError && typeof tarifaError === 'object' && 'message' in tarifaError) {
  tarifaErrorMsg = tarifaError.message;
}
```

---

## 6. Estructura de JSON para Actualización de Eventos

### Formato validado para PUT `/api/eventos/:id`
```json
{
  "nom_evt": "Nombre del evento",
  "fec_evt": "2025-11-26",
  "fec_fin_evt": "2025-12-14",
  "lug_evt": "Ubicación",
  "des_evt": "Descripción",
  "mod_evt": "PRESENCIAL",
  "tip_pub_evt": "ESTUDIANTES",
  "cos_evt": "DE PAGO",
  "ima_evt": "/Default_Image.png",
  "detalles": {
    "cup_det": 30,
    "hor_det": 40,
    "are_det": "TECNOLOGIA E INGENIERIA",
    "cat_det": "CURSO",
    "tip_evt": "CURSO",
    "not_min_evt": 7,
    "asi_evt_det": 50,
    "instructores": [
      { "id_usu": 7, "rol_instructor": "INSTRUCTOR" }
    ]
  },
  "carreras": ["CAR001"],
  "semestres": ["PRIMERO"],
  "precioEstudiantes": 50,
  "precioGeneral": 100,
  "cartaMotivacion": true,
  "requiereAsistencia": true
}
```

### Flujo de actualización
1. PUT a `/api/eventos/:id` con todos los datos
2. POST a `/api/tarifas-evento` para tarifa estudiantes
3. POST a `/api/tarifas-evento` para tarifa general

---

## Archivos Principales Modificados

### Backend
- ✅ `src/controllers/tarifas-evento.controller.ts` (nuevo)
- ✅ `src/routes/tarifas-evento.routes.ts` (nuevo)
- ✅ `src/routes/index.ts`
- ✅ `src/services/auth.service.ts`
- ✅ `package.json`

### Frontend
- ✅ `src/services/api.ts`
- ✅ `src/app/responsable/ModalEditar.tsx`

---

## Puntos Pendientes

### Alta prioridad
- [ ] Implementar solución para error de `met_pag` vacío en pagos
- [ ] Validar flujo completo de inscripción → pago → comprobante

### Media prioridad
- [ ] Agregar tests para el endpoint de tarifas
- [ ] Documentar API de tarifas en Swagger

### Baja prioridad
- [ ] Considerar unificar actualización de evento y tarifas en una sola petición
- [ ] Optimizar manejo de errores en modal de edición

---

## Comandos Útiles

### Backend
```powershell
cd backend
npm install
npm run dev
```

### Frontend
```powershell
cd frontend
npm install
npm run dev
```

### Postman - Ejemplos de Peticiones

**Actualizar Tarifa:**
```http
POST http://localhost:3001/api/tarifas-evento
Content-Type: application/json
Authorization: Bearer <token>

{
  "id_evt": "EVT009377",
  "tip_par": "ESTUDIANTE",
  "val_evt": 50
}
```

**Actualizar Evento:**
```http
PUT http://localhost:3001/api/eventos/EVT009377
Content-Type: application/json
Authorization: Bearer <token>

{...json del evento...}
```

---

## Notas Técnicas

### Restricciones de Base de Datos
- `pagos.met_pag`: Solo acepta `'EFECTIVO'` o `'TARJETA'`
- `pagos.pag_o_no`: Solo acepta 0 o 1
- `tarifas_evento.tip_par`: Solo acepta `'ESTUDIANTE'` o `'PERSONA'`

### Tipos de Eventos Válidos
- CURSO
- CONGRESO
- WEBINAR
- CONFERENCIAS
- SOCIALIZACIONES
- CASAS ABIERTAS
- SEMINARIOS
- OTROS

### Estados de Eventos
- EDITANDO
- PLANIFICADO
- EN CURSO
- FINALIZADO
- CANCELADO

---

## 7. Validación de Evento Completo Antes de Publicar

### Problema
- Los eventos podían ser publicados sin tener todos los datos requeridos
- Faltaban validaciones para garantizar completitud de eventos

### Solución Implementada
**Archivo:** `backend/src/services/eventos.service.ts`

#### Nuevo método: `validarEventoCompleto()`
Valida que el evento tenga:
- ✅ Al menos un detalle configurado
- ✅ Al menos un instructor asignado
- ✅ Si es "DE PAGO", debe tener tarifas configuradas
- ✅ Campos básicos completos: nombre, descripción, fecha, ubicación

#### Modificación en `actualizarEvento()`
```typescript
// Validar si se intenta publicar el evento
if (data.est_evt && data.est_evt.toUpperCase() === 'PUBLICADO') {
  const validacion = await this.validarEventoCompleto(idEvento);
  
  if (!validacion.valido) {
    throw new Error(
      `No se puede publicar el evento. Faltan los siguientes requisitos:\n${validacion.errores.join('\n')}`
    );
  }
}
```

### Funcionalidad
El backend ahora rechaza cambios de estado a "PUBLICADO" si el evento está incompleto, mostrando lista detallada de lo que falta.

---

## 8. Ocultar Selector de Nivel para No Estudiantes

### Problema
- El selector de nivel académico aparecía para todos los usuarios
- Solo es relevante para estudiantes (`stu_usu === 1`)

### Solución Implementada
**Archivo:** `frontend/src/components/perfil/InfoPersonal.tsx`

```tsx
{/* Nivel (Carrera + Semestre) - Solo para estudiantes */}
{userData.stu_usu === 1 && (
  <select name="niv_usu" ...>
    {/* opciones */}
  </select>
)}
```

### Funcionalidad
El combo de nivel académico solo se muestra a usuarios con `stu_usu === 1`.

---

## 9. Sistema de Subida de Comprobante de Pago

### Problema
- No había forma de subir comprobantes de pago desde el flujo de inscripción
- El usuario debía ir a "Mis Cursos" después

### Solución Implementada
**Archivo:** `frontend/src/app/cursos/[id]/CourseDetailClient.tsx`

#### Funcionalidades Agregadas
1. **Input de archivo en modal de pago**
   - Acepta: PDF, JPG, JPEG, PNG
   - Validación de tamaño: máximo 5MB
   - Validación de tipo MIME

2. **Upload endpoint integrado**
   ```typescript
   POST http://localhost:3001/api/pagos/subir-comprobante/${numRegPer}
   ```

3. **Flujo completo**
   - Usuario se inscribe → elige método depósito/transferencia
   - Puede subir comprobante inmediatamente o después
   - Sistema valida archivo antes de enviar
   - Mensaje de confirmación al subir exitosamente

### Código agregado
```typescript
const formData = new FormData();
formData.append('comprobante', file);

const response = await fetch(
  `http://localhost:3001/api/pagos/subir-comprobante/${numRegPer}`,
  {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${authToken}` },
    body: formData
  }
);
```

---

## 10. Corrección de Guardado de Foto de Perfil

### Problema
- La foto de perfil usaba ruta relativa `/api/user/id/...` (Next.js API route inexistente)
- No incluía token de autorización
- No actualizaba localStorage después de guardar

### Solución Implementada
**Archivo:** `frontend/src/components/perfil/FotoPerfil.tsx`

#### Cambios Realizados
1. **URL correcta al backend**
   ```typescript
   await fetch(`http://localhost:3001/api/user/id/${usuario.id_usu}`, ...)
   ```

2. **Token de autorización**
   ```typescript
   headers: { 
     "Content-Type": "application/json",
     "Authorization": `Bearer ${token}`
   }
   ```

3. **Actualización de localStorage**
   ```typescript
   const userData = localStorage.getItem('user');
   if (userData) {
     const parsed = JSON.parse(userData);
     parsed.img_usu = base64;
     localStorage.setItem('user', JSON.stringify(parsed));
   }
   ```

4. **Manejo de errores**
   - Validación de sesión activa
   - Alertas de éxito/error
   - Solo actualiza estado si la subida fue exitosa

---

## 11. Filtrado de Cursos por Tipo de Público

### Verificación Realizada
**Sistema ya implementado correctamente**

#### Backend
**Archivo:** `backend/src/services/eventos.service.ts`
- Método `obtenerEventosPublicados()` con filtros:
  - `mod_evt`: PRESENCIAL, VIRTUAL, A DISTANCIA
  - `tip_pub_evt`: GENERAL, ESTUDIANTES, ADMINISTRATIVOS ✅
  - `cos_evt`: GRATUITO, DE PAGO
  - `busqueda`: búsqueda por nombre/descripción

#### Frontend
**Archivo:** `frontend/src/app/cursos/page.tsx`
- Estado `selectedPublico` controla filtro
- Se envía al backend como query parameter
- El backend filtra usando Prisma `where` clause

### Funcionalidad
Los usuarios pueden filtrar cursos por tipo de público desde la UI, y el sistema retorna solo eventos que coincidan con los criterios.

---

## 12. Auto-refresh de Vistas Después de Acciones

### Verificación Realizada
**Sistema ya implementado correctamente**

#### Patrón Utilizado
```typescript
// Después de cualquier acción exitosa:
router.push("/usuarios/cursos");  // O la ruta correspondiente
```

#### Archivos que implementan este patrón
- `CourseDetailClient.tsx`: Redirige después de inscripción
- `InfoPersonal.tsx`: Actualiza datos en servidor
- Modales de edición: Recargan lista después de guardar

### Funcionalidad
El sistema usa el enrutador de Next.js (`router.push()`) que automáticamente:
1. Navega a la nueva ruta
2. Desmonta el componente anterior
3. Monta el nuevo componente
4. Ejecuta `useEffect` que carga datos frescos del servidor

---

## 13. Corrección de Redirección Post-Login

### Problema
- Todos los usuarios no-estudiantes iban a `/home`
- Responsables/instructores necesitan ir a `/responsable`

### Solución Implementada
**Archivo:** `frontend/src/components/loginModal.tsx`

#### Lógica de Redirección Actualizada
```typescript
if (usuario.adm_usu === 1 || usuario.Administrador === true) {
  // Administradores van a /admin
  mensaje = `Bienvenido ${usuario.nom_usu} 👑`;
  ruta = "/admin";
} else if (usuario.stu_usu === 1) {
  // Estudiantes van a /cursos
  mensaje = `Bienvenido ${usuario.nom_usu} 🎓`;
  ruta = "/cursos";
} else {
  // Usuarios regulares (responsables/instructores) van a /responsable
  mensaje = `Bienvenido ${usuario.nom_usu}`;
  ruta = "/responsable";
}
```

### Funcionalidad
- **Administradores** → `/admin`
- **Estudiantes** → `/cursos`
- **Responsables/Instructores** → `/responsable`
- **Otros** → `/responsable`

---

## 14. Control de Acceso a Rutas Admin/Responsable

### Problema
- Las rutas `/admin` y `/responsable` eran accesibles sin validación de rol
- Usuarios no autorizados podían ingresar directamente por URL

### Solución Implementada

#### Archivo: `frontend/src/app/admin/page.tsx`
```typescript
const { user, isAuthenticated, isLoading } = useAuth();

// Proteger la ruta - solo administradores
useEffect(() => {
  if (!isLoading && (!isAuthenticated || !user || 
      (user.adm_usu !== 1 && !user.Administrador))) {
    router.push("/");
  }
}, [isLoading, isAuthenticated, user, router]);
```

#### Archivo: `frontend/src/app/responsable/page.tsx`
```typescript
const { user, isAuthenticated, isLoading: authLoading } = useAuth();

// Proteger la ruta - solo usuarios autenticados que NO sean estudiantes
useEffect(() => {
  if (!authLoading && (!isAuthenticated || !user || user.stu_usu === 1)) {
    router.push("/");
  }
}, [authLoading, isAuthenticated, user, router]);
```

### Funcionalidad
- **`/admin`**: Solo administradores (`adm_usu === 1` o `Administrador === true`)
- **`/responsable`**: Usuarios autenticados excepto estudiantes
- Redirección automática a `/` si no cumplen requisitos

---

## 15. Validación de Longitud de Correo

### Problema
- Los inputs de email no tenían límite de caracteres
- La base de datos acepta máximo 100 caracteres (`VARCHAR(100)`)
- Posible error de truncado o rechazo de registro

### Solución Implementada

#### Archivos Modificados
1. **`frontend/src/app/login/registroForm.tsx`**
   ```tsx
   <input
     type="email"
     maxLength={100}
     ...
   />
   ```

2. **`frontend/src/components/loginModal.tsx`**
   ```tsx
   <input
     type="email"
     maxLength={100}
     ...
   />
   ```

### Funcionalidad
Los inputs de correo ahora limitan la entrada a 100 caracteres, coincidiendo con el límite de la base de datos.

---

## 16. Validación de Correo Institucional (UTA)

### Problema
- No había validación estricta de formato de correos @uta.edu.ec
- Se aceptaban correos con cualquier cantidad de dígitos

### Nuevas Reglas Implementadas
**Archivo:** `backend/src/services/auth.service.ts` → método `determinarRolPorEmail()`

#### 1. Correos Externos (gmail, hotmail, etc.)
```typescript
// Ejemplo: juan@gmail.com, maria@outlook.com
stu_usu: 0 (null)
adm_usu: 0 (null)
Administrador: false
```

#### 2. Correos @uta.edu.ec SIN números
```typescript
// Ejemplo: maria.lopez@uta.edu.ec, juan.perez@uta.edu.ec
stu_usu: 0
adm_usu: 1 ✅ (Administrativo)
Administrador: false
```

#### 3. Correos @uta.edu.ec con números DIFERENTES de 4
```typescript
// Ejemplo: vero123@uta.edu.ec (3 dígitos)
// Error: "Correo institucional inválido. Los correos de estudiantes 
//         deben tener exactamente 4 dígitos antes de @uta.edu.ec"
```

#### 4. Correos @uta.edu.ec con EXACTAMENTE 4 dígitos
```typescript
// Ejemplo: vero1234@uta.edu.ec, juan5678@uta.edu.ec
stu_usu: 1 ✅ (Estudiante)
adm_usu: 0
Administrador: false
```

#### 5. Correo Especial admin@admin.com
```typescript
stu_usu: 0
adm_usu: 0
Administrador: true ✅ (Super Admin)
```

### Código de Validación
```typescript
if (emailLower.endsWith('@uta.edu.ec')) {
  const usuarioPart = emailLower.split('@')[0];
  
  // Contar cuántos dígitos tiene
  const digitosMatch = usuarioPart.match(/\d/g);
  const cantidadDigitos = digitosMatch ? digitosMatch.length : 0;
  
  if (cantidadDigitos === 0) {
    // Sin números => ADMINISTRATIVO
    return { esAdministrativo: true, ... };
  } else if (cantidadDigitos === 4) {
    // Exactamente 4 números => ESTUDIANTE
    return { esEstudiante: true, ... };
  } else {
    // Cantidad diferente de 4 => ERROR
    return { error: "mensaje de error...", ... };
  }
}
```

### Funcionalidad
El backend ahora rechaza registros con correos @uta.edu.ec que tengan una cantidad incorrecta de dígitos, asegurando que:
- Estudiantes tengan exactamente 4 dígitos en su correo
- Administrativos no tengan dígitos
- Usuarios externos se registren con cualquier otro dominio

---

## Base de Datos - Cambios y Estructura

### Tablas Principales Afectadas

#### 1. `usuarios`
```sql
id_usu: INT (PK)
cor_usu: VARCHAR(100) UNIQUE ✅ maxLength validado
pas_usu: VARCHAR(255)
nom_usu: VARCHAR(50)
ape_usu: VARCHAR(50)
tel_usu: VARCHAR(10)
img_usu: TEXT ✅ base64 de foto de perfil
stu_usu: SMALLINT ✅ 0 o 1
adm_usu: SMALLINT ✅ 0 o 1
Administrador: BOOLEAN ✅ super admin
```

#### 2. `eventos`
```sql
id_evt: VARCHAR(10) (PK)
nom_evt: VARCHAR(25)
fec_evt: DATE
lug_evt: VARCHAR(25)
mod_evt: VARCHAR(15)
tip_pub_evt: VARCHAR(20) ✅ GENERAL, ESTUDIANTES, ADMINISTRATIVOS
cos_evt: VARCHAR(15) ✅ GRATUITO, DE PAGO
des_evt: VARCHAR(255)
est_evt: VARCHAR(20) ✅ EDITANDO, PUBLICADO, etc.
id_res_evt: INT (FK → usuarios)
```

#### 3. `tarifas_evento` ✅ Nueva funcionalidad
```sql
id_tar_evt: INT (PK)
id_evt: VARCHAR(10) (FK → eventos)
tip_par: VARCHAR(10) ✅ ESTUDIANTE, PERSONA
val_evt: DECIMAL(10,2) ✅ precio del evento
```

#### 4. `detalle_eventos`
```sql
id_det: VARCHAR(10) (PK)
id_evt_per: VARCHAR(10) (FK → eventos)
cup_det: INT ✅ cupos
hor_det: DECIMAL(4,2) ✅ horas
are_det: VARCHAR(40)
cat_det: VARCHAR(20) ✅ CURSO, CONGRESO, etc.
est_evt_det: VARCHAR(20) ✅ INSCRIPCIONES, EN CURSO, etc.
```

#### 5. `detalle_instructores` ✅ Validado en publicación
```sql
id_det: VARCHAR(10) (FK → detalle_eventos)
id_usu: INT (FK → usuarios)
rol_instructor: VARCHAR(30)
fec_asignacion: TIMESTAMP
```

#### 6. `pagos`
```sql
num_pag: INT (PK)
num_reg_per: INT (FK → registro_personas)
val_pag: DECIMAL(5,2)
met_pag: VARCHAR(15) ✅ CHECK: EFECTIVO o TARJETA
pdf_comp_pag: TEXT ✅ ruta del comprobante subido
pag_o_no: SMALLINT ✅ CHECK: 0 o 1
```

#### 7. `estudiantes`
```sql
id_est: INT (PK)
id_usu: INT (FK → usuarios)
id_niv: VARCHAR(10) (FK → nivel)
fec_ingreso: DATE
est_activo: INT
```

### Restricciones de BD Validadas
```sql
✅ pagos.met_pag: Solo 'EFECTIVO' o 'TARJETA'
✅ pagos.pag_o_no: Solo 0 o 1
✅ tarifas_evento.tip_par: Solo 'ESTUDIANTE' o 'PERSONA'
✅ usuarios.cor_usu: UNIQUE, máximo 100 caracteres
```

---

## Resumen Ejecutivo de Cambios

### Backend (11 archivos modificados/creados)
1. ✅ `src/controllers/tarifas-evento.controller.ts` (nuevo)
2. ✅ `src/routes/tarifas-evento.routes.ts` (nuevo)
3. ✅ `src/routes/index.ts`
4. ✅ `src/services/auth.service.ts` (múltiples cambios)
5. ✅ `src/services/eventos.service.ts` (validación de publicación)
6. ✅ `src/controllers/user.controller.ts` (manejo de nivel)
7. ✅ `src/services/user.service.ts` (relación estudiantes)
8. ✅ `src/services/inscripciones.service.ts` (INSCRIPCION_INCLUDES)
9. ✅ `package.json` (script dev actualizado)

### Frontend (9 archivos modificados)
1. ✅ `src/services/api.ts` (tarifasAPI)
2. ✅ `src/app/responsable/ModalEditar.tsx` (tarifas automáticas)
3. ✅ `src/app/responsable/page.tsx` (protección de ruta)
4. ✅ `src/app/admin/page.tsx` (protección de ruta)
5. ✅ `src/components/perfil/InfoPersonal.tsx` (nivel condicional)
6. ✅ `src/components/perfil/FotoPerfil.tsx` (upload corregido)
7. ✅ `src/app/cursos/[id]/CourseDetailClient.tsx` (comprobante upload)
8. ✅ `src/components/loginModal.tsx` (redirección y maxLength)
9. ✅ `src/app/login/registroForm.tsx` (maxLength email)
10. ✅ `src/hooks/useAuth.tsx` (carga completa de datos)

### Validaciones Nuevas Implementadas
- ✅ Evento completo antes de publicar (detalles, instructores, tarifas)
- ✅ Correo institucional con exactamente 4 dígitos para estudiantes
- ✅ Correo máximo 100 caracteres
- ✅ Archivo de comprobante: tipo y tamaño

### Flujos Corregidos/Mejorados
- ✅ Inscripción → Pago → Subida de comprobante
- ✅ Edición de evento → Actualización de tarifas automática
- ✅ Login → Redirección según rol
- ✅ Protección de rutas por rol de usuario
- ✅ Guardado de foto de perfil con persistencia

---

## Comandos de Testing Actualizados

### Verificar validación de correos
```powershell
# Backend debe estar corriendo
cd backend
npm run dev

# Probar registro con diferentes correos:
# 1. juan@gmail.com → stu_usu: 0, adm_usu: 0
# 2. maria.lopez@uta.edu.ec → stu_usu: 0, adm_usu: 1
# 3. vero123@uta.edu.ec → ERROR (solo 3 dígitos)
# 4. juan1234@uta.edu.ec → stu_usu: 1, adm_usu: 0
```

### Verificar protección de rutas
```powershell
# Frontend corriendo
cd frontend
npm run dev

# Probar acceso directo a:
# http://localhost:3000/admin → Solo admins
# http://localhost:3000/responsable → No estudiantes
```

### Verificar subida de comprobante
```powershell
# Flujo completo:
# 1. Inscribirse en evento de pago
# 2. Elegir depósito/transferencia
# 3. Subir archivo PDF/JPG/PNG (máx 5MB)
# 4. Verificar en BD: pagos.pdf_comp_pag
```

---

**Fin del resumen de cambios - Sesión completa documentada**
