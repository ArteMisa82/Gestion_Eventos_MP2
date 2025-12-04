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
 * @swagger
 * /api/registro-personas:
 *   post:
 *     summary: Registrar al usuario autenticado en un curso
 *     tags: [Registro Personas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_reg_evt
 *             properties:
 *               id_reg_evt:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registro exitoso
 *       400:
 *         description: Datos faltantes
 *       401:
 *         description: No autenticado
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
 * @swagger
 * /api/registro-personas/validar:
 *   post:
 *     summary: Validar si el usuario puede registrarse en un curso
 *     tags: [Registro Personas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_reg_evt
 *             properties:
 *               id_reg_evt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resultado de la validación
 *       400:
 *         description: Datos faltantes
 *       401:
 *         description: No autenticado
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
 * @swagger
 * /api/registro-personas/validar-completo:
 *   post:
 *     summary: Ejecutar validación completa antes de inscribirse
 *     tags: [Registro Personas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_reg_evt
 *             properties:
 *               id_reg_evt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resultado detallado de la validación
 *       400:
 *         description: Datos faltantes
 *       401:
 *         description: No autenticado
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
 * @swagger
 * /api/registro-personas/mis-registros:
 *   get:
 *     summary: Listar registros del usuario autenticado
 *     tags: [Registro Personas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Registros obtenidos
 *       401:
 *         description: No autenticado
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
 * @swagger
 * /api/registro-personas/usuario/{id_usu}:
 *   get:
 *     summary: Obtener registros de un usuario específico
 *     tags: [Registro Personas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_usu
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Registros del usuario
 *       401:
 *         description: No autenticado
 */
router.get('/usuario/:id_usu', authMiddleware, async (req, res, next) => {
  try {
    const id_usu = Number(req.params.id_usu);

    const registros = await registroService.obtenerRegistrosUsuario(id_usu);

    res.json({
      success: true,
      data: registros,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/registro-personas/{num_reg_per}:
 *   delete:
 *     summary: Cancelar un registro de curso
 *     tags: [Registro Personas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: num_reg_per
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Registro cancelado
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Registro no encontrado
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
