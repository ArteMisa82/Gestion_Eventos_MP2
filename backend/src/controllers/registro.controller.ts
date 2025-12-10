/**
 * Controlador para registro de eventos e inscripciones
 */

import { Request, Response } from 'express';
import { registroEventoService } from '../services/registro-evento.service';
import { inscripcionesService } from '../services/inscripciones.service';
import { successResponse } from '../utils/response.util';

export class RegistroController {
  // ============= REGISTRO EVENTO =============
  
  /**
   * POST /api/registro-evento
   * Crea un nuevo registro de evento (vincula detalle con nivel)
   */
  async crearRegistroEvento(req: Request, res: Response) {
    try {
      const { id_det, id_niv } = req.body;

      if (!id_det || !id_niv) {
        return res.status(400).json({
          success: false,
          message: 'id_det e id_niv son requeridos'
        });
      }

      const registroEvento = await registroEventoService.crearRegistroEvento({
        id_det,
        id_niv
      });

      return res.status(201).json(
        successResponse(registroEvento, 'Registro de evento creado exitosamente')
      );
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/registro-evento
   * Obtiene todos los registros de eventos
   */
  async obtenerTodosRegistros(req: Request, res: Response) {
    try {
      const registros = await registroEventoService.obtenerTodos();
      return res.status(200).json(
        successResponse(registros, 'Registros obtenidos exitosamente')
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/registro-evento/:id
   * Obtiene un registro de evento por ID
   */
  async obtenerRegistroPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const registro = await registroEventoService.obtenerPorId(id);
      return res.status(200).json(
        successResponse(registro, 'Registro encontrado')
      );
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/registro-evento/detalle/:id_det
   * Obtiene registros por detalle
   */
  async obtenerRegistrosPorDetalle(req: Request, res: Response) {
    try {
      const { id_det } = req.params;
      const registros = await registroEventoService.obtenerPorDetalle(id_det);
      return res.status(200).json(
        successResponse(registros, 'Registros obtenidos exitosamente')
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/registro-evento/nivel/:id_niv
   * Obtiene registros por nivel
   */
  async obtenerRegistrosPorNivel(req: Request, res: Response) {
    try {
      const { id_niv } = req.params;
      const registros = await registroEventoService.obtenerPorNivel(id_niv);
      return res.status(200).json(
        successResponse(registros, 'Registros obtenidos exitosamente')
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * PUT /api/registro-evento/:id
   * Actualiza un registro de evento
   */
  async actualizarRegistroEvento(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { id_det, id_niv } = req.body;

      const actualizado = await registroEventoService.actualizarRegistroEvento(id, {
        id_det,
        id_niv
      });

      return res.status(200).json(
        successResponse(actualizado, 'Registro actualizado exitosamente')
      );
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * DELETE /api/registro-evento/:id
   * Elimina un registro de evento
   */
  async eliminarRegistroEvento(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await registroEventoService.eliminarRegistroEvento(id);
      return res.status(200).json(
        successResponse(null, 'Registro eliminado exitosamente')
      );
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/registro-evento/estudiante/mis-cursos
   * Obtiene cursos disponibles para el estudiante según su nivel
   */
  async obtenerCursosParaEstudiante(req: Request, res: Response) {
    try {
      const id_usu = (req as any).userId; // Del token JWT

      const cursos = await registroEventoService.obtenerCursosParaEstudiante(id_usu);

      return res.status(200).json(
        successResponse(cursos, 'Cursos disponibles obtenidos exitosamente')
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/registro-evento/filtrar
   * Obtiene cursos con filtros (admin/encargado)
   */
  async obtenerCursosFiltrados(req: Request, res: Response) {
    try {
      const id_usu = (req as any).userId;
      const isAdmin = (req as any).isAdmin;

      const {
        id_instructor,
        id_niv,
        id_carrera,
        estado,
        solo_mis_cursos
      } = req.query;

      const filtros: any = {};

      // Si no es admin y solicita solo sus cursos (encargado)
      if (!isAdmin && solo_mis_cursos === 'true') {
        filtros.id_responsable = id_usu;
      }

      // Aplicar filtros adicionales
      if (id_instructor) {
        filtros.id_instructor = parseInt(id_instructor as string);
      }

      if (id_niv) {
        filtros.id_niv = id_niv as string;
      }

      if (id_carrera) {
        filtros.id_carrera = id_carrera as string;
      }

      if (estado) {
        filtros.estado = estado as string;
      }

      const cursos = await registroEventoService.obtenerCursosFiltrados(filtros);

      return res.status(200).json(
        successResponse(cursos, 'Cursos filtrados obtenidos exitosamente')
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // ============= INSCRIPCIONES =============

  /**
   * POST /api/inscripciones
   * Inscribe un usuario a un evento
   * Puede recibir id_reg_evt (para ESTUDIANTES) o id_det (para PÚBLICO GENERAL)
   */
  async inscribirUsuario(req: Request, res: Response) {
    try {
      const { id_usu, id_reg_evt, id_det } = req.body;

      if (!id_usu || (!id_reg_evt && !id_det)) {
        return res.status(400).json({
          success: false,
          message: 'id_usu y (id_reg_evt o id_det) son requeridos'
        });
      }

      const inscripcion = await inscripcionesService.inscribirUsuario({
        id_usu: parseInt(id_usu),
        id_reg_evt,
        id_det
      });

      return res.status(201).json(
        successResponse(inscripcion, 'Usuario inscrito exitosamente')
      );
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /api/inscripciones/validar
   * Valida si un usuario puede inscribirse
   */
  async validarInscripcion(req: Request, res: Response) {
    try {
      const { id_usu, id_reg_evt } = req.body;

      if (!id_usu || !id_reg_evt) {
        return res.status(400).json({
          success: false,
          message: 'id_usu e id_reg_evt son requeridos'
        });
      }

      const validacion = await inscripcionesService.validarInscripcion(
        parseInt(id_usu),
        id_reg_evt
      );

      return res.status(200).json(
        successResponse(validacion, 'Validación completada')
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/inscripciones
   * Obtiene todas las inscripciones
   */
  async obtenerTodasInscripciones(req: Request, res: Response) {
    try {
      const inscripciones = await inscripcionesService.obtenerTodas();
      return res.status(200).json(
        successResponse(inscripciones, 'Inscripciones obtenidas exitosamente')
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/inscripciones/:id
   * Obtiene una inscripción por ID
   */
  async obtenerInscripcionPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const inscripcion = await inscripcionesService.obtenerPorId(parseInt(id));
      return res.status(200).json(
        successResponse(inscripcion, 'Inscripción encontrada')
      );
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/inscripciones/usuario/:id_usu
   * Obtiene inscripciones de un usuario
   */
  async obtenerInscripcionesPorUsuario(req: Request, res: Response) {
    try {
      const { id_usu } = req.params;
      const inscripciones = await inscripcionesService.obtenerPorUsuario(
        parseInt(id_usu)
      );
      return res.status(200).json(
        successResponse(inscripciones, 'Inscripciones obtenidas exitosamente')
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/inscripciones/evento/:id_reg_evt
   * Obtiene inscripciones de un registro de evento
   */
  async obtenerInscripcionesPorEvento(req: Request, res: Response) {
    try {
      const { id_reg_evt } = req.params;
      const inscripciones = await inscripcionesService.obtenerPorRegistroEvento(
        id_reg_evt
      );
      return res.status(200).json(
        successResponse(inscripciones, 'Inscripciones obtenidas exitosamente')
      );
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/inscripciones/estadisticas/:id_reg_evt
   * Obtiene estadísticas de inscripciones por evento
   */
  async obtenerEstadisticasEvento(req: Request, res: Response) {
    try {
      const { id_reg_evt } = req.params;
      const estadisticas = await inscripcionesService.obtenerEstadisticasPorEvento(
        id_reg_evt
      );
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
   * POST /api/inscripciones/:num_reg_per/documentos
   * Guarda los documentos y requisitos adicionales de una inscripción
   */
  async guardarDocumentosInscripcion(req: Request, res: Response) {
    try {
      const { num_reg_per } = req.params;
      const {
        carta_motivacion,
        documento_especifico,
        documento_especifico_url,
        documento_extra_1,
        documento_extra_1_url,
        documento_extra_2,
        documento_extra_2_url
      } = req.body;

      if (!num_reg_per) {
        return res.status(400).json({
          success: false,
          message: 'num_reg_per es requerido'
        });
      }

      const resultado = await inscripcionesService.guardarDocumentosInscripcion(
        parseInt(num_reg_per),
        {
          carta_motivacion,
          documento_especifico,
          documento_especifico_url,
          documento_extra_1,
          documento_extra_1_url,
          documento_extra_2,
          documento_extra_2_url
        }
      );

      return res.status(200).json(
        successResponse(resultado, 'Documentos guardados exitosamente')
      );
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/inscripciones/:num_reg_per/documentos
   * Obtiene los documentos de una inscripción
   */
  async obtenerDocumentosInscripcion(req: Request, res: Response) {
    try {
      const { num_reg_per } = req.params;

      if (!num_reg_per) {
        return res.status(400).json({
          success: false,
          message: 'num_reg_per es requerido'
        });
      }

      const documentos = await inscripcionesService.obtenerDocumentosInscripcion(
        parseInt(num_reg_per)
      );

      return res.status(200).json(
        successResponse(documentos, 'Documentos obtenidos exitosamente')
      );
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * DELETE /api/inscripciones/:id
   * Cancela una inscripción
   */
  async cancelarInscripcion(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const id_usu = req.body.id_usu; // Opcional, para validar permisos

      await inscripcionesService.cancelarInscripcion(parseInt(id), id_usu);

      return res.status(200).json(
        successResponse(null, 'Inscripción cancelada exitosamente')
      );
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

export const registroController = new RegistroController();
