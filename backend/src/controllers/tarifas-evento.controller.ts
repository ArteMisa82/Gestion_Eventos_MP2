import { Request, Response } from 'express';
import prisma from '../config/database';

export class TarifasEventoController {
  // POST /api/tarifas-evento
  async crearActualizarTarifa(req: Request, res: Response) {
    try {
      const { id_evt, tip_par, val_evt } = req.body;
      if (!id_evt || !tip_par || val_evt == null) {
        return res.status(400).json({ success: false, message: 'id_evt, tip_par y val_evt son requeridos' });
      }
      // Solo acepta ESTUDIANTE o PERSONA
      if (!["ESTUDIANTE", "PERSONA"].includes(tip_par)) {
        return res.status(400).json({ success: false, message: 'tip_par debe ser ESTUDIANTE o PERSONA' });
      }
      // Verifica si ya existe tarifa para ese evento y tipo
      const tarifaExistente = await prisma.tarifas_evento.findFirst({
        where: { id_evt, tip_par }
      });
      let tarifa;
      if (tarifaExistente) {
        tarifa = await prisma.tarifas_evento.update({
          where: { id_tar_evt: tarifaExistente.id_tar_evt },
          data: { val_evt }
        });
      } else {
        tarifa = await prisma.tarifas_evento.create({
          data: { id_evt, tip_par, val_evt }
        });
      }
      return res.status(200).json({ success: true, data: tarifa });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}
