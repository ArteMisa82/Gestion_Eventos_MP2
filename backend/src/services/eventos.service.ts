import prisma from '../config/database';
import { 
  CreateEventoDto, 
  UpdateEventoDto, 
  AsignarResponsableDto 
} from '../types/eventos.types';
import { TipoPublicoEvento, ModalidadEvento, CostoEvento } from '../types/eventos-constants.types';
import { generateEventoId } from '../utils/id-generator.util';
import { validateIsAdmin, validateIsResponsableOrAdmin, validateIsAdministrativeUser } from '../utils/validators.util';
import { EVENTO_INCLUDES, USUARIO_SELECT } from '../utils/prisma-includes.util';
import { DetallesEventosService } from './detalles-eventos.service';

/**
 * Servicio para gestionar eventos
 * Responsabilidad: CRUD de eventos principales (sin detalles)
 */
export class EventosService {
  private detallesService: DetallesEventosService;

  constructor() {
    this.detallesService = new DetallesEventosService();
  }

  /**
   * ADMIN: Crear evento con campos básicos
   * Opcionalmente puede crear los detalles en la misma petición
   */
  async crearEvento(data: CreateEventoDto, adminId: number) {
    try {
      // Validar que sea administrador
      await validateIsAdmin(adminId);

      // Verificar que se haya asignado un responsable (OBLIGATORIO)
      if (!data.id_responsable) {
        throw new Error('Debe asignar un responsable al evento');
      }

      // Validar que el responsable sea usuario administrativo
      await validateIsAdministrativeUser(data.id_responsable);

      // Generar ID único
      const id_evt = await generateEventoId();
      
      console.log('ID generado para evento:', id_evt);

      // Crear evento con campos básicos
      const evento = await prisma.eventos.create({
        data: {
          id_evt,
          nom_evt: data.nom_evt,
          fec_evt: new Date(data.fec_evt),
          lug_evt: data.lug_evt,
          des_evt: data.des_evt,
          mod_evt: data.mod_evt?.toUpperCase() || ModalidadEvento.PRESENCIAL,
          tip_pub_evt: data.tip_pub_evt?.toUpperCase() || TipoPublicoEvento.GENERAL,
          cos_evt: data.cos_evt?.toUpperCase() || CostoEvento.GRATUITO,
          est_evt: 'EDITANDO', // Estado inicial al crear
          id_res_evt: data.id_responsable
        },
        include: EVENTO_INCLUDES.withUsuario
      });

      // Si se enviaron detalles, crearlos también
      let detalleCreado = null;
      if (data.detalles) {
        console.log('Creando detalles del evento...');
        detalleCreado = await this.detallesService.crearDetalle(
          { 
            ...data.detalles, 
            id_evt_per: id_evt 
          }, 
          adminId
        );
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
      include: EVENTO_INCLUDES.full,
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
      include: EVENTO_INCLUDES.full
    });

    if (!evento) {
      throw new Error('Evento no encontrado');
    }

    return evento;
  }

  /**
   * ADMIN: Asignar o cambiar responsable del evento
   */
  async asignarResponsable(idEvento: string, data: AsignarResponsableDto, adminId: number) {
    // Validar que sea administrador
    await validateIsAdmin(adminId);

    // Verificar que el evento existe
    const evento = await prisma.eventos.findUnique({
      where: { id_evt: idEvento }
    });

    if (!evento) {
      throw new Error('Evento no encontrado');
    }

    // Validar que el responsable sea usuario administrativo
    await validateIsAdministrativeUser(data.id_responsable);

    // Asignar responsable
    return await prisma.eventos.update({
      where: { id_evt: idEvento },
      data: { id_res_evt: data.id_responsable },
      include: EVENTO_INCLUDES.withUsuario
    });
  }

