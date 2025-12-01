// src/routes/comite.routes.ts
import { Router } from 'express';
import { ComiteController } from '../controllers/comite.controller';
import { requireAuth } from '../middlewares/session.middleware';

const router = Router();
const controller = new ComiteController();

// El admin debe estar logueado
router.post('/login', requireAuth, controller.login.bind(controller));
router.get('/session', requireAuth, controller.getCurrentSession.bind(controller));

// 🔹 NUEVOS ENDPOINTS
router.get('/estado', requireAuth, controller.getEstado.bind(controller));
router.get('/miembros', requireAuth, controller.getMiembros.bind(controller));

router.post('/logout', requireAuth, controller.logout.bind(controller));

export default router;
