import { Router } from 'express';
import eventosRoutes from './eventos.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/eventos', eventosRoutes);
router.use('/users', userRoutes); // ✅ ¡Aquí estaba lo que te faltaba!

export default router;
