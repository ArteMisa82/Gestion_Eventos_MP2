import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient({
  log: ['warn', 'error'], // Solo mostrar warnings y errores
});

export default prisma;
