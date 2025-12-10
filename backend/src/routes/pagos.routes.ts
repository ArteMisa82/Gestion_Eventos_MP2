// backend/src/routes/pagos.routes.ts
import { Router } from 'express';
import { PagosController } from '../controllers/pagos.controller';
import multer from 'multer';
import path from 'path';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const pagosController = new PagosController();

// Configuración de subida de archivos con extensión preservada
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/comprobantes/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.pdf'; // Por defecto .pdf si no tiene extensión
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ storage });


/**
 * @swagger
 * tags:
 *   name: Pagos
 *   description: Operaciones relacionadas con pagos, órdenes y comprobantes
 */

/**
 * @swagger
 * /pagos/tarifas/{idEvento}:
 *   get:
 *     summary: Obtener tarifas disponibles para un evento
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: idEvento
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tarifas encontradas
 *       404:
 *         description: Evento sin tarifas
 */
router.get('/tarifas/:idEvento', pagosController.getTarifas.bind(pagosController));

/**
 * @swagger
 * /pagos/registrar:
 *   post:
 *     summary: Registrar un pago manual
 *     tags: [Pagos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idRegistroPersona
 *               - valorPago
 *               - metodoPago
 *             properties:
 *               idRegistroPersona:
 *                 type: integer
 *               valorPago:
 *                 type: number
 *               metodoPago:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pago registrado correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/registrar', pagosController.registrarPago.bind(pagosController));

/**
 * @swagger
 * /pagos/orden_pago/{numRegPer}:
 *   get:
 *     summary: Generar orden de pago en PDF
 *     tags: [Pagos]
 *     parameters:
 *       - in: path
 *         name: numRegPer
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: PDF generado correctamente
 *       400:
 *         description: Identificador inválido o requisitos faltantes
 *       404:
 *         description: Registro o evento no encontrado
 */
router.get('/orden_pago/:numRegPer', pagosController.getPaymentOrder.bind(pagosController));

/**
 * @swagger
 * /pagos/subir-comprobante/{numRegPer}:
 *   post:
 *     summary: Subir comprobante de pago
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: numRegPer
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               comprobante:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Comprobante subido
 *       400:
 *         description: Archivo faltante
 */
router.post(
    '/subir-comprobante/:numRegPer',
    authMiddleware,                 // Requiere login
    upload.single('comprobante'),   // Subida del archivo
    pagosController.subirComprobante.bind(pagosController)
);

/**
 * @swagger
 * /pagos/pendientes-validacion:
 *   get:
 *     summary: Obtener pagos pendientes de validación
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pagos pendientes
 *       500:
 *         description: Error del servidor
 */
router.get(
    '/pendientes-validacion',
    adminMiddleware,  // Solo responsables/admin pueden ver pagos pendientes
    pagosController.getPagosPendientes.bind(pagosController)
);

/**
 * @swagger
 * /pagos/validar/{numRegPer}:
 *   put:
 *     summary: Validar comprobante de pago
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: numRegPer
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [APROBAR, RECHAZAR]
 *               comentarios:
 *                 type: string
 *     responses:
 *       200:
 *         description: Validación realizada
 *       400:
 *         description: Estado inválido
 */
router.put(
    '/validar/:numRegPer',
    adminMiddleware,                // Solo el responsable/admin puede validar
    pagosController.validarComprobante.bind(pagosController)
);

export default router;
