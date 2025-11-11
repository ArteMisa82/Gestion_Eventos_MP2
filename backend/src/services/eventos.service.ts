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
        lug_evt: data.lug_evt,
        mod_evt: data.mod_evt?.toUpperCase(),
        tip_pub_evt: data.tip_pub_evt?.toUpperCase(),
        cos_evt: data.cos_evt?.toUpperCase(),
        des_evt: data.des_evt,
        est_evt: data.est_evt?.toUpperCase(),
        // Solo admin puede cambiar responsable
        ...(esAdmin && data.id_responsable !== undefined && {
          id_res_evt: data.id_responsable
        })
      },
      include: EVENTO_INCLUDES.withUsuario
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
