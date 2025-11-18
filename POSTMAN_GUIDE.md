# 📚 Guía Completa de Postman - Sistema de Gestión de Eventos

## ⚠️ IMPORTANTE: Política de Administradores

**Solo existe UN administrador en el sistema:**
- Email: `admin@admin.com`
- Este es el único usuario con `Administrador = true`
- **NO se permite crear nuevos administradores mediante registro**

**Tipos de usuarios que SÍ se pueden crear:**
- ✅ **Estudiantes** (`stu_usu = 1`): Correo con 4 dígitos → `jose1234@uta.edu.ec`
- ✅ **Administrativos** (`adm_usu = 1`): Correo sin números → `profesor@uta.edu.ec`
- ✅ **Externos**: Cualquier otro dominio → `usuario@gmail.com`

---

## 🔧 Configuración en Postman

### Variables de Entorno
Crea un Environment llamado "Gestion Eventos" con estas variables:

| Variable | Valor |
|----------|-------|
| `base_url` | `http://localhost:3000/api` |
| `admin_token` | *(se llenará automáticamente)* |
| `profesor_token` | *(se llenará automáticamente)* |
| `estudiante_token` | *(se llenará automáticamente)* |
| `profesor_id` | *(se llenará automáticamente)* |
| `evento_id` | *(se llenará automáticamente)* |

---

## 🔐 AUTENTICACIÓN

### 1. Login como Administrador (Usuario Existente)

**Endpoint:** `POST {{base_url}}/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "cor_usu": "admin@admin.com",
  "pas_usu": "tu_contraseña_admin"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id_usu": 6,
      "cor_usu": "admin@admin.com",
      "nom_usu": "Admin",
      "ape_usu": "User",
      "adm_usu": 1,
      "stu_usu": 0,
      "Administrador": true
    }
  }
}
```

**Script para Tests (Postman):**
```javascript
if (pm.response.code === 200) {
    pm.environment.set("admin_token", pm.response.json().data.token);
    console.log("✅ Admin token guardado");
}
```

---

### 2. Registrar Profesor (Usuario Administrativo)

**Endpoint:** `POST {{base_url}}/auth/register`

**Body (raw JSON):**
```json
{
  "cor_usu": "jperez@uta.edu.ec",
  "pas_usu": "profesor123",
  "nom_usu": "Juan",
  "ape_usu": "Pérez",
  "ced_usu": "1234567890",
  "tel_usu": "0987654321"
}
```

**✅ Detección automática:**
- Correo sin números + `@uta.edu.ec` → `adm_usu = 1`
- Puede ser responsable de eventos

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Usuario administrativo registrado exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id_usu": 7,
      "cor_usu": "jperez@uta.edu.ec",
      "nom_usu": "Juan",
      "ape_usu": "Pérez",
      "adm_usu": 1,
      "stu_usu": 0,
      "Administrador": false
    }
  }
}
```

**Script para Tests:**
```javascript
if (pm.response.code === 201) {
    pm.environment.set("profesor_token", pm.response.json().data.token);
    pm.environment.set("profesor_id", pm.response.json().data.usuario.id_usu);
    console.log("✅ Profesor registrado con ID:", pm.response.json().data.usuario.id_usu);
}
```

---

### 3. Registrar Estudiante

**Endpoint:** `POST {{base_url}}/auth/register`

**Body (raw JSON):**
```json
{
  "cor_usu": "mgarcia5678@uta.edu.ec",
  "pas_usu": "estudiante123",
  "nom_usu": "María",
  "ape_usu": "García",
  "ced_usu": "0987654321",
  "tel_usu": "0987654322",
  "niv_usu": "SEX"
}
```

**✅ Detección automática:**
- Correo con 4 dígitos consecutivos + `@uta.edu.ec` → `stu_usu = 1`

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Estudiante registrado exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id_usu": 8,
      "cor_usu": "mgarcia5678@uta.edu.ec",
      "nom_usu": "María",
      "ape_usu": "García",
      "adm_usu": 0,
      "stu_usu": 1,
      "Administrador": false
    }
  }
}
```

**Script para Tests:**
```javascript
if (pm.response.code === 201) {
    pm.environment.set("estudiante_token", pm.response.json().data.token);
    console.log("✅ Estudiante registrado");
}
```

---

### 4. ❌ Intento de Registrar Administrador (BLOQUEADO)

**Endpoint:** `POST {{base_url}}/auth/register`

**Body (raw JSON):**
```json
{
  "cor_usu": "admin@uta.edu.ec",
  "pas_usu": "intento123",
  "nom_usu": "Nuevo",
  "ape_usu": "Admin"
}
```

**Respuesta (400):**
```json
{
  "success": false,
  "message": "No se permite crear nuevos administradores. El administrador del sistema ya existe."
}
```

**✅ Correos bloqueados:**
- `admin@uta.edu.ec`
- `administrador@uta.edu.ec`
- `admin@admin.com`

