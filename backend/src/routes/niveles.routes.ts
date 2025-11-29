/**
 * Rutas para gestión de niveles académicos (ADMIN)
 */

import { Router } from 'express';
import { nivelesController } from '../controllers/niveles.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/niveles/carrera/{id_car}:
 *   get:
 *     summary: Listar niveles por carrera
 *     tags: [Niveles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_car
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de niveles asociados a la carrera
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Carrera sin niveles registrados
 */
router.get(
  '/carrera/:id_car',
  authMiddleware,
  nivelesController.obtenerPorCarrera.bind(nivelesController)
);

/**
 * @swagger
 * /api/niveles:
 *   post:
 *     summary: Crear un nuevo nivel
 *     tags: [Niveles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_niv
 *               - nom_niv
 *               - org_cur_niv
 *               - id_car
 *             properties:
 *               id_niv:
 *                 type: string
 *               nom_niv:
 *                 type: string
 *               org_cur_niv:
 *                 type: string
 *               id_car:
 *                 type: string
 *     responses:
 *       201:
 *         description: Nivel creado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authMiddleware,
  nivelesController.crearNivel.bind(nivelesController)
);

/**
 * @swagger
 * /api/niveles:
 *   get:
 *     summary: Listar todos los niveles
 *     tags: [Niveles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista completa de niveles
 *       401:
 *         description: No autenticado
 */
router.get(
  '/',
  authMiddleware,
  nivelesController.obtenerTodos.bind(nivelesController)
);

/**
 * @swagger
 * /api/niveles/{id}:
 *   get:
 *     summary: Obtener nivel por ID
 *     tags: [Niveles]
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
 *         description: Información del nivel solicitado
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Nivel no encontrado
 */
router.get(
  '/:id',
  authMiddleware,
  nivelesController.obtenerPorId.bind(nivelesController)
);

/**
 * @swagger
 * /api/niveles/{id}:
 *   put:
 *     summary: Actualizar un nivel existente
 *     tags: [Niveles]
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
 *               nom_niv:
 *                 type: string
 *               org_cur_niv:
 *                 type: string
 *               id_car:
 *                 type: string
 *     responses:
 *       200:
 *         description: Nivel actualizado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Nivel no encontrado
 */
router.put(
  '/:id',
  authMiddleware,
  nivelesController.actualizarNivel.bind(nivelesController)
);

/**
 * @swagger
 * /api/niveles/{id}:
 *   delete:
 *     summary: Eliminar nivel
 *     tags: [Niveles]
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
 *         description: Nivel eliminado correctamente
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Nivel no encontrado
 */
router.delete(
  '/:id',
  authMiddleware,
  nivelesController.eliminarNivel.bind(nivelesController)
);

export default router;
