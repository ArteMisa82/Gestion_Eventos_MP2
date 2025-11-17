import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { sessionConfig } from './utils/session.util';
import prisma from './config/database';
import { errorHandler } from './middlewares/errorHandler.middleware';

dotenv.config();

const app = express();

// 🔥 Para permitir imágenes Base64 grandes
app.use(express.json({ limit: '10mb' }));
app.use(cors());
app.use(session(sessionConfig)); // ← SESIONES ACTIVADAS
// Middlewares CORS configurado para desarrollo
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(session(sessionConfig)); // ← SESIONES CONFIGURADAS

// ✔ Ruta base de prueba
app.get('/', (req, res) => {
  res.send('Backend funcionando 🚀');
});

// ✔ Aquí se conectan TODAS tus rutas del proyecto (API REST)
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
