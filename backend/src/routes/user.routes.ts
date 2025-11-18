// Se actualizo la ruta y las carpetas del user para controlesuser.routes.ts
// src/routes/user.routes.ts
// src/routes/user.routes.ts
import { Router } from 'express';
import multer from 'multer';
import { UserController } from '../controllers/user.controller';

const router = Router();
const controller = new UserController();

// Configuración de multer para archivos temporales
const upload = multer({ dest: 'uploads/' });

// Rutas REST
router.get('/', controller.getAll.bind(controller));

// Buscar usuario por cédula
router.get('/:ced', controller.getByCedula.bind(controller));

// Buscar usuario por ID
router.get('/id/:id', controller.getById.bind(controller));

// Crear usuario con imagen opcional
router.post('/', upload.single('img_usu'), controller.create.bind(controller));

// Actualizar usuario por cédula con imagen opcional
router.put('/:ced', upload.single('img_usu'), controller.update.bind(controller));

// Eliminar usuario por cédula
router.delete('/:ced', controller.delete.bind(controller));

export default router;


//Aquí definimos las rutas REST: