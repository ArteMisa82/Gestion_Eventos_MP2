# 🎯 Plan de Integración Frontend-Backend - Paso a Paso

## 📌 Estado Actual

### ✅ Backend (100% Completado)
- **40+ endpoints** funcionando
- **8 módulos** de rutas configurados
- **10 servicios** implementados
- **Validaciones** completas (tipo usuario, nivel, cupo)
- **Base de datos** actualizada (GENERAL, ESTUDIANTES, ADMINISTRATIVOS)

### 🔄 Frontend (Parcialmente desarrollado)
- ✅ UI/UX completado
- ✅ Componentes creados
- ❌ **Usando datos mock** (necesita conexión backend)
- ❌ Login hardcodeado

---

## 🚀 Plan de Acción en 5 Pasos

### **PASO 1: Copiar Archivos Nuevos** ⏱️ 5 min

Copiar los archivos creados a sus ubicaciones en el frontend:

```bash
# Desde la raíz del proyecto frontend:

# 1. Crear carpeta services si no existe
mkdir -p src/services

# 2. Copiar servicio de API
# Copiar el contenido de: 
#   frontend/src/services/api.ts (ya creado arriba)

# 3. Crear carpeta types si no existe  
mkdir -p src/types

# 4. Copiar tipos TypeScript
# Copiar el contenido de:
#   frontend/src/types/api.types.ts (ya creado arriba)

# 5. Crear carpeta hooks si no existe
mkdir -p src/hooks

# 6. Copiar hook de autenticación
# Copiar el contenido de:
#   frontend/src/hooks/useAuth.tsx (ya creado arriba)

# 7. Copiar archivo .env.local
# Ya creado en: frontend/.env.local
```

**Resultado:** 
- ✅ `frontend/src/services/api.ts` (600 líneas)
- ✅ `frontend/src/types/api.types.ts` (200 líneas)
- ✅ `frontend/src/hooks/useAuth.tsx` (90 líneas)
- ✅ `frontend/.env.local`

---

### **PASO 2: Actualizar Login** ⏱️ 10 min

**Archivo:** `frontend/src/components/loginModal.tsx`

**Cambios a realizar:**

```typescript
// 1. Agregar import al inicio del archivo
import { authAPI } from '@/services/api';

// 2. Agregar estado de loading
const [isLoading, setIsLoading] = useState(false);

// 3. Reemplazar toda la función handleLogin con:
const handleLogin = async () => {
  if (!email || !password) {
    Swal.fire({
      title: 'Campos vacíos',
      text: 'Ingresa email y contraseña',
      icon: 'warning',
      confirmButtonColor: '#581517',
    });
    return;
  }

  setIsLoading(true);

  try {
    // ✅ Llamada real al backend
    const response = await authAPI.login(email, password);
    const { token, usuario } = response;
    
    // Guardar en localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(usuario));
    
    // Determinar ruta según rol
    let ruta = '/home';
    if (usuario.adm_usu === 1 || usuario.Administrador) {
      ruta = '/admin';
    } else if (usuario.stu_usu === 1) {
      ruta = '/cursos';
    }
    
    Swal.fire({
      title: `Bienvenido ${usuario.nom_usu}`,
      icon: 'success',
      confirmButtonColor: '#581517',
      timer: 2000,
    });
    
    setEmail("");
    setPassword("");
    
    if (onLoginSuccess) {
      onLoginSuccess(usuario);
    }
    
    onClose();
    router.push(ruta);
    
  } catch (error: any) {
    Swal.fire({
      title: 'Error',
      text: error.message || 'Credenciales incorrectas',
      icon: 'error',
      confirmButtonColor: '#581517',
    });
  } finally {
    setIsLoading(false);
  }
};

// 4. Actualizar el botón de login para mostrar estado de carga:
<button
  onClick={handleLogin}
  disabled={isLoading}
  className={`w-full py-3 rounded-lg font-semibold ${
    isLoading 
      ? 'bg-gray-400 cursor-not-allowed'
      : 'bg-[#581517] hover:bg-[#6d1a1d] text-white'
  }`}
>
  {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
</button>
```

**Probar:**
```bash
# 1. Iniciar backend
cd backend
npm run dev

# 2. Iniciar frontend
cd frontend
npm run dev

# 3. Abrir http://localhost:3000
# 4. Hacer login con credenciales reales de la BD
# 5. Verificar en consola (F12) → Network → ver llamada a /api/auth/login
# 6. Verificar en Application → Local Storage → ver token y user
```

---

### **PASO 3: Actualizar Admin Dashboard** ⏱️ 15 min