  /**
   * RESPONSABLE o ADMIN: Actualizar evento
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
        fec_fin_evt: data.fec_fin_evt ? new Date(data.fec_fin_evt) : undefined,
        lug_evt: data.lug_evt,
        mod_evt: data.mod_evt?.toUpperCase(),
        tip_pub_evt: data.tip_pub_evt?.toUpperCase(),
        cos_evt: data.cos_evt?.toUpperCase(),
        des_evt: data.des_evt,
        est_evt: data.est_evt?.toUpperCase(),
        ima_evt: data.ima_evt,
        // Solo admin puede cambiar responsable
        ...(esAdmin && data.id_responsable !== undefined && {
          id_res_evt: data.id_responsable
        })
      },
      include: EVENTO_INCLUDES.withUsuario
    });
  }

  /**
   * RESPONSABLE: Actualizar evento completo con detalles
   * Usado desde el modal del responsable para actualizar evento Y crear/actualizar su detalle
   */
  async actualizarEventoCompleto(
    idEvento: string, 
    data: UpdateEventoDto & { 
      detalles?: {
        cup_det?: number;
        hor_det?: number;
        tip_evt?: string;
        are_det?: string;
        cat_det?: string;
      };
      carreras?: string[];
      semestres?: string[];
    }, 
    userId: number
  ) {
    // Actualizar el evento primero
    const evento = await this.actualizarEvento(idEvento, data, userId);

    // Si se proporcionan detalles, crear o actualizar
    if (data.detalles && (data.detalles.cup_det || data.detalles.hor_det || data.detalles.tip_evt)) {
      // Verificar si ya existe un detalle para este evento
      const detalleExistente = await prisma.detalle_eventos.findFirst({
        where: { id_evt_per: idEvento }
      });

      // Mapear cat_det a tip_evt (tip_evt tiene valores más limitados)
      const catDetValue = data.detalles.cat_det?.toUpperCase() || 'CURSO';
      let tipEvtValue = 'CURSO'; // valor por defecto
      
      // Mapeo de cat_det a tip_evt según restricciones de la BD
      const catDetToTipEvt: Record<string, string> = {
        'CURSO': 'CURSO',
        'CONGRESO': 'CONGRESO',
        'WEBINAR': 'WEBINAR',
        'CONFERENCIAS': 'CONFERENCIA', // singular en tip_evt
        'SOCIALIZACIONES': 'CURSO',    // mapear a CURSO
        'CASAS ABIERTAS': 'CASAS ABIERTAS',
        'SEMINARIOS': 'CURSO',         // mapear a CURSO
        'OTROS': 'CURSO'               // mapear a CURSO
      };
      
      tipEvtValue = catDetToTipEvt[catDetValue] || 'CURSO';

      const detalleData: any = {
        cup_det: Number(data.detalles.cup_det) || 30,
        hor_det: Number(data.detalles.hor_det) || 40,
        are_det: data.detalles.are_det || 'TECNOLOGIA E INGENIERIA',
        cat_det: catDetValue,
        tip_evt: tipEvtValue,
      };

      if (detalleExistente) {
        // Actualizar detalle existente
        await prisma.detalle_eventos.update({
          where: { id_det: detalleExistente.id_det },
          data: detalleData
        });
        
        // Crear registros de evento si se proporcionaron carreras y semestres
        if (data.carreras && data.carreras.length > 0 && data.semestres && data.semestres.length > 0) {
          await this.crearRegistrosEvento(detalleExistente.id_det, data.carreras, data.semestres);
        }
      } else {
        // Crear nuevo detalle
        const { generateDetalleId } = await import('../utils/id-generator.util');
        const id_det = await generateDetalleId();
        
        await prisma.detalle_eventos.create({
          data: {
            id_det,
            id_evt_per: idEvento,
            ...detalleData,
            est_evt_det: 'INSCRIPCIONES'
          }
        });
        
        // Crear registros de evento si se proporcionaron carreras y semestres
        if (data.carreras && data.carreras.length > 0 && data.semestres && data.semestres.length > 0) {
          await this.crearRegistrosEvento(id_det, data.carreras, data.semestres);
        }
      }
    }

    // Retornar evento actualizado con detalles
    return await prisma.eventos.findUnique({
      where: { id_evt: idEvento },
      include: EVENTO_INCLUDES.full
    });
  }

  /**
   * ADMIN: Eliminar evento
   */
  async eliminarEvento(idEvento: string, adminId: number) {
    // Validar que sea administrador
    await validateIsAdmin(adminId);

    return await prisma.eventos.delete({
      where: { id_evt: idEvento }
    });
  }

  /**
   * Listar usuarios administrativos (para asignar como responsables)
   * Excluye al super admin (admin@admin.com)
   */
  async obtenerUsuariosAdministrativos() {
    return await prisma.usuarios.findMany({
      where: {
        adm_usu: 1,
        NOT: {
          cor_usu: 'admin@admin.com'
        }
      },
      select: {
        ...USUARIO_SELECT
      },
      orderBy: {
        nom_usu: 'asc'
      }
    });
  }

  /**
   * Obtener usuarios que son responsables de al menos un curso/evento
   */
  async obtenerResponsablesActivos() {
    // Obtener todos los usuarios que tienen al menos un evento asignado
    return await prisma.usuarios.findMany({
      where: {
        eventos: {
          some: {} // Tiene al menos un evento
        }
      },
      select: {
        ...USUARIO_SELECT,
        _count: {
          select: {
            eventos: true // Contar cuántos eventos tiene asignados
          }
        }
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
        //detalle_eventos: true,
        tarifas_evento: true
      },
      orderBy: {
        fec_evt: 'desc'
      }
    });
  }

