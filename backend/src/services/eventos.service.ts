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
import { InstructoresService } from './instructores.service';

/**
 * Servicio para gestionar eventos
 * Responsabilidad: CRUD de eventos principales (sin detalles)
 */
export class EventosService {
  private detallesService: DetallesEventosService;
  private instructoresService: InstructoresService;

  constructor() {
    this.detallesService = new DetallesEventosService();
    this.instructoresService = new InstructoresService();
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
   * Validar que el evento esté completo antes de publicarlo
   */
  private async validarEventoCompleto(idEvento: string): Promise<{ valido: boolean; errores: string[] }> {
    const errores: string[] = [];

    // Obtener evento con todas sus relaciones
    const evento = await prisma.eventos.findUnique({
      where: { id_evt: idEvento },
      include: {
        detalle_eventos: {
          include: {
            detalle_instructores: true
          }
        },
        tarifas_evento: true
      }
    });

    if (!evento) {
      errores.push('Evento no encontrado');
      return { valido: false, errores };
    }

    // Validar que tenga al menos un detalle
    if (!evento.detalle_eventos || evento.detalle_eventos.length === 0) {
      errores.push('El evento debe tener al menos un detalle configurado');
    } else {
      // Validar que el detalle tenga al menos un instructor
      const detalleConInstructores = evento.detalle_eventos.some(
        det => det.detalle_instructores && det.detalle_instructores.length > 0
      );
      
      if (!detalleConInstructores) {
        errores.push('El evento debe tener al menos un instructor asignado');
      }
    }

    // Si es evento de pago, validar que tenga tarifas
    if (evento.cos_evt === 'DE PAGO') {
      if (!evento.tarifas_evento || evento.tarifas_evento.length === 0) {
        errores.push('Los eventos de pago deben tener al menos una tarifa configurada');
      }
    }

    // Validar campos básicos requeridos
    if (!evento.nom_evt || evento.nom_evt.trim() === '') {
      errores.push('El evento debe tener un nombre');
    }

    if (!evento.des_evt || evento.des_evt.trim() === '') {
      errores.push('El evento debe tener una descripción');
    }

    if (!evento.fec_evt) {
      errores.push('El evento debe tener una fecha de inicio');
    }

    if (!evento.lug_evt || evento.lug_evt.trim() === '') {
      errores.push('El evento debe tener una ubicación');
    }

    return {
      valido: errores.length === 0,
      errores
    };
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

    // Validar si se intenta publicar el evento
    if (data.est_evt && data.est_evt.toUpperCase() === 'PUBLICADO') {
      const validacion = await this.validarEventoCompleto(idEvento);
      
      if (!validacion.valido) {
        throw new Error(
          `No se puede publicar el evento. Faltan los siguientes requisitos:\n${validacion.errores.join('\n')}`
        );
      }
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
      docentes?: string[];
    }, 
    userId: number
  ) {
    console.log('🔥🔥🔥 ACTUALIZANDO EVENTO:', idEvento);
    console.log('📦 Datos recibidos:', JSON.stringify(data, null, 2));
    
    // Actualizar el evento primero
    const evento = await this.actualizarEvento(idEvento, data, userId);
    
    console.log('✅ Evento actualizado. tip_pub_evt:', evento.tip_pub_evt);

    // Verificar si hay detalles o carreras/semestres para procesar
    const tieneDetalles = data.detalles && (data.detalles.cup_det || data.detalles.hor_det || data.detalles.tip_evt || data.detalles.cat_det);
    const tieneCarrerasSemestres = (data.carreras && data.carreras.length > 0 && data.semestres && data.semestres.length > 0);
    const tieneDocentes = data.docentes && data.docentes.length > 0;

    console.log('📋 Procesando actualización completa:');
    console.log('  - Tiene detalles:', tieneDetalles);
    console.log('  - Tiene carreras/semestres:', tieneCarrerasSemestres);
    console.log('  - Tiene docentes:', tieneDocentes, data.docentes);

    if (tieneDetalles || tieneCarrerasSemestres || tieneDocentes) {
      // Verificar si ya existe un detalle para este evento
      const detalleExistente = await prisma.detalle_eventos.findFirst({
        where: { id_evt_per: idEvento }
      });

      console.log('  - Detalle existente:', detalleExistente?.id_det || 'ninguno');

      let id_det_final: string;

      if (tieneDetalles) {
        // Mapear cat_det a tip_evt (tip_evt tiene valores más limitados)
        const catDetValue = data.detalles!.cat_det?.toUpperCase() || 'CURSO';
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
          cup_det: Number(data.detalles!.cup_det) || 30,
          hor_det: Number(data.detalles!.hor_det) || 40,
          are_det: data.detalles!.are_det || 'TECNOLOGIA E INGENIERIA',
          cat_det: catDetValue,
          tip_evt: tipEvtValue,
        };

        if (detalleExistente) {
          // Actualizar detalle existente
          await prisma.detalle_eventos.update({
            where: { id_det: detalleExistente.id_det },
            data: detalleData
          });
          id_det_final = detalleExistente.id_det;
          console.log('  ✅ Detalle actualizado:', id_det_final);
        } else {
          // Crear nuevo detalle
          const { generateDetalleId } = await import('../utils/id-generator.util');
          id_det_final = await generateDetalleId();
          
          await prisma.detalle_eventos.create({
            data: {
              id_det: id_det_final,
              id_evt_per: idEvento,
              ...detalleData,
              est_evt_det: 'INSCRIPCIONES'
            }
          });
          console.log('  ✅ Detalle creado:', id_det_final);
        }
      } else {
        // Solo hay carreras/semestres pero no detalles
        if (detalleExistente) {
          id_det_final = detalleExistente.id_det;
        } else {
          // Necesitamos crear un detalle con valores por defecto
          const { generateDetalleId } = await import('../utils/id-generator.util');
          id_det_final = await generateDetalleId();
          
          await prisma.detalle_eventos.create({
            data: {
              id_det: id_det_final,
              id_evt_per: idEvento,
              cup_det: 30,
              hor_det: 40,
              are_det: 'TECNOLOGIA E INGENIERIA',
              cat_det: 'CURSO',
              tip_evt: 'CURSO',
              est_evt_det: 'INSCRIPCIONES'
            }
          });
          console.log('  ✅ Detalle creado con valores por defecto:', id_det_final);
        }
      }

      // Crear registros de evento solo si es para ESTUDIANTES y se proporcionaron carreras/semestres
      const esParaEstudiantes = evento.tip_pub_evt === 'ESTUDIANTES';
      
      if (esParaEstudiantes && tieneCarrerasSemestres) {
        console.log('  🎯 Evento para ESTUDIANTES - Llamando a crearRegistrosEvento...');
        await this.crearRegistrosEvento(id_det_final, data.carreras, data.semestres);
      } else if (esParaEstudiantes && !tieneCarrerasSemestres) {
        console.log('  ⚠️ ADVERTENCIA: Evento para ESTUDIANTES sin carreras/semestres configurados');
      } else {
        console.log('  ℹ️ Evento para PÚBLICO GENERAL - no requiere registros de nivel');
      }

      // Procesar docentes/instructores si se proporcionaron
      if (tieneDocentes) {
        console.log('  👨‍🏫 Procesando docentes:', data.docentes);
        
        // Buscar usuarios por nombre completo
        const instructorDtos = [];
        for (const nombreCompleto of data.docentes) {
          // El nombre viene como "Nombre Apellido", buscar usuario que coincida
          const palabras = nombreCompleto.trim().split(' ');
          
          // Intentar buscar por nombre y apellido
          const usuario = await prisma.usuarios.findFirst({
            where: {
              OR: [
                // Buscar por coincidencia exacta de nombre completo concatenado
                {
                  AND: [
                    { nom_usu: { contains: palabras[0], mode: 'insensitive' } },
                    palabras.length > 1 ? { ape_usu: { contains: palabras.slice(1).join(' '), mode: 'insensitive' } } : {}
                  ]
                },
                // Buscar solo por nombre si no hay apellido
                palabras.length === 1 ? { nom_usu: { equals: palabras[0], mode: 'insensitive' } } : {}
              ]
            },
            select: { id_usu: true, nom_usu: true, ape_usu: true }
          });

          if (usuario) {
            console.log(`    ✅ Encontrado: ${usuario.nom_usu} ${usuario.ape_usu} (ID: ${usuario.id_usu})`);
            instructorDtos.push({
              id_usu: usuario.id_usu,
              rol_instructor: 'INSTRUCTOR'
            });
          } else {
            console.log(`    ⚠️ No encontrado: ${nombreCompleto}`);
          }
        }

        // Si se encontraron instructores, reemplazar los existentes
        if (instructorDtos.length > 0) {
          console.log(`  🔄 Reemplazando ${instructorDtos.length} instructores...`);
          await this.instructoresService.reemplazarInstructores(id_det_final, instructorDtos);
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
    const eventos = await prisma.eventos.findMany({
      where: {
        id_res_evt: userId
      },
      include: {
        detalle_eventos: {
          include: {
            registro_evento: {
              include: {
                nivel: {
                  include: {
                    carreras: true
                  }
                }
              }
            },
            detalle_instructores: {
              include: {
                usuarios: {
                  select: {
                    id_usu: true,
                    nom_usu: true,
                    ape_usu: true
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

    // Transformar para incluir carreras, semestres y docentes
    return eventos.map(evento => {
      console.log('\n🔍 ===== PROCESANDO EVENTO =====');
      console.log('📌 ID Evento:', evento.id_evt);
      console.log('📌 Nombre:', evento.nom_evt);
      
      const detalle = evento.detalle_eventos?.[0]; // Tomamos el primer detalle
      console.log('📦 Detalle encontrado:', detalle ? detalle.id_det : 'NO HAY DETALLE');
      
      const carrerasUnicas = new Set<string>();
      const semestresUnicos = new Set<string>();
      
      // Extraer carreras y semestres desde registro_evento
      if (detalle?.registro_evento && Array.isArray(detalle.registro_evento)) {
        console.log('📚 Registros de evento encontrados:', detalle.registro_evento.length);
        
        detalle.registro_evento.forEach((reg: any, index: number) => {
          console.log(`\n  📋 Registro #${index + 1}:`);
          console.log('    - ID Registro:', reg.id_reg_evt);
          console.log('    - ID Nivel:', reg.id_niv);
          console.log('    - Nivel completo:', reg.nivel);
          
          // Agregar nombre de la carrera
          if (reg.nivel?.carreras?.nom_car) {
            const nombreCarrera = reg.nivel.carreras.nom_car;
            console.log('    ✅ Carrera encontrada:', nombreCarrera);
            carrerasUnicas.add(nombreCarrera);
          } else {
            console.log('    ⚠️ Sin carrera en este registro');
          }
          
          // Agregar nombre del nivel (semestre)
          if (reg.nivel?.nom_niv) {
            // Mapear nombres de semestres a formato frontend
            const nombreOriginal = reg.nivel.nom_niv.trim().toUpperCase();
            console.log('    📖 Semestre original:', nombreOriginal);
            
            const mapeoDeSemestres: { [key: string]: string } = {
              'PRIMERO': '1er semestre',
              'SEGUNDO': '2do semestre',
              'TERCERO': '3er semestre',
              'CUARTO': '4to semestre',
              'QUINTO': '5to semestre',
              'SEXTO': '6to semestre',
              'SÉPTIMO': '7mo semestre',
              'SEPTIMO': '7mo semestre',
              'OCTAVO': '8vo semestre',
              'NOVENO': '9no semestre',
              'DÉCIMO': '10mo semestre',
              'DECIMO': '10mo semestre'
            };
            
            // Buscar mapeo exacto
            let nombreSemestre = mapeoDeSemestres[nombreOriginal];
            
            if (!nombreSemestre) {
              // Si ya tiene formato "Xer/do/to/mo semestre", usarlo tal cual
              if (nombreOriginal.includes('SEMESTRE')) {
                nombreSemestre = reg.nivel.nom_niv.trim();
              } else {
                // Fallback: añadir " semestre" al original
                nombreSemestre = `${reg.nivel.nom_niv.trim()} semestre`;
              }
            }
            
            console.log('    ✅ Semestre mapeado:', nombreSemestre);
            semestresUnicos.add(nombreSemestre);
          } else {
            console.log('    ⚠️ Sin nivel/semestre en este registro');
          }
        });
      } else {
        console.log('⚠️ NO hay registros de evento para este detalle');
        if (!detalle) {
          console.log('   Razón: No existe detalle_eventos');
        } else if (!detalle.registro_evento) {
          console.log('   Razón: detalle.registro_evento es undefined/null');
        } else if (!Array.isArray(detalle.registro_evento)) {
          console.log('   Razón: detalle.registro_evento no es un array');
        }
      }
      
      console.log('\n📊 RESUMEN DEL EVENTO:');
      console.log('  Carreras únicas:', Array.from(carrerasUnicas));
      console.log('  Semestres únicos:', Array.from(semestresUnicos));

      // Extraer nombres de docentes/instructores
      const docentes = detalle?.detalle_instructores?.map((instructor: any) => 
        `${instructor.usuarios.nom_usu} ${instructor.usuarios.ape_usu}`.trim()
      ) || [];

      return {
        ...evento,
        carreras: Array.from(carrerasUnicas).sort(),
        semestres: Array.from(semestresUnicos).sort(),
        docentes: docentes,
        // Agregar datos del detalle al evento
        cupos: detalle?.cup_det,
        capacidad: detalle?.cup_det,
        horas: detalle?.hor_det,
        area: detalle?.are_det,
        categoria: detalle?.cat_det,
        tipoEvento: detalle?.tip_evt,
        tip_evt: detalle?.tip_evt,
        detalle_eventos: evento.detalle_eventos
      };
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
   * IMPORTANTE: En la BD, cada nivel (id_niv) ya incluye la carrera y el semestre
   * Por ejemplo: NIV001 = "1er Semestre de Software", NIV011 = "1er Semestre de TI"
   */
  private async crearRegistrosEvento(
    id_det: string,
    carreras?: string[],
    semestres?: string[]
  ): Promise<void> {
    if (!carreras || carreras.length === 0 || !semestres || semestres.length === 0) {
      console.log(`⚠️ No se crearán registros de evento: carreras=${carreras?.length || 0}, semestres=${semestres?.length || 0}`);
      return;
    }

    console.log(`🔍 Creando registros de evento para detalle ${id_det}`);
    console.log(`Carreras recibidas:`, carreras);
    console.log(`Semestres recibidos:`, semestres);

    // Mapeo de semestres del frontend a nom_niv de la BD
    const mapeoSemestres: Record<string, string> = {
      '1er semestre': 'PRIMERO',
      '2do semestre': 'SEGUNDO',
      '3er semestre': 'TERCERO',
      '4to semestre': 'CUARTO',
      '5to semestre': 'QUINTO',
      '6to semestre': 'SEXTO',
      '7mo semestre': 'SEPTIMO',  // Sin acento
      '8vo semestre': 'OCTAVO',
      '9no semestre': 'NOVENO',
      '10mo semestre': 'DECIMO'  // Sin acento
    };

    // Convertir semestres del frontend a formato BD
    const semestresNormalizados = semestres.map(s => mapeoSemestres[s] || s.toUpperCase());
    
    console.log(`Semestres normalizados:`, semestresNormalizados);

    // Primero eliminar registros existentes para este detalle
    const registrosAntiguos = await prisma.registro_evento.deleteMany({
      where: { id_det }
    });
    
    if (registrosAntiguos.count > 0) {
      console.log(`🗑️ Eliminados ${registrosAntiguos.count} registros antiguos`);
    }

    // Obtener todas las carreras de la BD
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

    console.log(`📚 Carreras encontradas en BD:`, carrerasDb);

    if (carrerasDb.length === 0) {
      console.warn(`⚠️ No se encontraron carreras en la BD para los nombres: ${carreras.join(', ')}`);
      return;
    }

    const idsCarreras = carrerasDb.map(c => c.id_car);

    // Buscar los niveles que coincidan con las carreras Y semestres
    // nom_niv tiene el formato del semestre (1er, 2do, etc.) SIN la palabra "semestre"
    const niveles = await prisma.nivel.findMany({
      where: {
        id_car: {
          in: idsCarreras
        },
        nom_niv: {
          in: semestresNormalizados
        }
      },
      select: {
        id_niv: true,
        nom_niv: true,
        id_car: true,
        carreras: {
          select: {
            nom_car: true
          }
        }
      }
    });

    console.log(`🎓 Niveles encontrados en BD:`, niveles);

    if (niveles.length === 0) {
      console.warn(`⚠️ No se encontraron niveles para las combinaciones de carreras y semestres especificadas`);
      return;
    }

    // Obtener el conteo base una sola vez
    const countBase = await prisma.registro_evento.count();
    let contador = countBase + 1;

    // Generar todos los registros de evento
    const registrosEvento = [];
    
    for (const nivel of niveles) {
      // Generar ID único para este registro
      const id_reg_evt = `REG${String(contador).padStart(3, '0')}`;
      contador++;

      registrosEvento.push({
        id_reg_evt,
        id_det,
        id_niv: nivel.id_niv
      });

      console.log(`📝 Preparado registro: ${id_reg_evt} -> ${id_det} + ${nivel.id_niv} (${nivel.carreras.nom_car} - ${nivel.nom_niv})`);
    }

    // Crear todos los registros en batch
    if (registrosEvento.length > 0) {
      await prisma.registro_evento.createMany({
        data: registrosEvento,
        skipDuplicates: true
      });

      console.log(`✅ Creados ${registrosEvento.length} registros de evento para detalle ${id_det}`);
    } else {
      console.warn(`⚠️ No se crearon registros de evento (lista vacía)`);
    }
  }
}
