// Se actualizo la ruta y las carpetas del user para controlesuser.routes.ts
// src/routes/user.routes.ts
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';

const router = Router();
const controller = new UserController();

router.get('/', controller.getAll.bind(controller));
router.get('/:ced', controller.getByCedula.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:ced', controller.update.bind(controller));
router.delete('/:ced', controller.delete.bind(controller));

export default router;


//Aquí definimos las rutas REST: