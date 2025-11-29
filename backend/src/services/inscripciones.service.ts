/**
 * Servicio para gestión de inscripciones (registro_personas)
 * Responsabilidad: Inscribir usuarios a eventos y validar cupos
 */

import prisma from '../config/database';
import { EstadoDetalleEvento } from '../utils/estados-detalle.util';
import { TipoPublicoEvento } from '../types/eventos-constants.types';
import {
  CrearInscripcionDTO,
  InscripcionResponse,
  ValidarInscripcionResult
} from '../types/registro.types';

const INSCRIPCION_INCLUDES = {
  usuarios: {
    select: {
      id_usu: true,
      cor_usu: true,
      nom_usu: true,
      nom_seg_usu: true,
      ape_usu: true,
      ape_seg_usu: true,
      tel_usu: true,
      niv_usu: true
    }
  },
  registro_evento: {
    include: {
      detalle_eventos: {
        include: {
          eventos: true
        }
      },
      nivel: {
        include: {
          carreras: true
        }
      }
    }
  }
};

export class InscripcionesService {
  /**
   * Inscribe un usuario a un evento
   */
  async inscribirUsuario(data: CrearInscripcionDTO): Promise<InscripcionResponse> {
    // Validar que el usuario existe
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usu: data.id_usu }
    });

    if (!usuario) {
      throw new Error('El usuario no existe');
    }

    // Validar que el registro de evento existe
    const registroEvento = await prisma.registro_evento.findUnique({
      where: { id_reg_evt: data.id_reg_evt },
      include: {
        detalle_eventos: true,
        registro_personas: true
      }
    });

    if (!registroEvento) {
      throw new Error('El registro de evento no existe');
    }

    // Validar inscripción (cupo, estado, duplicados)
    const validacion = await this.validarInscripcion(
      data.id_usu,
      data.id_reg_evt,
      registroEvento
    );

    if (!validacion.valido) {
      throw new Error(validacion.mensaje);
    }

    // Crear la inscripción
    const inscripcion = await prisma.registro_personas.create({
      data: {
        id_usu: data.id_usu,
        id_reg_evt: data.id_reg_evt
      },
      include: INSCRIPCION_INCLUDES
    });

    return this.formatResponse(inscripcion);
  }

  /**
   * Valida si un usuario puede inscribirse
   */
  async validarInscripcion(
    id_usu: number,
    id_reg_evt: string,
    registroEvento?: any
  ): Promise<ValidarInscripcionResult> {
    // Obtener datos del usuario
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usu }
    });

    if (!usuario) {
      return {
        valido: false,
        mensaje: 'Usuario no encontrado'
      };
    }

    // Obtener registro evento si no se proporcionó
    if (!registroEvento) {
      registroEvento = await prisma.registro_evento.findUnique({
        where: { id_reg_evt },
        include: {
          detalle_eventos: {
            include: {
              eventos: true
            }
          },
          registro_personas: true,
          nivel: true
        }
      });

      if (!registroEvento) {
        return {
          valido: false,
          mensaje: 'El registro de evento no existe'
        };
      }
    }

    const detalle = registroEvento.detalle_eventos;
    const evento = detalle.eventos;
    const inscritos = registroEvento.registro_personas || [];
    const nivelRequerido = registroEvento.id_niv;
    const tipoPublico = evento.tip_pub_evt; // GENERAL, ESTUDIANTES, ADMINISTRATIVOS

    // ===== VALIDACIÓN 0: NO PUEDE INSCRIBIRSE SI ES INSTRUCTOR O RESPONSABLE =====
    // Verificar si es instructor del curso
    const esInstructor = await prisma.detalle_instructores.findFirst({
      where: {
        id_det: detalle.id_det,
        id_usu: id_usu
      }
    });

    if (esInstructor) {
      return {
        valido: false,
        mensaje: 'No puedes inscribirte en un curso donde eres instructor',
        detalles: {
          cupoDisponible: false,
          yaInscrito: false,
          estadoDetalle: detalle.est_evt_det
        }
      };
    }

    // Verificar si es responsable del evento
    if (evento.id_res_evt === id_usu) {
      return {
        valido: false,
        mensaje: 'No puedes inscribirte en un evento donde eres el responsable',
        detalles: {
          cupoDisponible: false,
          yaInscrito: false,
          estadoDetalle: detalle.est_evt_det
        }
      };
    }

    // ===== VALIDACIÓN 1: TIPO DE PÚBLICO DEL EVENTO =====
    const esEstudiante = usuario.stu_usu === 1;
    const esAdministrativo = usuario.adm_usu === 1 || usuario.Administrador === true;

    // Si el evento es solo para ESTUDIANTES
    if (tipoPublico === TipoPublicoEvento.ESTUDIANTES) {
      if (!esEstudiante) {
        return {
          valido: false,
          mensaje: 'Este evento es exclusivo para estudiantes',
          detalles: {
            cupoDisponible: false,
            yaInscrito: false,
            estadoDetalle: detalle.est_evt_det
          }
        };
      }
    }
    
    // Si el evento es solo para ADMINISTRATIVOS
    if (tipoPublico === TipoPublicoEvento.ADMINISTRATIVOS) {
      if (!esAdministrativo) {
        return {
          valido: false,
          mensaje: 'Este evento es exclusivo para personal administrativo',
          detalles: {
            cupoDisponible: false,
            yaInscrito: false,
            estadoDetalle: detalle.est_evt_det
          }
        };
      }
    }
    // Si el evento es GENERAL, cualquiera puede registrarse (no se valida nada aquí)

    // ===== VALIDACIÓN 2: SI ES ESTUDIANTE, VERIFICAR NIVEL =====
    if (esEstudiante) {
      const estudianteEnNivel = await prisma.estudiantes.findFirst({
        where: {
          id_usu: id_usu,
          id_niv: nivelRequerido,
          est_activo: 1
        }
      });

      if (!estudianteEnNivel) {
        return {
          valido: false,
          mensaje: `No puedes inscribirte. Este curso es para el nivel: ${registroEvento.nivel?.nom_niv || nivelRequerido}. Verifica que estés matriculado en ese nivel.`,
          detalles: {
            cupoDisponible: false,
            yaInscrito: false,
            estadoDetalle: detalle.est_evt_det
          }
        };
      }
    }

    // ===== VALIDACIÓN 3: ESTADO DEL DETALLE =====
    if (detalle.est_evt_det !== EstadoDetalleEvento.INSCRIPCIONES) {
      return {
        valido: false,
        mensaje: `No se pueden realizar inscripciones. Estado actual: ${detalle.est_evt_det}`,
        detalles: {
          cupoDisponible: false,
          yaInscrito: false,
          estadoDetalle: detalle.est_evt_det
        }
      };
    }

    // ===== VALIDACIÓN 4: CUPO DISPONIBLE =====
    const cupoDisponible = inscritos.length < detalle.cup_det;
    if (!cupoDisponible) {
      return {
        valido: false,
        mensaje: `Cupo completo. Inscritos: ${inscritos.length}/${detalle.cup_det}`,
        detalles: {
          cupoDisponible: false,
          yaInscrito: false,
          estadoDetalle: detalle.est_evt_det
        }
      };
    }

    // ===== VALIDACIÓN 5: USUARIO YA INSCRITO =====
    const yaInscrito = inscritos.some((i: any) => i.id_usu === id_usu);
    if (yaInscrito) {
      return {
        valido: false,
        mensaje: 'El usuario ya está inscrito en este evento',
        detalles: {
          cupoDisponible: true,
          yaInscrito: true,
          estadoDetalle: detalle.est_evt_det
        }
      };
    }

    // ===== INSCRIPCIÓN VÁLIDA =====
    return {
      valido: true,
      detalles: {
        cupoDisponible: true,
        yaInscrito: false,
        estadoDetalle: detalle.est_evt_det
      }
    };
  }

  /**
   * Obtiene todas las inscripciones
   */
  async obtenerTodas(): Promise<InscripcionResponse[]> {
    const inscripciones = await prisma.registro_personas.findMany({
      include: INSCRIPCION_INCLUDES,
      orderBy: {
        fec_reg_per: 'desc'
      }
    });

    return inscripciones.map(i => this.formatResponse(i));
  }

  /**
   * Obtiene una inscripción por ID
   */
  async obtenerPorId(num_reg_per: number): Promise<InscripcionResponse> {
    const inscripcion = await prisma.registro_personas.findUnique({
      where: { num_reg_per },
      include: INSCRIPCION_INCLUDES
    });

    if (!inscripcion) {
      throw new Error('Inscripción no encontrada');
    }

    return this.formatResponse(inscripcion);
  }

  /**
   * Obtiene inscripciones por usuario
   */
  async obtenerPorUsuario(id_usu: number): Promise<InscripcionResponse[]> {
    const inscripciones = await prisma.registro_personas.findMany({
      where: { id_usu },
      include: INSCRIPCION_INCLUDES,
      orderBy: {
        fec_reg_per: 'desc'
      }
    });

    return inscripciones.map(i => this.formatResponse(i));
  }

  /**
   * Obtiene inscripciones por registro de evento
   */
  async obtenerPorRegistroEvento(id_reg_evt: string): Promise<InscripcionResponse[]> {
    const inscripciones = await prisma.registro_personas.findMany({
      where: { id_reg_evt },
      include: INSCRIPCION_INCLUDES,
      orderBy: {
        fec_reg_per: 'desc'
      }
    });

    return inscripciones.map(i => this.formatResponse(i));
  }

  /**
   * Cancela una inscripción (elimina)
   */
  async cancelarInscripcion(num_reg_per: number, id_usu?: number): Promise<void> {
    // Verificar que existe
    const inscripcion = await prisma.registro_personas.findUnique({
      where: { num_reg_per },
      include: {
        registro_evento: {
          include: {
            detalle_eventos: true
          }
        }
      }
    });

    if (!inscripcion) {
      throw new Error('Inscripción no encontrada');
    }

    // Si se proporciona id_usu, verificar que sea el dueño
    if (id_usu && inscripcion.id_usu !== id_usu) {
      throw new Error('No tienes permiso para cancelar esta inscripción');
    }

    // Solo permitir cancelación si el detalle está en INSCRIPCIONES
    const estadoDetalle = inscripcion.registro_evento.detalle_eventos.est_evt_det;
    if (estadoDetalle !== EstadoDetalleEvento.INSCRIPCIONES) {
      throw new Error(
        `No se puede cancelar la inscripción. El evento está en estado: ${estadoDetalle}`
      );
    }

    // Eliminar inscripción
    await prisma.registro_personas.delete({
      where: { num_reg_per }
    });
  }

  /**
   * Obtiene estadísticas de inscripciones por evento
   */
  async obtenerEstadisticasPorEvento(id_reg_evt: string) {
    const registroEvento = await prisma.registro_evento.findUnique({
      where: { id_reg_evt },
      include: {
        detalle_eventos: true,
        registro_personas: {
          include: {
            usuarios: true
          }
        }
      }
    });

    if (!registroEvento) {
      throw new Error('Registro de evento no encontrado');
    }

    const cupoTotal = registroEvento.detalle_eventos.cup_det;
    const inscritos = registroEvento.registro_personas.length;
    const cupoDisponible = cupoTotal - inscritos;

    return {
      id_reg_evt,
      cupoTotal,
      inscritos,
      cupoDisponible,
      porcentajeOcupacion: Math.round((inscritos / cupoTotal) * 100),
      listadoInscritos: registroEvento.registro_personas.map(rp => ({
        num_reg_per: rp.num_reg_per,
        usuario: {
          id_usu: rp.usuarios.id_usu,
          nombre: `${rp.usuarios.nom_usu} ${rp.usuarios.ape_usu}`,
          correo: rp.usuarios.cor_usu
        },
        fec_reg_per: rp.fec_reg_per
      }))
    };
  }

  /**
   * Formatea la respuesta
   */
  private formatResponse(inscripcion: any): InscripcionResponse {
    return {
      num_reg_per: inscripcion.num_reg_per,
      id_usu: inscripcion.id_usu,
      id_reg_evt: inscripcion.id_reg_evt,
      fec_reg_per: inscripcion.fec_reg_per,
      usuario: inscripcion.usuarios,
      registro_evento: inscripcion.registro_evento
    };
  }
}

export const inscripcionesService = new InscripcionesService();
