/**
 * Rutas para registro de eventos e inscripciones
 */

import { Router } from 'express';
import { registroController } from '../controllers/registro.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { verificarRequisitosEvento } from '../middlewares/verificarRequisitos.middleware';


const router = Router();

// ============= REGISTRO EVENTO =============
// Vincula detalles con niveles académicos

/**
 * @swagger
 * /api/registro-evento/estudiante/mis-cursos:
 *   get:
 *     summary: Listar cursos disponibles para el estudiante autenticado
 *     tags: [Registro Evento]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cursos disponibles para el nivel del estudiante
 *       401:
 *         description: No autenticado
 */
router.get(
  '/estudiante/mis-cursos',
  authMiddleware,
  registroController.obtenerCursosParaEstudiante.bind(registroController)
);

/**
 * @swagger
 * /api/registro-evento/filtrar:
 *   get:
 *     summary: Filtrar cursos registrados por criterio
 *     tags: [Registro Evento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id_instructor
 *         schema:
 *           type: integer
 *       - in: query
 *         name: id_niv
 *         schema:
 *           type: string
 *       - in: query
 *         name: id_carrera
 *         schema:
 *           type: string
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *       - in: query
 *         name: solo_mis_cursos
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *     responses:
 *       200:
 *         description: Cursos filtrados
 *       401:
 *         description: No autenticado
 */
router.get(
  '/filtrar',
  authMiddleware,
  registroController.obtenerCursosFiltrados.bind(registroController)
);

/**
 * @swagger
 * /api/registro-evento:
 *   post:
 *     summary: Crear registro de evento para un nivel
 *     tags: [Registro Evento]
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
 *               - id_niv
 *             properties:
 *               id_det:
 *                 type: string
 *               id_niv:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registro de evento creado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 */
router.post(
  '/',
  authMiddleware,
  verificarRequisitosEvento, // 👈 AQUÍ LA MAGIA
  registroController.crearRegistroEvento.bind(registroController)
);

/**
 * @swagger
 * /api/registro-evento:
 *   get:
 *     summary: Listar todos los registros de evento
 *     tags: [Registro Evento]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Registros obtenidos
 *       401:
 *         description: No autenticado
 */
router.get(
  '/',
  authMiddleware,
  registroController.obtenerTodosRegistros.bind(registroController)
);

/**
 * @swagger
 * /api/registro-evento/detalle/{id_det}:
 *   get:
 *     summary: Listar registros de evento por detalle
 *     tags: [Registro Evento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_det
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registros asociados al detalle
 *       401:
 *         description: No autenticado
 */
router.get(
  '/detalle/:id_det',
  authMiddleware,
  registroController.obtenerRegistrosPorDetalle.bind(registroController)
);

/**
 * @swagger
 * /api/registro-evento/nivel/{id_niv}:
 *   get:
 *     summary: Listar registros de evento por nivel académico
 *     tags: [Registro Evento]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_niv
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registros asociados al nivel
 *       401:
 *         description: No autenticado
 */
router.get(
  '/nivel/:id_niv',
  authMiddleware,
  registroController.obtenerRegistrosPorNivel.bind(registroController)
);

/**
 * @swagger
 * /api/registro-evento/{id}:
 *   get:
 *     summary: Obtener registro de evento por ID
 *     tags: [Registro Evento]
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
 *         description: Registro encontrado
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Registro no encontrado
 */
router.get(
  '/:id',
  authMiddleware,
  registroController.obtenerRegistroPorId.bind(registroController)
);

/**
 * @swagger
 * /api/registro-evento/{id}:
 *   put:
 *     summary: Actualizar registro de evento
 *     tags: [Registro Evento]
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
 *               id_det:
 *                 type: string
 *               id_niv:
 *                 type: string
 *     responses:
 *       200:
 *         description: Registro actualizado
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Registro no encontrado
 */
router.put(
  '/:id',
  authMiddleware,
  registroController.actualizarRegistroEvento.bind(registroController)
);

/**
 * @swagger
 * /api/registro-evento/{id}:
 *   delete:
 *     summary: Eliminar registro de evento
 *     tags: [Registro Evento]
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
 *         description: Registro eliminado
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Registro no encontrado
 */
router.delete(
  '/:id',
  authMiddleware,
  registroController.eliminarRegistroEvento.bind(registroController)
);

export default router;
