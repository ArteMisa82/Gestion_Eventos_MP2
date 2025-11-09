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

// Middlewares
app.use(cors());
app.use(express.json());
app.use(session(sessionConfig)); // ← SESIONES CONFIGURADAS

// Ruta raíz
app.get('/', (req, res) => {
  res.send('Backend funcionando 🚀');
});

// Rutas API
app.use('/api', routes);

// Manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

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

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});