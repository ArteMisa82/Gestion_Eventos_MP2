/**
 * Controlador para gestión de niveles académicos (ADMIN)
 */

import { Request, Response } from 'express';
import { nivelesService } from '../services/niveles.service';
import { successResponse } from '../utils/response.util';

export class NivelesController {
  /**
   * POST /api/niveles
   * Crea un nuevo nivel
   */
  async crearNivel(req: Request, res: Response) {
    try {
      const { id_niv, nom_niv, org_cur_niv, id_car } = req.body;

      if (!id_niv || !nom_niv || !org_cur_niv || !id_car) {
        return res.status(400).json({
          success: false,
          message: 'id_niv, nom_niv, org_cur_niv e id_car son requeridos'
        });
      }

      const nivel = await nivelesService.crearNivel({
        id_niv,
        nom_niv,
        org_cur_niv,
        id_car
      });

      return res.status(201).json(
        successResponse(nivel, 'Nivel creado exitosamente')
      );
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/niveles
   * Obtiene todos los niveles
   */
  async obtenerTodos(req: Request, res: Response) {
    try {
      const niveles = await nivelesService.obtenerTodos();
      return res.status(200).json(
        successResponse(niveles, 'Niveles obtenidos exitosamente')
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/niveles/carrera/:id_car
   * Obtiene niveles por carrera
   */
  async obtenerPorCarrera(req: Request, res: Response) {
    try {
      const { id_car } = req.params;
      const niveles = await nivelesService.obtenerPorCarrera(id_car);
      return res.status(200).json(
        successResponse(niveles, 'Niveles obtenidos exitosamente')
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/niveles/:id
   * Obtiene un nivel por ID
   */
  async obtenerPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const nivel = await nivelesService.obtenerPorId(id);
      return res.status(200).json(
        successResponse(nivel, 'Nivel encontrado')
      );
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /api/niveles/:id
   * Actualiza un nivel
   */
  async actualizarNivel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nom_niv, org_cur_niv, id_car } = req.body;

      const nivel = await nivelesService.actualizarNivel(id, {
        nom_niv,
        org_cur_niv,
        id_car
      });

      return res.status(200).json(
        successResponse(nivel, 'Nivel actualizado exitosamente')
      );
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * DELETE /api/niveles/:id
   * Elimina un nivel
   */
  async eliminarNivel(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await nivelesService.eliminarNivel(id);
      return res.status(200).json(
        successResponse(null, 'Nivel eliminado exitosamente')
      );
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export const nivelesController = new NivelesController();
