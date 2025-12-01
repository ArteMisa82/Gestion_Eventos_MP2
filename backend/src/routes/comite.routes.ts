// src/routes/comite.routes.ts
import { Router } from 'express';
import { ComiteController } from '../controllers/comite.controller';
import { requireAuth } from '../middlewares/session.middleware';

const router = Router();
const controller = new ComiteController();

// El admin ya debe estar logueado (requireAuth) para poder usar el comité
router.post('/login', requireAuth, controller.login.bind(controller));
router.get('/session', requireAuth, controller.getCurrentSession.bind(controller));
router.post('/logout', requireAuth, controller.logout.bind(controller));

export default router;
