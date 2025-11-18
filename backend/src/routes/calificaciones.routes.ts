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
 * GET /api/calificaciones/:idDetalle
 * Obtener todas las calificaciones de un curso
 * Solo para instructor o responsable del evento
 */
router.get(
  '/:idDetalle',
  authMiddleware,
  calificacionesController.obtenerCalificaciones.bind(calificacionesController)
);

/**
 * PUT /api/calificaciones/:idDetalle/asignar
 * Asignar o actualizar nota final y/o asistencia a un estudiante
 * Solo para instructor o responsable del evento
 * 
 * Body:
 * {
 *   "id_reg_per": 123,
 *   "not_fin_evt": 85.5,    // Opcional: Nota final (0-100)
 *   "asi_evt_det": 90        // Opcional: Asistencia porcentaje (0-100)
 * }
 */
router.put(
  '/:idDetalle/asignar',
  authMiddleware,
  calificacionesController.asignarCalificacion.bind(calificacionesController)
);

/**
 * PUT /api/calificaciones/:idDetalle/asignar-lote
 * Asignar calificaciones a múltiples estudiantes
 * Solo para instructor o responsable del evento
 * 
 * Body:
 * {
 *   "calificaciones": [
 *     { "id_reg_per": 123, "not_fin_evt": 85.5, "asi_evt_det": 90 },
 *     { "id_reg_per": 124, "not_fin_evt": 92.0, "asi_evt_det": 95 }
 *   ]
 * }
 */
router.put(
  '/:idDetalle/asignar-lote',
  authMiddleware,
  calificacionesController.asignarCalificacionesLote.bind(calificacionesController)
);

export default router;
