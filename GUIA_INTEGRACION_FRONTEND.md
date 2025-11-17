/**
 * GUÍA DE INTEGRACIÓN FRONTEND-BACKEND
 * Sistema de Gestión de Eventos
 */

## 📁 Estructura de Archivos Creados

```
frontend/
├── .env.local                    # ✅ Variables de entorno
├── src/
│   ├── services/
│   │   └── api.ts                # ✅ Servicio centralizado de API
│   ├── types/
│   │   └── api.types.ts          # ✅ Tipos TypeScript
│   └── hooks/
│       └── useAuth.tsx           # ✅ Hook de autenticación
```

---

## 🔧 Configuración Inicial

### 1. **Variables de Entorno** (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 2. **Iniciar Backend**

```bash
cd backend
npm run dev
# Backend corriendo en http://localhost:3001
```

### 3. **Iniciar Frontend**

```bash
cd frontend
npm run dev
# Frontend corriendo en http://localhost:3000
```

---

## 📋 Ejemplos de Integración por Componente

### **1. Login Modal** (`components/loginModal.tsx`)

#### ❌ **Código Actual (Mock)**

```typescript
const handleLogin = async () => {
  const adminEmail = "admin@admin.uta.edu.ec";
  // ... validación hardcodeada
};
```

#### ✅ **Código Integrado con Backend**

```typescript
import { authAPI } from '@/services/api';
import Swal from 'sweetalert2';

const handleLogin = async () => {
  try {
    // Llamada real al backend
    const response = await authAPI.login(email, password);
    
    // response = { token: "xxx", usuario: {...} }
    const { token, usuario } = response;
    
    // Guardar token y usuario
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(usuario));
    
    // Determinar redirección según rol
    if (usuario.adm_usu === 1 || usuario.Administrador) {
      Swal.fire({
        title: `Bienvenido ${usuario.nom_usu} 👑`,
        text: 'Administrador',
        icon: 'success',
        confirmButtonColor: '#581517',
      });
      router.push('/admin');
    } else if (usuario.stu_usu === 1) {
      Swal.fire({
        title: `Bienvenido ${usuario.nom_usu}`,
        text: 'Estudiante',
        icon: 'success',
        confirmButtonColor: '#581517',
      });
      router.push('/cursos');
    } else {
      Swal.fire({
        title: `Bienvenido ${usuario.nom_usu}`,
        icon: 'success',
        confirmButtonColor: '#581517',
      });
      router.push('/home');
    }
    
    onClose();
  } catch (error: any) {
    Swal.fire({
      title: 'Error de autenticación',
      text: error.message || 'Credenciales incorrectas',
      icon: 'error',
      confirmButtonColor: '#581517',
    });
  }
};
```

---

### **2. Dashboard Admin** (`app/admin/page.tsx`)

#### ❌ **Código Actual (Mock)**

```typescript
const [eventos, setEventos] = useState<Evento[]>([
  { id_evt: "EVT001", nom_evt: "Curso...", ... }
]);
```

#### ✅ **Código Integrado con Backend**

```typescript
import { eventosAPI, detallesAPI } from '@/services/api';
import { Evento } from '@/types/api.types';

const AdminDashboard: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("EN CURSO");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarEventos();
  }, [filtro, busqueda]);

  const cargarEventos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      // Obtener todos los eventos
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

  const handleEditarEvento = async (evento: Evento) => {
    // ... lógica de edición
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando eventos...</div>;
  }

  return (
    <div className="p-8">
      {/* ... UI existente */}
      {eventos.map(evento => (
        <div key={evento.id_evt}>
          <h3>{evento.nom_evt}</h3>
          <p>{evento.des_evt}</p>
          <span>{evento.tip_pub_evt}</span>
          {/* Ahora usa GENERAL, ESTUDIANTES, ADMINISTRATIVOS */}
        </div>
      ))}
    </div>
  );
};
```

---

### **3. Dashboard Responsable** (`app/responsable/page.tsx`)

