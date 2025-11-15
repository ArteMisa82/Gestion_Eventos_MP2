/**
 * Servicio para gestión de estudiantes y sus niveles
 * Responsabilidad: Asignar/gestionar niveles académicos de estudiantes
 */

import prisma from '../config/database';

export class EstudiantesService {
  /**
   * Asigna un estudiante a un nivel
   */
  async asignarEstudianteANivel(
    id_usu: number,
    id_niv: string,
    observaciones?: string
  ) {
    // Verificar que el usuario existe y es estudiante
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usu }
    });

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    if (usuario.stu_usu !== 1) {
      throw new Error('El usuario no es un estudiante');
    }

    // Verificar que el nivel existe
    const nivel = await prisma.nivel.findUnique({
      where: { id_niv }
    });

    if (!nivel) {
      throw new Error('Nivel académico no encontrado');
    }

    // Verificar si ya está activo en ese nivel
    const yaAsignado = await prisma.estudiantes.findFirst({
      where: {
        id_usu,
        id_niv,
        est_activo: 1
      }
    });

    if (yaAsignado) {
      throw new Error('El estudiante ya está activo en este nivel');
    }

    // Crear la asignación
    const estudiante = await prisma.estudiantes.create({
      data: {
        id_usu,
        id_niv,
        est_activo: 1,
        observaciones
      },
      include: {
        usuarios: {
          select: {
            id_usu: true,
            nom_usu: true,
            ape_usu: true,
            cor_usu: true
          }
        },
        nivel: {
          include: {
            carreras: true
          }
        }
      }
    });

    return estudiante;
  }

  /**
   * Desactiva un estudiante de un nivel
   */
  async desactivarEstudianteDeNivel(id_est: number) {
    const estudiante = await prisma.estudiantes.findUnique({
      where: { id_est }
    });

    if (!estudiante) {
      throw new Error('Registro de estudiante no encontrado');
    }

    // Actualizar estado y fecha de egreso
    return await prisma.estudiantes.update({
      where: { id_est },
      data: {
        est_activo: 0,
        fec_egreso: new Date()
      },
      include: {
        usuarios: {
          select: {
            id_usu: true,
            nom_usu: true,
            ape_usu: true
          }
        },
        nivel: true
      }
    });
  }

  /**
   * Obtiene todos los estudiantes de un nivel
   */
  async obtenerEstudiantesPorNivel(id_niv: string, soloActivos: boolean = true) {
    const whereClause: any = { id_niv };
    
    if (soloActivos) {
      whereClause.est_activo = 1;
    }

    const estudiantes = await prisma.estudiantes.findMany({
      where: whereClause,
      include: {
        usuarios: {
          select: {
            id_usu: true,
            nom_usu: true,
            nom_seg_usu: true,
            ape_usu: true,
            ape_seg_usu: true,
            cor_usu: true,
            tel_usu: true,
            ced_usu: true
          }
        },
        nivel: {
          include: {
            carreras: true
          }
        }
      },
      orderBy: {
        usuarios: {
          ape_usu: 'asc'
        }
      }
    });

    return estudiantes.map(est => ({
      id_est: est.id_est,
      estudiante: {
        id_usu: est.usuarios.id_usu,
        nombre_completo: `${est.usuarios.nom_usu} ${est.usuarios.nom_seg_usu || ''} ${est.usuarios.ape_usu} ${est.usuarios.ape_seg_usu || ''}`.trim(),
        correo: est.usuarios.cor_usu,
        cedula: est.usuarios.ced_usu,
        telefono: est.usuarios.tel_usu
      },
      nivel: {
        id_niv: est.nivel.id_niv,
        nom_niv: est.nivel.nom_niv,
        carrera: est.nivel.carreras.nom_car
      },
      fec_ingreso: est.fec_ingreso,
      fec_egreso: est.fec_egreso,
      est_activo: est.est_activo,
      observaciones: est.observaciones
    }));
  }

  /**
   * Obtiene el historial de niveles de un estudiante
   */
  async obtenerHistorialEstudiante(id_usu: number) {
    const historial = await prisma.estudiantes.findMany({
      where: { id_usu },
      include: {
        nivel: {
          include: {
            carreras: true
          }
        }
      },
      orderBy: {
        fec_ingreso: 'desc'
      }
    });

    return historial.map(est => ({
      id_est: est.id_est,
      nivel: {
        id_niv: est.nivel.id_niv,
        nom_niv: est.nivel.nom_niv,
        carrera: est.nivel.carreras.nom_car
      },
      fec_ingreso: est.fec_ingreso,
      fec_egreso: est.fec_egreso,
      est_activo: est.est_activo,
      observaciones: est.observaciones
    }));
  }

  /**
   * Obtiene niveles activos de un estudiante
   */
  async obtenerNivelesActivosEstudiante(id_usu: number) {
    const nivelesActivos = await prisma.estudiantes.findMany({
      where: {
        id_usu,
        est_activo: 1
      },
      include: {
        nivel: {
          include: {
            carreras: true
          }
        }
      }
    });

    return nivelesActivos.map(est => ({
      id_est: est.id_est,
      id_niv: est.nivel.id_niv,
      nom_niv: est.nivel.nom_niv,
      carrera: est.nivel.carreras.nom_car,
      fec_ingreso: est.fec_ingreso
    }));
  }
}

export const estudiantesService = new EstudiantesService();
