/**
 * Rutas para gestión de carreras (ADMIN)
 */

import { Router } from 'express';
import { carrerasController } from '../controllers/carreras.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * GET /api/carreras/estadisticas
 * Obtiene estadísticas de carreras
 */
router.get(
  '/estadisticas',
  authMiddleware,
  carrerasController.obtenerEstadisticas.bind(carrerasController)
);

/**
 * POST /api/carreras
 * Crea una nueva carrera
 * Requiere: id_car, nom_car
 */
router.post(
  '/',
  authMiddleware,
  carrerasController.crearCarrera.bind(carrerasController)
);

/**
 * GET /api/carreras
 * Obtiene todas las carreras
 */
router.get(
  '/',
  authMiddleware,
  carrerasController.obtenerTodas.bind(carrerasController)
);

/**
 * GET /api/carreras/:id
 * Obtiene una carrera por ID
 */
router.get(
  '/:id',
  authMiddleware,
  carrerasController.obtenerPorId.bind(carrerasController)
);

/**
 * PUT /api/carreras/:id
 * Actualiza una carrera
 * Body: nom_car
 */
router.put(
  '/:id',
  authMiddleware,
  carrerasController.actualizarCarrera.bind(carrerasController)
);

/**
 * DELETE /api/carreras/:id
 * Elimina una carrera
 */
router.delete(
  '/:id',
  authMiddleware,
  carrerasController.eliminarCarrera.bind(carrerasController)
);

export default router;
