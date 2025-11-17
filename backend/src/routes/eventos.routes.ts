import { Router } from 'express';
import { EventosController } from '../controllers/eventos.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new EventosController();

// ==========================================
// RUTAS PÚBLICAS (SIN AUTENTICACIÓN)
// ==========================================
router.get('/publicos', controller.obtenerEventosPublicados.bind(controller));

// ==========================================
// RUTAS AUTENTICADAS
// ==========================================
// Rutas públicas (con autenticación)
router.get('/', authMiddleware, controller.obtenerTodos.bind(controller));
router.get('/usuarios/administrativos', authMiddleware, controller.obtenerUsuariosAdministrativos.bind(controller));
router.get('/usuarios/responsables-activos', authMiddleware, controller.obtenerResponsablesActivos.bind(controller));
router.get('/mis-eventos', authMiddleware, controller.obtenerMisEventos.bind(controller));
router.get('/:id', authMiddleware, controller.obtenerPorId.bind(controller));

// Rutas ADMIN (requieren ser administrador)
router.post('/', authMiddleware, adminMiddleware, controller.crear.bind(controller));
router.put('/:id/responsable', authMiddleware, adminMiddleware, controller.asignarResponsable.bind(controller));
router.delete('/:id', authMiddleware, adminMiddleware, controller.eliminar.bind(controller));

// Rutas RESPONSABLE o ADMIN (requieren ser el responsable del evento o admin)
router.put('/:id', authMiddleware, controller.actualizar.bind(controller));

// ==========================================
// RUTAS PARA DETALLE_EVENTOS
// ==========================================

// Crear detalle de evento (RESPONSABLE o ADMIN)
router.post('/:id/detalles', authMiddleware, controller.crearDetalle.bind(controller));

// Listar detalles de un evento
router.get('/:id/detalles', authMiddleware, controller.obtenerDetallesPorEvento.bind(controller));

export default router;
