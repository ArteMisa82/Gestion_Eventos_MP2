// backend/src/routes/certificados.routes.ts

import { Router } from 'express';
import { CertificadoController } from '../controllers/certificado.controller'; 

const router = Router();
const certificadoController = new CertificadoController();

/**
 * @swagger
 * tags:
 *   name: Certificados
 *   description: Generación y gestión de certificados PDF
 */

/**
 * @swagger
 * /api/certificados/generate/{registrationId}:
 *   get:
 *     summary: Generar certificado en PDF
 *     tags: [Certificados]
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del registro de la persona (registro_personas)
 *     responses:
 *       200:
 *         description: Certificado generado correctamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: El participante no cumple los requisitos para obtener el certificado
 *       404:
 *         description: Registro no encontrado
 */
router.get('/generate/:registrationId', certificadoController.generateCertificate);

/**
 * @swagger
 * /api/certificados/guardar:
 *   post:
 *     summary: Guardar URL del certificado generado
 *     tags: [Certificados]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_reg_per
 *               - url_certificado
 *             properties:
 *               id_reg_per:
 *                 type: string
 *                 example: "123"
 *               url_certificado:
 *                 type: string
 *                 format: uri
 *                 example: "https://mis-certificados.uta.edu/certificado.pdf"
 *     responses:
 *       200:
 *         description: Certificado guardado correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/guardar', certificadoController.saveCertificate);

export default router;
