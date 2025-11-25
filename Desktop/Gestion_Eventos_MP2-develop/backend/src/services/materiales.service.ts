import { PrismaClient } from '../generated/prisma';
import { AppError } from '../middlewares/errorHandler.middleware';

const prisma = new PrismaClient();

export class MaterialesService {
  /**
   * Obtener materiales visibles para estudiantes de un curso
   * @param idDetalle - ID del detalle del evento
   */
  async obtenerMaterialesVisibles(idDetalle: string) {
    try {
      const materiales = await prisma.material_curso.findMany({
        where: {
          id_det: idDetalle,
          est_mat: true, // Material activo
          vis_est_mat: true, // Visible para estudiantes
        },
        select: {
          id_mat: true,
          nom_mat: true,
          des_mat: true,
          tip_mat: true,
          tam_mat: true,
          fec_subida: true,
          mat_det: true, // Contenido del PDF
        },
        orderBy: {
          fec_subida: 'desc',
        },
      });

      return materiales;
    } catch (error) {
      console.error('Error al obtener materiales visibles:', error);
      throw new AppError('Error al obtener los materiales', 500);
    }
  }

  /**
   * Obtener TODOS los materiales de un curso (para profesor/encargado)
   * Incluye visibles y no visibles
   * @param idDetalle - ID del detalle del evento
   * @param idUsuario - ID del usuario (debe ser profesor/encargado)
   */
  async obtenerTodosMateriales(idDetalle: string, idUsuario: number) {
    try {
      // Verificar que el usuario sea instructor o responsable del evento
      const esInstructor = await this.verificarEsInstructor(idDetalle, idUsuario);
      const esResponsable = await this.verificarEsResponsable(idDetalle, idUsuario);

      if (!esInstructor && !esResponsable) {
        throw new AppError('No tienes permisos para ver todos los materiales', 403);
      }

      const materiales = await prisma.material_curso.findMany({
        where: {
          id_det: idDetalle,
          est_mat: true,
        },
        select: {
          id_mat: true,
          nom_mat: true,
          des_mat: true,
          tip_mat: true,
          tam_mat: true,
          fec_subida: true,
          vis_est_mat: true, // Incluir visibilidad
          mat_det: true,
          usuarios: {
            select: {
              id_usu: true,
              nom_usu: true,
              nom_seg_usu: true,
              ape_usu: true,
              ape_seg_usu: true,
            },
          },
        },
        orderBy: {
          fec_subida: 'desc',
        },
      });

      return materiales;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error al obtener todos los materiales:', error);
      throw new AppError('Error al obtener los materiales', 500);
    }
  }

  /**
   * Subir nuevo material (solo profesor/encargado)
   */
  async subirMaterial(data: {
    id_det: string;
    nom_mat: string;
    des_mat?: string;
    mat_det: string; // Contenido del PDF (base64, URL, etc.)
    tip_mat?: string;
    tam_mat?: number;
    id_usu_subida: number;
    vis_est_mat?: boolean;
  }) {
    try {
      // Verificar permisos
      const esInstructor = await this.verificarEsInstructor(data.id_det, data.id_usu_subida);
      const esResponsable = await this.verificarEsResponsable(data.id_det, data.id_usu_subida);

      if (!esInstructor && !esResponsable) {
        throw new AppError('No tienes permisos para subir materiales', 403);
      }

      const nuevoMaterial = await prisma.material_curso.create({
        data: {
          id_det: data.id_det,
          nom_mat: data.nom_mat,
          des_mat: data.des_mat,
          mat_det: data.mat_det,
          tip_mat: data.tip_mat || 'PDF',
          tam_mat: data.tam_mat,
          id_usu_subida: data.id_usu_subida,
          vis_est_mat: data.vis_est_mat ?? false, // Por defecto no visible
        },
      });

      return nuevoMaterial;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error al subir material:', error);
      throw new AppError('Error al subir el material', 500);
    }
  }

  /**
   * Cambiar visibilidad de un material (solo profesor/encargado)
   */
  async cambiarVisibilidad(
    idMaterial: number,
    idUsuario: number,
    visible: boolean
  ) {
    try {
      // Obtener el material para verificar permisos
      const material = await prisma.material_curso.findUnique({
        where: { id_mat: idMaterial },
        select: { id_det: true },
      });

      if (!material) {
        throw new AppError('Material no encontrado', 404);
      }

      // Verificar permisos
      const esInstructor = await this.verificarEsInstructor(material.id_det, idUsuario);
      const esResponsable = await this.verificarEsResponsable(material.id_det, idUsuario);

      if (!esInstructor && !esResponsable) {
        throw new AppError('No tienes permisos para modificar la visibilidad', 403);
      }

      const materialActualizado = await prisma.material_curso.update({
        where: { id_mat: idMaterial },
        data: { vis_est_mat: visible },
      });

      return materialActualizado;
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error al cambiar visibilidad:', error);
      throw new AppError('Error al cambiar la visibilidad', 500);
    }
  }

  /**
   * Eliminar material (solo profesor/encargado)
   */
  async eliminarMaterial(idMaterial: number, idUsuario: number) {
    try {
      // Obtener el material para verificar permisos
      const material = await prisma.material_curso.findUnique({
        where: { id_mat: idMaterial },
        select: { id_det: true },
      });

      if (!material) {
        throw new AppError('Material no encontrado', 404);
      }

      // Verificar permisos
      const esInstructor = await this.verificarEsInstructor(material.id_det, idUsuario);
      const esResponsable = await this.verificarEsResponsable(material.id_det, idUsuario);

      if (!esInstructor && !esResponsable) {
        throw new AppError('No tienes permisos para eliminar este material', 403);
      }

      // Eliminación lógica
      await prisma.material_curso.update({
        where: { id_mat: idMaterial },
        data: { est_mat: false },
      });

      return { mensaje: 'Material eliminado correctamente' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error al eliminar material:', error);
      throw new AppError('Error al eliminar el material', 500);
    }
  }

  // ============================================
  // MÉTODOS AUXILIARES PRIVADOS
  // ============================================

  /**
   * Verificar si el usuario es instructor del curso
   */
  private async verificarEsInstructor(idDetalle: string, idUsuario: number): Promise<boolean> {
    const instructor = await prisma.detalle_instructores.findFirst({
      where: {
        id_det: idDetalle,
        id_usu: idUsuario,
      },
    });

    return !!instructor;
  }

  /**
   * Verificar si el usuario es responsable del evento
   */
  private async verificarEsResponsable(idDetalle: string, idUsuario: number): Promise<boolean> {
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
}
