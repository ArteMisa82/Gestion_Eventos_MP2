import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new AuthController();

// Rutas públicas
router.post('/register', controller.register.bind(controller));
router.post('/login', controller.login.bind(controller));

// Rutas protegidas
router.get('/profile', authMiddleware, controller.getProfile.bind(controller));

export default router;
