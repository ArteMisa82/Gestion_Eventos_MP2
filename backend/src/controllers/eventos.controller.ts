import { Request, Response } from 'express';
import { EventosService } from '../services/eventos.service';
import { CreateEventoDto, UpdateEventoDto, AsignarResponsableDto } from '../types/eventos.types';

const eventosService = new EventosService();

export class EventosController {
  // GET /api/eventos - Listar todos los eventos
  async obtenerTodos(req: Request, res: Response) {
    try {
      const eventos = await eventosService.obtenerTodos();
      res.json({
        success: true,
        data: eventos
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener eventos'
      });
    }
  }

  // GET /api/eventos/:id - Obtener un evento por ID
  async obtenerPorId(req: Request, res: Response) {
    try {
      const evento = await eventosService.obtenerPorId(req.params.id);
      res.json({
        success: true,
        data: evento
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Evento no encontrado'
      });
    }
  }

  // POST /api/eventos - ADMIN: Crear nuevo evento
  async crear(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const data: CreateEventoDto = req.body;

      // Validaciones
      if (!data.nom_evt || !data.fec_evt || !data.lug_evt || !data.des_evt) {
        return res.status(400).json({
          success: false,
          message: 'Los campos nombre, fecha, lugar y descripción son obligatorios'
        });
      }

      const evento = await eventosService.crearEvento(data, userId);

      res.status(201).json({
        success: true,
        message: 'Evento creado exitosamente',
        data: evento
      });
    } catch (error: any) {
      res.status(403).json({
        success: false,
        message: error.message || 'Error al crear evento'
      });
    }
  }

  // PUT /api/eventos/:id/responsable - ADMIN: Asignar responsable
  async asignarResponsable(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const data: AsignarResponsableDto = req.body;

      if (!data.id_responsable) {
        return res.status(400).json({
          success: false,
          message: 'El ID del responsable es obligatorio'
        });
      }

      const evento = await eventosService.asignarResponsable(
        req.params.id,
        data,
        userId
      );

      res.json({
        success: true,
        message: 'Responsable asignado exitosamente',
        data: evento
      });
    } catch (error: any) {
      res.status(403).json({
        success: false,
        message: error.message || 'Error al asignar responsable'
      });
    }
  }

  // PUT /api/eventos/:id - RESPONSABLE: Actualizar detalles del evento
  async actualizar(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const data: UpdateEventoDto = req.body;

      const evento = await eventosService.actualizarEvento(
        req.params.id,
        data,
        userId
      );

      res.json({
        success: true,
        message: 'Evento actualizado exitosamente',
        data: evento
      });
    } catch (error: any) {
      res.status(403).json({
        success: false,
        message: error.message || 'Error al actualizar evento'
      });
    }
  }

  // DELETE /api/eventos/:id - ADMIN: Eliminar evento
  async eliminar(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      await eventosService.eliminarEvento(req.params.id, userId);

      res.status(204).send();
    } catch (error: any) {
      res.status(403).json({
        success: false,
        message: error.message || 'Error al eliminar evento'
      });
    }
  }

  // GET /api/eventos/usuarios/administrativos - Listar usuarios administrativos
  async obtenerUsuariosAdministrativos(req: Request, res: Response) {
    try {
      const usuarios = await eventosService.obtenerUsuariosAdministrativos();
      res.json({
        success: true,
        data: usuarios
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener usuarios administrativos'
      });
    }
  }

  // GET /api/eventos/mis-eventos - Obtener eventos asignados al usuario actual
  async obtenerMisEventos(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const eventos = await eventosService.obtenerEventosPorResponsable(userId);
      res.json({
        success: true,
        data: eventos
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener eventos asignados'
      });
    }
  }
}
