/**
 * Servicio para gestión de niveles académicos
 * Responsabilidad: CRUD de niveles
 */

import prisma from '../config/database';

export interface CrearNivelDTO {
  id_niv: string;
  nom_niv: string;
  org_cur_niv: string;
  id_car: string;
}

export interface ActualizarNivelDTO {
  nom_niv?: string;
  org_cur_niv?: string;
  id_car?: string;
}

export class NivelesService {
  /**
   * Crea un nuevo nivel
   */
  async crearNivel(data: CrearNivelDTO) {
    // Verificar que no exista
    const existe = await prisma.nivel.findUnique({
      where: { id_niv: data.id_niv }
    });

    if (existe) {
      throw new Error(`Ya existe un nivel con el ID: ${data.id_niv}`);
    }

    // Verificar que la carrera existe
    const carrera = await prisma.carreras.findUnique({
      where: { id_car: data.id_car }
    });

    if (!carrera) {
      throw new Error('La carrera especificada no existe');
    }

    return await prisma.nivel.create({
      data: {
        id_niv: data.id_niv,
        nom_niv: data.nom_niv,
        org_cur_niv: data.org_cur_niv,
        id_car: data.id_car
      },
      include: {
        carreras: true
      }
    });
  }

  /**
   * Obtiene todos los niveles
   */
  async obtenerTodos() {
    const niveles = await prisma.nivel.findMany({
      include: {
        carreras: true,
        estudiantes: {
          where: {
            est_activo: 1
          }
        },
        registro_evento: true
      },
      orderBy: [
        {
          carreras: {
            nom_car: 'asc'
          }
        },
        {
          nom_niv: 'asc'
        }
      ]
    });

    return niveles.map(nivel => ({
      id_niv: nivel.id_niv,
      nom_niv: nivel.nom_niv,
      org_cur_niv: nivel.org_cur_niv,
      carrera: {
        id_car: nivel.carreras.id_car,
        nom_car: nivel.carreras.nom_car
      },
      estudiantes_activos: nivel.estudiantes.length,
      cursos_disponibles: nivel.registro_evento.length
    }));
  }

  /**
   * Obtiene un nivel por ID
   */
  async obtenerPorId(id_niv: string) {
    const nivel = await prisma.nivel.findUnique({
      where: { id_niv },
      include: {
        carreras: true,
        estudiantes: {
          where: {
            est_activo: 1
          },
          include: {
            usuarios: {
              select: {
                id_usu: true,
                nom_usu: true,
                ape_usu: true,
                cor_usu: true
              }
            }
          }
        },
        registro_evento: {
          include: {
            detalle_eventos: {
              include: {
                eventos: {
                  select: {
                    nom_evt: true,
                    fec_evt: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!nivel) {
      throw new Error('Nivel no encontrado');
    }

    return {
      id_niv: nivel.id_niv,
      nom_niv: nivel.nom_niv,
      org_cur_niv: nivel.org_cur_niv,
      carrera: {
        id_car: nivel.carreras.id_car,
        nom_car: nivel.carreras.nom_car
      },
      estudiantes: nivel.estudiantes.map(est => ({
        id_usu: est.usuarios.id_usu,
        nombre: `${est.usuarios.nom_usu} ${est.usuarios.ape_usu}`,
        correo: est.usuarios.cor_usu,
        fec_ingreso: est.fec_ingreso
      })),
      cursos: nivel.registro_evento.map(reg => ({
        id_reg_evt: reg.id_reg_evt,
        evento: reg.detalle_eventos.eventos.nom_evt,
        fecha: reg.detalle_eventos.eventos.fec_evt
      }))
    };
  }

  /**
   * Obtiene niveles por carrera
   */
  async obtenerPorCarrera(id_car: string) {
    const niveles = await prisma.nivel.findMany({
      where: { id_car },
      include: {
        carreras: true,
        estudiantes: {
          where: {
            est_activo: 1
          }
        }
      },
      orderBy: {
        nom_niv: 'asc'
      }
    });

    return niveles.map(nivel => ({
      id_niv: nivel.id_niv,
      nom_niv: nivel.nom_niv,
      org_cur_niv: nivel.org_cur_niv,
      estudiantes_activos: nivel.estudiantes.length
    }));
  }

  /**
   * Actualiza un nivel
   */
  async actualizarNivel(id_niv: string, data: ActualizarNivelDTO) {
    // Verificar que existe
    const existe = await prisma.nivel.findUnique({
      where: { id_niv }
    });

    if (!existe) {
      throw new Error('Nivel no encontrado');
    }

    // Si se actualiza la carrera, verificar que existe
    if (data.id_car) {
      const carrera = await prisma.carreras.findUnique({
        where: { id_car: data.id_car }
      });

      if (!carrera) {
        throw new Error('La carrera especificada no existe');
      }
    }

    return await prisma.nivel.update({
      where: { id_niv },
      data,
      include: {
        carreras: true
      }
    });
  }

  /**
   * Elimina un nivel
   */
  async eliminarNivel(id_niv: string) {
    // Verificar que existe
    const nivel = await prisma.nivel.findUnique({
      where: { id_niv },
      include: {
        estudiantes: true,
        registro_evento: true,
        usuarios: true
      }
    });

    if (!nivel) {
      throw new Error('Nivel no encontrado');
    }

    // Verificar restricciones
    const restricciones = [];

    if (nivel.estudiantes.length > 0) {
      restricciones.push(`${nivel.estudiantes.length} estudiante(s)`);
    }

    if (nivel.registro_evento.length > 0) {
      restricciones.push(`${nivel.registro_evento.length} curso(s)`);
    }

    if (nivel.usuarios.length > 0) {
      restricciones.push(`${nivel.usuarios.length} usuario(s) asignado(s)`);
    }

    if (restricciones.length > 0) {
      throw new Error(
        `No se puede eliminar el nivel porque tiene: ${restricciones.join(', ')}`
      );
    }

    await prisma.nivel.delete({
      where: { id_niv }
    });
  }
}

export const nivelesService = new NivelesService();
