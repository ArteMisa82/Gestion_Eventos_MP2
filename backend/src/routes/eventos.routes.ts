import { Router } from 'express';
import { EventosController } from '../controllers/eventos.controller';

const router = Router();
const controller = new EventosController();

router.get('/', controller.obtenerTodos.bind(controller));

export default router;
