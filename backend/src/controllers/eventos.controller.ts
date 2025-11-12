import { Request, Response } from 'express';
import { EventosService } from '../services/eventos.service';
import { DetallesEventosService } from '../services/detalles-eventos.service';
import { 
  CreateEventoDto, 
  UpdateEventoDto, 
  AsignarResponsableDto,
  CreateDetalleEventoDto,
  UpdateDetalleEventoDto 
} from '../types/eventos.types';

const eventosService = new EventosService();
const detallesService = new DetallesEventosService();

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

  // GET /api/eventos/usuarios/responsables-activos - Listar usuarios que son responsables de algún curso
  async obtenerResponsablesActivos(req: Request, res: Response) {
    try {
      const responsables = await eventosService.obtenerResponsablesActivos();
      res.json({
        success: true,
        data: responsables
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener responsables activos'
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

  // ==========================================
  // CONTROLADORES PARA DETALLE_EVENTOS
  // ==========================================

  // POST /api/eventos/:id/detalles - RESPONSABLE: Crear detalle de evento
  async crearDetalle(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const data: CreateDetalleEventoDto = {
        ...req.body,
        id_evt_per: req.params.id
      };

      // Validaciones
      if (!data.cup_det || !data.hor_det || !data.are_det || !data.cat_det || !data.tip_evt) {
        return res.status(400).json({
          success: false,
          message: 'Los campos cupo, horas, área, categoría y tipo de evento son obligatorios'
        });
      }

      const detalle = await detallesService.crearDetalle(data, userId);

      res.status(201).json({
        success: true,
        message: 'Detalle de evento creado exitosamente',
        data: detalle
      });
    } catch (error: any) {
      res.status(403).json({
        success: false,
        message: error.message || 'Error al crear detalle de evento'
      });
    }
  }

  // GET /api/eventos/:id/detalles - Listar detalles de un evento
  async obtenerDetallesPorEvento(req: Request, res: Response) {
    try {
      const detalles = await detallesService.obtenerDetallesPorEvento(req.params.id);
      res.json({
        success: true,
        data: detalles
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener detalles del evento'
      });
    }
  }

  // GET /api/detalles/:id - Obtener un detalle específico
  async obtenerDetallePorId(req: Request, res: Response) {
    try {
      const detalle = await detallesService.obtenerDetallePorId(req.params.id);
      res.json({
        success: true,
        data: detalle
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Detalle de evento no encontrado'
      });
    }
  }

  // PUT /api/detalles/:id - RESPONSABLE: Actualizar detalle de evento
  async actualizarDetalle(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const data: UpdateDetalleEventoDto = req.body;

      const detalle = await detallesService.actualizarDetalle(
        req.params.id,
        data,
        userId
      );

      res.json({
        success: true,
        message: 'Detalle de evento actualizado exitosamente',
        data: detalle
      });
    } catch (error: any) {
      res.status(403).json({
        success: false,
        message: error.message || 'Error al actualizar detalle de evento'
      });
    }
  }

  // PUT /api/detalles/:id/estado - RESPONSABLE: Cambiar estado del detalle
  async cambiarEstado(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { estado } = req.body;

      if (!estado) {
        return res.status(400).json({
          success: false,
          message: 'El estado es obligatorio. Valores permitidos: INSCRIPCIONES, EN_CURSO, FINALIZADO'
        });
      }

      const detalle = await detallesService.cambiarEstado(
        req.params.id,
        estado.toUpperCase(),
        userId
      );

      res.json({
        success: true,
        message: `Estado cambiado a ${estado.toUpperCase()} exitosamente`,
        data: detalle
      });
    } catch (error: any) {
      res.status(403).json({
        success: false,
        message: error.message || 'Error al cambiar estado del detalle'
      });
    }
  }

  // DELETE /api/detalles/:id - RESPONSABLE o ADMIN: Eliminar detalle
  async eliminarDetalle(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      await detallesService.eliminarDetalle(req.params.id, userId);

      res.status(204).send();
    } catch (error: any) {
      res.status(403).json({
        success: false,
        message: error.message || 'Error al eliminar detalle de evento'
      });
    }
  }
}
