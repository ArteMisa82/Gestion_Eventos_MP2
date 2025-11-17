# 📚 Índice de Documentación - Integración Frontend-Backend

## 🎯 Resumen Ejecutivo

Se han creado **7 archivos** para facilitar la integración del frontend Next.js con el backend Express+Prisma ya desarrollado.

---

## 📁 Archivos Creados

### **1. Servicio de API** ⭐ PRINCIPAL
📄 `frontend/src/services/api.ts` (600 líneas)

**Qué hace:**
- Centraliza todas las llamadas al backend
- Maneja autenticación con JWT
- Gestiona errores automáticamente
- Incluye 8 módulos de API

**Módulos incluidos:**
- ✅ `authAPI` - Login y registro
- ✅ `eventosAPI` - CRUD eventos
- ✅ `detallesAPI` - Detalles de eventos
- ✅ `registroEventoAPI` - Cursos por nivel
- ✅ `inscripcionesAPI` - Inscripciones de estudiantes
- ✅ `estudiantesAPI` - Gestión de estudiantes
- ✅ `carrerasAPI` - CRUD carreras
- ✅ `nivelesAPI` - CRUD niveles

**Uso:**
```typescript
import { authAPI, eventosAPI } from '@/services/api';

// Login
const response = await authAPI.login(email, password);

// Obtener eventos
const eventos = await eventosAPI.getAll(token);
```

---

### **2. Tipos TypeScript** ⭐ PRINCIPAL
📄 `frontend/src/types/api.types.ts` (200 líneas)

**Qué hace:**
- Define interfaces para todas las respuestas del backend
- Proporciona tipado fuerte
- Evita errores en tiempo de compilación

**Tipos incluidos:**
- `Usuario`, `Evento`, `DetalleEvento`
- `RegistroEvento`, `InscripcionPersona`
- `Estudiante`, `Carrera`, `Nivel`
- `LoginResponse`, `ApiResponse`

**Uso:**
```typescript
import { Evento, Usuario } from '@/types/api.types';

const [eventos, setEventos] = useState<Evento[]>([]);
```

---

### **3. Hook de Autenticación**
📄 `frontend/src/hooks/useAuth.tsx` (90 líneas)

**Qué hace:**
- Maneja estado global de autenticación
- Gestiona token y usuario
- Proporciona funciones login/logout

**Uso:**
```typescript
import { useAuth } from '@/hooks/useAuth';

const { user, token, login, logout } = useAuth();

await login(email, password);
```

---

### **4. Variables de Entorno**
📄 `frontend/.env.local`

**Contenido:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

**Propósito:** 
- Configurar URL del backend
- Fácil cambio entre dev/prod

---

### **5. Guía de Integración** 📖
📄 `GUIA_INTEGRACION_FRONTEND.md`

**Contenido:**
- Configuración inicial completa
- Ejemplos de integración por componente
- Mapeo de datos Backend → Frontend
- Testing de integración
- Endpoints disponibles

**Cuándo usar:** 
- Para entender cómo conectar cada componente
- Como referencia de endpoints

---

### **6. Ejemplo Login Integrado** 💡
📄 `EJEMPLO_LOGIN_INTEGRADO.tsx`

**Contenido:**
- Código completo de loginModal.tsx actualizado
- Muestra el antes y después
- Comentarios explicativos
- Listo para copiar y pegar

**Cuándo usar:**
- Como plantilla para actualizar el login
- Para ver un ejemplo real funcionando

---

### **7. Plan Paso a Paso** 📋 ⭐ EMPEZAR AQUÍ
📄 `PLAN_INTEGRACION_PASO_A_PASO.md`

**Contenido:**
- 5 pasos claros y ordenados
- Checklist de verificación
- Testing completo
- Solución de errores comunes

**Cuándo usar:**
- **Empezar por aquí**
- Seguir los pasos en orden
- Verificar con los checklists

---

### **8. Resumen de Integración** 📊
📄 `RESUMEN_INTEGRACION.md`

**Contenido:**
- Estructura de archivos
- Componentes a actualizar
- Mapeo de endpoints
- Errores comunes