---

## 📋 GESTIÓN DE EVENTOS

### 5. Crear Evento (Solo Admin)

**Endpoint:** `POST {{base_url}}/eventos`

**Headers:**
```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "nom_evt": "Conferencia IA 2024",
  "fec_evt": "2024-12-15",
  "lug_evt": "Auditorio Central",
  "des_evt": "Conferencia sobre Inteligencia Artificial y Machine Learning",
  "mod_evt": "Presencial",
  "tip_pub_evt": "Público",
  "cos_evt": "Gratuito",
  "id_responsable": {{profesor_id}}
}
```

**Campos:**
- `nom_evt`: Máximo 25 caracteres
- `fec_evt`: Formato `YYYY-MM-DD`
- `lug_evt`: Máximo 25 caracteres
- `des_evt`: Máximo 255 caracteres
- `mod_evt`: "Presencial", "Virtual", "Híbrido"
- `tip_pub_evt`: "Público", "Privado", "Restringido"
- `cos_evt`: "Gratuito", "Pagado"
- `id_responsable`: ID de un usuario con `adm_usu = 1` (profesor)

**Respuesta (201):**
```json
{
  "success": true,
  "message": "Evento creado exitosamente",
  "data": {
    "id_evt": "EVT456789",
    "nom_evt": "Conferencia IA 2024",
    "fec_evt": "2024-12-15T00:00:00.000Z",
    "lug_evt": "Auditorio Central",
    "mod_evt": "Presencial",
    "tip_pub_evt": "Público",
    "cos_evt": "Gratuito",
    "des_evt": "Conferencia sobre Inteligencia Artificial y Machine Learning",
    "id_res_evt": 7,
    "usuarios": {
      "id_usu": 7,
      "nom_usu": "Juan",
      "ape_usu": "Pérez",
      "cor_usu": "jperez@uta.edu.ec"
    }
  }
}
```

**Script para Tests:**
```javascript
if (pm.response.code === 201) {
    pm.environment.set("evento_id", pm.response.json().data.id_evt);
    console.log("✅ Evento creado con ID:", pm.response.json().data.id_evt);
}
```

---

### 6. Ver Todos los Eventos (Público)

**Endpoint:** `GET {{base_url}}/eventos`

**Headers:** *(No requiere autenticación)*

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Eventos obtenidos exitosamente",
  "data": [
    {
      "id_evt": "EVT456789",
      "nom_evt": "Conferencia IA 2024",
      "fec_evt": "2024-12-15T00:00:00.000Z",
      "lug_evt": "Auditorio Central",
      "mod_evt": "Presencial",
      "tip_pub_evt": "Público",
      "cos_evt": "Gratuito",
      "des_evt": "Conferencia sobre...",
      "id_res_evt": 7,
      "usuarios": {
        "id_usu": 7,
        "nom_usu": "Juan",
        "ape_usu": "Pérez"
      },
      "detalle_eventos": [],
      "tarifas_evento": []
    }
  ]
}
```

---

### 7. Ver Evento por ID (Público)

**Endpoint:** `GET {{base_url}}/eventos/{{evento_id}}`

**Ejemplo:** `GET {{base_url}}/eventos/EVT456789`

---

### 8. Listar Usuarios Administrativos (Requiere Auth)

**Endpoint:** `GET {{base_url}}/eventos/usuarios/administrativos`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Usuarios administrativos obtenidos",
  "data": [
    {
      "id_usu": 7,
      "nom_usu": "Juan",
      "ape_usu": "Pérez",
      "cor_usu": "jperez@uta.edu.ec",
      "adm_usu": 1
    },
    {
      "id_usu": 9,
      "nom_usu": "Ana",
      "ape_usu": "Martínez",
      "cor_usu": "amartinez@uta.edu.ec",
      "adm_usu": 1
    }
  ]
}
```

**✅ Uso:** Lista de profesores que pueden ser responsables de eventos

---

### 9. Asignar/Cambiar Responsable (Solo Admin)

**Endpoint:** `PUT {{base_url}}/eventos/{{evento_id}}/responsable`

**Headers:**
```
Authorization: Bearer {{admin_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "id_responsable": 9
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Responsable asignado exitosamente",
  "data": {
    "id_evt": "EVT456789",
    "id_res_evt": 9,
    "usuarios": {
      "id_usu": 9,
      "nom_usu": "Ana",
      "ape_usu": "Martínez",
      "cor_usu": "amartinez@uta.edu.ec"
    }
  }
}
```

---

### 10. Ver Mis Eventos Asignados (Responsable)

**Endpoint:** `GET {{base_url}}/eventos/mis-eventos`

