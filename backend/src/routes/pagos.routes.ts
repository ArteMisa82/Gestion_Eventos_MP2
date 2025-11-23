import { Router } from 'express';
import { PagosController } from '../controllers/pagos.controller';
import multer from 'multer';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware'; 

const router = Router();
const pagosController = new PagosController();

const upload = multer({ dest: 'uploads/comprobantes/' });

/**
 * @swagger
 * /api/pagos/tarifas/{idEvento}:
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
 *         description: Evento sin tarifas asignadas
 */
router.get('/tarifas/:idEvento', pagosController.getTarifas);

/**
 * @swagger
 * /api/pagos/registrar:
 *   post:
 *     summary: Registrar pago manual
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
 *                 format: float
 *               metodoPago:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pago registrado correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/registrar', pagosController.registrarPago);

// PDF Orden de Pago
/**
 * @swagger
 * /api/pagos/orden_pago/{numRegPer}:
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
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Identificador inválido
 *       404:
 *         description: Registro o evento no encontrado
 */
router.get('/orden_pago/:numRegPer', pagosController.getPaymentOrder);

/**
 * @swagger
 * /api/pagos/subir-comprobante/{numRegPer}:
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
 *         description: Comprobante cargado y pendiente de validación
 *       400:
 *         description: Archivo faltante o inválido
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Registro de inscripción no encontrado
 */
router.post(
    '/subir-comprobante/:numRegPer',
    authMiddleware,                // <--- Nombre correcto del middleware
    upload.single('comprobante'),  // Campo del archivo
    pagosController.subirComprobante
);

/**
 * @swagger
 * /api/pagos/validar/{numRegPer}:
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
 *     responses:
 *       200:
 *         description: Resultado de la validación
 *       400:
 *         description: Estado inválido
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Pago o registro no encontrado
 */
router.put(
    '/validar/:numRegPer',
    adminMiddleware,               // <--- Nombre correcto
    pagosController.validarComprobante
);

export default router;