#### ✅ **Código Integrado con Backend**

```typescript
import { eventosAPI } from '@/services/api';

export default function DashboardResponsable() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  
  useEffect(() => {
    cargarEventosResponsable();
  }, []);

  const cargarEventosResponsable = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token || !user.id_usu) {
        router.push('/login');
        return;
      }

      // Obtener eventos asignados al responsable
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
      
      // Recargar eventos
      await cargarEventosResponsable();
      
      Swal.fire({
        icon: 'success',
        title: 'Evento actualizado',
        confirmButtonColor: '#581517',
      });
    } catch (error: any) {
      Swal.fire({
        title: 'Error',
        text: error.message,
        icon: 'error',
        confirmButtonColor: '#581517',
      });
    }
  };

  return (
    <div className="p-8">
      {eventos.map(ev => (
        <div key={ev.id_evt}>
          {/* ... */}
        </div>
      ))}
    </div>
  );
}
```

---

### **4. Página de Cursos para Estudiantes** (Nueva)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { registroEventoAPI, inscripcionesAPI } from '@/services/api';
import { RegistroEvento } from '@/types/api.types';
import Swal from 'sweetalert2';

export default function CursosEstudiante() {
  const [cursos, setCursos] = useState<RegistroEvento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token || !user.id_usu) {
        window.location.href = '/login';
        return;
      }

      // Obtener cursos filtrados por nivel del estudiante
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
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, inscribirme',
        cancelButtonText: 'Cancelar',
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

        // Recargar cursos
        cargarCursos();
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Cargando cursos...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-6">Cursos Disponibles</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cursos.map(curso => (
          <div key={curso.id_reg_evt} className="border rounded-lg p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-2">
              {curso.detalle_eventos?.eventos?.nom_evt}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {curso.detalle_eventos?.eventos?.des_evt}
            </p>
            
            <div className="space-y-2 text-sm">
              <p><strong>Modalidad:</strong> {curso.detalle_eventos?.eventos?.mod_evt}</p>
              <p><strong>Horas:</strong> {curso.detalle_eventos?.hor_det}</p>
              <p><strong>Cupo:</strong> {curso.inscritos_count}/{curso.detalle_eventos?.cup_det}</p>
              <p><strong>Estado:</strong> {curso.detalle_eventos?.est_evt_det}</p>
            </div>

            {curso.detalle_eventos?.est_evt_det === 'INSCRIPCIONES' && (
              <button
                onClick={() => handleInscribirse(curso.id_reg_evt)}
                className="mt-4 w-full bg-[#581517] text-white py-2 rounded-md hover:bg-[#6d1a1d] transition-colors"
              >
                Inscribirse
              </button>
            )}
          </div>
        ))}
      </div>

      {cursos.length === 0 && (
        <div className="text-center text-gray-500 mt-10">
          No hay cursos disponibles para tu nivel
        </div>
      )}
    </div>
  );
}
```

---

## 🔑 Manejo de Autenticación

### **Proteger Rutas**

```typescript
// middleware.ts (en la raíz del proyecto)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  // Rutas protegidas
  const protectedPaths = ['/admin', '/responsable', '/cursos'];
  
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/responsable/:path*', '/cursos/:path*'],
};
```

---

## 📊 Mapeo de Datos Backend → Frontend

### **Campos del Backend vs Frontend**

| Backend (BD) | Frontend (UI) | Tipo |
|-------------|---------------|------|
| `tip_pub_evt` | `tipoPublico` | GENERAL, ESTUDIANTES, ADMINISTRATIVOS |
| `mod_evt` | `modalidad` | PRESENCIAL, VIRTUAL |
| `cos_evt` | `costo` | GRATUITO, DE PAGO |
| `est_evt_det` | `estado` | INSCRIPCIONES, EN_CURSO, FINALIZADO |
| `id_usu` | `id` | number |
| `cor_usu` | `email` | string |
| `nom_usu` | `nombre` | string |
| `ape_usu` | `apellido` | string |

### **Transformación de Datos**

```typescript
// Backend → Frontend
const transformarEvento = (eventoBackend: any) => ({
  id: eventoBackend.id_evt,
  nombre: eventoBackend.nom_evt,
  descripcion: eventoBackend.des_evt,
  fecha: new Date(eventoBackend.fec_evt).toLocaleDateString(),
  lugar: eventoBackend.lug_evt,
  modalidad: eventoBackend.mod_evt,
  tipoPublico: eventoBackend.tip_pub_evt,
  estado: eventoBackend.est_evt,
});

