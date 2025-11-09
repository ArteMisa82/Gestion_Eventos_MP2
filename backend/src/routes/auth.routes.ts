import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/session.middleware';

const router = Router();
const controller = new AuthController();

// Rutas públicas
router.post('/register', controller.register.bind(controller));
router.post('/login', controller.login.bind(controller));

// Rutas protegidas (requieren SESIÓN)
router.get('/profile', requireAuth, controller.getProfile.bind(controller));
router.post('/logout', requireAuth, controller.logout.bind(controller));

export default router;