**Headers:**
```
Authorization: Bearer {{profesor_token}}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Eventos del responsable obtenidos",
  "data": [
    {
      "id_evt": "EVT456789",
      "nom_evt": "Conferencia IA 2024",
      "fec_evt": "2024-12-15T00:00:00.000Z",
      "lug_evt": "Auditorio Central",
      "mod_evt": "Presencial",
      "tip_pub_evt": "Público",
      "cos_evt": "Gratuito",
      "des_evt": "Conferencia sobre...",
      "detalle_eventos": [],
      "tarifas_evento": []
    }
  ]
}
```

---

### 11. Actualizar Evento (Solo Responsable Asignado)

**Endpoint:** `PUT {{base_url}}/eventos/{{evento_id}}`

**Headers:**
```
Authorization: Bearer {{profesor_token}}
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "des_evt": "Descripción actualizada: Incluye talleres prácticos de Deep Learning",
  "lug_evt": "Auditorio + Sala de Labs",
  "mod_evt": "Híbrido"
}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Evento actualizado exitosamente",
  "data": {
    "id_evt": "EVT456789",
    "nom_evt": "Conferencia IA 2024",
    "fec_evt": "2024-12-15T00:00:00.000Z",
    "lug_evt": "Auditorio + Sala de Labs",
    "mod_evt": "Híbrido",
    "tip_pub_evt": "Público",
    "cos_evt": "Gratuito",
    "des_evt": "Descripción actualizada: Incluye talleres prácticos de Deep Learning",
    "id_res_evt": 7,
    "usuarios": {
      "id_usu": 7,
      "nom_usu": "Juan",
      "ape_usu": "Pérez",
      "cor_usu": "jperez@uta.edu.ec"
    }
  }
}
```

---

### 12. Eliminar Evento (Solo Admin)

**Endpoint:** `DELETE {{base_url}}/eventos/{{evento_id}}`

**Headers:**
```
Authorization: Bearer {{admin_token}}
```

**Respuesta (200):**
```json
{
  "success": true,
  "message": "Evento eliminado exitosamente"
}
```

---

## 📊 Matriz de Permisos

| Acción | Admin (Administrador=true) | Profesor (adm_usu=1) | Estudiante (stu_usu=1) | Externo |
|--------|----------------------------|----------------------|------------------------|---------|
| Registrarse | ❌ (Bloqueado) | ✅ | ✅ | ✅ |
| Login | ✅ (ya existe en BD) | ✅ | ✅ | ✅ |
| Ver eventos | ✅ | ✅ | ✅ | ✅ |
| Crear evento | ✅ | ❌ | ❌ | ❌ |
| Asignar responsable | ✅ | ❌ | ❌ | ❌ |
| Actualizar evento | ❌ | ✅ (solo asignados) | ❌ | ❌ |
| Eliminar evento | ✅ | ❌ | ❌ | ❌ |
| Ver mis eventos | ❌ | ✅ | ❌ | ❌ |

---

## 🎯 Flujo Completo Recomendado

### Flujo 1: Admin crea evento y asigna responsable

1. **Login Admin** → `POST /auth/login` → Guardar token
2. **Listar Administrativos** → `GET /eventos/usuarios/administrativos` → Ver profesores
3. **Crear Evento** → `POST /eventos` → Asignar responsable (profesor)
4. **Verificar Creación** → `GET /eventos/{id}` → Ver detalles

### Flujo 2: Profesor actualiza su evento asignado

1. **Login Profesor** → `POST /auth/login` → Guardar token
2. **Ver Mis Eventos** → `GET /eventos/mis-eventos` → Ver eventos asignados
3. **Actualizar Evento** → `PUT /eventos/{id}` → Editar detalles
4. **Verificar Cambios** → `GET /eventos/{id}` → Confirmar actualización

### Flujo 3: Estudiante consulta eventos

1. **Registrar Estudiante** → `POST /auth/register` → Correo con 4 dígitos
2. **Ver Eventos** → `GET /eventos` → Lista pública
3. **Ver Detalle** → `GET /eventos/{id}` → Información completa

---

## ⚠️ Mensajes de Error Comunes

### 400 - Bad Request
```json
{
  "success": false,
  "message": "No se permite crear nuevos administradores. El administrador del sistema ya existe."
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Token no válido o expirado"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "Solo el administrador puede crear eventos"
}
```

```json
{
  "success": false,
  "message": "Solo el responsable asignado puede editar los detalles del evento"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Evento no encontrado"
}
```

---

## 🔍 Notas Importantes

1. **Tokens JWT expiran en 7 días** - Incluir en header: `Authorization: Bearer <token>`

2. **Detección automática de roles por correo:**
   - `nombre1234@uta.edu.ec` → Estudiante
   - `nombre@uta.edu.ec` → Administrativo (profesor)
   - `usuario@gmail.com` → Externo

3. **Solo admin@admin.com puede:**
   - Crear eventos
   - Eliminar eventos
   - Asignar responsables

4. **Solo responsables asignados pueden:**
   - Actualizar eventos donde son responsables
   - Ver "mis eventos"

5. **Todos pueden:**
   - Ver lista de eventos
   - Ver detalles de un evento específico
