/**
 * Controlador para gestión de carreras (ADMIN)
 */

import { Request, Response } from 'express';
import { carrerasService } from '../services/carreras.service';
import { successResponse } from '../utils/response.util';

export class CarrerasController {
  /**
   * POST /api/carreras
   * Crea una nueva carrera
   */
  async crearCarrera(req: Request, res: Response) {
    try {
      const { id_car, nom_car } = req.body;

      if (!id_car || !nom_car) {
        return res.status(400).json({
          success: false,
          message: 'id_car y nom_car son requeridos'
        });
      }

      const carrera = await carrerasService.crearCarrera({
        id_car,
        nom_car
      });

      return res.status(201).json(
        successResponse(carrera, 'Carrera creada exitosamente')
      );
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/carreras
   * Obtiene todas las carreras
   */
  async obtenerTodas(req: Request, res: Response) {
    try {
      const carreras = await carrerasService.obtenerTodas();
      return res.status(200).json(
        successResponse(carreras, 'Carreras obtenidas exitosamente')
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/carreras/estadisticas
   * Obtiene estadísticas de carreras
   */
  async obtenerEstadisticas(req: Request, res: Response) {
    try {
      const estadisticas = await carrerasService.obtenerEstadisticas();
      return res.status(200).json(
        successResponse(estadisticas, 'Estadísticas obtenidas exitosamente')
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/carreras/:id
   * Obtiene una carrera por ID
   */
  async obtenerPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const carrera = await carrerasService.obtenerPorId(id);
      return res.status(200).json(
        successResponse(carrera, 'Carrera encontrada')
      );
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /api/carreras/:id
   * Actualiza una carrera
   */
  async actualizarCarrera(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nom_car } = req.body;

      const carrera = await carrerasService.actualizarCarrera(id, {
        nom_car
      });

      return res.status(200).json(
        successResponse(carrera, 'Carrera actualizada exitosamente')
      );
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * DELETE /api/carreras/:id
   * Elimina una carrera
   */
  async eliminarCarrera(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await carrerasService.eliminarCarrera(id);
      return res.status(200).json(
        successResponse(null, 'Carrera eliminada exitosamente')
      );
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export const carrerasController = new CarrerasController();
