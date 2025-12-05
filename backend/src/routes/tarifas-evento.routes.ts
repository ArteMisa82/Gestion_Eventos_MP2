import { Router } from 'express';
import { TarifasEventoController } from '../controllers/tarifas-evento.controller';
import { requireAuth } from '../middlewares/session.middleware';

const controller = new TarifasEventoController();
const router = Router();

// POST /api/tarifas-evento
router.post('/', requireAuth, controller.crearActualizarTarifa.bind(controller));

export default router;