// Frontend → Backend
const transformarParaBackend = (eventoFrontend: any) => ({
  nom_evt: eventoFrontend.nombre,
  des_evt: eventoFrontend.descripcion,
  fec_evt: eventoFrontend.fecha,
  lug_evt: eventoFrontend.lugar,
  mod_evt: eventoFrontend.modalidad,
  tip_pub_evt: eventoFrontend.tipoPublico,
  id_responsable: eventoFrontend.responsableId,
});
```

---

## 🧪 Testing de Integración

### **1. Probar Login**

```bash
# En el navegador, abrir:
http://localhost:3000/login

# Credenciales de prueba:
Email: admin@uta.edu.ec
Password: admin123

# Deberías ver:
# 1. Llamada a http://localhost:3001/api/auth/login
# 2. Respuesta con token y usuario
# 3. Redirección a /admin
```

### **2. Probar Carga de Eventos**

```bash
# Abrir consola del navegador (F12)
# Ver Network tab
# Debería aparecer:
GET http://localhost:3001/api/eventos
Authorization: Bearer eyJhbGc...

# Respuesta esperada:
[
  {
    "id_evt": "EVT001",
    "nom_evt": "Curso de React",
    "tip_pub_evt": "GENERAL",
    ...
  }
]
```

---

## 🚀 Próximos Pasos

1. ✅ **Reemplazar mocks** en cada componente
2. ✅ **Agregar manejo de errores** global
3. ✅ **Implementar loading states**
4. ✅ **Agregar validaciones** de formularios
5. ✅ **Implementar paginación** para listas largas
6. ✅ **Agregar filtros** dinámicos
7. ✅ **Implementar refresh** automático de datos

---

## 📞 Endpoints Disponibles

### **Autenticación**
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/registro` - Registrar usuario

### **Eventos**
- `GET /api/eventos` - Todos los eventos (admin)
- `GET /api/eventos/:id` - Evento por ID
- `POST /api/eventos` - Crear evento (admin)
- `PUT /api/eventos/:id` - Actualizar evento (admin)
- `DELETE /api/eventos/:id` - Eliminar evento (admin)
- `GET /api/eventos/responsable/:id` - Eventos de un responsable

### **Cursos (Registro Evento)**
- `GET /api/registro-evento/estudiante/:id` - Cursos para estudiante
- `GET /api/registro-evento/filtrados` - Cursos filtrados (admin)

### **Inscripciones**
- `POST /api/inscripciones` - Inscribirse a curso
- `GET /api/inscripciones/usuario/:id` - Inscripciones de usuario
- `GET /api/inscripciones/registro/:id` - Inscritos en un curso
- `DELETE /api/inscripciones/:id` - Cancelar inscripción

### **Estudiantes**
- `POST /api/estudiantes/asignar` - Asignar a nivel
- `GET /api/estudiantes/nivel/:id` - Estudiantes de un nivel
- `GET /api/estudiantes/historial/:id` - Historial de estudiante

### **Carreras y Niveles**
- `GET /api/carreras` - Todas las carreras
- `GET /api/niveles` - Todos los niveles
- `GET /api/niveles/carrera/:id` - Niveles de una carrera
- `POST /api/carreras` - Crear carrera (admin)
- `POST /api/niveles` - Crear nivel (admin)

---

¡Listo para integrar! 🎉
