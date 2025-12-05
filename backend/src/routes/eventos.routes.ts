import { Router } from 'express';
import { EventosController } from '../controllers/eventos.controller';
import { requireAuth, requireAdmin } from '../middlewares/session.middleware';

const router = Router();
const controller = new EventosController();

/**
 * @swagger
 * tags:
 *   name: Eventos
 *   description: Gestión de eventos académicos
 */

/**
 * @swagger
 * /api/eventos/publicos:
 *   get:
 *     summary: Obtener eventos publicados (sin autenticación)
 *     tags: [Eventos]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de eventos públicos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Evento'
 */
// ==========================================
// RUTAS PÚBLICAS (SIN AUTENTICACIÓN)
// ==========================================
router.get('/publicos', controller.obtenerEventosPublicados.bind(controller));

/**
 * @swagger
 * /api/eventos/publico/{id}:
 *   get:
 *     summary: Obtener un evento público por ID (sin autenticación)
 *     tags: [Eventos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Detalles del evento
 *       404:
 *         description: Evento no encontrado
 */
router.get('/publico/:id', controller.obtenerPorId.bind(controller));

/**
 * @swagger
 * /api/eventos:
 *   get:
 *     summary: Obtener todos los eventos (requiere autenticación)
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de eventos
 *       401:
 *         description: No autenticado
 */
// ==========================================
// RUTAS AUTENTICADAS
// ==========================================
// Rutas públicas (con autenticación)
router.get('/', requireAuth, controller.obtenerTodos.bind(controller));

/**
 * @swagger
 * /api/eventos/usuarios/administrativos:
 *   get:
 *     summary: Listar usuarios con rol administrativo
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuarios administrativos disponibles
 */
router.get('/usuarios/administrativos', requireAuth, controller.obtenerUsuariosAdministrativos.bind(controller));

/**
 * @swagger
 * /api/eventos/usuarios/responsables-activos:
 *   get:
 *     summary: Listar responsables activos de eventos
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Responsables con eventos asignados
 */
router.get('/usuarios/responsables-activos', requireAuth, controller.obtenerResponsablesActivos.bind(controller));

/**
 * @swagger
 * /api/eventos/mis-eventos:
 *   get:
 *     summary: Obtener eventos asignados al usuario autenticado
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Eventos asociados al usuario
 */
router.get('/mis-eventos', requireAuth, controller.obtenerMisEventos.bind(controller));

/**
 * @swagger
 * /api/eventos/{id}:
 *   get:
 *     summary: Obtener evento por ID
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Detalles del evento
 *       404:
 *         description: Evento no encontrado
 */
router.get('/:id', requireAuth, controller.obtenerPorId.bind(controller));

/**
 * @swagger
 * /api/eventos:
 *   post:
 *     summary: Crear un nuevo evento (ADMIN)
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom_evt
 *               - fec_evt
 *               - lug_evt
 *               - mod_evt
 *             properties:
 *               nom_evt:
 *                 type: string
 *                 example: Curso de TypeScript
 *               fec_evt:
 *                 type: string
 *                 format: date
 *                 example: 2025-12-01
 *               lug_evt:
 *                 type: string
 *                 example: Auditorio Principal
 *               mod_evt:
 *                 type: string
 *                 example: Presencial
 *               ima_evt:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Requiere rol de administrador
 */
// Rutas ADMIN (requieren ser administrador)
router.post('/', requireAuth, requireAdmin, controller.crear.bind(controller));

/**
 * @swagger
 * /api/eventos/{id}/responsable:
 *   put:
 *     summary: Asignar responsable a un evento (ADMIN)
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_responsable:
 *                 type: string
 *                 example: "1"
 *     responses:
 *       200:
 *         description: Responsable asignado
 *       403:
 *         description: Requiere rol de administrador
 */
router.put('/:id/responsable', requireAuth, requireAdmin, controller.asignarResponsable.bind(controller));

/**
 * @swagger
 * /api/eventos/{id}:
 *   delete:
 *     summary: Eliminar un evento (ADMIN)
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento eliminado
 *       403:
 *         description: Requiere rol de administrador
 */
router.delete('/:id', requireAuth, requireAdmin, controller.eliminar.bind(controller));

/**
 * @swagger
 * /api/eventos/{id}:
 *   put:
 *     summary: Actualizar evento (responsable o administrador)
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEventoDto'
 *     responses:
 *       200:
 *         description: Evento actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Acceso denegado
 *       404:
 *         description: Evento no encontrado
 */
router.put('/:id', requireAuth, controller.actualizar.bind(controller));

// ==========================================
// RUTAS PARA DETALLE_EVENTOS
// ==========================================

/**
 * @swagger
 * /api/eventos/{id}/detalles:
 *   post:
 *     summary: Crear detalle para un evento
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cup_det
 *               - hor_det
 *               - are_det
 *               - cat_det
 *               - tip_evt
 *             properties:
 *               cup_det:
 *                 type: integer
 *               hor_det:
 *                 type: number
 *               are_det:
 *                 type: string
 *               cat_det:
 *                 type: string
 *               tip_evt:
 *                 type: string
 *               val_evt:
 *                 type: number
 *                 format: float
 *               des_det:
 *                 type: string
 *     responses:
 *       201:
 *         description: Detalle creado correctamente
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Acceso denegado
 */
router.post('/:id/detalles', requireAuth, controller.crearDetalle.bind(controller));

/**
 * @swagger
 * /api/eventos/{id}/detalles:
 *   get:
 *     summary: Listar detalles asociados a un evento
 *     tags: [Eventos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles del evento
 *       401:
 *         description: No autenticado
 */
router.get('/:id/detalles', requireAuth, controller.obtenerDetallesPorEvento.bind(controller));

export default router;
