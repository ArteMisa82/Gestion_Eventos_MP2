import { Router } from 'express';
import eventosRoutes from './eventos.routes';
import detallesRoutes from './detalles.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/eventos', eventosRoutes);
router.use('/detalles', detallesRoutes);

export default router;
