// Se actualizo la ruta y las carpetas del user para controlesuser.routes.ts
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
router.get('/:ced', controller.getByCedula.bind(controller));

// Subida de imágenes incluida en create y update
router.post('/', upload.single('img_usu'), controller.create.bind(controller));
router.put('/:ced', upload.single('img_usu'), controller.update.bind(controller));

router.delete('/:ced', controller.delete.bind(controller));

export default router;


//Aquí definimos las rutas REST: