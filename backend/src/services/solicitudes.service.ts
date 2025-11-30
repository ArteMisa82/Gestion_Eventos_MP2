import { SolicitudCambio } from '../types/solicitudes.types';
import prisma from '../config/database';

export class SolicitudesService {

  async crearSolicitud(solicitud: SolicitudCambio) {
    return await prisma.solicitudes.create({
      data: {
        titulo: solicitud.titulo,
        descripcion: solicitud.descripcion,
        usuarioId: solicitud.usuarioId,
        estado: 'pendiente', // estado inicial
      },
    });
  }

  // 🔹 Página general: muestra todas las solicitudes
  async listarTodas() {
    return await prisma.solicitudes.findMany({
      orderBy: { fechaCreacion: 'desc' },
      include: {
        usuarios: true,
      },
    });
  }

  // 🔹 Página del comité: solo solicitudes para revisión
  async listarSolicitudesComite() {
    return await prisma.solicitudes.findMany({
      where: { estado: 'pendiente' },  // filtra solo las del comité
      orderBy: { fechaCreacion: 'desc' },
      include: {
        usuarios: true, // trae info del usuario/programador
      },
    });
  }
}
