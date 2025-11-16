import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/session.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new AuthController();

// Rutas públicas
router.post('/register', controller.register.bind(controller));
router.post('/login', controller.login.bind(controller));

// Password recovery routes (public)
router.post('/forgot-password', controller.forgotPassword.bind(controller));
router.post('/reset-password', controller.resetPassword.bind(controller));
router.post('/verify-reset-token', controller.verifyResetToken.bind(controller));

// Rutas protegidas (requieren SESIÓN)
router.get('/profile', requireAuth, controller.getProfile.bind(controller));
router.post('/logout', requireAuth, controller.logout.bind(controller));
// Email verification (protected)
router.post('/send-verification', requireAuth, controller.sendVerificationEmail.bind(controller));
router.post('/verify-email', requireAuth, controller.verifyEmail.bind(controller));

export default router;
// Rutas protegidas
router.get('/profile', authMiddleware, controller.getProfile.bind(controller));

export default router;
