import { Router } from "express";
import { certificadoUsuarioController } from "../controllers/certificadoUsuario.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: CertificadosUsuario
 *   description: Gestión de múltiples certificados por usuario
 */

/**
 * @swagger
 * /api/certificados-usuario/{id}:
 *   post:
 *     summary: Generar y guardar un certificado para un usuario
 *     tags: [CertificadosUsuario]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Certificado de Participación"
 *               id_est:
 *                 type: integer
 *                 example: 7
 *               num_reg_per:
 *                 type: integer
 *                 example: 1456
 *     responses:
 *       200:
 *         description: Certificado generado y registrado en la BD
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Certificado generado y guardado."
 *                 certificado:
 *                   type: object
 *       400:
 *         description: Datos incompletos
 *       500:
 *         description: Error generando certificado
 */
router.post('/:id', certificadoUsuarioController.generar.bind(certificadoUsuarioController));

/**
 * @swagger
 * /api/certificados-usuario/{id}:
 *   get:
 *     summary: Listar todos los certificados generados por un usuario
 *     tags: [CertificadosUsuario]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de certificados del usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id_cert:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   url_cert:
 *                     type: string
 *                   creado_en:
 *                     type: string
 *       500:
 *         description: Error obteniendo certificados
 */
router.get('/:id', certificadoUsuarioController.listar.bind(certificadoUsuarioController));

export default router;
