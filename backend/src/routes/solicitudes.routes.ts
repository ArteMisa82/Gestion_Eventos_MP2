import { Router } from 'express';
import { SolicitudesController } from '../controllers/solicitudes.controller';

const router = Router();
const controller = new SolicitudesController();

/**
 * @swagger
 * tags:
 *   name: Solicitudes
 *   description: Gestión de solicitudes y revisión del comité
 */

/**
 * @swagger
 * /api/solicitudes:
 *   get:
 *     summary: Listar todas las solicitudes
 *     tags: [Solicitudes]
 *     responses:
 *       200:
 *         description: Lista de solicitudes obtenida correctamente
 *       500:
 *         description: Error al obtener las solicitudes
 */
router.get('/', controller.listar.bind(controller));

/**
 * @swagger
 * /api/solicitudes/comite:
 *   get:
 *     summary: Listar solicitudes para revisión del comité
 *     tags: [Solicitudes]
 *     responses:
 *       200:
 *         description: Datos enviados al front para página del comité
 *       500:
 *         description: Error al obtener solicitudes
 */
router.get('/comite', controller.listarParaComite.bind(controller));

/**
 * @swagger
 * /api/solicitudes:
 *   post:
 *     summary: Crear una nueva solicitud
 *     tags: [Solicitudes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               usuarioId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Solicitud creada correctamente
 *       500:
 *         description: Error al crear solicitud
 */
router.post('/', controller.crear.bind(controller));

export default router;
