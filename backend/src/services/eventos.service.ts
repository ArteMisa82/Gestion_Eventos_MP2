import prisma from '../config/database';
import { CreateEventoDto, UpdateEventoDto, AsignarResponsableDto } from '../types/eventos.types';

export class EventosService {
  /**
   * Genera un ID único para el evento
   * Formato: EVT + timestamp de 6 dígitos
   */
  private async generateEventoId(): Promise<string> {
    const timestamp = Date.now().toString().slice(-6);
    const id = `EVT${timestamp}`;
    
    // Verificar que no exista
    const exists = await prisma.eventos.findUnique({
      where: { id_evt: id }
    });
    
    if (exists) {
      // Si existe, intentar de nuevo con un número aleatorio
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `EVT${random}${timestamp.slice(-3)}`;
    }
    
    return id;
  }

  /**
   * ADMIN (Administrador = true): Crear evento (campos básicos)
   */
  async crearEvento(data: CreateEventoDto, adminId: number) {
    try {
      // Verificar que el usuario sea administrador (superusuario)
      const admin = await prisma.usuarios.findUnique({
        where: { id_usu: adminId }
      });

      if (!admin || !admin.Administrador) {
        throw new Error('Solo el administrador puede crear eventos');
      }

      // Si se asigna responsable, verificar que sea usuario administrativo (adm_usu = 1)
      if (data.id_responsable) {
        const responsable = await prisma.usuarios.findUnique({
          where: { id_usu: data.id_responsable }
        });

        if (!responsable || responsable.adm_usu !== 1) {
          throw new Error('El responsable debe ser un usuario administrativo (profesor, secretaría, etc.)');
        }
      }

      // Generar ID
      const id_evt = await this.generateEventoId();
      
      console.log('ID generado para evento:', id_evt);
      console.log('Datos a insertar:', {
        id_evt,
        nom_evt: data.nom_evt,
        fec_evt: data.fec_evt,
        lug_evt: data.lug_evt,
        des_evt: data.des_evt,
        mod_evt: data.mod_evt || 'Presencial',
        tip_pub_evt: data.tip_pub_evt || 'Público',
        cos_evt: data.cos_evt || 'Gratuito',
        id_res_evt: data.id_responsable || null
      });

      // Crear evento con campos básicos
      const evento = await prisma.eventos.create({
        data: {
          id_evt,
          nom_evt: data.nom_evt,
          fec_evt: new Date(data.fec_evt),
          lug_evt: data.lug_evt,
          des_evt: data.des_evt,
          mod_evt: data.mod_evt?.toUpperCase() || 'PRESENCIAL',
          tip_pub_evt: data.tip_pub_evt?.toUpperCase() || 'GENERAL',
          cos_evt: data.cos_evt?.toUpperCase() || 'GRATUITO',
          id_res_evt: data.id_responsable || null
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
      });

      console.log('Evento creado exitosamente:', evento);
      return evento;
      
    } catch (error) {
      console.error('Error al crear evento:', error);
      throw error;
    }
  }

  /**
   * Listar todos los eventos
   */
  async obtenerTodos() {
    return await prisma.eventos.findMany({
      include: {
        usuarios: {
          select: {
            id_usu: true,
            nom_usu: true,
            ape_usu: true,
            cor_usu: true
          }
        },
        detalle_eventos: true,
        tarifas_evento: true
      },
      orderBy: {
        fec_evt: 'desc'
      }
    });
  }

  /**
   * Obtener un evento por ID
   */
  async obtenerPorId(id: string) {
    const evento = await prisma.eventos.findUnique({
      where: { id_evt: id },
      include: {
        usuarios: {
          select: {
            id_usu: true,
            nom_usu: true,
            ape_usu: true,
            cor_usu: true
          }
        },
        detalle_eventos: {
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
        tarifas_evento: true,
        requerimientos: true
      }
    });

    if (!evento) {
      throw new Error('Evento no encontrado');
    }

    return evento;
  }

  /**
   * ADMIN (Administrador = true): Asignar o cambiar responsable del evento
   */
  async asignarResponsable(idEvento: string, data: AsignarResponsableDto, adminId: number) {
    // Verificar que el usuario sea administrador (superusuario)
    const admin = await prisma.usuarios.findUnique({
      where: { id_usu: adminId }
    });

    if (!admin || !admin.Administrador) {
      throw new Error('Solo el administrador puede asignar responsables');
    }

    // Verificar que el evento existe
    const evento = await prisma.eventos.findUnique({
      where: { id_evt: idEvento }
    });

    if (!evento) {
      throw new Error('Evento no encontrado');
    }

    // Verificar que el responsable sea usuario administrativo (adm_usu = 1)
    const responsable = await prisma.usuarios.findUnique({
      where: { id_usu: data.id_responsable }
    });

    if (!responsable || responsable.adm_usu !== 1) {
      throw new Error('El responsable debe ser un usuario administrativo (profesor, secretaría, etc.)');
    }

    // Asignar responsable
    return await prisma.eventos.update({
      where: { id_evt: idEvento },
      data: { id_res_evt: data.id_responsable },
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
    });
  }

  /**
   * RESPONSABLE: Actualizar detalles del evento asignado
   */
  async actualizarEvento(idEvento: string, data: UpdateEventoDto, userId: number) {
    // Verificar que el evento existe
    const evento = await prisma.eventos.findUnique({
      where: { id_evt: idEvento }
    });

    if (!evento) {
      throw new Error('Evento no encontrado');
    }

    // Verificar que el usuario sea el responsable del evento
    if (evento.id_res_evt !== userId) {
      throw new Error('Solo el responsable asignado puede editar los detalles del evento');
    }

    // Actualizar evento
    return await prisma.eventos.update({
      where: { id_evt: idEvento },
      data: {
        nom_evt: data.nom_evt,
        fec_evt: data.fec_evt ? new Date(data.fec_evt) : undefined,
        lug_evt: data.lug_evt,
        mod_evt: data.mod_evt,
        tip_pub_evt: data.tip_pub_evt,
        cos_evt: data.cos_evt,
        des_evt: data.des_evt
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
    });
  }

  /**
   * ADMIN (Administrador = true): Eliminar evento
   */
  async eliminarEvento(idEvento: string, adminId: number) {
    // Verificar que el usuario sea administrador (superusuario)
    const admin = await prisma.usuarios.findUnique({
      where: { id_usu: adminId }
    });

    if (!admin || !admin.Administrador) {
      throw new Error('Solo el administrador puede eliminar eventos');
    }

    return await prisma.eventos.delete({
      where: { id_evt: idEvento }
    });
  }

  /**
   * Listar usuarios administrativos (para asignar como responsables)
   */
  async obtenerUsuariosAdministrativos() {
    return await prisma.usuarios.findMany({
      where: {
        adm_usu: 1
      },
      select: {
        id_usu: true,
        nom_usu: true,
        ape_usu: true,
        cor_usu: true
      },
      orderBy: {
        nom_usu: 'asc'
      }
    });
  }

  /**
   * Obtener eventos asignados a un responsable
   */
  async obtenerEventosPorResponsable(userId: number) {
    return await prisma.eventos.findMany({
      where: {
        id_res_evt: userId
      },
      include: {
        detalle_eventos: true,
        tarifas_evento: true
      },
      orderBy: {
        fec_evt: 'desc'
      }
    });
  }
}
