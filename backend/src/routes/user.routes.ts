// Se actualizo la ruta y las carpetas del user para controlesuser.routes.ts
// src/routes/user.routes.ts

import { Router } from 'express';
import multer from 'multer';
import { UserController } from '../controllers/user.controller';

const router = Router();
const controller = new UserController();

// Configuración de multer para archivos temporales
const upload = multer({ dest: 'uploads/' });

/* ---------------------------------------------------
   RUTAS REST CORREGIDAS Y ORDENADAS
   Primero las rutas específicas (evitan conflictos)
   Luego las rutas genéricas
--------------------------------------------------- */

// 🔍 Buscar usuario por ID (esta SIEMPRE va primero)
router.get('/id/:id', controller.getById.bind(controller));

// 🔍 Buscar usuario por cédula (ruta específica)
router.get('/ced/:ced', controller.getByCedula.bind(controller));

// 📌 Obtener todos los usuarios
router.get('/', controller.getAll.bind(controller));

// ➕ Crear usuario con imagen opcional
router.post('/', upload.single('img_usu'), controller.create.bind(controller));

// ✏️ Actualizar usuario por cédula con imagen opcional
router.put('/ced/:ced', upload.single('img_usu'), controller.update.bind(controller));

// ❌ Eliminar usuario por cédula
router.delete('/ced/:ced', controller.delete.bind(controller));

export default router;



//Aquí definimos las rutas REST: