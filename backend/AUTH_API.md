# 🔐 Sistema de Autenticación - API REST

## 🎓 Detección automática de tipo de usuario

El sistema detecta automáticamente el tipo de usuario basándose en el correo electrónico:

### **Correos institucionales (@uta.edu.ec):**

1. **Estudiante (`stu_usu = 1`):**
   - Correo termina en `@uta.edu.ec`
   - La parte antes del @ contiene **exactamente 4 dígitos consecutivos**
   - Ejemplos: `juan1234@uta.edu.ec`, `maria5678@uta.edu.ec`
   - **Requiere especificar nivel académico (`niv_usu`)**

2. **Administrador (`adm_usu = 1`):**
   - Correo termina en `@uta.edu.ec`
   - La parte antes del @ **NO contiene ningún número**
   - Ejemplos: `juan.perez@uta.edu.ec`, `maria.lopez@uta.edu.ec`

3. **Usuario sin rol institucional:**
   - Correo termina en `@uta.edu.ec`
   - Tiene números pero NO 4 consecutivos
   - Ejemplos: `juan12@uta.edu.ec`, `maria1@uta.edu.ec`

### **Correos externos (otros dominios):**
- No se asigna ningún rol institucional
- `stu_usu = 0` y `adm_usu = 0`
- Ejemplos: `usuario@gmail.com`, `test@hotmail.com`

---

## 📋 Endpoints disponibles

### 1️⃣ **POST** `/api/auth/register` - Registro de usuario

Crea un nuevo usuario en el sistema.

**Campos obligatorios:**
- `cor_usu` (string): Correo electrónico
- `pas_usu` (string): Contraseña (mínimo 6 caracteres)
- `nom_usu` (string): Nombre
- `ape_usu` (string): Apellido

**Campos opcionales:**
- `nom_seg_usu` (string): Segundo nombre
- `ape_seg_usu` (string): Segundo apellido
- `tel_usu` (string): Teléfono
- `ced_usu` (string): Cédula
- `niv_usu` (string): ID del nivel (si es estudiante)

**Request:**
```json
{
  "cor_usu": "juan@example.com",
  "pas_usu": "password123",
  "nom_usu": "Juan",
  "ape_usu": "Pérez",
  "tel_usu": "0999999999",
  "ced_usu": "1234567890",
  "niv_usu": "NIV001"
}
```

**Ejemplos por tipo de usuario:**

**Estudiante (requiere niv_usu):**
```json
{
  "cor_usu": "juan1234@uta.edu.ec",
  "pas_usu": "password123",
  "nom_usu": "Juan",
  "ape_usu": "Pérez",
  "niv_usu": "NIV001"
}
```

**Administrador:**
```json
{
  "cor_usu": "juan.perez@uta.edu.ec",
  "pas_usu": "password123",
  "nom_usu": "Juan",
  "ape_usu": "Pérez"
}
```

**Usuario externo:**
```json
{
  "cor_usu": "juan@gmail.com",
  "pas_usu": "password123",
  "nom_usu": "Juan",
  "ape_usu": "Pérez"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Estudiante registrado exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id_usu": 1,
      "cor_usu": "juan1234@uta.edu.ec",
      "nom_usu": "Juan",
      "ape_usu": "Pérez",
      "adm_usu": 0,
      "stu_usu": 1
    }
  }
}
```

---

### 2️⃣ **POST** `/api/auth/login` - Inicio de sesión

Autentica un usuario y devuelve un token JWT.

**Request:**
```json
{
  "cor_usu": "juan@example.com",
  "pas_usu": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id_usu": 1,
      "cor_usu": "juan@example.com",
      "nom_usu": "Juan",
      "ape_usu": "Pérez",
      "adm_usu": 0,
      "stu_usu": 1
    }
  }
}
```

---

### 3️⃣ **GET** `/api/auth/profile` - Obtener perfil

Obtiene la información completa del usuario autenticado (requiere token).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Perfil obtenido",
  "data": {
    "id_usu": 1,
    "cor_usu": "juan@example.com",
    "nom_usu": "Juan",
    "nom_seg_usu": null,
    "ape_usu": "Pérez",
    "ape_seg_usu": null,
    "tel_usu": "0999999999",
    "ced_usu": "1234567890",
    "img_usu": null,
    "stu_usu": 1,
    "adm_usu": 0,
    "niv_usu": "NIV001",
    "nivel": {
      "id_niv": "NIV001",
      "nom_niv": "PRIMERO",
      "org_cur_niv": "BASICA",
      "carreras": {
        "id_car": "CAR001",
        "nom_car": "Ingeniería en Software"
      }
    }
  }
}
```

---

## 🔒 Autenticación con JWT

Para acceder a rutas protegidas, debes incluir el token en el header:

```
Authorization: Bearer <tu_token_aqui>
```

El token se obtiene al hacer login o registro exitoso.

---

## 🚀 Probar los endpoints

### Con **Postman** o **Thunder Client**:

1. **Registrar usuario:**
   - Method: POST
   - URL: `http://localhost:3001/api/auth/register`
   - Body (JSON):
   ```json
   {
     "cor_usu": "test@example.com",
     "pas_usu": "password123",
     "nom_usu": "Test",
     "ape_usu": "User",
     "niv_usu": "NIV001"
   }
   ```

2. **Login:**
   - Method: POST
   - URL: `http://localhost:3001/api/auth/login`
   - Body (JSON):
   ```json
   {
     "cor_usu": "test@example.com",
     "pas_usu": "password123"
   }
   ```

3. **Ver perfil:**
   - Method: GET
   - URL: `http://localhost:3001/api/auth/profile`
   - Headers: `Authorization: Bearer <token>`

---

## 📁 Estructura de archivos creados

```
backend/src/
├── types/
│   └── auth.types.ts          # Interfaces TypeScript
├── utils/
│   ├── jwt.util.ts            # Generación y verificación de JWT
│   └── bcrypt.util.ts         # Hasheo de contraseñas
├── services/
│   └── auth.service.ts        # Lógica de negocio
├── controllers/
│   └── auth.controller.ts     # Controladores de endpoints
├── middlewares/
│   └── auth.middleware.ts     # Middleware de autenticación
└── routes/
    └── auth.routes.ts         # Definición de rutas
```

---

## ⚙️ Variables de entorno (.env)

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/Gestion-Eventos?schema=public"
PORT=3001
JWT_SECRET="tu_secreto_super_seguro_cambiar_en_produccion_123456"
JWT_EXPIRES_IN="7d"
```

---

## ✅ Sistema completo implementado:

- ✅ Registro de usuarios con validaciones
- ✅ Login con JWT
- ✅ Hasheo seguro de contraseñas con bcrypt
- ✅ Middleware de autenticación
- ✅ Endpoint de perfil protegido
- ✅ Validación de correo y contraseña
- ✅ Verificación de niveles existentes
- ✅ Detección automática de estudiantes
