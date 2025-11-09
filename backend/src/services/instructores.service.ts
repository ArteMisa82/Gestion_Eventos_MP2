import prisma from '../config/database';
import { InstructorDto } from '../types/eventos.types';
import { validateInstructores } from '../utils/validators.util';
import { INSTRUCTOR_INCLUDE } from '../utils/prisma-includes.util';

/**
 * Servicio para gestionar instructores de eventos
 * Responsabilidad: CRUD de instructores asignados a detalles de eventos
 */
export class InstructoresService {
  /**
   * Asignar múltiples instructores a un detalle de evento
   */
  async asignarInstructores(detalleId: string, instructores: InstructorDto[]) {
    await validateInstructores(instructores);
    
    return await prisma.detalle_instructores.createMany({
      data: instructores.map(inst => ({
        id_det: detalleId,
        id_usu: inst.id_usu,
        rol_instructor: inst.rol_instructor?.toUpperCase() || 'INSTRUCTOR'
      }))
    });
  }

  /**
   * Reemplazar todos los instructores de un detalle
   * (Elimina los actuales y crea los nuevos)
   */
  async reemplazarInstructores(detalleId: string, nuevos: InstructorDto[]) {
    await validateInstructores(nuevos);
    
    // Eliminar instructores actuales
    await prisma.detalle_instructores.deleteMany({
      where: { id_det: detalleId }
    });
    
    // Crear nuevos instructores
    return await this.asignarInstructores(detalleId, nuevos);
  }

  /**
   * Obtener instructores de un detalle específico
   */
  async obtenerPorDetalle(detalleId: string) {
    return await prisma.detalle_instructores.findMany({
      where: { id_det: detalleId },
      ...INSTRUCTOR_INCLUDE
    });
  }

  /**
   * Eliminar un instructor específico de un detalle
   */
  async eliminarInstructor(detalleId: string, usuarioId: number) {
    return await prisma.detalle_instructores.delete({
      where: {
        id_det_id_usu: {
          id_det: detalleId,
          id_usu: usuarioId
        }
      }
    });
  }

  /**
   * Eliminar todos los instructores de un detalle
   */
  async eliminarTodos(detalleId: string) {
    return await prisma.detalle_instructores.deleteMany({
      where: { id_det: detalleId }
    });
  }
}
