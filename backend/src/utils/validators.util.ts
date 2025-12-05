import prisma from '../config/database';
import { InstructorDto } from '../types/eventos.types';

/**
 * Valida que el usuario sea administrador (superusuario)
 */
export async function validateIsAdmin(userId: number): Promise<void> {
  const admin = await prisma.usuarios.findUnique({
    where: { id_usu: userId }
  });

  console.log(`[validateIsAdmin] Usuario ID: ${userId}, Administrador: ${admin?.Administrador}, adm_usu: ${admin?.adm_usu}, Email: ${admin?.cor_usu}`);

  if (!admin || !admin.Administrador) {
    throw new Error('Solo el administrador puede realizar esta acción');
  }
}

/**
 * Valida que el usuario sea el responsable del evento O sea administrador
 */
export async function validateIsResponsableOrAdmin(
  userId: number, 
  eventoId: string
): Promise<void> {
  const usuario = await prisma.usuarios.findUnique({
    where: { id_usu: userId }
  });

  const evento = await prisma.eventos.findUnique({
    where: { id_evt: eventoId }
  });

  if (!evento) {
    throw new Error('Evento no encontrado');
  }

  const esResponsable = evento.id_res_evt === userId;
  const esAdmin = usuario?.Administrador === true;

  if (!esResponsable && !esAdmin) {
    throw new Error('Solo el responsable asignado o el administrador pueden realizar esta acción');
  }
}

/**
 * Valida que todos los instructores existan en la base de datos
 * Los instructores pueden ser cualquier usuario (administrativo o no)
 */
export async function validateInstructores(instructores: InstructorDto[]): Promise<void> {
  for (const instructor of instructores) {
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usu: instructor.id_usu }
    });

    if (!usuario) {
      throw new Error(
        `El instructor con ID ${instructor.id_usu} no existe en el sistema`
      );
    }
  }
}

/**
 * Valida que un usuario sea administrativo (adm_usu = 1)
 */
export async function validateIsAdministrativeUser(userId: number): Promise<void> {
  const usuario = await prisma.usuarios.findUnique({
    where: { id_usu: userId }
  });

  if (!usuario || usuario.adm_usu !== 1) {
    throw new Error('El usuario debe ser administrativo (profesor, secretaría, etc.)');
  }
}
