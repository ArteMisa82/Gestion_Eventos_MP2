# 🚀 Resumen de Integración Frontend-Backend

## ✅ Archivos Creados

```
📦 Proyecto
├── 📁 frontend/
│   ├── .env.local                          ✅ Variables de entorno
│   └── src/
│       ├── services/
│       │   └── api.ts                      ✅ Servicio API centralizado (600+ líneas)
│       ├── types/
│       │   └── api.types.ts                ✅ Tipos TypeScript (200+ líneas)
│       └── hooks/
│           └── useAuth.tsx                 ✅ Hook de autenticación
│
├── 📁 backend/                             ✅ Ya desarrollado
│   ├── src/
│   │   ├── controllers/                    ✅ 8 controladores
│   │   ├── services/                       ✅ 10 servicios
│   │   ├── routes/                         ✅ 8 módulos de rutas
│   │   └── types/                          ✅ Tipos y constantes
│   └── prisma/
│       └── schema.prisma                   ✅ Schema actualizado
│
└── 📄 Documentación
    ├── GUIA_INTEGRACION_FRONTEND.md        ✅ Guía completa
    ├── EJEMPLO_LOGIN_INTEGRADO.tsx         ✅ Ejemplo práctico
    └── MIGRACION_TIP_PUB_EVT.md           ✅ Migración BD
```

---

## 🎯 Componentes Frontend a Actualizar

### **1. Login Modal** (`components/loginModal.tsx`)

**Estado actual:** Mock hardcodeado
**Necesita:**
- ✅ Importar `authAPI` desde `@/services/api`
- ✅ Reemplazar validación hardcodeada
- ✅ Guardar token en localStorage
- ✅ Redirigir según rol del usuario

**Cambio principal:**
```typescript
// ❌ ANTES (Mock)
if (email === "admin@admin.uta.edu.ec" && password === "admin123") {
  router.push("/admin");
}

// ✅ DESPUÉS (Backend real)
const response = await authAPI.login(email, password);
localStorage.setItem('token', response.token);
if (response.usuario.adm_usu === 1) router.push("/admin");
```

---

### **2. Admin Dashboard** (`app/admin/page.tsx`)

**Estado actual:** Array estático de eventos
**Necesita:**
- ✅ Usar `eventosAPI.getAll()`
- ✅ Implementar filtros reales
- ✅ Conectar búsqueda con backend
- ✅ Manejar estados (INSCRIPCIONES, EN_CURSO, FINALIZADO)

**Cambio principal:**
```typescript
// ❌ ANTES
const [eventos] = useState([
  { id_evt: "EVT001", nom_evt: "..." }
]);

// ✅ DESPUÉS
useEffect(() => {
  const cargarEventos = async () => {
    const token = localStorage.getItem('token');
    const data = await eventosAPI.getAll(token, { estado: filtro });
    setEventos(data);
  };
  cargarEventos();
}, [filtro]);
```

---

### **3. Dashboard Responsable** (`app/responsable/page.tsx`)

**Estado actual:** Mock de 2 eventos
**Necesita:**
- ✅ Usar `eventosAPI.getByResponsable()`
- ✅ Obtener ID del usuario desde localStorage
- ✅ Implementar actualización de eventos

**Cambio principal:**
```typescript
// ❌ ANTES
const mockEventos = [...]

// ✅ DESPUÉS
const user = JSON.parse(localStorage.getItem('user'));
const data = await eventosAPI.getByResponsable(token, user.id_usu);
```

---

### **4. Navbar** (`components/Navbar.tsx`)

**Necesita:**
- ✅ Leer usuario desde localStorage
- ✅ Mostrar nombre del usuario logueado
- ✅ Botón de logout que limpie localStorage
- ✅ Mostrar opciones según rol

**Ejemplo:**
```typescript
const [user, setUser] = useState(null);

useEffect(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) setUser(JSON.parse(storedUser));
}, []);

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/');
};
```

---

## 🔧 Configuración Necesaria

### **1. Variables de Entorno**

Crear archivo `.env.local` en `/frontend`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### **2. Iniciar Ambos Servidores**

```bash
# Terminal 1 - Backend
cd backend
npm run dev
# ✅ http://localhost:3001

# Terminal 2 - Frontend  
cd frontend
npm run dev
# ✅ http://localhost:3000
```

---

## 📊 Mapeo de Endpoints Backend → Frontend

### **Autenticación**

| Acción | Endpoint | Método | Frontend |
|--------|----------|--------|----------|
| Login | `/api/auth/login` | POST | `loginModal.tsx` |
| Registro | `/api/auth/registro` | POST | `registroForm.tsx` |

### **Eventos (Admin)**

| Acción | Endpoint | Método | Frontend |
|--------|----------|--------|----------|
| Listar todos | `/api/eventos` | GET | `admin/page.tsx` |
| Ver uno | `/api/eventos/:id` | GET | Modales de edición |
| Crear | `/api/eventos` | POST | Formulario crear |
| Actualizar | `/api/eventos/:id` | PUT | Modal editar |
| Eliminar | `/api/eventos/:id` | DELETE | Botón eliminar |

### **Eventos (Responsable)**

