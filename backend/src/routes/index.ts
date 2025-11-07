import { Router } from 'express';
import eventosRoutes from './eventos.routes';

const router = Router();

router.use('/eventos', eventosRoutes);

export default router;
