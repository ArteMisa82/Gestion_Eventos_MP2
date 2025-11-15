/**
 * Rutas para gestión de niveles académicos (ADMIN)
 */

import { Router } from 'express';
import { nivelesController } from '../controllers/niveles.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * GET /api/niveles/carrera/:id_car
 * Obtiene niveles por carrera
 */
router.get(
  '/carrera/:id_car',
  authMiddleware,
  nivelesController.obtenerPorCarrera.bind(nivelesController)
);

/**
 * POST /api/niveles
 * Crea un nuevo nivel
 * Requiere: id_niv, nom_niv, org_cur_niv, id_car
 */
router.post(
  '/',
  authMiddleware,
  nivelesController.crearNivel.bind(nivelesController)
);

/**
 * GET /api/niveles
 * Obtiene todos los niveles
 */
router.get(
  '/',
  authMiddleware,
  nivelesController.obtenerTodos.bind(nivelesController)
);

/**
 * GET /api/niveles/:id
 * Obtiene un nivel por ID con detalles
 */
router.get(
  '/:id',
  authMiddleware,
  nivelesController.obtenerPorId.bind(nivelesController)
);

/**
 * PUT /api/niveles/:id
 * Actualiza un nivel
 * Body: nom_niv, org_cur_niv, id_car
 */
router.put(
  '/:id',
  authMiddleware,
  nivelesController.actualizarNivel.bind(nivelesController)
);

/**
 * DELETE /api/niveles/:id
 * Elimina un nivel
 */
router.delete(
  '/:id',
  authMiddleware,
  nivelesController.eliminarNivel.bind(nivelesController)
);

export default router;
