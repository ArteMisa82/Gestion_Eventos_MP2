/**
 * Rutas para inscripciones (registro_personas)
 */

import { Router } from 'express';
import { registroController } from '../controllers/registro.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Inscripciones
 *   description: Gestión de inscripciones de usuarios a eventos
 */

// ============= INSCRIPCIONES =============
// Registro de usuarios en eventos

/**
 * @swagger
 * /api/inscripciones:
 *   post:
*     summary: Inscribir usuario a un evento
*     tags: [Inscripciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_usu
 *               - id_reg_evt
 *             properties:
 *               id_usu:
 *                 type: string
 *                 example: "14"
 *               id_reg_evt:
 *                 type: string
 *                 example: "55"
 *               fuente:
 *                 type: string
 *                 example: "portal_web"
 *     responses:
 *       201:
 *         description: Inscripción creada correctamente
 *       400:
 *         description: Datos inválidos o inscripción duplicada
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authMiddleware,
  registroController.inscribirUsuario.bind(registroController)
);

/**
 * @swagger
 * /api/inscripciones/validar:
 *   post:
 *     summary: Validar inscripción
 *     description: Verifica requisitos y disponibilidad para inscribir a un usuario en un evento.
 *     tags: [Inscripciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_usu
 *               - id_reg_evt
 *             properties:
 *               id_usu:
 *                 type: string
 *                 example: "14"
 *               id_reg_evt:
 *                 type: string
 *                 example: "55"
 *     responses:
 *       200:
 *         description: Resultado de la validación
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 */
router.post(
  '/validar',
  authMiddleware,
  registroController.validarInscripcion.bind(registroController)
);

/**
 * @swagger
 * /api/inscripciones:
 *   get:
 *     summary: Listar todas las inscripciones
 *     tags: [Inscripciones]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inscripciones obtenidas correctamente
 *       401:
 *         description: No autenticado
 */
router.get(
  '/',
  authMiddleware,
  registroController.obtenerTodasInscripciones.bind(registroController)
);

/**
 * @swagger
 * /api/inscripciones/usuario/{id_usu}:
 *   get:
 *     summary: Obtener inscripciones de un usuario
 *     tags: [Inscripciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_usu
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Inscripciones del usuario obtenidas
 *       401:
 *         description: No autenticado
 */
router.get(
  '/usuario/:id_usu',
  authMiddleware,
  registroController.obtenerInscripcionesPorUsuario.bind(registroController)
);

/**
 * @swagger
 * /api/inscripciones/evento/{id_reg_evt}:
 *   get:
 *     summary: Obtener inscripciones por registro de evento
 *     tags: [Inscripciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_reg_evt
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del registro del evento (detalle_eventos)
 *     responses:
 *       200:
 *         description: Inscripciones obtenidas
 *       401:
 *         description: No autenticado
 */
router.get(
  '/evento/:id_reg_evt',
  authMiddleware,
  registroController.obtenerInscripcionesPorEvento.bind(registroController)
);

/**
 * @swagger
 * /api/inscripciones/estadisticas/{id_reg_evt}:
 *   get:
 *     summary: Obtener estadísticas de inscripciones
 *     tags: [Inscripciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_reg_evt
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del registro de evento
 *     responses:
 *       200:
 *         description: Estadísticas calculadas
 *       401:
 *         description: No autenticado
 */
router.get(
  '/estadisticas/:id_reg_evt',
  authMiddleware,
  registroController.obtenerEstadisticasEvento.bind(registroController)
);

/**
 * @swagger
 * /api/inscripciones/{id}:
 *   get:
 *     summary: Obtener una inscripción específica
 *     tags: [Inscripciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la inscripción
 *     responses:
 *       200:
 *         description: Inscripción encontrada
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Inscripción no encontrada
 */
router.get(
  '/:id',
  authMiddleware,
  registroController.obtenerInscripcionPorId.bind(registroController)
);

/**
 * @swagger
 * /api/inscripciones/{id}:
 *   delete:
 *     summary: Cancelar una inscripción
 *     tags: [Inscripciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la inscripción
 *     responses:
 *       200:
 *         description: Inscripción cancelada correctamente
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Inscripción no encontrada
 */
router.delete(
  '/:id',
  authMiddleware,
  registroController.cancelarInscripcion.bind(registroController)
);

export default router;