**Archivo:** `frontend/src/app/admin/page.tsx`

**Cambios a realizar:**

```typescript
// 1. Agregar imports
import { eventosAPI } from '@/services/api';
import { Evento } from '@/types/api.types';

// 2. Agregar estado de loading
const [loading, setLoading] = useState(true);

// 3. Agregar useEffect para cargar eventos
useEffect(() => {
  cargarEventos();
}, [filtro, busqueda]);

// 4. Crear función para cargar eventos
const cargarEventos = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }

    const eventosData = await eventosAPI.getAll(token, {
      estado: filtro,
      busqueda: busqueda
    });
    
    setEventos(eventosData);
  } catch (error: any) {
    Swal.fire({
      title: 'Error',
      text: error.message,
      icon: 'error',
      confirmButtonColor: '#581517',
    });
  } finally {
    setLoading(false);
  }
};

// 5. Agregar loading state en el render
if (loading) {
  return (
    <div className="flex justify-center p-8">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#581517]"></div>
    </div>
  );
}

// 6. Actualizar los valores de tip_pub_evt en la UI
// Buscar "USUARIOS UTA" y reemplazar por "ESTUDIANTES" o "ADMINISTRATIVOS"
```

**Probar:**
```bash
# 1. Login como admin
# 2. Ir a /admin
# 3. Ver Network tab → debe haber llamada a /api/eventos
# 4. Ver eventos reales de la BD
# 5. Probar filtros (deben hacer nuevas llamadas al backend)
```

---

### **PASO 4: Actualizar Dashboard Responsable** ⏱️ 15 min

**Archivo:** `frontend/src/app/responsable/page.tsx`

**Cambios similares al admin:**

```typescript
import { eventosAPI } from '@/services/api';

useEffect(() => {
  cargarEventos();
}, []);

const cargarEventos = async () => {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.id_usu) {
      router.push('/login');
      return;
    }

    // Obtener solo eventos asignados a este responsable
    const eventosData = await eventosAPI.getByResponsable(token, user.id_usu);
    setEventos(eventosData);
  } catch (error: any) {
    Swal.fire({
      title: 'Error',
      text: error.message,
      icon: 'error',
      confirmButtonColor: '#581517',
    });
  }
};

const handleGuardar = async (eventoActualizado: Evento) => {
  try {
    const token = localStorage.getItem('token');
    
    await eventosAPI.update(token!, eventoActualizado.id_evt, eventoActualizado);
    
    Swal.fire({
      icon: 'success',
      title: 'Evento actualizado',
      confirmButtonColor: '#581517',
    });
    
    cargarEventos();
  } catch (error: any) {
    Swal.fire({
      title: 'Error',
      text: error.message,
      icon: 'error',
      confirmButtonColor: '#581517',
    });
  }
};
```

---

### **PASO 5: Actualizar Página de Cursos** ⏱️ 20 min

**Archivo:** `frontend/src/app/cursos/page.tsx`

Veo que ya tienen una página de cursos con filtros. Necesitan:

1. **Reemplazar `COURSES` (datos mock) por llamada al backend:**

```typescript
import { registroEventoAPI, inscripcionesAPI } from '@/services/api';
import { RegistroEvento } from '@/types/api.types';

const [cursos, setCursos] = useState<RegistroEvento[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  cargarCursos();
}, []);

const cargarCursos = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token || !user.id_usu) {
      router.push('/login');
      return;
    }

    // Obtener cursos del nivel del estudiante
    const cursosData = await registroEventoAPI.getCursosEstudiante(token, user.id_usu);
    setCursos(cursosData);
  } catch (error: any) {
    Swal.fire({
      title: 'Error',
      text: error.message,
      icon: 'error',
      confirmButtonColor: '#581517',
    });
  } finally {
    setLoading(false);
  }
};
```

2. **Agregar función de inscripción:**

```typescript
const handleInscribirse = async (id_reg_evt: string) => {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const result = await Swal.fire({
      title: '¿Confirmar inscripción?',
      text: '¿Deseas inscribirte en este curso?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#581517',
      confirmButtonText: 'Sí, inscribirme',
    });

    if (result.isConfirmed) {
      await inscripcionesAPI.inscribir(token!, {
        id_usu: user.id_usu,
        id_reg_evt: id_reg_evt,
      });

      Swal.fire({
        title: '¡Inscripción exitosa!',
        icon: 'success',
        confirmButtonColor: '#581517',
      });

      cargarCursos(); // Recargar
    }
  } catch (error: any) {
    Swal.fire({
      title: 'Error',
      text: error.message,
      icon: 'error',
      confirmButtonColor: '#581517',
    });
  }
};
```

