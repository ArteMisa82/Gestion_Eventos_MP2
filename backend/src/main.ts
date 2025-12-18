import express from 'express'; 
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import routes from './routes';
import { sessionConfig } from './utils/session.util';
import prisma from './config/database';
import { errorHandler } from './middlewares/errorHandler.middleware';
import { swaggerUi, swaggerSpec } from './config/swagger';

// 🔥 Importa las rutas de eventos favoritos
import favoriteEventsRoutes from './routes/favoriteEvents.routes'; // Ruta de eventos favoritos
// 👉 IMPORTA LA RUTA DEL DASHBOARD
import dashboardRoutes from './routes/dashboard.routes';

dotenv.config();

const app = express();

// 🔥 Middlewares CORS - DEBE IR PRIMERO
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 🔥 Para permitir imágenes Base64 grandes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 🔥 Sesiones configuradas
app.use(session(sessionConfig));

// 📁 Servir archivos estáticos (uploads) con Content-Type correcto
app.use('/uploads', (req, res, next) => {
  console.log('🔍 [UPLOADS] Solicitud:', req.path);
  console.log('🔍 [UPLOADS] Ruta completa:', req.url);
  console.log('🔍 [UPLOADS] Extensión:', path.extname(req.path));
  const uploadsRoot = path.join(__dirname, '../uploads');
  const requestedPath = path.join(uploadsRoot, req.path);
  // Si viene con .pdf pero el archivo real no tiene extensión, hacemos fallback
  if (req.path.endsWith('.pdf') && !fs.existsSync(requestedPath)) {
    const withoutExtPath = requestedPath.replace(/\.pdf$/, '');
    if (fs.existsSync(withoutExtPath)) {
      console.log('🔁 [UPLOADS] Archivo sin extensión encontrado, reescribiendo URL');
      req.url = req.url.replace(/\.pdf$/, '');
    }
  }
  
  // Si la URL no tiene extensión, asumir que es PDF
  if (!path.extname(req.path)) {
    console.log('✅ [UPLOADS] Sin extensión detectada - Agregando Content-Type: application/pdf');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
  }
  next();
}, express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res, path) => {
    console.log('📄 [STATIC] Sirviendo archivo:', path);
    console.log('📄 [STATIC] Tipo MIME:', res.getHeader('Content-Type'));
  }
}));

// ✔ Ruta base de prueba
app.get('/', (req, res) => {
  res.send('Backend funcionando 🚀');
});

// 📚 Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "API Gestión de Eventos - UTA"
}));

// =========================================
//        🆕 RUTA DEL DASHBOARD ADMIN
// =========================================
app.use('/api/admin/dashboard', dashboardRoutes);

// ✔ Aquí se conectan TODAS tus rutas del proyecto (API REST)
// Rutas de eventos favoritos
app.use('/api/eventos', favoriteEventsRoutes); // Rutas para eventos favoritos

// ✔ Aquí se registran otras rutas generales
app.use('/api', routes);

// ✔ Middleware global de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

// 🚀 Arrancar servidor + conectar a BD
app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`✅ Base de datos conectada`);
    console.log(`🚀 Servidor backend en puerto ${PORT}`);
    console.log(`📡 API disponible en http://localhost:${PORT}/api`);
    console.log(`📚 Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    process.exit(1);
  }
});

// 🧹 Cerrar conexión cuando se apague el servidor
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Manejadores para errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
});
