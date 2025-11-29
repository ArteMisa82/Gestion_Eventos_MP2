import { Router } from 'express';
import { SolicitudesController } from '../controllers/solicitudes.controller';

const router = Router();
const controller = new SolicitudesController();

router.post('/', controller.crear.bind(controller));
router.get('/', controller.listar.bind(controller));
router.get('/comite', controller.listarParaComite.bind(controller));

export default router;
