/**
 * Servicio para gestión de registro_evento
 * Responsabilidad: Vincular detalles de eventos con niveles académicos
 */

import prisma from '../config/database';
import { generateRegistroEventoId } from '../utils/id-generator.util';
import {
  CrearRegistroEventoDTO,
  ActualizarRegistroEventoDTO,
  RegistroEventoResponse
} from '../types/registro.types';

const REGISTRO_EVENTO_INCLUDES = {
  detalle_eventos: {
    include: {
      eventos: true
    }
  },
  nivel: {
    include: {
      carreras: true
    }
  },
  registro_personas: {
    select: {
      num_reg_per: true,
      id_usu: true,
      fec_reg_per: true
    }
  }
};

export class RegistroEventoService {
  /**
   * Crea un nuevo registro de evento (vincula detalle con nivel)
   */
  async crearRegistroEvento(data: CrearRegistroEventoDTO): Promise<RegistroEventoResponse> {
    // Validar que el detalle existe
    const detalle = await prisma.detalle_eventos.findUnique({
      where: { id_det: data.id_det }
    });

    if (!detalle) {
      throw new Error('El detalle del evento no existe');
    }

    // Validar que el nivel existe
    const nivel = await prisma.nivel.findUnique({
      where: { id_niv: data.id_niv }
    });

    if (!nivel) {
      throw new Error('El nivel académico no existe');
    }

    // Verificar que no exista ya esta combinación
    const existente = await prisma.registro_evento.findFirst({
      where: {
        id_det: data.id_det,
        id_niv: data.id_niv
      }
    });

    if (existente) {
      throw new Error('Ya existe un registro de evento para este detalle y nivel');
    }

    // Generar ID único
    const id_reg_evt = await generateRegistroEventoId();

    // Crear el registro
    const registroEvento = await prisma.registro_evento.create({
      data: {
        id_reg_evt,
        id_det: data.id_det,
        id_niv: data.id_niv
      },
      include: REGISTRO_EVENTO_INCLUDES
    });

    return this.formatResponse(registroEvento);
  }

  /**
   * Obtiene todos los registros de eventos
   */
  async obtenerTodos(): Promise<RegistroEventoResponse[]> {
    const registros = await prisma.registro_evento.findMany({
      include: REGISTRO_EVENTO_INCLUDES
    });

    return registros.map(r => this.formatResponse(r));
  }

  /**
   * Obtiene un registro de evento por ID
   */
  async obtenerPorId(id_reg_evt: string): Promise<RegistroEventoResponse> {
    const registro = await prisma.registro_evento.findUnique({
      where: { id_reg_evt },
      include: REGISTRO_EVENTO_INCLUDES
    });

    if (!registro) {
      throw new Error('Registro de evento no encontrado');
    }

    return this.formatResponse(registro);
  }

  /**
   * Obtiene registros por detalle
   */
  async obtenerPorDetalle(id_det: string): Promise<RegistroEventoResponse[]> {
    const registros = await prisma.registro_evento.findMany({
      where: { id_det },
      include: REGISTRO_EVENTO_INCLUDES
    });

    return registros.map(r => this.formatResponse(r));
  }

  /**
   * Obtiene registros por nivel
   */
  async obtenerPorNivel(id_niv: string): Promise<RegistroEventoResponse[]> {
    const registros = await prisma.registro_evento.findMany({
      where: { id_niv },
      include: REGISTRO_EVENTO_INCLUDES
    });

    return registros.map(r => this.formatResponse(r));
  }

  /**
   * Actualiza un registro de evento
   */
  async actualizarRegistroEvento(
    id_reg_evt: string,
    data: ActualizarRegistroEventoDTO
  ): Promise<RegistroEventoResponse> {
    // Verificar que existe
    const existente = await prisma.registro_evento.findUnique({
      where: { id_reg_evt }
    });

    if (!existente) {
      throw new Error('Registro de evento no encontrado');
    }

    // Si se actualiza el detalle, validar que existe
    if (data.id_det) {
      const detalle = await prisma.detalle_eventos.findUnique({
        where: { id_det: data.id_det }
      });
      if (!detalle) {
        throw new Error('El detalle del evento no existe');
      }
    }

    // Si se actualiza el nivel, validar que existe
    if (data.id_niv) {
      const nivel = await prisma.nivel.findUnique({
        where: { id_niv: data.id_niv }
      });
      if (!nivel) {
        throw new Error('El nivel académico no existe');
      }
    }

    // Actualizar
    const actualizado = await prisma.registro_evento.update({
      where: { id_reg_evt },
      data,
      include: REGISTRO_EVENTO_INCLUDES
    });

    return this.formatResponse(actualizado);
  }

