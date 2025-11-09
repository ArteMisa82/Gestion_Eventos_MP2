import prisma from '../config/database';

export class EventosService {
  async obtenerTodos() {
    return await prisma.eventos.findMany({
      include: {
        //detalle_eventos: true,
        tarifas_evento: true
      }
    });
  }
}
