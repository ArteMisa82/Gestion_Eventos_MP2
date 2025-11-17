import { Request, Response, NextFunction } from 'express';
import { MaterialesService } from '../services/materiales.service';
import { AppError } from '../middlewares/errorHandler.middleware';

const materialesService = new MaterialesService();

export class MaterialesController {
  /**
   * GET /api/materiales/:idDetalle/visibles
   * Obtener materiales visibles para estudiantes
   */
  async obtenerMaterialesVisibles(req: Request, res: Response, next: NextFunction) {
    try {
      const { idDetalle } = req.params;

      const materiales = await materialesService.obtenerMaterialesVisibles(idDetalle);

      res.json({
        success: true,
        data: materiales,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/materiales/:idDetalle/todos
   * Obtener TODOS los materiales (requiere autenticación - profesor/encargado)
   */
  async obtenerTodosMateriales(req: Request, res: Response, next: NextFunction) {
    try {
      const { idDetalle } = req.params;
      const userId = (req as any).userId;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const materiales = await materialesService.obtenerTodosMateriales(idDetalle, userId);

      res.json({
        success: true,
        data: materiales,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/materiales
   * Subir nuevo material (requiere autenticación - profesor/encargado)
   */
  async subirMaterial(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const { id_det, nom_mat, des_mat, mat_det, tip_mat, tam_mat, vis_est_mat } = req.body;

      if (!id_det || !nom_mat || !mat_det) {
        throw new AppError('Faltan campos requeridos: id_det, nom_mat, mat_det', 400);
      }

      const nuevoMaterial = await materialesService.subirMaterial({
        id_det,
        nom_mat,
        des_mat,
        mat_det,
        tip_mat,
        tam_mat,
        id_usu_subida: userId,
        vis_est_mat,
      });

      res.status(201).json({
        success: true,
        message: 'Material subido correctamente',
        data: nuevoMaterial,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/materiales/:idMaterial/visibilidad
   * Cambiar visibilidad de un material (requiere autenticación - profesor/encargado)
   */
  async cambiarVisibilidad(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const { idMaterial } = req.params;
      const { visible } = req.body;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      if (typeof visible !== 'boolean') {
        throw new AppError('El campo "visible" debe ser true o false', 400);
      }

      const materialActualizado = await materialesService.cambiarVisibilidad(
        Number(idMaterial),
        userId,
        visible
      );

      res.json({
        success: true,
        message: `Material ${visible ? 'visible' : 'oculto'} para estudiantes`,
        data: materialActualizado,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/materiales/:idMaterial
   * Eliminar material (requiere autenticación - profesor/encargado)
   */
  async eliminarMaterial(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const { idMaterial } = req.params;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const resultado = await materialesService.eliminarMaterial(Number(idMaterial), userId);

      res.json({
        success: true,
        message: resultado.mensaje,
      });
    } catch (error) {
      next(error);
    }
  }
}
