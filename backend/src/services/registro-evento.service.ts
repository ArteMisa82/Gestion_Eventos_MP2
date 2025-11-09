/**
 * Servicio para gestión de registro_evento
 * Responsabilidad: Vincular detalles de eventos con niveles académicos
 */

import prisma from '../config/database';
import { generateRegistroEventoId } from '../utils/id-generator.util';
import {
  CrearRegistroEventoDTO,
  ActualizarRegistroEventoDTO,
  RegistroEventoResponse
} from '../types/registro.types';

const REGISTRO_EVENTO_INCLUDES = {
  detalle_eventos: {
    include: {
      eventos: true
    }
  },
  nivel: {
    include: {
      carreras: true
    }
  },
  registro_personas: {
    select: {
      num_reg_per: true,
      id_usu: true,
      fec_reg_per: true
    }
  }
};

export class RegistroEventoService {
  /**
   * Crea un nuevo registro de evento (vincula detalle con nivel)
   */
  async crearRegistroEvento(data: CrearRegistroEventoDTO): Promise<RegistroEventoResponse> {
    // Validar que el detalle existe
    const detalle = await prisma.detalle_eventos.findUnique({
      where: { id_det: data.id_det }
    });

    if (!detalle) {
      throw new Error('El detalle del evento no existe');
    }

    // Validar que el nivel existe
    const nivel = await prisma.nivel.findUnique({
      where: { id_niv: data.id_niv }
    });

    if (!nivel) {
      throw new Error('El nivel académico no existe');
    }

    // Verificar que no exista ya esta combinación
    const existente = await prisma.registro_evento.findFirst({
      where: {
        id_det: data.id_det,
        id_niv: data.id_niv
      }
    });

    if (existente) {
      throw new Error('Ya existe un registro de evento para este detalle y nivel');
    }

    // Generar ID único
    const id_reg_evt = await generateRegistroEventoId();

    // Crear el registro
    const registroEvento = await prisma.registro_evento.create({
      data: {
        id_reg_evt,
        id_det: data.id_det,
        id_niv: data.id_niv
      },
      include: REGISTRO_EVENTO_INCLUDES
    });

    return this.formatResponse(registroEvento);
  }

  /**
   * Obtiene todos los registros de eventos
   */
  async obtenerTodos(): Promise<RegistroEventoResponse[]> {
    const registros = await prisma.registro_evento.findMany({
      include: REGISTRO_EVENTO_INCLUDES
    });

    return registros.map(r => this.formatResponse(r));
  }

  /**
   * Obtiene un registro de evento por ID
   */
  async obtenerPorId(id_reg_evt: string): Promise<RegistroEventoResponse> {
    const registro = await prisma.registro_evento.findUnique({
      where: { id_reg_evt },
      include: REGISTRO_EVENTO_INCLUDES
    });

    if (!registro) {
      throw new Error('Registro de evento no encontrado');
    }

    return this.formatResponse(registro);
  }

  /**
   * Obtiene registros por detalle
   */
  async obtenerPorDetalle(id_det: string): Promise<RegistroEventoResponse[]> {
    const registros = await prisma.registro_evento.findMany({
      where: { id_det },
      include: REGISTRO_EVENTO_INCLUDES
    });

    return registros.map(r => this.formatResponse(r));
  }

  /**
   * Obtiene registros por nivel
   */
  async obtenerPorNivel(id_niv: string): Promise<RegistroEventoResponse[]> {
    const registros = await prisma.registro_evento.findMany({
      where: { id_niv },
      include: REGISTRO_EVENTO_INCLUDES
    });

    return registros.map(r => this.formatResponse(r));
  }

  /**
   * Actualiza un registro de evento
   */
  async actualizarRegistroEvento(
    id_reg_evt: string,
    data: ActualizarRegistroEventoDTO
  ): Promise<RegistroEventoResponse> {
    // Verificar que existe
    const existente = await prisma.registro_evento.findUnique({
      where: { id_reg_evt }
    });

    if (!existente) {
      throw new Error('Registro de evento no encontrado');
    }

    // Si se actualiza el detalle, validar que existe
    if (data.id_det) {
      const detalle = await prisma.detalle_eventos.findUnique({
        where: { id_det: data.id_det }
      });
      if (!detalle) {
        throw new Error('El detalle del evento no existe');
      }
    }

    // Si se actualiza el nivel, validar que existe
    if (data.id_niv) {
      const nivel = await prisma.nivel.findUnique({
        where: { id_niv: data.id_niv }
      });
      if (!nivel) {
        throw new Error('El nivel académico no existe');
      }
    }

    // Actualizar
    const actualizado = await prisma.registro_evento.update({
      where: { id_reg_evt },
      data,
      include: REGISTRO_EVENTO_INCLUDES
    });

    return this.formatResponse(actualizado);
  }

  /**
   * Elimina un registro de evento
   */
  async eliminarRegistroEvento(id_reg_evt: string): Promise<void> {
    // Verificar que existe
    const existente = await prisma.registro_evento.findUnique({
      where: { id_reg_evt },
      include: {
        registro_personas: true
      }
    });

    if (!existente) {
      throw new Error('Registro de evento no encontrado');
    }

    // Verificar si tiene inscripciones
    if (existente.registro_personas.length > 0) {
      throw new Error(
        `No se puede eliminar el registro porque tiene ${existente.registro_personas.length} inscripción(es)`
      );
    }

    await prisma.registro_evento.delete({
      where: { id_reg_evt }
    });
  }

  /**
   * Formatea la respuesta con datos adicionales
   */
  private formatResponse(registro: any): RegistroEventoResponse {
    return {
      id_reg_evt: registro.id_reg_evt,
      id_det: registro.id_det,
      id_niv: registro.id_niv,
      detalle: registro.detalle_eventos,
      nivel: registro.nivel,
      cantidadInscritos: registro.registro_personas?.length || 0
    };
  }
}

export const registroEventoService = new RegistroEventoService();
