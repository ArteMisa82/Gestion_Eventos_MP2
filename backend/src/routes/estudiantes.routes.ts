/**
 * Rutas para gestión de estudiantes y niveles
 */

import { Router } from 'express';
import { estudiantesController } from '../controllers/estudiantes.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * GET /api/estudiantes/mis-niveles
 * Obtiene niveles activos del estudiante autenticado
 */
router.get(
  '/mis-niveles',
  authMiddleware,
  estudiantesController.obtenerMisNiveles.bind(estudiantesController)
);

/**
 * POST /api/estudiantes/asignar-nivel
 * Asigna un estudiante a un nivel (admin/encargado)
 * Requiere: id_usu, id_niv, observaciones (opcional)
 */
router.post(
  '/asignar-nivel',
  authMiddleware,
  estudiantesController.asignarEstudianteANivel.bind(estudiantesController)
);

/**
 * PUT /api/estudiantes/:id_est/desactivar
 * Desactiva un estudiante de un nivel
 */
router.put(
  '/:id_est/desactivar',
  authMiddleware,
  estudiantesController.desactivarEstudianteDeNivel.bind(estudiantesController)
);

/**
 * GET /api/estudiantes/nivel/:id_niv
 * Obtiene estudiantes de un nivel
 * Query params: incluir_inactivos=true
 */
router.get(
  '/nivel/:id_niv',
  authMiddleware,
  estudiantesController.obtenerEstudiantesPorNivel.bind(estudiantesController)
);

/**
 * GET /api/estudiantes/historial/:id_usu
 * Obtiene historial de niveles de un estudiante
 */
router.get(
  '/historial/:id_usu',
  authMiddleware,
  estudiantesController.obtenerHistorialEstudiante.bind(estudiantesController)
);

export default router;
