import { Router } from 'express';
import eventosRoutes from './eventos.routes';
import detallesRoutes from './detalles.routes';
import authRoutes from './auth.routes';
import registroEventoRoutes from './registro-evento.routes';
import inscripcionesRoutes from './inscripciones.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/eventos', eventosRoutes);
router.use('/detalles', detallesRoutes);
router.use('/registro-evento', registroEventoRoutes);
router.use('/inscripciones', inscripcionesRoutes);

export default router;
