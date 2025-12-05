import { Router } from 'express';
import { MaterialesController } from '../controllers/materiales.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const materialesController = new MaterialesController();

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================

/**
 * @swagger
 * tags:
 *   name: Materiales
 *   description: Gestión de materiales de apoyo para eventos
 */

/**
 * @swagger
 * /api/materiales/{idDetalle}/visibles:
 *   get:
 *     summary: Obtener materiales visibles
 *     description: Devuelve los materiales marcados como visibles para los participantes del detalle de evento indicado.
 *     tags: [Materiales]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: idDetalle
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del detalle del evento
 *     responses:
 *       200:
 *         description: Materiales visibles obtenidos correctamente
 *       404:
 *         description: Detalle no encontrado
 */
router.get(
  '/:idDetalle/visibles',
  materialesController.obtenerMaterialesVisibles.bind(materialesController)
);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

/**
 * @swagger
 * /api/materiales/{idDetalle}/todos:
 *   get:
 *     summary: Obtener todos los materiales del evento
 *     tags: [Materiales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idDetalle
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del detalle del evento
 *     responses:
 *       200:
 *         description: Materiales obtenidos correctamente
 *       401:
 *         description: No autenticado
 */
router.get(
  '/:idDetalle/todos',
  authMiddleware,
  materialesController.obtenerTodosMateriales.bind(materialesController)
);

/**
 * @swagger
 * /api/materiales:
 *   post:
 *     summary: Subir nuevo material
 *     tags: [Materiales]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_det
 *               - nom_mat
 *               - mat_det
 *             properties:
 *               id_det:
 *                 type: string
 *                 example: "DET-45"
 *               nom_mat:
 *                 type: string
 *                 example: "Guía de ejercicios"
 *               des_mat:
 *                 type: string
 *                 example: "Documento PDF con ejercicios"
 *               mat_det:
 *                 type: string
 *                 description: URL o contenido base64 del material
 *                 example: "https://storage.uta.edu/materiales/guia.pdf"
 *               tip_mat:
 *                 type: string
 *                 example: "application/pdf"
 *               tam_mat:
 *                 type: number
 *                 example: 1024
 *               vis_est_mat:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Material subido correctamente
 *       400:
 *         description: Campos faltantes
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authMiddleware,
  materialesController.subirMaterial.bind(materialesController)
);

/**
 * @swagger
 * /api/materiales/{idMaterial}/visibilidad:
 *   patch:
 *     summary: Cambiar visibilidad de un material
 *     tags: [Materiales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idMaterial
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del material
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - visible
 *             properties:
 *               visible:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Visibilidad actualizada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 */
router.patch(
  '/:idMaterial/visibilidad',
  authMiddleware,
  materialesController.cambiarVisibilidad.bind(materialesController)
);

/**
 * @swagger
 * /api/materiales/{idMaterial}:
 *   delete:
 *     summary: Eliminar material de un curso
 *     tags: [Materiales]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: idMaterial
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Material eliminado correctamente
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Material no encontrado
 */
router.delete(
  '/:idMaterial',
  authMiddleware,
  materialesController.eliminarMaterial.bind(materialesController)
);

export default router;
