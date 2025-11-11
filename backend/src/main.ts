import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import prisma from './config/database';
import { errorHandler } from './middlewares/errorHandler.middleware';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // 🔥 Para aceptar imágenes Base64 grandes

app.get('/', (req, res) => {
  res.send('Backend funcionando 🚀');
});

app.use('/api', routes);
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
