// backend/src/routes/certificados.routes.ts

import { Router } from 'express';
import { CertificadoController } from '../controllers/certificado.controller'; 

const router = Router();
const certificadoController = new CertificadoController();

router.get('/data/:registrationId', certificadoController.getCertificateData);

router.post('/generar', certificadoController.generateCertificate);

router.post('/guardar', certificadoController.saveCertificate);

export default router;