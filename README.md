# 🎓 Gestión de Eventos Académicos – FISEI

Aplicación web desarrollada como parte del segundo parcial de la asignatura **Manejo y Configuración de Software**, enfocada en aplicar buenas prácticas de **control de versiones**, **control de cambios** y trabajo colaborativo. El sistema permite administrar cursos y eventos académicos de la FISEI, gestionar inscripciones, asistencias, pagos y certificados.

Proyecto creado por el **Equipo de Desarrollo – Grupo 3 – Carrera de Software (UTA)**.

---

## 📌 Objetivo del Proyecto
Desarrollar una plataforma para la gestión de cursos y eventos académicos integrando un flujo real de trabajo utilizando GitHub, GitFlow, Issues, Pull Requests y solicitudes de cambio, simulando un proceso profesional de gestión de la configuración.

---

## 🧩 Funcionalidades Principales

### 👥 Gestión de Roles
- Administrador  
- Responsable / Docente  
- Estudiante / Participante  
- Usuario logueado  
- Usuario no logueado  

### 🎫 Gestión de Eventos
- Crear, editar y eliminar eventos (cursos, congresos, webinars, conferencias, socializaciones).  
- Asignación por carrera o público general.  
- Eventos gratuitos o de pago.  
- Para cursos: horas, nota mínima, área, responsable.

### 📝 Procesos del Sistema
- Búsqueda avanzada de eventos.  
- Inscripción con verificación de requisitos.  
- Generación de orden de pago (depósito / transferencia).  
- Subida de comprobante y aprobación por administrador.  
- Registro de asistencia.  
- Registro de nota final (solo cursos).  
- Certificados de aprobación o asistencia.  
- Reportes por evento (inscritos, asistencia, notas).

---

## 🏗️ Arquitectura del Proyecto

### 🧠 Frontend
- React + Next.js (App Router)  
- TypeScript  
- CSS Modules  
- Animaciones con IntersectionObserver  
- Hook personalizado: `useInView()`  
- Next/Image y Next/Link  
- SweetAlert2  

### ⚙️ Backend
- Node.js + Express  
- Prisma ORM  
- PostgreSQL (pgAdmin 4)  
- Nodemailer  
- express-session + connect-pg-simple  
- TypeScript

### 🗄️ Base de Datos
- Modelado con Prisma  
- Migraciones automáticas  
- Cliente Prisma generado con `npx prisma generate`  

---

## 🚀 Cómo Ejecutar el Proyecto

### 1️⃣ Clonar el repositorio
```bash
git clone <url-del-repo>
cd Gestion_Eventos_MP2
```

### 2️⃣ Instalar dependencias

#### Backend
```bash
cd backend
npm install
npx prisma generate
```

#### Frontend
```bash
cd frontend
npm install
```

### 3️⃣ Variables de Entorno

**backend/.env**
```
DATABASE_URL="postgresql://usuario:password@localhost:5432/eventos"
SESSION_SECRET="clave_segura"
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 4️⃣ Ejecutar Servidores

Backend:
```bash
npm run dev
```

Frontend:
```bash
npm run dev
```

---

## 🔧 Flujo de Control de Cambios

El proyecto implementa un flujo completo de control de cambios:

- RFC (Solicitud del Usuario Final)  
- Solicitud Técnica del Desarrollador  
- Comité de Cambios (CCC)  
- Issues vinculados  
- Gestión con ramas `feature/`, `develop/`, `main`  
- Pull Requests con revisión  
- Evidencias en GitHub  
- Cierre y documentación del cambio  

---

## 👥 Equipo
**Equipo de Desarrollo – Grupo 3 – Carrera de Software (UTA)**  

- Bejarano Carlos
- Cardenas Evelyn
- Guatemal Bryan
- Guevara Josue
- Jaque Verónica
- Molina Karen


