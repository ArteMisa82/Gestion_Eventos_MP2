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

      console.log("=== ACTUALIZAR EVENTO ===");
      console.log("ID evento:", req.params.id);
      console.log("User ID:", userId);
      console.log("Data recibida:", JSON.stringify(data, null, 2));
      console.log("mod_evt (modalidad):", data.mod_evt);
      console.log("cos_evt (pago):", data.cos_evt);
      console.log("detalles.cup_det (cupos):", data.detalles?.cup_det);

      // Validar datos básicos
      if (data.detalles) {
        // Validar cupos
        if (data.detalles.cup_det !== undefined) {
          const cupos = Number(data.detalles.cup_det);
          if (isNaN(cupos) || cupos <= 0) {
            return res.status(400).json({
              success: false,
              message: 'Los cupos deben ser un número válido mayor a 0',
              field: 'cup_det'
            });
          }
        }

        // Validar horas
        if (data.detalles.hor_det !== undefined) {
          const horas = Number(data.detalles.hor_det);
          if (isNaN(horas) || horas <= 0) {
            return res.status(400).json({
              success: false,
              message: 'Las horas de duración deben ser un número válido mayor a 0',
              field: 'hor_det'
            });
          }
        }

        // Validar categoría
        if (data.detalles.cat_det !== undefined) {
          const validCategories = [
            'CURSO', 'CONGRESO', 'WEBINAR', 'CONFERENCIAS', 
            'SOCIALIZACIONES', 'CASAS ABIERTAS', 'SEMINARIOS', 'OTROS'
          ];
          
          if (!validCategories.includes(data.detalles.cat_det)) {
            return res.status(400).json({
              success: false,
              message: `Tipo de evento inválido. Valores permitidos: ${validCategories.join(', ')}`,
              field: 'cat_det'
            });
          }
        }
      }

      // Si se envían detalles, carreras o semestres en el body, usar actualización completa
      const tieneDetalles = data.detalles && 
        (data.detalles.cup_det || data.detalles.hor_det || data.detalles.cat_det);
      const tieneCarrerasOSemestres = (data.carreras && data.carreras.length > 0) || 
                                       (data.semestres && data.semestres.length > 0);

      console.log('🔍 Verificando tipo de actualización:');
      console.log('  - tieneDetalles:', tieneDetalles);
      console.log('  - tieneCarrerasOSemestres:', tieneCarrerasOSemestres);
      console.log('  - carreras:', data.carreras);
      console.log('  - semestres:', data.semestres);

      const evento = (tieneDetalles || tieneCarrerasOSemestres)
        ? await eventosService.actualizarEventoCompleto(req.params.id, data, userId)
        : await eventosService.actualizarEvento(req.params.id, data, userId);

      res.json({
        success: true,
        message: 'Evento actualizado exitosamente',
        data: evento
      });
    } catch (error: any) {
      console.error("=== ERROR AL ACTUALIZAR EVENTO ===");
      console.error("Error:", error);
      console.error("Message:", error.message);
      console.error("Code:", error.code);
      
      // Errores específicos de base de datos
      let message = 'Error al actualizar evento';
      let statusCode = 500;
      
      if (error.code) {
        switch (error.code) {
          case 'P2002': // Unique constraint violation
            message = 'Ya existe un evento con esos datos';
            statusCode = 400;
            break;
          case 'P2003': // Foreign key constraint violation
            message = 'Referencia inválida a otro registro';
            statusCode = 400;
            break;
          case 'P2025': // Record not found
            message = 'Evento no encontrado';
            statusCode = 404;
            break;
          default:
            message = error.message || 'Error de base de datos';
            statusCode = 500;
        }
      } else if (error.message) {
        message = error.message;
        if (error.message.includes('permission') || error.message.includes('access')) {
          statusCode = 403;
        } else if (error.message.includes('not found')) {
          statusCode = 404;
        } else if (error.message.includes('invalid') || error.message.includes('validation')) {
          statusCode = 400;
        }
      }

      res.status(statusCode).json({
        success: false,
        message: message
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

  // ==========================================
  // ENDPOINTS PÚBLICOS (SIN AUTENTICACIÓN)
  // ==========================================

  // GET /api/eventos/publicos - PÚBLICO: Obtener eventos publicados
  async obtenerEventosPublicados(req: Request, res: Response) {
    try {
      // Parsear filtros que pueden ser arrays (separados por coma)
      const parseFiltro = (value: any): string | string[] | undefined => {
        if (!value) return undefined;
        if (typeof value === 'string' && value.includes(',')) {
          return value.split(',').map(v => v.trim());
        }
        return value as string;
      };

      const filtros = {
        mod_evt: parseFiltro(req.query.mod_evt),
        tip_pub_evt: parseFiltro(req.query.tip_pub_evt),
        cos_evt: parseFiltro(req.query.cos_evt),
        busqueda: req.query.busqueda as string | undefined,
      };

      const eventos = await eventosService.obtenerEventosPublicados(filtros);
      
      res.json({
        success: true,
        data: eventos
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener eventos publicados'
      });
    }
  }
}
