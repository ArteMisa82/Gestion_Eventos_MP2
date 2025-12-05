import { PrismaClient } from '@prisma/client';
import { AppError } from '../middlewares/errorHandler.middleware';

const prisma = new PrismaClient();

export interface AsignarNotaDTO {
  id_reg_per: number; // ID del registro_personas
  not_fin_evt?: number; // Nota final (0-100)
  asi_evt_det?: number; // Asistencia porcentaje (0-100)
}

export interface CalificacionResponse {
  id_reg_per: number;
  estudiante: {
    id_usu: number;
    nombre_completo: string;
    correo: string;
  };
  not_min_evt: number | null; // Nota mínima del detalle
  not_fin_evt: number | null; // Nota final del estudiante
  asi_evt_det: number | null; // Asistencia del estudiante
  cer_evt_det: number | null; // Certificado
  apr_evt_det: number | null; // Aprobado
}

export class CalificacionesService {
  /**
   * Verificar si el usuario es instructor o responsable del curso
   */
  private async verificarPermisos(idDetalle: string, idUsuario: number): Promise<boolean> {
    // Verificar si es instructor
    const esInstructor = await prisma.detalle_instructores.findFirst({
      where: {
        id_det: idDetalle,
        id_usu: idUsuario,
      },
    });

    if (esInstructor) return true;

    // Verificar si es responsable del evento
    const detalle = await prisma.detalle_eventos.findUnique({
      where: { id_det: idDetalle },
      select: {
        eventos: {
          select: {
            id_res_evt: true,
          },
        },
      },
    });

    return detalle?.eventos.id_res_evt === idUsuario;
  }

  /**
   * Obtener todas las calificaciones de un curso (para profesor)
   */
  async obtenerCalificaciones(idDetalle: string, idProfesor: number): Promise<CalificacionResponse[]> {
    try {
      // Verificar permisos
      const tienePermisos = await this.verificarPermisos(idDetalle, idProfesor);
      if (!tienePermisos) {
        throw new AppError('No tienes permisos para ver las calificaciones de este curso', 403);
      }

      // Obtener detalle del evento para la nota mínima
      const detalle = await prisma.detalle_eventos.findUnique({
        where: { id_det: idDetalle },
        select: {
          not_min_evt: true,
          cer_evt_det: true,
          apr_evt_det: true,
        },
      });

      // Obtener registros de evento asociados al detalle
      const registrosEvento = await prisma.registro_evento.findMany({
        where: { id_det: idDetalle },
        select: { id_reg_evt: true },
      });

      const idsRegistrosEvento = registrosEvento.map((r) => r.id_reg_evt);

      // Obtener inscripciones
      const inscripciones = await prisma.registro_personas.findMany({
        where: {
          id_reg_evt: { in: idsRegistrosEvento },
        },
        select: {
          num_reg_per: true,
          not_fin_evt: true,
          asi_evt_det: true,
          usuarios: {
            select: {
              id_usu: true,
              nom_usu: true,
              nom_seg_usu: true,
              ape_usu: true,
              ape_seg_usu: true,
              cor_usu: true,
            },
          },
        },
        orderBy: {
          usuarios: {
            ape_usu: 'asc',
          },
        },
      });

      // Mapear respuesta
      const calificaciones: CalificacionResponse[] = inscripciones.map((inscripcion) => {
        const usuario = inscripcion.usuarios;
        const nombreCompleto = `${usuario.nom_usu} ${usuario.nom_seg_usu || ''} ${usuario.ape_usu} ${usuario.ape_seg_usu || ''}`.trim();

        return {
          id_reg_per: inscripcion.num_reg_per,
          estudiante: {
            id_usu: usuario.id_usu,
            nombre_completo: nombreCompleto,
            correo: usuario.cor_usu,
          },
          not_min_evt: detalle?.not_min_evt ? Number(detalle.not_min_evt) : null,
          not_fin_evt: inscripcion.not_fin_evt ? Number(inscripcion.not_fin_evt) : null,
          asi_evt_det: inscripcion.asi_evt_det,
          cer_evt_det: detalle?.cer_evt_det || null,
          apr_evt_det: detalle?.apr_evt_det || null,
        };
      });

      return calificaciones;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error al obtener calificaciones:', error);
      throw new AppError('Error al obtener las calificaciones', 500);
    }
  }

