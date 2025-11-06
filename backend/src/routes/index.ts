import { Router } from 'express';
import eventosRoutes from './eventos.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/eventos', eventosRoutes);

export default router;
