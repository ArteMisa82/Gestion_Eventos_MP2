import { SolicitudCambio } from '../types/solicitudes.types';
import prisma from '../config/database';

export class SolicitudesService {
  async crearSolicitud(solicitud: SolicitudCambio) {
    return await prisma.solicitudes.create({
      data: {
        titulo: solicitud.titulo,
        descripcion: solicitud.descripcion,
        usuarioId: solicitud.usuarioId,
        estado: 'pendiente',
      },
    });
  }

  async listarSolicitudesComite() {
  return await prisma.solicitudes.findMany({
    orderBy: { fechaCreacion: 'desc' },
    include: {
      usuarios: true, // trae info del usuario/programador
    },
  });
}

}