  /**
   * Asignar o actualizar nota final y/o asistencia a un estudiante
   */
  async asignarCalificacion(
    idDetalle: string,
    idProfesor: number,
    data: AsignarNotaDTO
  ): Promise<CalificacionResponse> {
    try {
      // Verificar permisos
      const tienePermisos = await this.verificarPermisos(idDetalle, idProfesor);
      if (!tienePermisos) {
        throw new AppError('No tienes permisos para asignar calificaciones en este curso', 403);
      }

      // Validar que al menos un campo se está actualizando
      if (data.not_fin_evt === undefined && data.asi_evt_det === undefined) {
        throw new AppError('Debes proporcionar al menos nota_final o asistencia', 400);
      }

      // Validar rangos
      if (data.not_fin_evt !== undefined && (data.not_fin_evt < 0 || data.not_fin_evt > 100)) {
        throw new AppError('La nota final debe estar entre 0 y 100', 400);
      }

      if (data.asi_evt_det !== undefined && (data.asi_evt_det < 0 || data.asi_evt_det > 100)) {
        throw new AppError('La asistencia debe estar entre 0 y 100', 400);
      }

      // Verificar que el registro_personas existe
      const registroPersona = await prisma.registro_personas.findUnique({
        where: { num_reg_per: data.id_reg_per },
        include: {
          registro_evento: {
            select: {
              id_det: true,
            },
          },
          usuarios: {
            select: {
              id_usu: true,
              nom_usu: true,
              nom_seg_usu: true,
              ape_usu: true,
              ape_seg_usu: true,
              cor_usu: true,
            },
          },
        },
      });

      if (!registroPersona) {
        throw new AppError('Inscripción no encontrada', 404);
      }

      // Verificar que la inscripción pertenece al detalle correcto
      if (registroPersona.registro_evento.id_det !== idDetalle) {
        throw new AppError('Esta inscripción no pertenece a este curso', 400);
      }

      // Actualizar calificación
      const dataActualizacion: any = {};
      if (data.not_fin_evt !== undefined) {
        dataActualizacion.not_fin_evt = data.not_fin_evt;
      }
      if (data.asi_evt_det !== undefined) {
        dataActualizacion.asi_evt_det = data.asi_evt_det;
      }

      const inscripcionActualizada = await prisma.registro_personas.update({
        where: { num_reg_per: data.id_reg_per },
        data: dataActualizacion,
        select: {
          num_reg_per: true,
          not_fin_evt: true,
          asi_evt_det: true,
        },
      });

      // Obtener detalle para nota mínima
      const detalle = await prisma.detalle_eventos.findUnique({
        where: { id_det: idDetalle },
        select: {
          not_min_evt: true,
          cer_evt_det: true,
          apr_evt_det: true,
        },
      });

      const usuario = registroPersona.usuarios;
      const nombreCompleto = `${usuario.nom_usu} ${usuario.nom_seg_usu || ''} ${usuario.ape_usu} ${usuario.ape_seg_usu || ''}`.trim();

      return {
        id_reg_per: inscripcionActualizada.num_reg_per,
        estudiante: {
          id_usu: usuario.id_usu,
          nombre_completo: nombreCompleto,
          correo: usuario.cor_usu,
        },
        not_min_evt: detalle?.not_min_evt ? Number(detalle.not_min_evt) : null,
        not_fin_evt: inscripcionActualizada.not_fin_evt ? Number(inscripcionActualizada.not_fin_evt) : null,
        asi_evt_det: inscripcionActualizada.asi_evt_det,
        cer_evt_det: detalle?.cer_evt_det || null,
        apr_evt_det: detalle?.apr_evt_det || null,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error al asignar calificación:', error);
      throw new AppError('Error al asignar la calificación', 500);
    }
  }

  /**
   * Asignar calificaciones en lote (múltiples estudiantes)
   */
  async asignarCalificacionesLote(
    idDetalle: string,
    idProfesor: number,
    calificaciones: AsignarNotaDTO[]
  ): Promise<{ exitosos: number; errores: string[] }> {
    try {
      // Verificar permisos
      const tienePermisos = await this.verificarPermisos(idDetalle, idProfesor);
      if (!tienePermisos) {
        throw new AppError('No tienes permisos para asignar calificaciones en este curso', 403);
      }

      const errores: string[] = [];
      let exitosos = 0;

      for (const calificacion of calificaciones) {
        try {
          await this.asignarCalificacion(idDetalle, idProfesor, calificacion);
          exitosos++;
        } catch (error) {
          const mensaje = error instanceof Error ? error.message : 'Error desconocido';
          errores.push(`ID ${calificacion.id_reg_per}: ${mensaje}`);
        }
      }

      return { exitosos, errores };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error al asignar calificaciones en lote:', error);
      throw new AppError('Error al asignar las calificaciones', 500);
    }
  }
}
