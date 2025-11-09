/**
 * Rutas para registro de eventos e inscripciones
 */

import { Router } from 'express';
import { registroController } from '../controllers/registro.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// ============= REGISTRO EVENTO =============
// Vincula detalles con niveles académicos

/**
 * GET /api/registro-evento/estudiante/mis-cursos
 * Obtiene cursos disponibles para el estudiante según su nivel
 */
router.get(
  '/estudiante/mis-cursos',
  authMiddleware,
  registroController.obtenerCursosParaEstudiante.bind(registroController)
);

/**
 * GET /api/registro-evento/filtrar
 * Obtiene cursos con filtros (admin/encargado)
 * Query params: id_instructor, id_niv, id_carrera, estado, solo_mis_cursos
 */
router.get(
  '/filtrar',
  authMiddleware,
  registroController.obtenerCursosFiltrados.bind(registroController)
);

/**
 * POST /api/registro-evento
 * Crea un nuevo registro de evento (vincula detalle con nivel)
 * Requiere: id_det, id_niv
 */
router.post(
  '/',
  authMiddleware,
  registroController.crearRegistroEvento.bind(registroController)
);

/**
 * GET /api/registro-evento
 * Obtiene todos los registros de eventos
 */
router.get(
  '/',
  authMiddleware,
  registroController.obtenerTodosRegistros.bind(registroController)
);

/**
 * GET /api/registro-evento/detalle/:id_det
 * Obtiene registros por detalle
 */
router.get(
  '/detalle/:id_det',
  authMiddleware,
  registroController.obtenerRegistrosPorDetalle.bind(registroController)
);

/**
 * GET /api/registro-evento/nivel/:id_niv
 * Obtiene registros por nivel
 */
router.get(
  '/nivel/:id_niv',
  authMiddleware,
  registroController.obtenerRegistrosPorNivel.bind(registroController)
);

/**
 * GET /api/registro-evento/:id
 * Obtiene un registro de evento por ID
 */
router.get(
  '/:id',
  authMiddleware,
  registroController.obtenerRegistroPorId.bind(registroController)
);

/**
 * PUT /api/registro-evento/:id
 * Actualiza un registro de evento
 */
router.put(
  '/:id',
  authMiddleware,
  registroController.actualizarRegistroEvento.bind(registroController)
);

/**
 * DELETE /api/registro-evento/:id
 * Elimina un registro de evento
 */
router.delete(
  '/:id',
  authMiddleware,
  registroController.eliminarRegistroEvento.bind(registroController)
);

export default router;