  /**
   * Elimina un registro de evento
   */
  async eliminarRegistroEvento(id_reg_evt: string): Promise<void> {
    // Verificar que existe
    const existente = await prisma.registro_evento.findUnique({
      where: { id_reg_evt },
      include: {
        registro_personas: true
      }
    });

    if (!existente) {
      throw new Error('Registro de evento no encontrado');
    }

    // Verificar si tiene inscripciones
    if (existente.registro_personas.length > 0) {
      throw new Error(
        `No se puede eliminar el registro porque tiene ${existente.registro_personas.length} inscripción(es)`
      );
    }

    await prisma.registro_evento.delete({
      where: { id_reg_evt }
    });
  }

  /**
   * Obtiene cursos disponibles para un estudiante según su(s) nivel(es)
   */
  async obtenerCursosParaEstudiante(id_usu: number): Promise<any[]> {
    // Obtener niveles activos del estudiante
    const nivelesEstudiante = await prisma.estudiantes.findMany({
      where: {
        id_usu,
        est_activo: 1
      },
      select: {
        id_niv: true,
        nivel: {
          include: {
            carreras: true
          }
        }
      }
    });

    if (nivelesEstudiante.length === 0) {
      return [];
    }

    const idsNiveles = nivelesEstudiante.map(e => e.id_niv);

    // Obtener registros de eventos para esos niveles
    const cursosDisponibles = await prisma.registro_evento.findMany({
      where: {
        id_niv: {
          in: idsNiveles
        },
        detalle_eventos: {
          est_evt_det: 'INSCRIPCIONES' // Solo cursos en inscripciones
        }
      },
      include: {
        detalle_eventos: {
          include: {
            eventos: true,
            detalle_instructores: {
              include: {
                usuarios: {
                  select: {
                    id_usu: true,
                    nom_usu: true,
                    ape_usu: true
                  }
                }
              }
            }
          }
        },
        nivel: {
          include: {
            carreras: true
          }
        },
        registro_personas: {
          select: {
            num_reg_per: true
          }
        }
      }
    });

    // Formatear respuesta con información de cupos
    return cursosDisponibles.map(curso => {
      const inscritos = curso.registro_personas.length;
      const cupoTotal = curso.detalle_eventos.cup_det;
      
      return {
        id_reg_evt: curso.id_reg_evt,
        evento: {
          id_evt: curso.detalle_eventos.eventos.id_evt,
          nom_evt: curso.detalle_eventos.eventos.nom_evt,
          fec_evt: curso.detalle_eventos.eventos.fec_evt,
          lug_evt: curso.detalle_eventos.eventos.lug_evt,
          mod_evt: curso.detalle_eventos.eventos.mod_evt,
          des_evt: curso.detalle_eventos.eventos.des_evt
        },
        detalle: {
          id_det: curso.detalle_eventos.id_det,
          are_det: curso.detalle_eventos.are_det,
          cat_det: curso.detalle_eventos.cat_det,
          tip_evt: curso.detalle_eventos.tip_evt,
          hor_det: curso.detalle_eventos.hor_det,
          est_evt_det: curso.detalle_eventos.est_evt_det
        },
        nivel: {
          id_niv: curso.nivel.id_niv,
          nom_niv: curso.nivel.nom_niv,
          carrera: curso.nivel.carreras.nom_car
        },
        instructores: curso.detalle_eventos.detalle_instructores.map(di => ({
          nombre: `${di.usuarios.nom_usu} ${di.usuarios.ape_usu}`,
          rol: di.rol_instructor
        })),
        cupo: {
          total: cupoTotal,
          ocupado: inscritos,
          disponible: cupoTotal - inscritos,
          porcentaje: Math.round((inscritos / cupoTotal) * 100)
        }
      };
    });
  }