| Acción | Endpoint | Método | Frontend |
|--------|----------|--------|----------|
| Mis eventos | `/api/eventos/responsable/:id` | GET | `responsable/page.tsx` |
| Actualizar | `/api/eventos/:id` | PUT | `ModalEditar.tsx` |

### **Cursos (Estudiantes)**

| Acción | Endpoint | Método | Frontend |
|--------|----------|--------|----------|
| Ver cursos disponibles | `/api/registro-evento/estudiante/:id` | GET | `cursos/page.tsx` |
| Inscribirse | `/api/inscripciones` | POST | Botón inscribir |
| Mis inscripciones | `/api/inscripciones/usuario/:id` | GET | `mis-cursos/page.tsx` |

---

## 🎨 Nuevos Valores de `tip_pub_evt`

**⚠️ IMPORTANTE:** La BD fue actualizada con nuevos valores:

| Valor Antiguo | Valor Nuevo | Significado |
|--------------|-------------|-------------|
| `USUARIOS UTA` | ❌ ELIMINADO | - |
| `GENERAL` | ✅ `GENERAL` | Todos pueden inscribirse |
| - | ✅ `ESTUDIANTES` | Solo estudiantes activos |
| - | ✅ `ADMINISTRATIVOS` | Solo personal admin |

**Actualizar en componentes:**
```typescript
// ❌ ANTES
tip_pub_evt: "USUARIOS UTA"

// ✅ DESPUÉS
tip_pub_evt: "ESTUDIANTES" | "ADMINISTRATIVOS" | "GENERAL"
```

---

## 🧪 Checklist de Testing

### **Probar Login**
- [ ] Login con credenciales correctas → Ver token en localStorage
- [ ] Login con credenciales incorrectas → Ver mensaje de error
- [ ] Login como admin → Redirige a `/admin`
- [ ] Login como estudiante → Redirige a `/cursos`

### **Probar Admin Dashboard**
- [ ] Ver lista de eventos desde backend
- [ ] Filtrar por estado (INSCRIPCIONES, EN_CURSO, FINALIZADO)
- [ ] Buscar por nombre
- [ ] Crear nuevo evento
- [ ] Editar evento existente

### **Probar Responsable**
- [ ] Ver solo eventos asignados
- [ ] Editar eventos propios
- [ ] No poder editar eventos de otros

### **Probar Estudiante**
- [ ] Ver solo cursos de su nivel
- [ ] Inscribirse a curso
- [ ] Ver "Cupo completo" cuando no hay espacio
- [ ] No poder inscribirse a cursos de otros niveles

---

## 🚨 Errores Comunes y Soluciones

### **1. CORS Error**

```
Access to fetch at 'http://localhost:3001/api/...' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solución:** Ya configurado en `backend/src/main.ts`:
```typescript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### **2. Token Expirado**

```
Error: Token inválido o expirado
```

**Solución:** Implementar refresh o logout automático:
```typescript
if (error.message.includes('Token')) {
  localStorage.removeItem('token');
  router.push('/login');
}
```

### **3. Usuario no encontrado en localStorage**

```
Cannot read property 'id_usu' of null
```

**Solución:** Siempre validar antes de usar:
```typescript
const user = JSON.parse(localStorage.getItem('user') || '{}');
if (!user.id_usu) {
  router.push('/login');
  return;
}
```

---

## 📝 Pasos para Empezar

1. **✅ Copiar archivos creados** a sus ubicaciones
   - `api.ts` → `frontend/src/services/`
   - `api.types.ts` → `frontend/src/types/`
   - `useAuth.tsx` → `frontend/src/hooks/`
   - `.env.local` → `frontend/`

2. **✅ Actualizar componentes** uno por uno:
   - Empezar con `loginModal.tsx`
   - Luego `admin/page.tsx`
   - Después `responsable/page.tsx`

3. **✅ Probar cada componente** después de actualizar

4. **✅ Ver consola del navegador** (F12) para:
   - Network tab: ver llamadas a la API
   - Console: ver errores
   - Application → Local Storage: ver token y user

---

## 🎉 Resultado Final

Después de la integración tendrás:

✅ Login real con JWT
✅ Redirección automática según rol
✅ Dashboard admin con eventos reales
✅ Dashboard responsable con eventos asignados
✅ Estudiantes pueden inscribirse a cursos
✅ Validaciones de nivel y tipo de usuario
✅ Sistema completo funcionando

---

## 📞 Endpoints de Prueba Rápida

### **Login Admin**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cor_usu":"admin@uta.edu.ec","con_usu":"admin123"}'
```

### **Obtener Eventos**
```bash
curl http://localhost:3001/api/eventos \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### **Crear Evento**
```bash
curl -X POST http://localhost:3001/api/eventos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "nom_evt": "Curso de Next.js",
    "fec_evt": "2025-12-15",
    "lug_evt": "Aula 301",
    "des_evt": "Curso intensivo",
    "tip_pub_evt": "GENERAL",
    "mod_evt": "PRESENCIAL",
    "cos_evt": "GRATUITO",
    "id_responsable": 1
  }'
```

---

¡Todo listo para conectar el frontend con el backend! 🚀