**Cuándo usar:**
- Vista rápida del proyecto
- Referencia de endpoints
- Troubleshooting

---

## 🚀 ¿Por Dónde Empezar?

### **Ruta Recomendada:**

```
1️⃣ Leer: PLAN_INTEGRACION_PASO_A_PASO.md
   ↓
2️⃣ Copiar archivos (PASO 1):
   - api.ts
   - api.types.ts  
   - useAuth.tsx
   - .env.local
   ↓
3️⃣ Actualizar loginModal.tsx (PASO 2)
   Usar EJEMPLO_LOGIN_INTEGRADO.tsx como guía
   ↓
4️⃣ Actualizar admin/page.tsx (PASO 3)
   ↓
5️⃣ Actualizar responsable/page.tsx (PASO 4)
   ↓
6️⃣ Actualizar cursos/page.tsx (PASO 5)
   ↓
7️⃣ Testing completo
   Usar checklist del PLAN_PASO_A_PASO
```

---

## 📊 Componentes Frontend a Modificar

### ✅ **Prioritarios (orden sugerido):**

1. **loginModal.tsx** (10 min)
   - Archivo: `frontend/src/components/loginModal.tsx`
   - Cambios: Reemplazar lógica hardcodeada por `authAPI.login()`
   - Guía: `EJEMPLO_LOGIN_INTEGRADO.tsx`

2. **admin/page.tsx** (15 min)
   - Archivo: `frontend/src/app/admin/page.tsx`
   - Cambios: Usar `eventosAPI.getAll()`
   - Agregar: Loading state, manejo de errores

3. **responsable/page.tsx** (15 min)
   - Archivo: `frontend/src/app/responsable/page.tsx`
   - Cambios: Usar `eventosAPI.getByResponsable()`
   - Agregar: Actualización de eventos

4. **cursos/page.tsx** (20 min)
   - Archivo: `frontend/src/app/cursos/page.tsx`
   - Cambios: Usar `registroEventoAPI.getCursosEstudiante()`
   - Agregar: Función de inscripción

### 📝 **Opcionales:**

5. **Navbar.tsx**
   - Mostrar usuario logueado
   - Botón de logout
   
6. **registroForm.tsx**
   - Usar `authAPI.register()`

---

## 🎯 Endpoints Backend Disponibles

### **Total: 40+ endpoints**

| Módulo | Endpoints | Archivo Frontend |
|--------|-----------|------------------|
| **Auth** | 2 | `loginModal.tsx` |
| **Eventos** | 7 | `admin/page.tsx` |
| **Detalles** | 4 | Modal editar |
| **Registro Evento** | 3 | `cursos/page.tsx` |
| **Inscripciones** | 5 | `cursos/page.tsx` |
| **Estudiantes** | 4 | Admin panel |
| **Carreras** | 6 | Admin panel |
| **Niveles** | 6 | Admin panel |

**Ver lista completa:** `RESUMEN_INTEGRACION.md` sección "Mapeo de Endpoints"

---

## 🔧 Backend Actualizado

### **Cambios Recientes:**
- ✅ Campo `tip_pub_evt` actualizado: `GENERAL`, `ESTUDIANTES`, `ADMINISTRATIVOS`
- ✅ Validación por tipo de usuario implementada
- ✅ Sistema de niveles y estudiantes funcionando
- ✅ CRUD de carreras y niveles (admin)
- ✅ 40+ endpoints testeados

### **Ejecutar Backend:**
```bash
cd backend
npm run dev
# http://localhost:3001
```

---

## 📦 Estructura Final

