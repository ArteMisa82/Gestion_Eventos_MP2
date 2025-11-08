import prisma from '../config/database';
import { 
  CreateEventoDto, 
  UpdateEventoDto, 
  AsignarResponsableDto,
  CreateDetalleEventoDto,
  UpdateDetalleEventoDto 
} from '../types/eventos.types';

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
          est_evt: 'EDITANDO', // Estado inicial al crear
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
   * RESPONSABLE o ADMIN: Actualizar detalles del evento asignado
   */
  async actualizarEvento(idEvento: string, data: UpdateEventoDto, userId: number) {
    // Verificar que el evento existe
    const evento = await prisma.eventos.findUnique({
      where: { id_evt: idEvento }
    });

    if (!evento) {
      throw new Error('Evento no encontrado');
    }

    // Verificar que el usuario sea el responsable del evento O sea administrador
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usu: userId }
    });

    const esResponsable = evento.id_res_evt === userId;
    const esAdmin = usuario?.Administrador === true;

    if (!esResponsable && !esAdmin) {
      throw new Error('Solo el responsable asignado o el administrador pueden editar el evento');
    }

    // Actualizar evento
    return await prisma.eventos.update({
      where: { id_evt: idEvento },
      data: {
        nom_evt: data.nom_evt,
        fec_evt: data.fec_evt ? new Date(data.fec_evt) : undefined,
        lug_evt: data.lug_evt,
        mod_evt: data.mod_evt?.toUpperCase(),
        tip_pub_evt: data.tip_pub_evt?.toUpperCase(),
        cos_evt: data.cos_evt?.toUpperCase(),
        des_evt: data.des_evt,
        est_evt: data.est_evt?.toUpperCase() // Permitir cambiar estado
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

  // ==========================================
  // MÉTODOS PARA DETALLE_EVENTOS
  // ==========================================

  /**
   * Genera un ID único para el detalle del evento
   * Formato: DET + timestamp de 7 dígitos
   */
  private async generateDetalleId(): Promise<string> {
    const timestamp = Date.now().toString().slice(-7);
    const id = `DET${timestamp}`;
    
    // Verificar que no exista
    const exists = await prisma.detalle_eventos.findUnique({
      where: { id_det: id }
    });
    
    if (exists) {
      const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      return `DET${random}${timestamp.slice(-5)}`;
    }
    
    return id;
  }

  /**
   * RESPONSABLE: Crear detalle de evento (solo el responsable asignado)
   */
  async crearDetalleEvento(data: CreateDetalleEventoDto, userId: number) {
    // Verificar que el evento existe
    const evento = await prisma.eventos.findUnique({
      where: { id_evt: data.id_evt_per }
    });

    if (!evento) {
      throw new Error('Evento no encontrado');
    }

    // Verificar que el usuario sea el responsable del evento O sea administrador
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usu: userId }
    });

    const esResponsable = evento.id_res_evt === userId;
    const esAdmin = usuario?.Administrador === true;

    if (!esResponsable && !esAdmin) {
      throw new Error('Solo el responsable asignado o el administrador pueden crear detalles del evento');
    }

    // Si se asigna un instructor, verificar que sea usuario administrativo
    if (data.id_usu_doc) {
      const instructor = await prisma.usuarios.findUnique({
        where: { id_usu: data.id_usu_doc }
      });

      if (!instructor || instructor.adm_usu !== 1) {
        throw new Error('El instructor debe ser un usuario administrativo');
      }
    }

    // Generar ID
    const id_det = await this.generateDetalleId();

    // Crear detalle
    return await prisma.detalle_eventos.create({
      data: {
        id_det,
        id_evt_per: data.id_evt_per,
        id_usu_doc: data.id_usu_doc || null,
        cup_det: data.cup_det,
        hor_det: data.hor_det,
        are_det: data.are_det,
        cat_det: data.cat_det?.toUpperCase(),
        tip_evt: data.tip_evt?.toUpperCase(),
        not_evt_det: data.not_evt_det || null,
        asi_evt_det: data.asi_evt_det || null,
        cer_evt_det: data.cer_evt_det || 0,
        apr_evt_det: data.apr_evt_det || 0,
        est_evt_det: 'INSCRIPCIONES' // Estado inicial
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
        eventos: true
      }
    });
  }

  /**
   * RESPONSABLE: Actualizar detalle de evento (solo el responsable asignado)
   */
  async actualizarDetalleEvento(idDetalle: string, data: UpdateDetalleEventoDto, userId: number) {
    // Verificar que el detalle existe
    const detalle = await prisma.detalle_eventos.findUnique({
      where: { id_det: idDetalle },
      include: {
        eventos: true
      }
    });

    if (!detalle) {
      throw new Error('Detalle de evento no encontrado');
    }

    // Verificar que el usuario sea el responsable del evento O sea administrador
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usu: userId }
    });

    const esResponsable = detalle.eventos.id_res_evt === userId;
    const esAdmin = usuario?.Administrador === true;

    if (!esResponsable && !esAdmin) {
      throw new Error('Solo el responsable asignado o el administrador pueden editar los detalles del evento');
    }

    // Si se actualiza el instructor, verificar que sea usuario administrativo
    if (data.id_usu_doc) {
      const instructor = await prisma.usuarios.findUnique({
        where: { id_usu: data.id_usu_doc }
      });

      if (!instructor || instructor.adm_usu !== 1) {
        throw new Error('El instructor debe ser un usuario administrativo');
      }
    }

    // Actualizar detalle
    return await prisma.detalle_eventos.update({
      where: { id_det: idDetalle },
      data: {
        id_usu_doc: data.id_usu_doc,
        cup_det: data.cup_det,
        hor_det: data.hor_det,
        are_det: data.are_det,
        cat_det: data.cat_det?.toUpperCase(),
        tip_evt: data.tip_evt?.toUpperCase(),
        not_evt_det: data.not_evt_det,
        asi_evt_det: data.asi_evt_det,
        cer_evt_det: data.cer_evt_det,
        apr_evt_det: data.apr_evt_det,
        est_evt_det: data.est_evt_det?.toUpperCase()
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
        eventos: true
      }
    });
  }

  /**
   * Obtener detalle de evento por ID
   */
  async obtenerDetallePorId(idDetalle: string) {
    const detalle = await prisma.detalle_eventos.findUnique({
      where: { id_det: idDetalle },
      include: {
        usuarios: {
          select: {
            id_usu: true,
            nom_usu: true,
            ape_usu: true,
            cor_usu: true
          }
        },
        eventos: {
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
        registro_evento: true
      }
    });

    if (!detalle) {
      throw new Error('Detalle de evento no encontrado');
    }

    return detalle;
  }

  /**
   * Listar detalles de un evento específico
   */
  async obtenerDetallesPorEvento(idEvento: string) {
    return await prisma.detalle_eventos.findMany({
      where: {
        id_evt_per: idEvento
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
      },
      orderBy: {
        id_det: 'asc'
      }
    });
  }

  /**
   * RESPONSABLE o ADMIN: Eliminar detalle de evento
   */
  async eliminarDetalleEvento(idDetalle: string, userId: number) {
    // Verificar que el detalle existe
    const detalle = await prisma.detalle_eventos.findUnique({
      where: { id_det: idDetalle },
      include: {
        eventos: true
      }
    });

    if (!detalle) {
      throw new Error('Detalle de evento no encontrado');
    }

    // Verificar que el usuario sea el responsable del evento O sea administrador
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usu: userId }
    });

    const esResponsable = detalle.eventos.id_res_evt === userId;
    const esAdmin = usuario?.Administrador === true;

    if (!esResponsable && !esAdmin) {
      throw new Error('Solo el responsable asignado o el administrador pueden eliminar detalles del evento');
    }

    return await prisma.detalle_eventos.delete({
      where: { id_det: idDetalle }
    });
  }
}
