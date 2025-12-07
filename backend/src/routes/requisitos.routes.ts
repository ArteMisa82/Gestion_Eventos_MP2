import { Router } from 'express';
import { authenticateToken } from '../middlewares/auth.middleware';
import * as requisitosController from '../controllers/requisitos.controller';

const router = Router();

/**
 * @route   POST /api/requisitos
 * @desc    Crear un requisito para un evento
 * @access  Private (Admin/Responsable)
 */
router.post('/', authenticateToken, (req, res) => requisitosController.crearRequisito(req, res));

/**
 * @route   GET /api/requisitos/detalle/:idDetalle
 * @desc    Obtener todos los requisitos de un evento
 * @access  Public
 */
router.get('/detalle/:idDetalle', (req, res) => requisitosController.obtenerRequisitosPorDetalle(req, res));

/**
 * @route   POST /api/requisitos/completar
 * @desc    Completar un requisito
 * @access  Private
 */
router.post('/completar', authenticateToken, (req, res) => requisitosController.completarRequisito(req, res));

/**
 * @route   GET /api/requisitos/verificar/:numRegPer/:idDetalle
 * @desc    Verificar si todos los requisitos están completos
 * @access  Private
 */
router.get(
  '/verificar/:numRegPer/:idDetalle',
  authenticateToken,
  (req, res) => requisitosController.verificarRequisitosCompletos(req, res)
);

/**
 * @route   GET /api/requisitos/completados/:numRegPer
 * @desc    Obtener requisitos completados por un estudiante
 * @access  Private
 */
router.get(
  '/completados/:numRegPer',
  authenticateToken,
  (req, res) => requisitosController.obtenerRequisitosCompletados(req, res)
);

/**
 * @route   DELETE /api/requisitos/:idRequisito
 * @desc    Eliminar un requisito
 * @access  Private (Admin/Responsable)
 */
router.delete('/:idRequisito', authenticateToken, (req, res) => requisitosController.eliminarRequisito(req, res));

export default router;
