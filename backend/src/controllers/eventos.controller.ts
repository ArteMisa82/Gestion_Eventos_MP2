import { Request, Response } from 'express';
import { EventosService } from '../services/eventos.service';

const eventosService = new EventosService();

export class EventosController {
  async obtenerTodos(req: Request, res: Response) {
    try {
      const eventos = await eventosService.obtenerTodos();
      res.json(eventos);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener eventos' });
    }
  }
}
