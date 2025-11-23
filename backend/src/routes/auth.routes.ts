import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/session.middleware';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new AuthController();

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: Endpoints para autenticación de usuarios
 */

/**
 * @swagger
 * /api/auth/registro:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Autenticación]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cor_usu
 *               - con_usu
 *               - nom_usu
 *               - ape_usu
 *             properties:
 *               nom_usu:
 *                 type: string
 *                 example: Juan
 *               ape_usu:
 *                 type: string
 *                 example: Pérez
 *               cor_usu:
 *                 type: string
 *                 example: juan.perez@uta.edu.ec
 *               con_usu:
 *                 type: string
 *                 example: Password123!
 *               ced_usu:
 *                 type: string
 *                 example: "1234567890"
 *               tel_usu:
 *                 type: string
 *                 example: "0987654321"
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Datos inválidos o usuario ya existe
 */
// Rutas públicas
router.post('/registro', controller.register.bind(controller));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Autenticación]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cor_usu
 *               - con_usu
 *             properties:
 *               cor_usu:
 *                 type: string
 *                 example: juan.perez@uta.edu.ec
 *               con_usu:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login exitoso
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', controller.login.bind(controller));

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     tags: [Autenticación]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Instrucciones enviadas correctamente
 *       400:
 *         description: Datos faltantes
 */
router.post('/forgot-password', controller.forgotPassword.bind(controller));

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña con token válido
 *     tags: [Autenticación]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *       400:
 *         description: Token inválido o datos faltantes
 */
router.post('/reset-password', controller.resetPassword.bind(controller));

/**
 * @swagger
 * /api/auth/verify-reset-token:
 *   post:
 *     summary: Verificar token de restablecimiento de contraseña
 *     tags: [Autenticación]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token válido
 *       400:
 *         description: Token inválido o expirado
 */
router.post('/verify-reset-token', controller.verifyResetToken.bind(controller));

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Obtener perfil del usuario autenticado
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: No autenticado
 */
// Rutas protegidas (requieren SESIÓN)
router.get('/profile', requireAuth, controller.getProfile.bind(controller));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *       401:
 *         description: No autenticado
 */
router.post('/logout', requireAuth, controller.logout.bind(controller));
// Email verification (protected)
/**
 * @swagger
 * /api/auth/send-verification:
 *   post:
 *     summary: Enviar código de verificación al correo del usuario
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Código enviado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Acción no permitida para correo institucional
 */
router.post('/send-verification', requireAuth, controller.sendVerificationEmail.bind(controller));

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verificar correo del usuario con código recibido
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Correo verificado
 *       400:
 *         description: Código inválido
 *       401:
 *         description: No autenticado
 */
router.post('/verify-email', requireAuth, controller.verifyEmail.bind(controller));

export default router;