  /**
   * Obtiene todos los cursos con filtros (para admin/encargado)
   */
  async obtenerCursosFiltrados(filtros: {
    id_responsable?: number;
    id_instructor?: number;
    id_niv?: string;
    id_carrera?: string;
    estado?: string;
  }): Promise<any[]> {
    const whereDetalle: any = {};
    const whereEvento: any = {};
    const whereNivel: any = {};

    // Filtro por estado del detalle
    if (filtros.estado) {
      whereDetalle.est_evt_det = filtros.estado;
    }

    // Filtro por responsable del evento
    if (filtros.id_responsable) {
      whereEvento.id_res_evt = filtros.id_responsable;
    }

    // Filtro por instructor
    if (filtros.id_instructor) {
      whereDetalle.detalle_instructores = {
        some: {
          id_usu: filtros.id_instructor
        }
      };
    }

    // Filtro por nivel
    if (filtros.id_niv) {
      whereNivel.id_niv = filtros.id_niv;
    }

    // Filtro por carrera
    if (filtros.id_carrera) {
      whereNivel.id_car = filtros.id_carrera;
    }

    const cursos = await prisma.registro_evento.findMany({
      where: {
        detalle_eventos: {
          ...whereDetalle,
          eventos: whereEvento
        },
        nivel: whereNivel
      },
      include: {
        detalle_eventos: {
          include: {
            eventos: {
              include: {
                usuarios: {
                  select: {
                    id_usu: true,
                    nom_usu: true,
                    ape_usu: true
                  }
                }
              }
            },
            detalle_instructores: {
              include: {
                usuarios: {
                  select: {
                    id_usu: true,
                    nom_usu: true,
                    ape_usu: true
                  }
                }
              }
            }
          }
        },
        nivel: {
          include: {
            carreras: true
          }
        },
        registro_personas: {
          select: {
            num_reg_per: true,
            id_usu: true
          }
        }
      },
      orderBy: {
        detalle_eventos: {
          eventos: {
            fec_evt: 'desc'
          }
        }
      }
    });

    // Formatear respuesta
    return cursos.map(curso => {
      const inscritos = curso.registro_personas.length;
      const cupoTotal = curso.detalle_eventos.cup_det;

      return {
        id_reg_evt: curso.id_reg_evt,
        evento: {
          id_evt: curso.detalle_eventos.eventos.id_evt,
          nom_evt: curso.detalle_eventos.eventos.nom_evt,
          fec_evt: curso.detalle_eventos.eventos.fec_evt,
          lug_evt: curso.detalle_eventos.eventos.lug_evt,
          mod_evt: curso.detalle_eventos.eventos.mod_evt,
          des_evt: curso.detalle_eventos.eventos.des_evt,
          responsable: curso.detalle_eventos.eventos.usuarios ? {
            id_usu: curso.detalle_eventos.eventos.usuarios.id_usu,
            nombre: `${curso.detalle_eventos.eventos.usuarios.nom_usu} ${curso.detalle_eventos.eventos.usuarios.ape_usu}`
          } : null
        },
        detalle: {
          id_det: curso.detalle_eventos.id_det,
          are_det: curso.detalle_eventos.are_det,
          cat_det: curso.detalle_eventos.cat_det,
          tip_evt: curso.detalle_eventos.tip_evt,
          hor_det: curso.detalle_eventos.hor_det,
          est_evt_det: curso.detalle_eventos.est_evt_det
        },
        nivel: {
          id_niv: curso.nivel.id_niv,
          nom_niv: curso.nivel.nom_niv,
          carrera: {
            id_car: curso.nivel.carreras.id_car,
            nom_car: curso.nivel.carreras.nom_car
          }
        },
        instructores: curso.detalle_eventos.detalle_instructores.map(di => ({
          id_usu: di.usuarios.id_usu,
          nombre: `${di.usuarios.nom_usu} ${di.usuarios.ape_usu}`,
          rol: di.rol_instructor
        })),
        cupo: {
          total: cupoTotal,
          ocupado: inscritos,
          disponible: cupoTotal - inscritos,
          porcentaje: Math.round((inscritos / cupoTotal) * 100)
        },
        inscritos: curso.registro_personas.map(rp => rp.id_usu)
      };
    });
  }

  /**
   * Formatea la respuesta con datos adicionales
   */
  private formatResponse(registro: any): RegistroEventoResponse {
    return {
      id_reg_evt: registro.id_reg_evt,
      id_det: registro.id_det,
      id_niv: registro.id_niv,
      detalle: registro.detalle_eventos,
      nivel: registro.nivel,
      cantidadInscritos: registro.registro_personas?.length || 0
    };
  }
}

export const registroEventoService = new RegistroEventoService();
