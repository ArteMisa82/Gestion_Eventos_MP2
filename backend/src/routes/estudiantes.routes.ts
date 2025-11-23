/**
 * Rutas para gestión de estudiantes y niveles
 */

import { Router } from 'express';
import { estudiantesController } from '../controllers/estudiantes.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Estudiantes
 *   description: Administración de estudiantes y sus niveles académicos
 */

/**
 * @swagger
 * /api/estudiantes/mis-niveles:
 *   get:
 *     summary: Obtener niveles activos del estudiante
 *     tags: [Estudiantes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Niveles obtenidos correctamente
 *       401:
 *         description: No autenticado
 */
router.get(
  '/mis-niveles',
  authMiddleware,
  estudiantesController.obtenerMisNiveles.bind(estudiantesController)
);

/**
 * @swagger
 * /api/estudiantes/asignar-nivel:
 *   post:
 *     summary: Asignar estudiante a un nivel
 *     tags: [Estudiantes]
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
 *               - id_niv
 *             properties:
 *               id_usu:
 *                 type: string
 *                 example: "14"
 *               id_niv:
 *                 type: string
 *                 example: "SOF-3"
 *               observaciones:
 *                 type: string
 *                 example: "Requiere tutoría adicional"
 *     responses:
 *       200:
 *         description: Estudiante asignado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 */
router.post(
  '/asignar-nivel',
  authMiddleware,
  estudiantesController.asignarEstudianteANivel.bind(estudiantesController)
);

/**
 * @swagger
 * /api/estudiantes/{id_est}/desactivar:
 *   put:
 *     summary: Desactivar estudiante de un nivel
 *     tags: [Estudiantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_est
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del registro estudiante-nivel
 *     responses:
 *       200:
 *         description: Estudiante desactivado del nivel
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Registro no encontrado
 */
router.put(
  '/:id_est/desactivar',
  authMiddleware,
  estudiantesController.desactivarEstudianteDeNivel.bind(estudiantesController)
);

/**
 * @swagger
 * /api/estudiantes/nivel/{id_niv}:
 *   get:
 *     summary: Listar estudiantes por nivel
 *     tags: [Estudiantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_niv
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del nivel académico
 *       - in: query
 *         name: incluir_inactivos
 *         schema:
 *           type: boolean
 *         description: Incluir estudiantes desactivados
 *     responses:
 *       200:
 *         description: Estudiantes obtenidos correctamente
 *       401:
 *         description: No autenticado
 */
router.get(
  '/nivel/:id_niv',
  authMiddleware,
  estudiantesController.obtenerEstudiantesPorNivel.bind(estudiantesController)
);

/**
 * @swagger
 * /api/estudiantes/historial/{id_usu}:
 *   get:
 *     summary: Obtener historial de niveles de un estudiante
 *     tags: [Estudiantes]
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
 *         description: Historial obtenido correctamente
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Usuario no encontrado
 */
router.get(
  '/historial/:id_usu',
  authMiddleware,
  estudiantesController.obtenerHistorialEstudiante.bind(estudiantesController)
);

export default router;
