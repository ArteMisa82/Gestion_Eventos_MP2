import { PrismaClient } from '../generated/prisma';
import { AppError } from '../middlewares/errorHandler.middleware';

const prisma = new PrismaClient();

export interface RegistrarPersonaDTO {
  id_usu: number;
  id_reg_evt: string;
}

export interface RegistroPersonaResponse {
  num_reg_per: number;
  id_usu: number;
  id_reg_evt: string;
  id_est: number | null;
  fec_reg_per: Date;
  estudiante?: {
    id_est: number;
    nivel: string;
    carrera: string;
  };
  evento: {
    nombre: string;
    fecha: Date;
  };
}

export class RegistroService {
  /**
   * Verificar si un usuario puede registrarse en un curso
   */
  async validarRegistro(id_usu: number, id_reg_evt: string): Promise<{
    valido: boolean;
    mensaje?: string;
    id_est?: number;
  }> {
    try {
      // 1. Obtener información del registro_evento
      const registroEvento = await prisma.registro_evento.findUnique({
        where: { id_reg_evt },
        include: {
          detalle_eventos: {
            include: {
              eventos: true,
            },
          },
          nivel: {
            include: {
              carreras: true,
            },
          },
        },
      });

      if (!registroEvento) {
        return {
          valido: false,
          mensaje: 'El registro de evento no existe',
        };
      }

      // 2. Obtener información del usuario
      const usuario = await prisma.usuarios.findUnique({
        where: { id_usu },
      });

      if (!usuario) {
        return {
          valido: false,
          mensaje: 'Usuario no encontrado',
        };
      }

      const detalle = registroEvento.detalle_eventos;
      const evento = detalle.eventos;
      const nivelRequerido = registroEvento.id_niv;
      const tipoPublico = evento.tip_pub_evt; // GENERAL, ESTUDIANTES, ADMINISTRATIVOS

      // 3. Verificar que no esté ya registrado
      const yaRegistrado = await prisma.registro_personas.findFirst({
        where: {
          id_usu,
          id_reg_evt,
        },
      });

      if (yaRegistrado) {
        return {
          valido: false,
          mensaje: 'Ya estás registrado en este curso',
        };
      }

      // 4. Verificar que no sea instructor o responsable
      const esInstructor = await prisma.detalle_instructores.findFirst({
        where: {
          id_det: detalle.id_det,
          id_usu,
        },
      });

      if (esInstructor) {
        return {
          valido: false,
          mensaje: 'No puedes registrarte en un curso donde eres instructor',
        };
      }

      if (evento.id_res_evt === id_usu) {
        return {
          valido: false,
          mensaje: 'No puedes registrarte en un evento donde eres el responsable',
        };
      }

      // 5. Verificar tipo de público y permisos
      const esEstudiante = usuario.stu_usu === 1;
      const esAdministrativo = usuario.adm_usu === 1 || usuario.Administrador === true;

      // Si el evento es SOLO para ESTUDIANTES
      if (tipoPublico === 'ESTUDIANTES') {
        if (!esEstudiante) {
          return {
            valido: false,
            mensaje: 'Este curso es exclusivo para estudiantes',
          };
        }

        // 6. VALIDACIÓN CLAVE: Verificar nivel y carrera del estudiante
        const estudianteEnNivel = await prisma.estudiantes.findFirst({
          where: {
            id_usu,
            id_niv: nivelRequerido,
            est_activo: 1,
          },
          include: {
            nivel: {
              include: {
                carreras: true,
              },
            },
          },
        });

        if (!estudianteEnNivel) {
          const nivelInfo = registroEvento.nivel;
          const carreraInfo = nivelInfo?.carreras;

          return {
            valido: false,
            mensaje: `No puedes registrarte en este curso. Es para estudiantes de ${carreraInfo?.nom_car || 'la carrera'} - ${nivelInfo?.nom_niv || 'nivel ' + nivelRequerido}. Verifica que estés matriculado en ese nivel.`,
          };
        }

        // Estudiante válido, retornar su id_est
        return {
          valido: true,
          id_est: estudianteEnNivel.id_est,
        };
      }

      // Si el evento es SOLO para ADMINISTRATIVOS
      if (tipoPublico === 'ADMINISTRATIVOS') {
        if (!esAdministrativo) {
          return {
            valido: false,
            mensaje: 'Este curso es exclusivo para personal administrativo',
          };
        }

        return {
          valido: true,
          id_est: undefined, // Administrativos no tienen id_est
        };
      }

      // Si el evento es GENERAL, cualquiera puede registrarse
      // Pero si es estudiante, intentar vincular su id_est
      if (esEstudiante) {
        const estudianteActivo = await prisma.estudiantes.findFirst({
          where: {
            id_usu,
            id_niv: nivelRequerido,
            est_activo: 1,
          },
        });

        return {
          valido: true,
          id_est: estudianteActivo?.id_est,
        };
      }

      return {
        valido: true,
        id_est: undefined,
      };
    } catch (error) {
      console.error('Error al validar registro:', error);
      throw new AppError('Error al validar el registro', 500);
    }
  }

