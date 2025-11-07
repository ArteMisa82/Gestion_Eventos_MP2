// Se actualizo la ruta y las carpetas del user para controlesuser.routes.ts
import { Router } from 'express';
import { UserController } from '@/controllers/user.controller';

const router = Router();
const controller = new UserController();

// CRUD de usuarios
router.get('/', controller.getAll.bind(controller));
router.get('/:id', controller.getById.bind(controller));
router.post('/', controller.create.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

// Panel con cursos (en proceso y completados)
router.get('/:id/panel', controller.getPanelCursos.bind(controller));

export default router;
