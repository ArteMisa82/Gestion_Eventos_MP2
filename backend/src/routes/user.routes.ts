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

// 🔍 Buscar usuario por ID
router.get('/id/:id', controller.getById.bind(controller));

// 🔍 Buscar usuario por cédula
router.get('/ced/:ced', controller.getByCedula.bind(controller));

// 📌 Obtener todos los usuarios
router.get('/', controller.getAll.bind(controller));

// ➕ Crear usuario
router.post('/', upload.single('img_usu'), controller.create.bind(controller));

// 📄 Subir PDF (NUEVA RUTA - ruta específica primero)
router.put(
  '/upload-pdf/:id',
  upload.single('pdf'),
  controller.uploadPDF.bind(controller)
);

// ✏️ Actualizar usuario por cédula (ruta específica con imagen)
router.put('/ced/:ced', upload.single('img_usu'), controller.update.bind(controller));

// ❌ Eliminar usuario (ruta específica)
router.delete('/ced/:ced', controller.delete.bind(controller));

// ✏️ Actualizar usuario por ID (ruta genérica al final - JSON sin imagen)
router.put('/:id', controller.updateById.bind(controller));

export default router;


//Aquí definimos las rutas REST: