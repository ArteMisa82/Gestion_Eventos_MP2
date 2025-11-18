// backend/src/routes/certificados.routes.ts

import { Router } from 'express';
import { CertificadoController } from '../controllers/certificado.controller'; 

const router = Router();
const certificadoController = new CertificadoController();

// Nuevo flujo: Obtiene los datos, valida condiciones y genera el PDF.
router.get('/generate/:registrationId', certificadoController.generateCertificate);

// Ruta para guardar la URL del PDF (flujo POST separado)
router.post('/guardar', certificadoController.saveCertificate);

export default router;