  /**
   * PÚBLICO: Obtener eventos publicados (sin autenticación)
   * Para mostrar en la página de cursos
   */
  async obtenerEventosPublicados(filtros?: {
    mod_evt?: string | string[];  // PRESENCIAL, VIRTUAL, A DISTANCIA
    tip_pub_evt?: string | string[];  // GENERAL, ESTUDIANTES, ADMINISTRATIVOS
    cos_evt?: string | string[];  // GRATUITO, DE PAGO
    busqueda?: string;
  }) {
    const whereConditions: any = {
      est_evt: 'PUBLICADO'  // Solo eventos publicados
    };

    // Aplicar filtros si existen (soporta valores múltiples)
    if (filtros?.mod_evt) {
      const valores = Array.isArray(filtros.mod_evt) 
        ? filtros.mod_evt.map(v => v.toUpperCase())
        : [filtros.mod_evt.toUpperCase()];
      
      whereConditions.mod_evt = valores.length === 1 
        ? valores[0] 
        : { in: valores };
    }

    if (filtros?.tip_pub_evt) {
      const valores = Array.isArray(filtros.tip_pub_evt) 
        ? filtros.tip_pub_evt.map(v => v.toUpperCase())
        : [filtros.tip_pub_evt.toUpperCase()];
      
      whereConditions.tip_pub_evt = valores.length === 1 
        ? valores[0] 
        : { in: valores };
    }

    if (filtros?.cos_evt) {
      const valores = Array.isArray(filtros.cos_evt) 
        ? filtros.cos_evt.map(v => v.toUpperCase())
        : [filtros.cos_evt.toUpperCase()];
      
      whereConditions.cos_evt = valores.length === 1 
        ? valores[0] 
        : { in: valores };
    }

    // Búsqueda por nombre y descripción
    if (filtros?.busqueda) {
      whereConditions.OR = [
        {
          nom_evt: {
            contains: filtros.busqueda,
            mode: 'insensitive'
          }
        },
        {
          des_evt: {
            contains: filtros.busqueda,
            mode: 'insensitive'
          }
        }
      ];
    }

    return await prisma.eventos.findMany({
      where: whereConditions,
      include: {
        detalle_eventos: {
          include: {
            detalle_instructores: {
              include: {
                usuarios: {
                  select: USUARIO_SELECT
                }
              }
            }
          }
        },
        usuarios: {
          select: USUARIO_SELECT
        }
      },
      orderBy: {
        fec_evt: 'desc'
      }
    });
  }

  /**
   * Crea registros de evento para cada combinación de carrera y semestre
   */
  private async crearRegistrosEvento(
    id_det: string,
    carreras?: string[],
    semestres?: string[]
  ): Promise<void> {
    if (!carreras || carreras.length === 0 || !semestres || semestres.length === 0) {
      return;
    }

    // Mapeo de semestres a niveles
    const semestreToNivel: Record<string, string> = {
      '1er': 'NIV001',
      '2do': 'NIV002',
      '3er': 'NIV003',
      '4to': 'NIV004',
      '5to': 'NIV005',
      '6to': 'NIV006',
      '7mo': 'NIV007',
      '8vo': 'NIV008',
      '9no': 'NIV009',
      '10mo': 'NIV010'
    };

    // Obtener todas las carreras
    const carrerasDb = await prisma.carreras.findMany({
      where: {
        nom_car: {
          in: carreras
        }
      },
      select: {
        id_car: true,
        nom_car: true
      }
    });

    // Crear un mapa de nombre de carrera a ID
    const carreraMap = new Map(
      carrerasDb.map(c => [c.nom_car, c.id_car])
    );

    // Generar todos los registros de evento
    const registrosEvento = [];
    
    for (const carrera of carreras) {
      const id_car = carreraMap.get(carrera);
      if (!id_car) {
        console.warn(`Carrera no encontrada: ${carrera}`);
        continue;
      }

      for (const semestre of semestres) {
        const id_niv = semestreToNivel[semestre];
        if (!id_niv) {
          console.warn(`Semestre no reconocido: ${semestre}`);
          continue;
        }

        // Generar ID único para el registro
        const count = await prisma.registro_evento.count();
        const id_reg_evt = `REG${String(count + 1).padStart(3, '0')}`;

        registrosEvento.push({
          id_reg_evt,
          id_det,
          id_niv
        });
      }
    }

    // Crear todos los registros en una transacción
    if (registrosEvento.length > 0) {
      await prisma.registro_evento.createMany({
        data: registrosEvento,
        skipDuplicates: true
      });

      console.log(`✅ Creados ${registrosEvento.length} registros de evento para ${id_det}`);
    }
  }
}
