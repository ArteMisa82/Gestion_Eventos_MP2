// Se actualizo la ruta y las carpetas del user para controlesuser.routes.ts
// src/routes/user.routes.ts

// src/routes/user.routes.ts

import { Router } from 'express';
import multer from 'multer';
import { UserController } from '../controllers/user.controller';

const router = Router();
const controller = new UserController();

// Configuración de multer
const upload = multer({ dest: 'uploads/' });

/* ---------------------------------------------------
   RUTAS REST CORREGIDAS Y COMPLETAS
--------------------------------------------------- */

/**
 * @swagger
 * /api/user/id/{id}:
 *   get:
 *     summary: Obtener usuario por identificador numérico
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/id/:id', controller.getById.bind(controller));

/**
 * @swagger
 * /api/user/ced/{ced}:
 *   get:
 *     summary: Obtener usuario por cédula
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: ced
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/ced/:ced', controller.getByCedula.bind(controller));

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Listar usuarios registrados
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Listado de usuarios
 */
router.get('/', controller.getAll.bind(controller));

/**
 * @swagger
 * /api/user:
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - cor_usu
 *               - pas_usu
 *               - nom_usu
 *               - ape_usu
 *             properties:
 *               cor_usu:
 *                 type: string
 *                 format: email
 *               pas_usu:
 *                 type: string
 *               nom_usu:
 *                 type: string
 *               nom_seg_usu:
 *                 type: string
 *               ape_usu:
 *                 type: string
 *               ape_seg_usu:
 *                 type: string
 *               tel_usu:
 *                 type: string
 *               ced_usu:
 *                 type: string
 *               niv_usu:
 *                 type: string
 *               img_usu:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Usuario creado correctamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', upload.single('img_usu'), controller.create.bind(controller));

/**
 * @swagger
 * /api/user/upload-pdf/{id}:
 *   put:
 *     summary: Subir documento PDF del usuario
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - pdf
 *             properties:
 *               pdf:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: PDF actualizado
 *       400:
 *         description: Archivo faltante o inválido
 *       404:
 *         description: Usuario no encontrado
 */
router.put(
  '/upload-pdf/:id',
  upload.single('pdf'),
  controller.uploadPDF.bind(controller)
);

/**
 * @swagger
 * /api/user/ced/{ced}:
 *   put:
 *     summary: Actualizar usuario por cédula (admite imagen)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: ced
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               cor_usu:
 *                 type: string
 *                 format: email
 *               pas_usu:
 *                 type: string
 *               nom_usu:
 *                 type: string
 *               ape_usu:
 *                 type: string
 *               tel_usu:
 *                 type: string
 *               img_usu:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/ced/:ced', upload.single('img_usu'), controller.update.bind(controller));

/**
 * @swagger
 * /api/user/ced/{ced}:
 *   delete:
 *     summary: Eliminar usuario por cédula
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: ced
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/ced/:ced', controller.delete.bind(controller));

/**
 * @swagger
 * /api/user/{id}:
 *   put:
 *     summary: Actualizar usuario por ID
 *     tags: [Usuarios]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cor_usu:
 *                 type: string
 *               nom_usu:
 *                 type: string
 *               ape_usu:
 *                 type: string
 *               tel_usu:
 *                 type: string
 *               niv_usu:
 *                 type: string
 *               adm_usu:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', controller.updateById.bind(controller));

export default router;


//Aquí definimos las rutas REST: