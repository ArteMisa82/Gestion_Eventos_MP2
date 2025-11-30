import { Request, Response } from 'express';
import { SolicitudesService } from '../services/solicitudes.service';

const service = new SolicitudesService();

export class SolicitudesController {

  async crear(req: Request, res: Response) {
    try {
      const solicitud = await service.crearSolicitud(req.body);
      res.status(201).json({ mensaje: 'Solicitud creada', solicitud });
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al crear solicitud', error });
    }
  }

  async listar(req: Request, res: Response) {
    try {
      const solicitudes = await service.listarTodas();
      res.json(solicitudes);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener solicitudes', error });
    }
  }

  async listarParaComite(req: Request, res: Response) {
    try {
      const solicitudes = await service.listarSolicitudesComite();
      res.json(solicitudes);
    } catch (error) {
      res.status(500).json({ mensaje: 'Error al obtener solicitudes para comité', error });
    }
  }
}