3. **Agregar botón de inscripción en cada tarjeta de curso:**

```typescript
{curso.detalle_eventos?.est_evt_det === 'INSCRIPCIONES' && (
  <button
    onClick={() => handleInscribirse(curso.id_reg_evt)}
    disabled={!curso.cupo_disponible}
    className={`w-full py-2 rounded-md ${
      !curso.cupo_disponible
        ? 'bg-gray-300 text-gray-500'
        : 'bg-[#581517] text-white hover:bg-[#6d1a1d]'
    }`}
  >
    {!curso.cupo_disponible ? 'Cupo completo' : 'Inscribirse'}
  </button>
)}
```

---

## ✅ Checklist de Verificación

### Backend
- [ ] Backend corriendo en `http://localhost:3001`
- [ ] Base de datos actualizada (script SQL ejecutado)
- [ ] `npx prisma generate` ejecutado
- [ ] Probar endpoint: `curl http://localhost:3001/api/eventos`

### Frontend
- [ ] Archivos copiados: `api.ts`, `api.types.ts`, `useAuth.tsx`
- [ ] `.env.local` creado con `NEXT_PUBLIC_API_URL`
- [ ] Frontend corriendo en `http://localhost:3000`

### Login
- [ ] Importa `authAPI`
- [ ] Guarda token en localStorage
- [ ] Redirige según rol
- [ ] Muestra errores del backend

### Admin Dashboard
- [ ] Carga eventos desde `/api/eventos`
- [ ] Filtros funcionan
- [ ] Búsqueda funciona
- [ ] Muestra nuevos valores: GENERAL, ESTUDIANTES, ADMINISTRATIVOS

### Responsable
- [ ] Carga eventos desde `/api/eventos/responsable/:id`
- [ ] Solo ve sus eventos
- [ ] Puede editar

### Cursos (Estudiantes)
- [ ] Carga cursos desde `/api/registro-evento/estudiante/:id`
- [ ] Solo ve cursos de su nivel
- [ ] Puede inscribirse
- [ ] Ve cupo disponible

---

## 🧪 Testing Completo

### 1. **Probar Login**
```bash
# Usuario: admin@uta.edu.ec
# Debe redirigir a /admin
# Ver token en localStorage
```

### 2. **Probar Admin**
```bash
# Ver lista de eventos reales
# Filtrar por estado
# Buscar por nombre
# Verificar que muestra GENERAL, ESTUDIANTES, ADMINISTRATIVOS
```

### 3. **Probar Estudiante**
```bash
# Login como estudiante
# Ver cursos de su nivel solamente
# Inscribirse a un curso
# Verificar que el cupo disminuye
# Intentar inscribirse con cupo lleno (debe fallar)
```

### 4. **Probar Validaciones**
```bash
# Estudiante intenta inscribirse a curso de otro nivel → ERROR
# Usuario externo intenta inscribirse a curso ESTUDIANTES → ERROR
# Estudiante intenta inscribirse a curso ADMINISTRATIVOS → ERROR
```

---

## 📊 Resultado Final Esperado

Después de completar los 5 pasos:

✅ **Login funcional** con backend real
✅ **Admin ve todos los eventos** desde la BD
✅ **Responsable ve solo sus eventos**
✅ **Estudiantes ven cursos de su nivel**
✅ **Inscripciones funcionan** con validaciones
✅ **Manejo de errores** desde el backend
✅ **Estados correctos** (INSCRIPCIONES, EN_CURSO, FINALIZADO)
✅ **Tipos de público correctos** (GENERAL, ESTUDIANTES, ADMINISTRATIVOS)

---

## 🚨 Errores Comunes

### Error: CORS
```
Access to fetch blocked by CORS
```
**Solución:** Backend ya tiene CORS configurado en `main.ts`

### Error: Token no válido
```
Token inválido
```
**Solución:** 
```typescript
if (error.message.includes('Token')) {
  localStorage.clear();
  router.push('/login');
}
```

### Error: proceso no definido
```
process is not defined
```
**Solución:** Ya configurado con `NEXT_PUBLIC_API_URL` en `.env.local`

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa la consola del navegador (F12)
2. Revisa Network tab (llamadas a la API)
3. Revisa consola del backend (logs de errores)
4. Verifica que ambos servidores estén corriendo

---

¡Listo para integrar! 🎉 Empieza con el PASO 1 y ve avanzando uno por uno.
