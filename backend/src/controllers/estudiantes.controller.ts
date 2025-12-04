/**
 * Controlador para gestión de estudiantes
 */

import { Request, Response } from 'express';
import { estudiantesService } from '../services/estudiantes.service';
import { successResponse } from '../utils/response.util';

export class EstudiantesController {
  /**
   * POST /api/estudiantes/asignar-nivel
   * Asigna un estudiante a un nivel (solo admin/encargado)
   */
  async asignarEstudianteANivel(req: Request, res: Response) {
    try {
      const { id_usu, id_niv, observaciones } = req.body;

      if (!id_usu || !id_niv) {
        return res.status(400).json({
          success: false,
          message: 'id_usu e id_niv son requeridos'
        });
      }

      const estudiante = await estudiantesService.asignarEstudianteANivel(
        parseInt(id_usu),
        id_niv,
        observaciones
      );

      return res.status(201).json(
        successResponse(estudiante, 'Estudiante asignado al nivel exitosamente')
      );
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /api/estudiantes/:id_est/desactivar
   * Desactiva un estudiante de un nivel
   */
  async desactivarEstudianteDeNivel(req: Request, res: Response) {
    try {
      const { id_est } = req.params;

      const estudiante = await estudiantesService.desactivarEstudianteDeNivel(
        parseInt(id_est)
      );

      return res.status(200).json(
        successResponse(estudiante, 'Estudiante desactivado del nivel')
      );
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/estudiantes/nivel/:id_niv
   * Obtiene estudiantes de un nivel
   */
  async obtenerEstudiantesPorNivel(req: Request, res: Response) {
    try {
      const { id_niv } = req.params;
      const { incluir_inactivos } = req.query;

      const soloActivos = incluir_inactivos !== 'true';

      const estudiantes = await estudiantesService.obtenerEstudiantesPorNivel(
        id_niv,
        soloActivos
      );

      return res.status(200).json(
        successResponse(estudiantes, 'Estudiantes obtenidos exitosamente')
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/estudiantes/historial/:id_usu
   * Obtiene historial de niveles de un estudiante
   */
  async obtenerHistorialEstudiante(req: Request, res: Response) {
    try {
      const { id_usu } = req.params;

      const historial = await estudiantesService.obtenerHistorialEstudiante(
        parseInt(id_usu)
      );

      return res.status(200).json(
        successResponse(historial, 'Historial obtenido exitosamente')
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/estudiantes/mis-niveles
   * Obtiene niveles activos del estudiante autenticado
   */
  async obtenerMisNiveles(req: Request, res: Response) {
    try {
      const id_usu = (req as any).userId; // Del token JWT

      const niveles = await estudiantesService.obtenerNivelesActivosEstudiante(id_usu);

      return res.status(200).json(
        successResponse(niveles, 'Niveles activos obtenidos exitosamente')
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/estudiantes/instructor/:id_usu
   * Verifica si el usuario es instructor en algún detalle de evento
   */
  async verificarInstructor(req: Request, res: Response) {
    try {
      const { id_usu } = req.params;

      const detalles = await estudiantesService.obtenerDetallesPorInstructor(
        parseInt(id_usu)
      );

      return res.status(200).json(
        successResponse(detalles, 'Detalles donde es instructor obtenidos exitosamente')
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

export const estudiantesController = new EstudiantesController();
