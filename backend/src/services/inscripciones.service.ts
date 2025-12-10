/**
 * Servicio para gestión de inscripciones (registro_personas)
 * Responsabilidad: Inscribir usuarios a eventos y validar cupos
 */

import prisma from '../config/database';
import { EstadoDetalleEvento } from '../utils/estados-detalle.util';
import { TipoPublicoEvento } from '../types/eventos-constants.types';
import {
  CrearInscripcionDTO,
  InscripcionResponse,
  ValidarInscripcionResult
} from '../types/registro.types';

const INSCRIPCION_INCLUDES = {
  usuarios: {
    select: {
      id_usu: true,
      cor_usu: true,
      nom_usu: true,
      nom_seg_usu: true,
      ape_usu: true,
      ape_seg_usu: true,
      tel_usu: true,
      estudiantes: {
        where: {
          est_activo: 1
        },
        include: {
          nivel: {
            include: {
              carreras: true
            }
          }
        },
        take: 1
      }
    }
  },
  registro_evento: {
    include: {
      detalle_eventos: {
        include: {
          eventos: true
        }
      },
      nivel: {
        include: {
          carreras: true
        }
      }
    }
  }
};

export class InscripcionesService {
  /**
   * Inscribe un usuario a un evento
   * Soporta dos flujos:
   * 1. Con id_reg_evt: para eventos de ESTUDIANTES (requiere nivel académico)
   * 2. Con id_det: para eventos de PÚBLICO GENERAL (inscripción directa)
   */
  async inscribirUsuario(data: CrearInscripcionDTO): Promise<InscripcionResponse> {
    // Validar que el usuario existe
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usu: data.id_usu }
    });

    if (!usuario) {
      throw new Error('El usuario no existe');
    }

    // CASO 1: Inscripción con id_reg_evt (ESTUDIANTES)
    if (data.id_reg_evt) {
      return await this.inscribirConRegistroEvento(data);
    }
    
    // CASO 2: Inscripción con id_det (PÚBLICO GENERAL)
    if (data.id_det) {
      return await this.inscribirConDetalle(data);
    }

    throw new Error('Debe proporcionar id_reg_evt o id_det');
  }

  /**
   * Inscripción para eventos de ESTUDIANTES (con validación de nivel)
   */
  private async inscribirConRegistroEvento(data: CrearInscripcionDTO): Promise<InscripcionResponse> {
    // Validar que el registro de evento existe
    const registroEvento = await prisma.registro_evento.findUnique({
      where: { id_reg_evt: data.id_reg_evt },
      include: {
        detalle_eventos: {
          include: {
            eventos: true
          }
        },
        registro_personas: true,
        nivel: true
      }
    });

    if (!registroEvento) {
      throw new Error('El registro de evento no existe');
    }

    if (!data.id_reg_evt) {
      throw new Error('El id_reg_evt es requerido');
    }

    // Validar inscripción (cupo, estado, duplicados)
    const validacion = await this.validarInscripcion(
      data.id_usu,
      data.id_reg_evt,
      registroEvento
    );

    if (!validacion.valido) {
      throw new Error(validacion.mensaje);
    }

    // Obtener información del evento para determinar si requiere pago
    const detalle = registroEvento.detalle_eventos;
    const evento = detalle.eventos;
    
    // Determinar el estado inicial basado en si el evento requiere pago
    const esPago = evento.cos_evt === 'DE PAGO' || evento.cos_evt === 'PAGO';
    const estadoInicial = esPago ? 'PAGO_PENDIENTE' : 'COMPLETADO';
    
    // Crear la inscripción con el estado apropiado
    const inscripcion = await prisma.registro_personas.create({
      data: {
        id_usu: data.id_usu,
        id_reg_evt: data.id_reg_evt,
        estado_registro: estadoInicial,
        responsable_valida: !esPago // Si es gratuito, se auto-aprueba
      },
      include: INSCRIPCION_INCLUDES
    });

    // Si requiere pago, crear el registro de pago pendiente
    if (esPago) {
      // Obtener tarifa del evento
      const tarifa = await prisma.tarifas_evento.findFirst({
        where: { id_evt: evento.id_evt }
      });
      
      if (tarifa) {
        await prisma.pagos.create({
          data: {
            num_reg_per: inscripcion.num_reg_per,
            val_pag: tarifa.val_evt,
            met_pag: 'EFECTIVO', // Método por defecto, se actualizará cuando el usuario suba el comprobante
            pag_o_no: 0 // Pendiente de pago
          }
        });
      }
    }

    return this.formatResponse(inscripcion);
  }

  /**
   * Inscripción para eventos de PÚBLICO GENERAL (sin validación de nivel)
   */
  private async inscribirConDetalle(data: CrearInscripcionDTO): Promise<InscripcionResponse> {
    // Obtener detalle del evento
    const detalle = await prisma.detalle_eventos.findUnique({
      where: { id_det: data.id_det },
      include: {
        eventos: true,
        registro_evento: {
          include: {
            registro_personas: true
          }
        }
      }
    });

    if (!detalle) {
      throw new Error('El detalle del evento no existe');
    }

    // Validar que el evento es para PÚBLICO GENERAL
    if (detalle.eventos.tip_pub_evt !== 'GENERAL') {
      throw new Error('Este evento requiere un registro de nivel académico');
    }

    // Validar cupo disponible
    const totalInscritos = detalle.registro_evento.reduce(
      (total, reg) => total + (reg.registro_personas?.length || 0),
      0
    );

    if (totalInscritos >= detalle.cup_det) {
      throw new Error('No hay cupos disponibles para este evento');
    }

    // Verificar si ya está inscrito (solo inscripciones activas, no rechazadas)
    const yaInscrito = detalle.registro_evento.some(reg =>
      reg.registro_personas?.some(rp => 
        rp.id_usu === data.id_usu && 
        rp.estado_registro !== 'RECHAZADO' // Permitir reinscripción si fue rechazado
      )
    );

    if (yaInscrito) {
      throw new Error('Ya estás inscrito en este evento');
    }

    // Para público general, buscar o crear un registro_evento con un nivel genérico
    // Primero intentar usar el primer registro_evento disponible
    let registroEvento = detalle.registro_evento[0];
    
    if (!registroEvento) {
      // Si no existe, crear uno con el primer nivel disponible (público general no valida nivel)
      // Obtener cualquier nivel para cumplir con la restricción de BD
      const primerNivel = await prisma.nivel.findFirst();
      
      if (!primerNivel) {
        throw new Error('No hay niveles configurados en el sistema');
      }

      if (!data.id_det) {
        throw new Error('El id_det es requerido para crear el registro de evento');
      }

      const { generateRegistroEventoId } = require('../utils/id-generator.util');
      const id_reg_evt = await generateRegistroEventoId();

      registroEvento = await prisma.registro_evento.create({
        data: {
          id_reg_evt,
          id_det: data.id_det,
          id_niv: primerNivel.id_niv
        }
      }) as any;
    }

    // Crear la inscripción
    const inscripcion = await prisma.registro_personas.create({
      data: {
        id_usu: data.id_usu,
        id_reg_evt: registroEvento.id_reg_evt
      },
      include: INSCRIPCION_INCLUDES
    });

    return this.formatResponse(inscripcion);
  }

  /**
   * Valida si un usuario puede inscribirse
   */
  async validarInscripcion(
    id_usu: number,
    id_reg_evt: string,
    registroEvento?: any
  ): Promise<ValidarInscripcionResult> {
    // Obtener datos del usuario
    const usuario = await prisma.usuarios.findUnique({
      where: { id_usu }
    });

    if (!usuario) {
      return {
        valido: false,
        mensaje: 'Usuario no encontrado'
      };
    }

    // Obtener registro evento si no se proporcionó
    if (!registroEvento) {
      registroEvento = await prisma.registro_evento.findUnique({
        where: { id_reg_evt },
        include: {
          detalle_eventos: {
            include: {
              eventos: true
            }
          },
          registro_personas: true,
          nivel: true
        }
      });

      if (!registroEvento) {
        return {
          valido: false,
          mensaje: 'El registro de evento no existe'
        };
      }
    }

    const detalle = registroEvento.detalle_eventos;
    
    if (!detalle) {
      return {
        valido: false,
        mensaje: 'El detalle del evento no existe'
      };
    }
    
    const evento = detalle.eventos;
    
    if (!evento) {
      return {
        valido: false,
        mensaje: 'El evento asociado no existe'
      };
    }
    
    const inscritos = registroEvento.registro_personas || [];
    const nivelRequerido = registroEvento.id_niv;
    const tipoPublico = evento.tip_pub_evt; // GENERAL, ESTUDIANTES, ADMINISTRATIVOS

    // ===== VALIDACIÓN 0: NO PUEDE INSCRIBIRSE SI ES INSTRUCTOR O RESPONSABLE =====
    // Verificar si es instructor del curso
    const esInstructor = await prisma.detalle_instructores.findFirst({
      where: {
        id_det: detalle.id_det,
        id_usu: id_usu
      }
    });

    if (esInstructor) {
      return {
        valido: false,
        mensaje: 'No puedes inscribirte en un curso donde eres instructor',
        detalles: {
          cupoDisponible: false,
          yaInscrito: false,
          estadoDetalle: detalle.est_evt_det
        }
      };
    }

    // Verificar si es responsable del evento
    if (evento.id_res_evt === id_usu) {
      return {
        valido: false,
        mensaje: 'No puedes inscribirte en un evento donde eres el responsable',
        detalles: {
          cupoDisponible: false,
          yaInscrito: false,
          estadoDetalle: detalle.est_evt_det
        }
      };
    }

    // ===== VALIDACIÓN 1: TIPO DE PÚBLICO DEL EVENTO =====
    const esEstudiante = usuario.stu_usu === 1;
    const esAdministrativo = usuario.adm_usu === 1 || usuario.Administrador === true;

    // Si el evento es solo para ESTUDIANTES
    if (tipoPublico === TipoPublicoEvento.ESTUDIANTES) {
      if (!esEstudiante) {
        return {
          valido: false,
          mensaje: 'Este evento es exclusivo para estudiantes',
          detalles: {
            cupoDisponible: false,
            yaInscrito: false,
            estadoDetalle: detalle.est_evt_det
          }
        };
      }
    }
    
    // Si el evento es solo para ADMINISTRATIVOS
    if (tipoPublico === TipoPublicoEvento.ADMINISTRATIVOS) {
      if (!esAdministrativo) {
        return {
          valido: false,
          mensaje: 'Este evento es exclusivo para personal administrativo',
          detalles: {
            cupoDisponible: false,
            yaInscrito: false,
            estadoDetalle: detalle.est_evt_det
          }
        };
      }
    }
    // Si el evento es GENERAL, cualquiera puede registrarse (no se valida nada aquí)

    // ===== VALIDACIÓN 2: SI ES ESTUDIANTE, VERIFICAR NIVEL =====
    if (esEstudiante) {
      const estudianteEnNivel = await prisma.estudiantes.findFirst({
        where: {
          id_usu: id_usu,
          id_niv: nivelRequerido,
          est_activo: 1
        }
      });

      if (!estudianteEnNivel) {
        return {
          valido: false,
          mensaje: `No puedes inscribirte. Este curso es para el nivel: ${registroEvento.nivel?.nom_niv || nivelRequerido}. Verifica que estés matriculado en ese nivel.`,
          detalles: {
            cupoDisponible: false,
            yaInscrito: false,
            estadoDetalle: detalle.est_evt_det
          }
        };
      }
    }

    // ===== VALIDACIÓN 3: ESTADO DEL DETALLE =====
    if (detalle.est_evt_det !== EstadoDetalleEvento.INSCRIPCIONES) {
      return {
        valido: false,
        mensaje: `No se pueden realizar inscripciones. Estado actual: ${detalle.est_evt_det}`,
        detalles: {
          cupoDisponible: false,
          yaInscrito: false,
          estadoDetalle: detalle.est_evt_det
        }
      };
    }

    // ===== VALIDACIÓN 4: CUPO DISPONIBLE =====
    const cupoDisponible = inscritos.length < detalle.cup_det;
    if (!cupoDisponible) {
      return {
        valido: false,
        mensaje: `Cupo completo. Inscritos: ${inscritos.length}/${detalle.cup_det}`,
        detalles: {
          cupoDisponible: false,
          yaInscrito: false,
          estadoDetalle: detalle.est_evt_det
        }
      };
    }

    // ===== VALIDACIÓN 5: USUARIO YA INSCRITO =====
    const yaInscrito = inscritos.some((i: any) => i.id_usu === id_usu);
    if (yaInscrito) {
      return {
        valido: false,
        mensaje: 'El usuario ya está inscrito en este evento',
        detalles: {
          cupoDisponible: true,
          yaInscrito: true,
          estadoDetalle: detalle.est_evt_det
        }
      };
    }

    // ===== INSCRIPCIÓN VÁLIDA =====
    return {
      valido: true,
      detalles: {
        cupoDisponible: true,
        yaInscrito: false,
        estadoDetalle: detalle.est_evt_det
      }
    };
  }

  /**
   * Obtiene todas las inscripciones
   */
  async obtenerTodas(): Promise<InscripcionResponse[]> {
    const inscripciones = await prisma.registro_personas.findMany({
      include: INSCRIPCION_INCLUDES,
      orderBy: {
        fec_reg_per: 'desc'
      }
    });

    return inscripciones.map(i => this.formatResponse(i));
  }

  /**
   * Obtiene una inscripción por ID
   */
  async obtenerPorId(num_reg_per: number): Promise<InscripcionResponse> {
    const inscripcion = await prisma.registro_personas.findUnique({
      where: { num_reg_per },
      include: INSCRIPCION_INCLUDES
    });

    if (!inscripcion) {
      throw new Error('Inscripción no encontrada');
    }

    return this.formatResponse(inscripcion);
  }

  /**
   * Obtiene inscripciones por usuario
   */
  async obtenerPorUsuario(id_usu: number): Promise<InscripcionResponse[]> {
    const inscripciones = await prisma.registro_personas.findMany({
      where: { id_usu },
      include: INSCRIPCION_INCLUDES,
      orderBy: {
        fec_reg_per: 'desc'
      }
    });

    return inscripciones.map(i => this.formatResponse(i));
  }

  /**
   * Obtiene inscripciones por registro de evento
   */
  async obtenerPorRegistroEvento(id_reg_evt: string): Promise<InscripcionResponse[]> {
    const inscripciones = await prisma.registro_personas.findMany({
      where: { id_reg_evt },
      include: INSCRIPCION_INCLUDES,
      orderBy: {
        fec_reg_per: 'desc'
      }
    });

    return inscripciones.map(i => this.formatResponse(i));
  }

  /**
   * Cancela una inscripción (elimina)
   */
  async cancelarInscripcion(num_reg_per: number, id_usu?: number): Promise<void> {
    // Verificar que existe
    const inscripcion = await prisma.registro_personas.findUnique({
      where: { num_reg_per },
      include: {
        registro_evento: {
          include: {
            detalle_eventos: true
          }
        }
      }
    });

    if (!inscripcion) {
      throw new Error('Inscripción no encontrada');
    }

    // Si se proporciona id_usu, verificar que sea el dueño
    if (id_usu && inscripcion.id_usu !== id_usu) {
      throw new Error('No tienes permiso para cancelar esta inscripción');
    }

    // Solo permitir cancelación si el detalle está en INSCRIPCIONES
    const estadoDetalle = inscripcion.registro_evento.detalle_eventos.est_evt_det;
    if (estadoDetalle !== EstadoDetalleEvento.INSCRIPCIONES) {
      throw new Error(
        `No se puede cancelar la inscripción. El evento está en estado: ${estadoDetalle}`
      );
    }

    // Eliminar inscripción
    await prisma.registro_personas.delete({
      where: { num_reg_per }
    });
  }

  /**
   * Obtiene estadísticas de inscripciones por evento
   */
  async obtenerEstadisticasPorEvento(id_reg_evt: string) {
    const registroEvento = await prisma.registro_evento.findUnique({
      where: { id_reg_evt },
      include: {
        detalle_eventos: true,
        registro_personas: {
          include: {
            usuarios: true
          }
        }
      }
    });

    if (!registroEvento) {
      throw new Error('Registro de evento no encontrado');
    }

    const cupoTotal = registroEvento.detalle_eventos.cup_det;
    const inscritos = registroEvento.registro_personas.length;
    const cupoDisponible = cupoTotal - inscritos;

    return {
      id_reg_evt,
      cupoTotal,
      inscritos,
      cupoDisponible,
      porcentajeOcupacion: Math.round((inscritos / cupoTotal) * 100),
      listadoInscritos: registroEvento.registro_personas.map(rp => ({
        num_reg_per: rp.num_reg_per,
        usuario: {
          id_usu: rp.usuarios.id_usu,
          nombre: `${rp.usuarios.nom_usu} ${rp.usuarios.ape_usu}`,
          correo: rp.usuarios.cor_usu
        },
        fec_reg_per: rp.fec_reg_per
      }))
    };
  }

  /**
   * Guarda los documentos y requisitos adicionales de una inscripción
   * Almacena: carta de motivación, documentos específicos, documentos extra
   */
  async guardarDocumentosInscripcion(
    num_reg_per: number,
    datos: {
      carta_motivacion?: string;
      documento_especifico?: string;
      documento_especifico_url?: string;
      documento_extra_1?: string;
      documento_extra_1_url?: string;
      documento_extra_2?: string;
      documento_extra_2_url?: string;
    }
  ) {
    console.log(`\n📦 GUARDANDO DOCUMENTOS - Inscripción #${num_reg_per}`);
    console.log('📄 Datos a guardar:', datos);

    // Validar que la inscripción existe
    const inscripcion = await prisma.registro_personas.findUnique({
      where: { num_reg_per }
    });

    if (!inscripcion) {
      throw new Error(`Inscripción #${num_reg_per} no encontrada`);
    }

    // Actualizar la inscripción con los documentos
    const actualizada = await prisma.registro_personas.update({
      where: { num_reg_per },
      data: {
        carta_motivacion: datos.carta_motivacion || inscripcion.carta_motivacion,
        documento_especifico: datos.documento_especifico || inscripcion.documento_especifico,
        documento_especifico_url: datos.documento_especifico_url || inscripcion.documento_especifico_url,
        documento_extra_1: datos.documento_extra_1 || inscripcion.documento_extra_1,
        documento_extra_1_url: datos.documento_extra_1_url || inscripcion.documento_extra_1_url,
        documento_extra_2: datos.documento_extra_2 || inscripcion.documento_extra_2,
        documento_extra_2_url: datos.documento_extra_2_url || inscripcion.documento_extra_2_url,
        fec_envio_documentos: new Date()
      },
      include: INSCRIPCION_INCLUDES
    });

    console.log(`✅ DOCUMENTOS GUARDADOS - Inscripción #${num_reg_per}`);
    console.log('📋 Datos almacenados en BD:');
    console.log('  - carta_motivacion:', actualizada.carta_motivacion ? 'Sí' : 'No');
    console.log('  - documento_especifico:', actualizada.documento_especifico);
    console.log('  - documento_especifico_url:', actualizada.documento_especifico_url);
    console.log('  - documento_extra_1:', actualizada.documento_extra_1);
    console.log('  - documento_extra_1_url:', actualizada.documento_extra_1_url);
    console.log('  - documento_extra_2:', actualizada.documento_extra_2);
    console.log('  - documento_extra_2_url:', actualizada.documento_extra_2_url);

    return this.formatResponse(actualizada);
  }

  /**
   * Obtiene los documentos de una inscripción
   */
  async obtenerDocumentosInscripcion(num_reg_per: number) {
    console.log(`\n🔍 OBTENIENDO DOCUMENTOS - Inscripción #${num_reg_per}`);

    const inscripcion = await prisma.registro_personas.findUnique({
      where: { num_reg_per },
      select: {
        num_reg_per: true,
        carta_motivacion: true,
        documento_especifico: true,
        documento_especifico_url: true,
        documento_extra_1: true,
        documento_extra_1_url: true,
        documento_extra_2: true,
        documento_extra_2_url: true,
        fec_envio_documentos: true,
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

    if (!inscripcion) {
      throw new Error(`Inscripción #${num_reg_per} no encontrada`);
    }

    console.log('✅ DOCUMENTOS OBTENIDOS:');
    console.log('  - carta_motivacion:', inscripcion.carta_motivacion ? 'Sí' : 'No');
    console.log('  - documento_especifico:', inscripcion.documento_especifico);
    console.log('  - fec_envio_documentos:', inscripcion.fec_envio_documentos);

    return inscripcion;
  }

  /**
   * Formatea la respuesta
   */
  private formatResponse(inscripcion: any): InscripcionResponse {
    return {
      num_reg_per: inscripcion.num_reg_per,
      id_usu: inscripcion.id_usu,
      id_reg_evt: inscripcion.id_reg_evt,
      fec_reg_per: inscripcion.fec_reg_per,
      usuario: inscripcion.usuarios,
      registro_evento: inscripcion.registro_evento
    };
  }
}

export const inscripcionesService = new InscripcionesService();
