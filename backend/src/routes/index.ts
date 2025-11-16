import { Router } from 'express';
import eventosRoutes from './eventos.routes';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/eventos', eventosRoutes);
router.use('/users', userRoutes);

export default router;

