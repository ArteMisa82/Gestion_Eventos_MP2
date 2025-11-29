import prisma from '../config/database';
import { CreateDetalleEventoDto, UpdateDetalleEventoDto } from '../types/eventos.types';
import { generateDetalleId } from '../utils/id-generator.util';
import { validateIsResponsableOrAdmin } from '../utils/validators.util';
import { DETALLE_INCLUDES } from '../utils/prisma-includes.util';
import { 
  EstadoDetalleEvento, 
  filtrarCamposPorEstado, 
  validarTransicionEstado,
  validarCamposRequeridos 
} from '../utils/estados-detalle.util';
import { InstructoresService } from './instructores.service';

/**
 * Servicio para gestionar detalles de eventos
 * Responsabilidad: CRUD de detalles de eventos y coordinación con instructores
 * Gestión de estados: INSCRIPCIONES → EN_CURSO → FINALIZADO
 */
export class DetallesEventosService {
  private instructoresService: InstructoresService;

  constructor() {
    this.instructoresService = new InstructoresService();
  }

  /**
   * Crear un detalle de evento con sus instructores
   */
  async crearDetalle(data: CreateDetalleEventoDto, userId: number) {
    // Validar permisos
    await validateIsResponsableOrAdmin(userId, data.id_evt_per);
    
    // Generar ID único
    const id_det = await generateDetalleId();

    // Crear detalle con instructores si se proporcionan
    const detalle = await prisma.detalle_eventos.create({
      data: {
        id_det,
        id_evt_per: data.id_evt_per,
        cup_det: data.cup_det,
        hor_det: data.hor_det,
        are_det: data.are_det,
        cat_det: data.cat_det?.toUpperCase(),
        tip_evt: data.tip_evt?.toUpperCase(),
        not_min_evt: data.not_min_evt || null,  // Nota mínima
        not_fin_evt: data.not_fin_evt || null,  // Nota final
        asi_evt_det: data.asi_evt_det || null,  // Porcentaje 0-100
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
      include: DETALLE_INCLUDES.full
    });

    return detalle;
  }

  /**
   * Obtener detalle por ID
   * Los campos mostrados dependen del estado actual
   */
  async obtenerDetallePorId(id: string) {
    const detalle = await prisma.detalle_eventos.findUnique({
      where: { id_det: id },
      include: DETALLE_INCLUDES.full
    });

    if (!detalle) {
      throw new Error('Detalle de evento no encontrado');
    }

    // Filtrar campos según estado
    return filtrarCamposPorEstado(detalle);
  }

  /**
   * Obtener todos los detalles de un evento
   * Los campos mostrados dependen del estado de cada detalle
   */
  async obtenerDetallesPorEvento(idEvento: string) {
    const detalles = await prisma.detalle_eventos.findMany({
      where: { id_evt_per: idEvento },
      include: DETALLE_INCLUDES.withInstructores,
      orderBy: { id_det: 'asc' }
    });

    // Filtrar campos según estado de cada detalle
    return detalles.map(detalle => filtrarCamposPorEstado(detalle));
  }

  /**
   * Actualizar detalle de evento
   * Si se envían instructores, los reemplaza completamente
   * Si se cambia el estado, valida las transiciones permitidas
   */
  async actualizarDetalle(id: string, data: UpdateDetalleEventoDto, userId: number) {
    // Verificar que el detalle existe
    const detalleActual = await prisma.detalle_eventos.findUnique({
      where: { id_det: id },
      include: {
        eventos: true,
        registro_evento: true
      }
    });

    if (!detalleActual) {
      throw new Error('Detalle de evento no encontrado');
    }

    // Validar permisos
    await validateIsResponsableOrAdmin(userId, detalleActual.id_evt_per);

    // Si se intenta cambiar el estado, validar transición
    if (data.est_evt_det && data.est_evt_det.toUpperCase() !== detalleActual.est_evt_det) {
      const estadoActual = detalleActual.est_evt_det as EstadoDetalleEvento;
      const nuevoEstado = data.est_evt_det.toUpperCase() as EstadoDetalleEvento;

      // Validar que la transición sea permitida
      const transicionValida = validarTransicionEstado(estadoActual, nuevoEstado);
      if (!transicionValida.valido) {
        throw new Error(transicionValida.mensaje);
      }

      // Validar campos requeridos para el nuevo estado
      const camposValidos = validarCamposRequeridos(nuevoEstado, {
        ...detalleActual,
        ...data,
        tiene_registros: detalleActual.registro_evento.length > 0
      });
      if (!camposValidos.valido) {
        throw new Error(camposValidos.mensaje);
      }
    }

    // Si se envían instructores, reemplazarlos
    if (data.instructores && data.instructores.length > 0) {
      await this.instructoresService.reemplazarInstructores(id, data.instructores);
    }

    // Actualizar detalle
    const detalleActualizado = await prisma.detalle_eventos.update({
      where: { id_det: id },
      data: {
        cup_det: data.cup_det,
        hor_det: data.hor_det,
        are_det: data.are_det,
        cat_det: data.cat_det?.toUpperCase(),
        tip_evt: data.tip_evt?.toUpperCase(),
        not_min_evt: data.not_min_evt,  // Nota mínima
        not_fin_evt: data.not_fin_evt,  // Nota final
        asi_evt_det: data.asi_evt_det,  // Porcentaje 0-100
        cer_evt_det: data.cer_evt_det,
        apr_evt_det: data.apr_evt_det,
        est_evt_det: data.est_evt_det?.toUpperCase()
      },
      include: DETALLE_INCLUDES.full
    });

    // Retornar con filtrado de campos según estado
    return filtrarCamposPorEstado(detalleActualizado);
  }

  /**
   * Cambiar estado de un detalle
   * INSCRIPCIONES → EN_CURSO → FINALIZADO
   */
  async cambiarEstado(id: string, nuevoEstado: EstadoDetalleEvento, userId: number) {
    // Obtener detalle actual
    const detalleActual = await prisma.detalle_eventos.findUnique({
      where: { id_det: id },
      include: {
        eventos: true,
        registro_evento: true
      }
    });

    if (!detalleActual) {
      throw new Error('Detalle de evento no encontrado');
    }

    // Validar permisos
    await validateIsResponsableOrAdmin(userId, detalleActual.id_evt_per);

    const estadoActual = detalleActual.est_evt_det as EstadoDetalleEvento;

    // Validar transición
    const transicionValida = validarTransicionEstado(estadoActual, nuevoEstado);
    if (!transicionValida.valido) {
      throw new Error(transicionValida.mensaje);
    }

    // Validar campos requeridos
    const camposValidos = validarCamposRequeridos(nuevoEstado, {
      ...detalleActual,
      tiene_registros: detalleActual.registro_evento.length > 0
    });
    if (!camposValidos.valido) {
      throw new Error(camposValidos.mensaje);
    }

    // Actualizar estado
    const detalleActualizado = await prisma.detalle_eventos.update({
      where: { id_det: id },
      data: { est_evt_det: nuevoEstado },
      include: DETALLE_INCLUDES.full
    });

    return filtrarCamposPorEstado(detalleActualizado);
  }

  /**
   * Eliminar detalle de evento
   * Solo se puede eliminar si está en estado INSCRIPCIONES
   */
  async eliminarDetalle(id: string, userId: number) {
    // Verificar que el detalle existe
    const detalle = await prisma.detalle_eventos.findUnique({
      where: { id_det: id },
      include: { eventos: true }
    });

    if (!detalle) {
      throw new Error('Detalle de evento no encontrado');
    }

    // Validar permisos
    await validateIsResponsableOrAdmin(userId, detalle.id_evt_per);

    // No permitir eliminar si ya está EN_CURSO o FINALIZADO
    if (detalle.est_evt_det === EstadoDetalleEvento.EN_CURSO || 
        detalle.est_evt_det === EstadoDetalleEvento.FINALIZADO) {
      throw new Error(`No se puede eliminar un detalle en estado ${detalle.est_evt_det}`);
    }

    return await prisma.detalle_eventos.delete({
      where: { id_det: id }
    });
  }
}
