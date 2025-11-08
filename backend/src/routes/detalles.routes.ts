import { Router } from 'express';
import { EventosController } from '../controllers/eventos.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new EventosController();

// GET /api/detalles/:id - Obtener un detalle específico
router.get('/:id', authMiddleware, controller.obtenerDetallePorId.bind(controller));

// PUT /api/detalles/:id - RESPONSABLE o ADMIN: Actualizar detalle
router.put('/:id', authMiddleware, controller.actualizarDetalle.bind(controller));

// DELETE /api/detalles/:id - RESPONSABLE o ADMIN: Eliminar detalle
router.delete('/:id', authMiddleware, controller.eliminarDetalle.bind(controller));

export default router;
