// backend/src/routes/pagos.routes.ts

import { Router } from 'express';
import { PagosController } from '../controllers/pagos.controller'; 

const router = Router();
const pagosController = new PagosController();


router.get('/tarifas/:idEvento', pagosController.getTarifas);
router.post('/registrar', pagosController.registrarPago);

// NUEVA RUTA para generar y descargar la Orden de Pago en PDF
router.get('/orden_pago/:numRegPer', pagosController.getPaymentOrder);

export default router;