import { Router } from 'express';
import { RegistroService } from '../services/registro.service';
import { authMiddleware } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/errorHandler.middleware';

const router = Router();
const registroService = new RegistroService();

// ============================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// ============================================

/**
 * POST /api/registro-personas
 * Registrar al usuario autenticado en un curso
 * 
 * Body:
 * {
 *   "id_reg_evt": "REG001"
 * }
 */
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError('Usuario no autenticado', 401);
    }

    const { id_reg_evt } = req.body;

    if (!id_reg_evt) {
      throw new AppError('El campo id_reg_evt es requerido', 400);
    }

    const resultado = await registroService.registrarPersona({
      id_usu: userId,
      id_reg_evt,
    });

    res.status(201).json({
      success: true,
      message: 'Registro exitoso en el curso',
      data: resultado,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/registro-personas/validar
 * Validar si el usuario puede registrarse en un curso
 * 
 * Body:
 * {
 *   "id_reg_evt": "REG001"
 * }
 */
router.post('/validar', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError('Usuario no autenticado', 401);
    }

    const { id_reg_evt } = req.body;

    if (!id_reg_evt) {
      throw new AppError('El campo id_reg_evt es requerido', 400);
    }

    const validacion = await registroService.validarRegistro(userId, id_reg_evt);

    res.json({
      success: true,
      data: validacion,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/registro-personas/validar-completo
 * Validación COMPLETA pre-inscripción
 * Verifica: datos personales, documentos, permisos, cupo, costo
 * 
 * Body:
 * {
 *   "id_reg_evt": "REG001"
 * }
 */
router.post('/validar-completo', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError('Usuario no autenticado', 401);
    }

    const { id_reg_evt } = req.body;

    if (!id_reg_evt) {
      throw new AppError('El campo id_reg_evt es requerido', 400);
    }

    const validacion = await registroService.validarPreInscripcion(userId, id_reg_evt);

    res.json({
      success: true,
      data: validacion,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/registro-personas/mis-registros
 * Obtener todos los registros del usuario autenticado
 */
router.get('/mis-registros', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      throw new AppError('Usuario no autenticado', 401);
    }

    const registros = await registroService.obtenerRegistrosUsuario(userId);

    res.json({
      success: true,
      data: registros,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/registro-personas/:num_reg_per
 * Cancelar un registro (solo si el curso está en INSCRIPCIONES)
 */
router.delete('/:num_reg_per', authMiddleware, async (req, res, next) => {
  try {
    const userId = (req as any).userId;
    const { num_reg_per } = req.params;

    if (!userId) {
      throw new AppError('Usuario no autenticado', 401);
    }

    await registroService.cancelarRegistro(Number(num_reg_per), userId);

    res.json({
      success: true,
      message: 'Registro cancelado correctamente',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
