// backend/src/routes/certificados.routes.ts

import { Router } from 'express';
import { CertificadoController } from '../controllers/certificado.controller';
import { CertificadoService } from '../services/certificado.service';

const router = Router();
const certificadoController = new CertificadoController();
const certificadoService = new CertificadoService();

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
router.get('/generate/:registrationId', (req, res) =>
  certificadoController.generateCertificate(req, res)
);

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
router.post('/guardar', (req, res) =>
  certificadoController.saveCertificate(req, res)
);

/**
 * @swagger
 * /api/certificados/verificar/{registrationId}:
 *   get:
 *     summary: Verificar si existe el certificado y si es válido
 *     tags: [Certificados]
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resultado de la verificación
 */
router.get('/verificar/:registrationId', (req, res) =>
  certificadoController.verifyCertificate(req, res)
);

/**
 * @swagger
 * /api/certificados/generate-and-save/{registrationId}:
 *   post:
 *     summary: Generar el certificado, guardarlo en disco y registrar la URL en la BD
 *     tags: [Certificados]
 *     parameters:
 *       - in: path
 *         name: registrationId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Certificado generado y guardado
 *       400:
 *         description: ID inválido
 *       500:
 *         description: Error interno del servidor
 */
router.post('/generate-and-save/:registrationId', async (req, res) => {
  try {
    const registrationId = parseInt(req.params.registrationId, 10);
    if (isNaN(registrationId)) {
      return res.status(400).json({ message: 'ID de registro inválido.' });
    }

    const certificateUrl = await certificadoService.generateAndSaveCertificate(
      registrationId
    );

    return res.json({
      message: 'Certificado generado, guardado en disco y registrado en BD.',
      certificateUrl,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Error al generar y guardar el certificado.',
      error: (error as Error).message,
    });
  }
});

export default router;
