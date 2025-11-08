# API de Autenticación y Eventos - Documentación

## Índice
1. [Jerarquía de Roles](#jerarquía-de-roles)
2. [Endpoints de Autenticación](#endpoints-de-autenticación)
3. [Endpoints de Eventos](#endpoints-de-eventos)
4. [Ejemplos de Uso](#ejemplos-de-uso)
5. [Códigos de Error](#códigos-de-error)

---

## Jerarquía de Roles

El sistema maneja 3 tipos de usuarios basados en su correo electrónico:

### 1. **Administrador del Sistema** (Superusuario)
- **Correos**: `admin@uta.edu.ec` o `administrador@uta.edu.ec`
- **Campo en BD**: `Administrador = true`
- **Permisos**: 
  - ✅ Crear eventos
  - ✅ Asignar responsables
  - ✅ Eliminar eventos
  - ✅ Ver todos los eventos

### 2. **Usuario Administrativo** (Profesor/Secretaría)
- **Correos**: `nombre@uta.edu.ec` (sin números en el nombre de usuario)
- **Campo en BD**: `adm_usu = 1`
- **Permisos**:
  - ✅ Ser asignado como responsable de eventos
  - ✅ Actualizar eventos donde es responsable
  - ✅ Ver eventos asignados
  - ❌ No puede crear eventos
  - ❌ No puede eliminar eventos

### 3. **Estudiante**
- **Correos**: `nombre1234@uta.edu.ec` (con 4 dígitos consecutivos)
- **Campo en BD**: `stu_usu = 1`
- **Permisos**:
  - ✅ Ver lista de eventos
  - ❌ No puede crear eventos
  - ❌ No puede actualizar eventos
  - ❌ No puede ser responsable

### 4. **Usuario Externo**
- **Correos**: Cualquier otro dominio (ej: `usuario@gmail.com`)
- **Permisos**:
  - ✅ Ver lista de eventos
  - ❌ No puede crear eventos
  - ❌ No puede actualizar eventos

---

## Endpoints de Autenticación

Base URL: `http://localhost:3000/api/auth`

### 1. Registro de Usuario

**POST** `/register`

Registra un nuevo usuario y automáticamente detecta su rol según su correo electrónico.

**Body:**
```json
{
  "cor_usu": "admin@uta.edu.ec",
  "pas_usu": "contraseña123",
  "nom_usu": "Juan",
  "ape_usu": "Pérez",
  "nom_seg_usu": "Carlos",      // Opcional
  "ape_seg_usu": "González",    // Opcional
  "tel_usu": "0987654321",      // Opcional
  "ced_usu": "1234567890",      // Opcional
  "niv_usu": "SEX"              // Opcional (solo para estudiantes)
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Administrador del sistema registrado exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id_usu": 1,
      "cor_usu": "admin@uta.edu.ec",
      "nom_usu": "Juan",
      "ape_usu": "Pérez",
      "adm_usu": 1,
      "stu_usu": 0,
      "Administrador": true
    }
  }
}
```

**Errores:**
- `400`: Datos faltantes o formato de correo inválido
- `400`: Correo ya registrado

---

### 2. Login

**POST** `/login`

Autentica un usuario y devuelve un token JWT.

**Body:**
```json
{
  "cor_usu": "admin@uta.edu.ec",
  "pas_usu": "contraseña123"
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
      "id_usu": 1,
      "cor_usu": "admin@uta.edu.ec",
      "nom_usu": "Juan",
      "ape_usu": "Pérez",
      "adm_usu": 1,
      "stu_usu": 0,
      "Administrador": true
    }
  }
}
```

**Errores:**
- `401`: Credenciales incorrectas
- `404`: Usuario no encontrado

---

### 3. Obtener Perfil

**GET** `/profile`

Obtiene la información del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Perfil obtenido",
  "data": {
    "id_usu": 1,
    "cor_usu": "admin@uta.edu.ec",
    "nom_usu": "Juan",
    "ape_usu": "Pérez",
    "tel_usu": "0987654321",
    "ced_usu": "1234567890",
    "adm_usu": 1,
    "stu_usu": 0,
    "Administrador": true,
    "nivel": null,
    "carrera": null
  }
}
```

---

## Endpoints de Eventos

Base URL: `http://localhost:3000/api/eventos`

### 1. Obtener Todos los Eventos

**GET** `/`

Lista todos los eventos disponibles (pública).

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Eventos obtenidos exitosamente",
  "data": [
    {
      "id_eve": 1,
      "nom_eve": "Conferencia de Tecnología",
      "des_eve": "Conferencia anual",
      "fec_ini_eve": "2024-06-15T09:00:00.000Z",
      "fec_fin_eve": "2024-06-15T17:00:00.000Z",
      "est_eve": "Planificado",
      "id_responsable": 2,
      "responsable": {
        "nom_usu": "María",
        "ape_usu": "López"
      }
    }
  ]
}
```

---

### 2. Obtener Evento por ID

**GET** `/:id`

Obtiene los detalles de un evento específico (pública).

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Evento obtenido exitosamente",
  "data": {
    "id_eve": 1,
    "nom_eve": "Conferencia de Tecnología",
    "des_eve": "Conferencia anual",
    "fec_ini_eve": "2024-06-15T09:00:00.000Z",
    "fec_fin_eve": "2024-06-15T17:00:00.000Z",
    "est_eve": "Planificado",
    "id_responsable": 2,
    "responsable": {
      "nom_usu": "María",
      "ape_usu": "López",
      "cor_usu": "maria@uta.edu.ec"
    }
  }
}
```

---

### 3. Crear Evento (Solo Administrador)

**POST** `/`

Crea un nuevo evento. **Solo usuarios con `Administrador = true`**.

**Headers:**
```
Authorization: Bearer <token_administrador>
```

**Body:**
```json
{
  "nom_eve": "Conferencia de Tecnología 2024",
  "des_eve": "Conferencia anual sobre tendencias tecnológicas",
  "fec_ini_eve": "2024-06-15T09:00:00.000Z",
  "fec_fin_eve": "2024-06-15T17:00:00.000Z",
  "est_eve": "Planificado",
  "id_responsable": 2  // ID de un usuario con adm_usu = 1
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Evento creado exitosamente",
  "data": {
    "id_eve": 1,
    "nom_eve": "Conferencia de Tecnología 2024",
    "des_eve": "Conferencia anual sobre tendencias tecnológicas",
    "fec_ini_eve": "2024-06-15T09:00:00.000Z",
    "fec_fin_eve": "2024-06-15T17:00:00.000Z",
    "est_eve": "Planificado",
    "id_responsable": 2
  }
}
```

**Errores:**
- `403`: Solo el administrador puede crear eventos
- `400`: El responsable no es un usuario administrativo

---

### 4. Asignar Responsable (Solo Administrador)

**PUT** `/:id/responsable`

Asigna o cambia el responsable de un evento. **Solo usuarios con `Administrador = true`**.

**Headers:**
```
Authorization: Bearer <token_administrador>
```

**Body:**
```json
{
  "id_responsable": 3  // ID de un usuario con adm_usu = 1
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Responsable asignado exitosamente",
  "data": {
    "id_eve": 1,
    "id_responsable": 3
  }
}
```

**Errores:**
- `403`: Solo el administrador puede asignar responsables
- `400`: El usuario no es administrativo (adm_usu ≠ 1)

---

### 5. Actualizar Evento (Solo Responsable Asignado)

**PUT** `/:id`

Actualiza un evento. **Solo el responsable asignado** puede actualizar.

**Headers:**
```
Authorization: Bearer <token_responsable>
```

**Body:**
```json
{
  "des_eve": "Descripción actualizada",
  "est_eve": "En Preparación"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Evento actualizado exitosamente",
  "data": {
    "id_eve": 1,
    "nom_eve": "Conferencia de Tecnología 2024",
    "des_eve": "Descripción actualizada",
    "est_eve": "En Preparación"
  }
}
```

**Errores:**
- `403`: Solo el responsable asignado puede actualizar el evento

---

### 6. Eliminar Evento (Solo Administrador)

**DELETE** `/:id`

Elimina un evento. **Solo usuarios con `Administrador = true`**.

**Headers:**
```
Authorization: Bearer <token_administrador>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Evento eliminado exitosamente"
}
```

**Errores:**
- `403`: Solo el administrador puede eliminar eventos

---

### 7. Obtener Usuarios Administrativos

**GET** `/usuarios/administrativos`

Lista todos los usuarios que pueden ser asignados como responsables (adm_usu = 1).

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Usuarios administrativos obtenidos",
  "data": [
    {
      "id_usu": 2,
      "nom_usu": "María",
      "ape_usu": "López",
      "cor_usu": "maria@uta.edu.ec",
      "adm_usu": 1
    },
    {
      "id_usu": 3,
      "nom_usu": "Pedro",
      "ape_usu": "Sánchez",
      "cor_usu": "pedro@uta.edu.ec",
      "adm_usu": 1
    }
  ]
}
```

---

### 8. Obtener Mis Eventos (Responsable)

**GET** `/mis-eventos`

Obtiene todos los eventos donde el usuario autenticado es responsable.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Eventos del responsable obtenidos",
  "data": [
    {
      "id_eve": 1,
      "nom_eve": "Conferencia de Tecnología",
      "des_eve": "Conferencia anual",
      "fec_ini_eve": "2024-06-15T09:00:00.000Z",
      "fec_fin_eve": "2024-06-15T17:00:00.000Z",
      "est_eve": "En Preparación"
    }
  ]
}
```

---

## Ejemplos de Uso

### Ejemplo 1: Flujo Completo de Administrador

```powershell
# 1. Registrar administrador
$adminData = @{
    cor_usu = "admin@uta.edu.ec"
    pas_usu = "admin123"
    nom_usu = "Admin"
    ape_usu = "Sistema"
} | ConvertTo-Json

$admin = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -Body $adminData -ContentType "application/json"
$token = $admin.data.token

# 2. Crear evento
$eventoData = @{
    nom_eve = "Conferencia 2024"
    des_eve = "Descripción"
    fec_ini_eve = "2024-06-15T09:00:00.000Z"
    fec_fin_eve = "2024-06-15T17:00:00.000Z"
    est_eve = "Planificado"
    id_responsable = 2
} | ConvertTo-Json

$headers = @{ "Authorization" = "Bearer $token" }
$evento = Invoke-RestMethod -Uri "http://localhost:3000/api/eventos" -Method Post -Body $eventoData -ContentType "application/json" -Headers $headers

Write-Host "Evento creado: $($evento.data.id_eve)"
```

### Ejemplo 2: Flujo de Profesor (Responsable)

```powershell
# 1. Registrar profesor
$profesorData = @{
    cor_usu = "profesor@uta.edu.ec"
    pas_usu = "profesor123"
    nom_usu = "Juan"
    ape_usu = "Pérez"
} | ConvertTo-Json

$profesor = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -Body $profesorData -ContentType "application/json"
$token = $profesor.data.token

# 2. Ver mis eventos asignados
$headers = @{ "Authorization" = "Bearer $token" }
$misEventos = Invoke-RestMethod -Uri "http://localhost:3000/api/eventos/mis-eventos" -Method Get -Headers $headers

# 3. Actualizar evento
$updateData = @{
    des_eve = "Descripción actualizada"
    est_eve = "En Preparación"
} | ConvertTo-Json

$eventoId = 1
Invoke-RestMethod -Uri "http://localhost:3000/api/eventos/$eventoId" -Method Put -Body $updateData -ContentType "application/json" -Headers $headers
```

---

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| `200` | Operación exitosa |
| `201` | Recurso creado exitosamente |
| `400` | Solicitud inválida (datos faltantes o incorrectos) |
| `401` | No autenticado (token inválido o faltante) |
| `403` | No autorizado (sin permisos suficientes) |
| `404` | Recurso no encontrado |
| `500` | Error interno del servidor |

### Ejemplos de Mensajes de Error

```json
{
  "success": false,
  "message": "Solo el administrador puede crear eventos"
}
```

```json
{
  "success": false,
  "message": "El responsable debe ser un usuario administrativo (profesor, secretaría)"
}
```

```json
{
  "success": false,
  "message": "Solo el responsable asignado puede actualizar este evento"
}
```

---

## Notas Importantes

1. **Tokens JWT**: Expiran en 7 días. Incluir en header `Authorization: Bearer <token>`.

2. **Detección Automática de Roles**: 
   - `admin@uta.edu.ec` → Administrador = true
   - `profesor@uta.edu.ec` → adm_usu = 1
   - `estudiante1234@uta.edu.ec` → stu_usu = 1

3. **Responsables**: Solo usuarios con `adm_usu = 1` pueden ser asignados como responsables.

4. **Permisos de Eventos**:
   - Crear/Eliminar: Solo `Administrador = true`
   - Asignar responsable: Solo `Administrador = true`
   - Actualizar: Solo el responsable asignado

5. **Formato de Fechas**: ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`)
