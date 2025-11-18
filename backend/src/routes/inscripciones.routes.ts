/**
 * Rutas para inscripciones (registro_personas)
 */

import { Router } from 'express';
import { registroController } from '../controllers/registro.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// ============= INSCRIPCIONES =============
// Registro de usuarios en eventos

/**
 * POST /api/inscripciones
 * Inscribe un usuario a un evento
 * Requiere: id_usu, id_reg_evt
 */
router.post(
  '/',
  authMiddleware,
  registroController.inscribirUsuario.bind(registroController)
);

/**
 * POST /api/inscripciones/validar
 * Valida si un usuario puede inscribirse
 * Requiere: id_usu, id_reg_evt
 */
router.post(
  '/validar',
  authMiddleware,
  registroController.validarInscripcion.bind(registroController)
);

/**
 * GET /api/inscripciones
 * Obtiene todas las inscripciones
 */
router.get(
  '/',
  authMiddleware,
  registroController.obtenerTodasInscripciones.bind(registroController)
);

/**
 * GET /api/inscripciones/usuario/:id_usu
 * Obtiene inscripciones de un usuario
 */
router.get(
  '/usuario/:id_usu',
  authMiddleware,
  registroController.obtenerInscripcionesPorUsuario.bind(registroController)
);

/**
 * GET /api/inscripciones/evento/:id_reg_evt
 * Obtiene inscripciones de un registro de evento
 */
router.get(
  '/evento/:id_reg_evt',
  authMiddleware,
  registroController.obtenerInscripcionesPorEvento.bind(registroController)
);

/**
 * GET /api/inscripciones/estadisticas/:id_reg_evt
 * Obtiene estadísticas de inscripciones por evento
 */
router.get(
  '/estadisticas/:id_reg_evt',
  authMiddleware,
  registroController.obtenerEstadisticasEvento.bind(registroController)
);

/**
 * GET /api/inscripciones/:id
 * Obtiene una inscripción por ID
 */
router.get(
  '/:id',
  authMiddleware,
  registroController.obtenerInscripcionPorId.bind(registroController)
);

/**
 * DELETE /api/inscripciones/:id
 * Cancela una inscripción
 */
router.delete(
  '/:id',
  authMiddleware,
  registroController.cancelarInscripcion.bind(registroController)
);

export default router;
