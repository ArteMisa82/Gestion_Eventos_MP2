import { Router } from 'express';
import { MaterialesController } from '../controllers/materiales.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const materialesController = new MaterialesController();

// ============================================
// RUTAS PÚBLICAS (sin autenticación)
// ============================================

/**
 * GET /api/materiales/:idDetalle/visibles
 * Obtener materiales visibles para estudiantes de un curso
 */
router.get(
  '/:idDetalle/visibles',
  materialesController.obtenerMaterialesVisibles.bind(materialesController)
);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

/**
 * GET /api/materiales/:idDetalle/todos
 * Obtener TODOS los materiales de un curso (incluye no visibles)
 * Solo para profesor/encargado
 */
router.get(
  '/:idDetalle/todos',
  authMiddleware,
  materialesController.obtenerTodosMateriales.bind(materialesController)
);

/**
 * POST /api/materiales
 * Subir nuevo material al curso
 * Solo para profesor/encargado
 */
router.post(
  '/',
  authMiddleware,
  materialesController.subirMaterial.bind(materialesController)
);

/**
 * PATCH /api/materiales/:idMaterial/visibilidad
 * Cambiar visibilidad de un material (visible/oculto para estudiantes)
 * Solo para profesor/encargado
 */
router.patch(
  '/:idMaterial/visibilidad',
  authMiddleware,
  materialesController.cambiarVisibilidad.bind(materialesController)
);

/**
 * DELETE /api/materiales/:idMaterial
 * Eliminar (desactivar) un material
 * Solo para profesor/encargado
 */
router.delete(
  '/:idMaterial',
  authMiddleware,
  materialesController.eliminarMaterial.bind(materialesController)
);

export default router;
