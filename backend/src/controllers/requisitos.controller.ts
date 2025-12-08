import { Request, Response } from 'express';
import * as requisitosService from '../services/requisitos.service';

/**
 * Crear un requisito para un evento
 */
export const crearRequisito = async (req: Request, res: Response) => {
  try {
    const { id_det, tip_req, des_req, obligatorio } = req.body;

    if (!id_det || !tip_req) {
      return res.status(400).json({
        success: false,
        message: 'id_det y tip_req son obligatorios',
      });
    }

    const requisito = await requisitosService.crearRequisito({
      id_det,
      tip_req,
      des_req,
      obligatorio,
    });

    res.status(201).json({
      success: true,
      data: requisito,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al crear requisito',
    });
  }
};

/**
 * Obtener requisitos por detalle de evento
 */
export const obtenerRequisitosPorDetalle = async (req: Request, res: Response) => {
  try {
    const { idDetalle } = req.params;

    const requisitos = await requisitosService.obtenerRequisitosPorDetalle(idDetalle);

    res.json({
      success: true,
      data: requisitos,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener requisitos',
    });
  }
};

/**
 * Completar un requisito por un estudiante
 */
export const completarRequisito = async (req: Request, res: Response) => {
  try {
    const { num_reg_per, id_req, val_req } = req.body;

    if (!num_reg_per || !id_req) {
      return res.status(400).json({
        success: false,
        message: 'num_reg_per y id_req son obligatorios',
      });
    }

    const requisito = await requisitosService.completarRequisito({
      num_reg_per,
      id_req,
      val_req,
    });

    res.json({
      success: true,
      data: requisito,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al completar requisito',
    });
  }
};

/**
 * Verificar si todos los requisitos están completos
 */
export const verificarRequisitosCompletos = async (req: Request, res: Response) => {
  try {
    const { numRegPer, idDetalle } = req.params;

    const completos = await requisitosService.verificarRequisitosCompletos(
      parseInt(numRegPer),
      idDetalle
    );

    res.json({
      success: true,
      data: { completos },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al verificar requisitos',
    });
  }
};

/**
 * Obtener requisitos completados por un estudiante
 */
export const obtenerRequisitosCompletados = async (req: Request, res: Response) => {
  try {
    const { numRegPer } = req.params;

    const requisitos = await requisitosService.obtenerRequisitosCompletados(
      parseInt(numRegPer)
    );

    res.json({
      success: true,
      data: requisitos,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al obtener requisitos completados',
    });
  }
};

/**
 * Eliminar un requisito
 */
export const eliminarRequisito = async (req: Request, res: Response) => {
  try {
    const { idRequisito } = req.params;

    await requisitosService.eliminarRequisito(parseInt(idRequisito));

    res.json({
      success: true,
      message: 'Requisito eliminado exitosamente',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error al eliminar requisito',
    });
  }
};
