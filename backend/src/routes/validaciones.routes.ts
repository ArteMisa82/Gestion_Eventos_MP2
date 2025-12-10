// backend/src/routes/validaciones.routes.ts
import { Router } from 'express';
import { ValidacionesController } from '../controllers/validaciones.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const validacionesController = new ValidacionesController();

/**
 * @swagger
 * /validaciones/documentos-pendientes:
 *   get:
 *     summary: Obtener todos los documentos pendientes de validación (requisitos + pagos)
 *     tags: [Validaciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de documentos pendientes
 *       500:
 *         description: Error del servidor
 */
router.get(
    '/documentos-pendientes',
    authMiddleware,
    adminMiddleware,
    validacionesController.getDocumentosPendientes.bind(validacionesController)
);

/**
 * @swagger
 * /validaciones/{tipo}/{id}:
 *   put:
 *     summary: Validar un documento (requisito o pago)
 *     tags: [Validaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [requisito, pago]
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [APROBAR, RECHAZAR]
 *               comentarios:
 *                 type: string
 *     responses:
 *       200:
 *         description: Validación realizada
 *       400:
 *         description: Parámetros inválidos
 */
router.put(
    '/:tipo/:id',
    authMiddleware,
    adminMiddleware,
    validacionesController.validarDocumento.bind(validacionesController)
);

export default router;
