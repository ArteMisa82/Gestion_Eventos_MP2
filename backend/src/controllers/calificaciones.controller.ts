import { Request, Response, NextFunction } from 'express';
import { CalificacionesService, AsignarNotaDTO } from '../services/calificaciones.service';
import { AppError } from '../middlewares/errorHandler.middleware';

const calificacionesService = new CalificacionesService();

export class CalificacionesController {
  /**
   * GET /api/calificaciones/:idDetalle
   * Obtener todas las calificaciones de un curso (para profesor/responsable)
   */
  async obtenerCalificaciones(req: Request, res: Response, next: NextFunction) {
    try {
      const { idDetalle } = req.params;
      const userId = (req as any).userId;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const calificaciones = await calificacionesService.obtenerCalificaciones(idDetalle, userId);

      res.json({
        success: true,
        data: calificaciones,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/calificaciones/:idDetalle/asignar
   * Asignar o actualizar nota final y/o asistencia a un estudiante
   */
  async asignarCalificacion(req: Request, res: Response, next: NextFunction) {
    try {
      const { idDetalle } = req.params;
      const userId = (req as any).userId;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const { id_reg_per, not_fin_evt, asi_evt_det } = req.body;

      if (!id_reg_per) {
        throw new AppError('El campo id_reg_per es requerido', 400);
      }

      const data: AsignarNotaDTO = {
        id_reg_per,
        not_fin_evt,
        asi_evt_det,
      };

      const resultado = await calificacionesService.asignarCalificacion(idDetalle, userId, data);

      res.json({
        success: true,
        message: 'Calificación asignada correctamente',
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/calificaciones/:idDetalle/asignar-lote
   * Asignar calificaciones a múltiples estudiantes
   */
  async asignarCalificacionesLote(req: Request, res: Response, next: NextFunction) {
    try {
      const { idDetalle } = req.params;
      const userId = (req as any).userId;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const { calificaciones } = req.body;

      if (!Array.isArray(calificaciones) || calificaciones.length === 0) {
        throw new AppError('El campo calificaciones debe ser un array no vacío', 400);
      }

      const resultado = await calificacionesService.asignarCalificacionesLote(
        idDetalle,
        userId,
        calificaciones
      );

      res.json({
        success: true,
        message: `${resultado.exitosos} calificaciones asignadas correctamente`,
        data: resultado,
      });
    } catch (error) {
      next(error);
    }
  }
}
