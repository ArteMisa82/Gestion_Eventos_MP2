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
   * Opcionalmente puede crear los detalles en la misma petición
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

      // Verificar que se haya asignado un responsable (OBLIGATORIO)
      if (!data.id_responsable) {
        throw new Error('Debe asignar un responsable al evento');
      }

      // Verificar que el responsable sea usuario administrativo (adm_usu = 1)
      const responsable = await prisma.usuarios.findUnique({
        where: { id_usu: data.id_responsable }
      });

      if (!responsable || responsable.adm_usu !== 1) {
        throw new Error('El responsable debe ser un usuario administrativo (profesor, secretaría, etc.)');
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
        id_res_evt: data.id_responsable,
        tiene_detalles: !!data.detalles
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
          id_res_evt: data.id_responsable
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

      // Si se enviaron detalles, crearlos también
      let detalleCreado = null;
      if (data.detalles) {
        console.log('Creando detalles del evento...');
        
        // Validar instructores si se proporcionan
        if (data.detalles.instructores && data.detalles.instructores.length > 0) {
          for (const instructor of data.detalles.instructores) {
            const usuarioInstructor = await prisma.usuarios.findUnique({
              where: { id_usu: instructor.id_usu }
            });

            if (!usuarioInstructor || usuarioInstructor.adm_usu !== 1) {
              throw new Error(`El instructor con ID ${instructor.id_usu} debe ser un usuario administrativo`);
            }
          }
        }

        const id_det = await this.generateDetalleId();

        detalleCreado = await prisma.detalle_eventos.create({
          data: {
            id_det,
            id_evt_per: id_evt,
            cup_det: data.detalles.cup_det,
            hor_det: data.detalles.hor_det,
            are_det: data.detalles.are_det,
            cat_det: data.detalles.cat_det?.toUpperCase(),
            tip_evt: data.detalles.tip_evt?.toUpperCase(),
            not_evt_det: data.detalles.not_evt_det || null,
            asi_evt_det: data.detalles.asi_evt_det || null,
            cer_evt_det: data.detalles.cer_evt_det || 0,
            apr_evt_det: data.detalles.apr_evt_det || 0,
            est_evt_det: 'INSCRIPCIONES', // Estado inicial
            // Crear instructores si se proporcionan
            ...(data.detalles.instructores && data.detalles.instructores.length > 0 && {
              detalle_instructores: {
                create: data.detalles.instructores.map(instructor => ({
                  id_usu: instructor.id_usu,
                  rol_instructor: instructor.rol_instructor?.toUpperCase() || 'INSTRUCTOR'
                }))
              }
            })
          },
          include: {
            detalle_instructores: {
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
            }
          }
        });

        console.log('Detalle creado exitosamente:', detalleCreado);
      }

      console.log('Evento creado exitosamente:', evento);
      
      // Retornar evento con detalles si se crearon
      return {
        ...evento,
        ...(detalleCreado && { detalle_eventos: [detalleCreado] })
      };
      
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
        detalle_eventos: {
          include: {
            detalle_instructores: {
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
            }
          }
        },
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
            detalle_instructores: {
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
   * - ADMIN puede editar TODO
   * - RESPONSABLE puede editar TODO excepto el campo id_res_evt (responsable)
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

    // Si NO es admin e intenta cambiar el responsable, lanzar error
    if (!esAdmin && data.id_responsable !== undefined) {
      throw new Error('Solo el administrador puede cambiar el responsable del evento');
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
        est_evt: data.est_evt?.toUpperCase(), // Permitir cambiar estado
        // Solo admin puede cambiar responsable
        ...(esAdmin && data.id_responsable !== undefined && {
          id_res_evt: data.id_responsable
        })
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
   * RESPONSABLE o ADMIN: Crear detalle de evento (solo el responsable asignado o admin)
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

    // Validar instructores si se proporcionan
    if (data.instructores && data.instructores.length > 0) {
      for (const instructor of data.instructores) {
        const usuarioInstructor = await prisma.usuarios.findUnique({
          where: { id_usu: instructor.id_usu }
        });

        if (!usuarioInstructor || usuarioInstructor.adm_usu !== 1) {
          throw new Error(`El instructor con ID ${instructor.id_usu} debe ser un usuario administrativo`);
        }
      }
    }

    // Generar ID
    const id_det = await this.generateDetalleId();

    // Crear detalle con instructores
    return await prisma.detalle_eventos.create({
      data: {
        id_det,
        id_evt_per: data.id_evt_per,
        cup_det: data.cup_det,
        hor_det: data.hor_det,
        are_det: data.are_det,
        cat_det: data.cat_det?.toUpperCase(),
        tip_evt: data.tip_evt?.toUpperCase(),
        not_evt_det: data.not_evt_det || null,
        asi_evt_det: data.asi_evt_det || null,
        cer_evt_det: data.cer_evt_det || 0,
        apr_evt_det: data.apr_evt_det || 0,
        est_evt_det: 'INSCRIPCIONES', // Estado inicial
        // Crear instructores si se proporcionan
        ...(data.instructores && data.instructores.length > 0 && {
          detalle_instructores: {
            create: data.instructores.map(instructor => ({
              id_usu: instructor.id_usu,
              rol_instructor: instructor.rol_instructor?.toUpperCase() || 'INSTRUCTOR'
            }))
          }
        })
      },
      include: {
        detalle_instructores: {
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
        eventos: true
      }
    });
  }

  /**
   * RESPONSABLE o ADMIN: Actualizar detalle de evento (solo el responsable asignado o admin)
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

    // Validar instructores si se proporcionan
    if (data.instructores && data.instructores.length > 0) {
      for (const instructor of data.instructores) {
        const usuarioInstructor = await prisma.usuarios.findUnique({
          where: { id_usu: instructor.id_usu }
        });

        if (!usuarioInstructor || usuarioInstructor.adm_usu !== 1) {
          throw new Error(`El instructor con ID ${instructor.id_usu} debe ser un usuario administrativo`);
        }
      }

      // Si se envían instructores, eliminar los actuales y crear los nuevos
      await prisma.detalle_instructores.deleteMany({
        where: { id_det: idDetalle }
      });
    }

    // Actualizar detalle
    return await prisma.detalle_eventos.update({
      where: { id_det: idDetalle },
      data: {
        cup_det: data.cup_det,
        hor_det: data.hor_det,
        are_det: data.are_det,
        cat_det: data.cat_det?.toUpperCase(),
        tip_evt: data.tip_evt?.toUpperCase(),
        not_evt_det: data.not_evt_det,
        asi_evt_det: data.asi_evt_det,
        cer_evt_det: data.cer_evt_det,
        apr_evt_det: data.apr_evt_det,
        est_evt_det: data.est_evt_det?.toUpperCase(),
        // Actualizar instructores si se proporcionan
        ...(data.instructores && data.instructores.length > 0 && {
          detalle_instructores: {
            create: data.instructores.map(instructor => ({
              id_usu: instructor.id_usu,
              rol_instructor: instructor.rol_instructor?.toUpperCase() || 'INSTRUCTOR'
            }))
          }
        })
      },
      include: {
        detalle_instructores: {
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
        detalle_instructores: {
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
        detalle_instructores: {
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
        }
      },
      orderBy: {
        id_det: 'asc'
      }
    });
  }

  /**
   * RESPONSABLE o ADMIN: Eliminar detalle de evento
   * Solo puede eliminar detalles del evento que tiene asignado
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
