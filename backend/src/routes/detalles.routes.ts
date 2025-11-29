import { Router } from 'express';
import { EventosController } from '../controllers/eventos.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new EventosController();

/**
 * @swagger
 * tags:
 *   name: DetallesEventos
 *   description: Gestión de detalles específicos asociados a eventos
 */

/**
 * @swagger
 * /api/detalles/{id}:
 *   get:
 *     summary: Obtener detalle de evento
 *     tags: [DetallesEventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del detalle de evento
 *     responses:
 *       200:
 *         description: Detalle encontrado
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Detalle no encontrado
 */
router.get('/:id', authMiddleware, controller.obtenerDetallePorId.bind(controller));

/**
 * @swagger
 * /api/detalles/{id}/estado:
 *   put:
 *     summary: Cambiar estado de un detalle de evento
 *     tags: [DetallesEventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del detalle de evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               est_det:
 *                 type: string
 *                 example: "publicado"
 *               fec_ini_det:
 *                 type: string
 *                 format: date-time
 *               fec_fin_det:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *       401:
 *         description: No autenticado
 *       403:
 *         description: El usuario no tiene permisos
 */
router.put('/:id/estado', authMiddleware, controller.cambiarEstado.bind(controller));

/**
 * @swagger
 * /api/detalles/{id}:
 *   put:
 *     summary: Actualizar detalle de evento
 *     tags: [DetallesEventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hor_det:
 *                 type: number
 *                 example: 40
 *               are_det:
 *                 type: string
 *                 example: "SOFTWARE"
 *               cup_det:
 *                 type: number
 *                 example: 30
 *               est_det:
 *                 type: string
 *                 example: "en_proceso"
 *     responses:
 *       200:
 *         description: Detalle actualizado
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Detalle no encontrado
 */
router.put('/:id', authMiddleware, controller.actualizarDetalle.bind(controller));

/**
 * @swagger
 * /api/detalles/{id}:
 *   delete:
 *     summary: Eliminar detalle de evento
 *     tags: [DetallesEventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle eliminado correctamente
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Detalle no encontrado
 */
router.delete('/:id', authMiddleware, controller.eliminarDetalle.bind(controller));

export default router;