```
📦 Gestion_Eventos_MP2/
├── 📁 backend/                    ✅ Completado
│   ├── src/
│   │   ├── controllers/           ✅ 8 controladores
│   │   ├── services/              ✅ 10 servicios
│   │   ├── routes/                ✅ 8 módulos
│   │   └── types/                 ✅ Tipos y constantes
│   └── prisma/schema.prisma       ✅ Actualizado
│
├── 📁 frontend/                   🔄 Por integrar
│   ├── .env.local                 ✅ Crear
│   └── src/
│       ├── services/
│       │   └── api.ts             ✅ Copiar
│       ├── types/
│       │   └── api.types.ts       ✅ Copiar
│       ├── hooks/
│       │   └── useAuth.tsx        ✅ Copiar
│       ├── components/
│       │   ├── loginModal.tsx     🔄 Actualizar
│       │   └── Navbar.tsx         🔄 Actualizar
│       └── app/
│           ├── admin/page.tsx     🔄 Actualizar
│           ├── responsable/       🔄 Actualizar
│           └── cursos/page.tsx    🔄 Actualizar
│
└── 📄 Documentación               ✅ Creada
    ├── PLAN_INTEGRACION_PASO_A_PASO.md  ⭐ EMPEZAR AQUÍ
    ├── GUIA_INTEGRACION_FRONTEND.md
    ├── RESUMEN_INTEGRACION.md
    ├── EJEMPLO_LOGIN_INTEGRADO.tsx
    └── INDICE_DOCUMENTACION.md (este archivo)
```

---

## ⏱️ Tiempo Estimado

- **Configuración inicial:** 5 min
- **Login:** 10 min
- **Admin Dashboard:** 15 min
- **Responsable Dashboard:** 15 min
- **Cursos Estudiantes:** 20 min
- **Testing:** 15 min

**Total: ~1.5 horas** para integración completa

---

## 🧪 Verificación Rápida

### **Backend funcionando:**
```bash
curl http://localhost:3001/api/eventos
# Debe responder con JSON
```

### **Frontend conectado:**
```bash
# 1. Abrir http://localhost:3000
# 2. Login con usuario real
# 3. F12 → Network → ver llamadas a localhost:3001
# 4. F12 → Application → Local Storage → ver token
```

---

## 🎓 Conceptos Clave

### **Flujo de Autenticación:**
```
Usuario → loginModal.tsx 
  ↓
authAPI.login(email, password)
  ↓
Backend: POST /api/auth/login
  ↓
Response: { token, usuario }
  ↓
localStorage.setItem('token', token)
  ↓
router.push('/admin' o '/cursos')
```

### **Flujo de Datos:**
```
Componente → useEffect()
  ↓
API Service (api.ts)
  ↓
fetch('http://localhost:3001/api/...')
  ↓
Backend Controller
  ↓
Service → Prisma → Database
  ↓
Response JSON
  ↓
setState(data)
  ↓
Render actualizado
```

---

## 🆘 Soporte

### **Si encuentras errores:**

1. **CORS Error**
   - ✅ Ya configurado en backend
   - Verificar que backend esté corriendo

2. **Token inválido**
   - Limpiar localStorage
   - Hacer login de nuevo

3. **Cannot find module '@/services/api'**
   - Verificar que api.ts esté en src/services/
   - Verificar tsconfig.json tiene path alias @

4. **Usuario no encontrado**
   - Verificar que usuario existe en BD
   - Verificar credenciales

### **Debugging:**
```typescript
// Agregar en api.ts para debug:
console.log('API URL:', API_URL);
console.log('Token:', token);
console.log('Response:', response);
```

---

## ✅ Checklist Final

### Antes de empezar:
- [ ] Backend corriendo en :3001
- [ ] Frontend corriendo en :3000
- [ ] BD actualizada (script SQL ejecutado)
- [ ] `npx prisma generate` ejecutado

### Archivos copiados:
- [ ] `frontend/src/services/api.ts`
- [ ] `frontend/src/types/api.types.ts`
- [ ] `frontend/src/hooks/useAuth.tsx`
- [ ] `frontend/.env.local`

### Componentes actualizados:
- [ ] `loginModal.tsx`
- [ ] `admin/page.tsx`
- [ ] `responsable/page.tsx`
- [ ] `cursos/page.tsx`

### Testing:
- [ ] Login funciona
- [ ] Admin ve eventos
- [ ] Responsable ve sus eventos
- [ ] Estudiante ve cursos de su nivel
- [ ] Inscripciones funcionan
- [ ] Validaciones funcionan

---

## 🎉 ¡Listo para Integrar!

**Siguiente paso:** Abrir `PLAN_INTEGRACION_PASO_A_PASO.md` y seguir los 5 pasos.

¡Éxito con la integración! 🚀
