/**
 * Rutas para gestión de carreras (ADMIN)
 */

import { Router } from 'express';
import { carrerasController } from '../controllers/carreras.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Carreras
 *   description: Administración de carreras académicas
 */

/**
 * @swagger
 * /api/carreras/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de carreras
 *     tags: [Carreras]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas correctamente
 *       401:
 *         description: No autenticado
 */
router.get(
  '/estadisticas',
  authMiddleware,
  carrerasController.obtenerEstadisticas.bind(carrerasController)
);

/**
 * @swagger
 * /api/carreras:
 *   post:
 *     summary: Crear una nueva carrera
 *     tags: [Carreras]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_car
 *               - nom_car
 *             properties:
 *               id_car:
 *                 type: string
 *                 example: "SOF"
 *               nom_car:
 *                 type: string
 *                 example: "Ingeniería de Software"
 *     responses:
 *       201:
 *         description: Carrera creada exitosamente
 *       400:
 *         description: Datos inválidos o carrera existente
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authMiddleware,
  carrerasController.crearCarrera.bind(carrerasController)
);

/**
 * @swagger
 * /api/carreras:
 *   get:
 *     summary: Listar todas las carreras
 *     tags: [Carreras]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de carreras obtenida
 *       401:
 *         description: No autenticado
 */
router.get(
  '/',
  authMiddleware,
  carrerasController.obtenerTodas.bind(carrerasController)
);

/**
 * @swagger
 * /api/carreras/{id}:
 *   get:
 *     summary: Obtener información de una carrera
 *     tags: [Carreras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la carrera
 *     responses:
 *       200:
 *         description: Carrera encontrada
 *       404:
 *         description: Carrera no encontrada
 */
router.get(
  '/:id',
  authMiddleware,
  carrerasController.obtenerPorId.bind(carrerasController)
);

/**
 * @swagger
 * /api/carreras/{id}:
 *   put:
 *     summary: Actualizar una carrera
 *     tags: [Carreras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la carrera a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom_car:
 *                 type: string
 *                 example: "Carrera actualizada"
 *     responses:
 *       200:
 *         description: Carrera actualizada correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Carrera no encontrada
 */
router.put(
  '/:id',
  authMiddleware,
  carrerasController.actualizarCarrera.bind(carrerasController)
);

/**
 * @swagger
 * /api/carreras/{id}:
 *   delete:
 *     summary: Eliminar una carrera
 *     tags: [Carreras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la carrera a eliminar
 *     responses:
 *       200:
 *         description: Carrera eliminada correctamente
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Carrera no encontrada
 */
router.delete(
  '/:id',
  authMiddleware,
  carrerasController.eliminarCarrera.bind(carrerasController)
);

export default router;
