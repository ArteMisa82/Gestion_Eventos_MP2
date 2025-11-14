// backend/src/routes/pagos.routes.ts

import { Router } from 'express';
import { PagosController } from '../controllers/pagos.controller'; 

const router = Router();
const pagosController = new PagosController();


router.get('/tarifas/:idEvento', pagosController.getTarifas);
router.post('/registrar', pagosController.registrarPago);

export default router;