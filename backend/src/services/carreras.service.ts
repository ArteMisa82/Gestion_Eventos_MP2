/**
 * Servicio para gestión de carreras
 * Responsabilidad: CRUD de carreras académicas
 */

import prisma from '../config/database';

export interface CrearCarreraDTO {
  id_car: string;
  nom_car: string;
}

export interface ActualizarCarreraDTO {
  nom_car?: string;
}

export class CarrerasService {
  /**
   * Crea una nueva carrera
   */
  async crearCarrera(data: CrearCarreraDTO) {
    // Verificar que no exista
    const existe = await prisma.carreras.findUnique({
      where: { id_car: data.id_car }
    });

    if (existe) {
      throw new Error(`Ya existe una carrera con el ID: ${data.id_car}`);
    }

    return await prisma.carreras.create({
      data: {
        id_car: data.id_car,
        nom_car: data.nom_car
      },
      include: {
        nivel: true
      }
    });
  }

  /**
   * Obtiene todas las carreras
   */
  async obtenerTodas() {
    const carreras = await prisma.carreras.findMany({
      include: {
        nivel: true
      },
      orderBy: {
        nom_car: 'asc'
      }
    });

    return carreras.map(carrera => ({
      id_car: carrera.id_car,
      nom_car: carrera.nom_car,
      cantidad_niveles: carrera.nivel.length,
      niveles: carrera.nivel.map(n => ({
        id_niv: n.id_niv,
        nom_niv: n.nom_niv,
        org_cur_niv: n.org_cur_niv
      }))
    }));
  }

  /**
   * Obtiene una carrera por ID
   */
  async obtenerPorId(id_car: string) {
    const carrera = await prisma.carreras.findUnique({
      where: { id_car },
      include: {
        nivel: {
          orderBy: {
            nom_niv: 'asc'
          }
        }
      }
    });

    if (!carrera) {
      throw new Error('Carrera no encontrada');
    }

    return {
      id_car: carrera.id_car,
      nom_car: carrera.nom_car,
      cantidad_niveles: carrera.nivel.length,
      niveles: carrera.nivel.map(n => ({
        id_niv: n.id_niv,
        nom_niv: n.nom_niv,
        org_cur_niv: n.org_cur_niv
      }))
    };
  }

  /**
   * Actualiza una carrera
   */
  async actualizarCarrera(id_car: string, data: ActualizarCarreraDTO) {
    // Verificar que existe
    const existe = await prisma.carreras.findUnique({
      where: { id_car }
    });

    if (!existe) {
      throw new Error('Carrera no encontrada');
    }

    return await prisma.carreras.update({
      where: { id_car },
      data,
      include: {
        nivel: true
      }
    });
  }

  /**
   * Elimina una carrera
   */
  async eliminarCarrera(id_car: string) {
    // Verificar que existe
    const carrera = await prisma.carreras.findUnique({
      where: { id_car },
      include: {
        nivel: true
      }
    });

    if (!carrera) {
      throw new Error('Carrera no encontrada');
    }

    // Verificar si tiene niveles asociados
    if (carrera.nivel.length > 0) {
      throw new Error(
        `No se puede eliminar la carrera porque tiene ${carrera.nivel.length} nivel(es) asociado(s)`
      );
    }

    await prisma.carreras.delete({
      where: { id_car }
    });
  }

  /**
   * Obtiene estadísticas de carreras
   */
  async obtenerEstadisticas() {
    const carreras = await prisma.carreras.findMany({
      include: {
        nivel: {
          include: {
            estudiantes: {
              where: {
                est_activo: 1
              }
            }
          }
        }
      }
    });

    return carreras.map(carrera => {
      const totalEstudiantes = carrera.nivel.reduce(
        (sum, nivel) => sum + nivel.estudiantes.length,
        0
      );

      return {
        id_car: carrera.id_car,
        nom_car: carrera.nom_car,
        cantidad_niveles: carrera.nivel.length,
        estudiantes_activos: totalEstudiantes
      };
    });
  }
}

export const carrerasService = new CarrerasService();
