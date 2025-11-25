import { Router } from 'express';
import { CalificacionesController } from '../controllers/calificaciones.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const calificacionesController = new CalificacionesController();

// ============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// Solo profesores/responsables pueden acceder
// ============================================

/**
 * @swagger
 * tags:
 *   name: Calificaciones
 *   description: Gestión de calificaciones y asistencias de eventos
 */

/**
 * @swagger
 * /api/calificaciones/{idDetalle}:
 *   get:
 *     summary: Obtener calificaciones de un evento
 *     description: Devuelve la lista de calificaciones y asistencias de los participantes registrados en un detalle de evento.
 *     tags: [Calificaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idDetalle
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del detalle del evento (tabla detalle_eventos)
 *     responses:
 *       200:
 *         description: Lista de calificaciones recuperada correctamente
 *       401:
 *         description: No autenticado o token inválido
 *       403:
 *         description: El usuario no tiene permisos para ver las calificaciones
 */
router.get(
  '/:idDetalle',
  authMiddleware,
  calificacionesController.obtenerCalificaciones.bind(calificacionesController)
);

/**
 * @swagger
 * /api/calificaciones/{idDetalle}/asignar:
 *   put:
 *     summary: Asignar calificación a un participante
 *     tags: [Calificaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idDetalle
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del detalle del evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_reg_per
 *             properties:
 *               id_reg_per:
 *                 type: string
 *                 description: ID del registro en `registro_personas`
 *                 example: "123"
 *               not_fin_evt:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Nota final obtenida por el participante
 *                 example: 85.5
 *               asi_evt_det:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Porcentaje de asistencia
 *                 example: 90
 *     responses:
 *       200:
 *         description: Calificación registrada o actualizada correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: El usuario no tiene permisos para calificar
 */
router.put(
  '/:idDetalle/asignar',
  authMiddleware,
  calificacionesController.asignarCalificacion.bind(calificacionesController)
);

/**
 * @swagger
 * /api/calificaciones/{idDetalle}/asignar-lote:
 *   put:
 *     summary: Asignar calificaciones en lote
 *     description: Permite actualizar la nota final y asistencia de múltiples participantes en un mismo detalle de evento.
 *     tags: [Calificaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idDetalle
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del detalle del evento
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - calificaciones
 *             properties:
 *               calificaciones:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id_reg_per
 *                   properties:
 *                     id_reg_per:
 *                       type: string
 *                       example: "123"
 *                     not_fin_evt:
 *                       type: number
 *                       format: float
 *                       example: 95.5
 *                     asi_evt_det:
 *                       type: number
 *                       format: float
 *                       example: 100
 *     responses:
 *       200:
 *         description: Calificaciones asignadas correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: El usuario no tiene permisos para calificar
 */
router.put(
  '/:idDetalle/asignar-lote',
  authMiddleware,
  calificacionesController.asignarCalificacionesLote.bind(calificacionesController)
);

export default router;
