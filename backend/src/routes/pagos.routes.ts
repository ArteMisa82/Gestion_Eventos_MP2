import { Router } from 'express';
import { PagosController } from '../controllers/pagos.controller';
import multer from 'multer';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware'; 

const router = Router();
const pagosController = new PagosController();

const upload = multer({ dest: 'uploads/comprobantes/' });


router.get('/tarifas/:idEvento', pagosController.getTarifas);
router.post('/registrar', pagosController.registrarPago);

// PDF Orden de Pago
router.get('/orden_pago/:numRegPer', pagosController.getPaymentOrder);

router.post(
    '/subir-comprobante/:numRegPer',
    authMiddleware,                // <--- Nombre correcto del middleware
    upload.single('comprobante'),  // Campo del archivo
    pagosController.subirComprobante
);

router.put(
    '/validar/:numRegPer',
    adminMiddleware,               // <--- Nombre correcto
    pagosController.validarComprobante
);

export default router;
