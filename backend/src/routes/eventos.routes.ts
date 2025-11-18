import { Router } from 'express';
import { EventosController } from '../controllers/eventos.controller';
import { requireAuth, requireAdmin } from '../middlewares/session.middleware';

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
router.get('/', requireAuth, controller.obtenerTodos.bind(controller));
router.get('/usuarios/administrativos', requireAuth, controller.obtenerUsuariosAdministrativos.bind(controller));
router.get('/usuarios/responsables-activos', requireAuth, controller.obtenerResponsablesActivos.bind(controller));
router.get('/mis-eventos', requireAuth, controller.obtenerMisEventos.bind(controller));
router.get('/:id', requireAuth, controller.obtenerPorId.bind(controller));

// Rutas ADMIN (requieren ser administrador)
router.post('/', requireAuth, requireAdmin, controller.crear.bind(controller));
router.put('/:id/responsable', requireAuth, requireAdmin, controller.asignarResponsable.bind(controller));
router.delete('/:id', requireAuth, requireAdmin, controller.eliminar.bind(controller));

// Rutas RESPONSABLE o ADMIN (requieren ser el responsable del evento o admin)
router.put('/:id', requireAuth, controller.actualizar.bind(controller));

// ==========================================
// RUTAS PARA DETALLE_EVENTOS
// ==========================================

// Crear detalle de evento (RESPONSABLE o ADMIN)
router.post('/:id/detalles', requireAuth, controller.crearDetalle.bind(controller));

// Listar detalles de un evento
router.get('/:id/detalles', requireAuth, controller.obtenerDetallesPorEvento.bind(controller));

export default router;