  /**
   * Registrar a una persona en un curso
   */
  async registrarPersona(data: RegistrarPersonaDTO): Promise<RegistroPersonaResponse> {
    try {
      // Validar registro
      const validacion = await this.validarRegistro(data.id_usu, data.id_reg_evt);

      if (!validacion.valido) {
        throw new AppError(validacion.mensaje || 'No puedes registrarte en este curso', 400);
      }

      // Verificar cupo disponible
      const registroEvento = await prisma.registro_evento.findUnique({
        where: { id_reg_evt: data.id_reg_evt },
        include: {
          detalle_eventos: true,
          registro_personas: true,
        },
      });

      if (!registroEvento) {
        throw new AppError('Registro de evento no encontrado', 404);
      }

      const inscritos = registroEvento.registro_personas?.length || 0;
      const cupoMaximo = registroEvento.detalle_eventos.cup_det;

      if (inscritos >= cupoMaximo) {
        throw new AppError('No hay cupo disponible para este curso', 400);
      }

      // Verificar estado del detalle
      const estadoDetalle = registroEvento.detalle_eventos.est_evt_det;
      if (estadoDetalle !== 'INSCRIPCIONES') {
        throw new AppError('Las inscripciones para este curso están cerradas', 400);
      }

      // Crear registro
      const nuevoRegistro = await prisma.registro_personas.create({
        data: {
          id_usu: data.id_usu,
          id_reg_evt: data.id_reg_evt,
          id_est: validacion.id_est || null,
        },
        include: {
          estudiantes: {
            include: {
              nivel: {
                include: {
                  carreras: true,
                },
              },
            },
          },
          registro_evento: {
            include: {
              detalle_eventos: {
                include: {
                  eventos: true,
                },
              },
            },
          },
        },
      });

      return {
        num_reg_per: nuevoRegistro.num_reg_per,
        id_usu: nuevoRegistro.id_usu,
        id_reg_evt: nuevoRegistro.id_reg_evt,
        id_est: nuevoRegistro.id_est,
        fec_reg_per: nuevoRegistro.fec_reg_per,
        estudiante: nuevoRegistro.estudiantes
          ? {
              id_est: nuevoRegistro.estudiantes.id_est,
              nivel: nuevoRegistro.estudiantes.nivel.nom_niv,
              carrera: nuevoRegistro.estudiantes.nivel.carreras.nom_car,
            }
          : undefined,
        evento: {
          nombre: nuevoRegistro.registro_evento.detalle_eventos.eventos.nom_evt,
          fecha: nuevoRegistro.registro_evento.detalle_eventos.eventos.fec_evt,
        },
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error al registrar persona:', error);
      throw new AppError('Error al registrar en el curso', 500);
    }
  }

  /**
   * Obtener registros de un usuario
   */
  async obtenerRegistrosUsuario(id_usu: number): Promise<RegistroPersonaResponse[]> {
    try {
      const registros = await prisma.registro_personas.findMany({
        where: { id_usu },
        include: {
          estudiantes: {
            include: {
              nivel: {
                include: {
                  carreras: true,
                },
              },
            },
          },
          registro_evento: {
            include: {
              detalle_eventos: {
                include: {
                  eventos: true,
                },
              },
            },
          },
        },
        orderBy: {
          fec_reg_per: 'desc',
        },
      });

      return registros.map((registro) => ({
        num_reg_per: registro.num_reg_per,
        id_usu: registro.id_usu,
        id_reg_evt: registro.id_reg_evt,
        id_est: registro.id_est,
        fec_reg_per: registro.fec_reg_per,
        estudiante: registro.estudiantes
          ? {
              id_est: registro.estudiantes.id_est,
              nivel: registro.estudiantes.nivel.nom_niv,
              carrera: registro.estudiantes.nivel.carreras.nom_car,
            }
          : undefined,
        evento: {
          nombre: registro.registro_evento.detalle_eventos.eventos.nom_evt,
          fecha: registro.registro_evento.detalle_eventos.eventos.fec_evt,
        },
      }));
    } catch (error) {
      console.error('Error al obtener registros de usuario:', error);
      throw new AppError('Error al obtener los registros', 500);
    }
  }

  /**
   * Cancelar registro de una persona
   */
  async cancelarRegistro(num_reg_per: number, id_usu: number): Promise<void> {
    try {
      // Verificar que el registro pertenece al usuario
      const registro = await prisma.registro_personas.findUnique({
        where: { num_reg_per },
        include: {
          registro_evento: {
            include: {
              detalle_eventos: true,
            },
          },
        },
      });

      if (!registro) {
        throw new AppError('Registro no encontrado', 404);
      }

      if (registro.id_usu !== id_usu) {
        throw new AppError('No tienes permisos para cancelar este registro', 403);
      }

      // Verificar que el curso esté en estado INSCRIPCIONES
      const estado = registro.registro_evento.detalle_eventos.est_evt_det;
      if (estado !== 'INSCRIPCIONES') {
        throw new AppError('No puedes cancelar tu registro. El curso ya ha iniciado', 400);
      }

      // Eliminar registro
      await prisma.registro_personas.delete({
        where: { num_reg_per },
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error('Error al cancelar registro:', error);
      throw new AppError('Error al cancelar el registro', 500);
    }
  }
}
