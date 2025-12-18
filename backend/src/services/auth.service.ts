import { PrismaClient } from '../generated/prisma';
import { comparePassword, hashPassword } from '../utils/bcrypt.util';
import { EmailService } from './email.service';
import { TokenUtil } from '../utils/token.util';

const prisma = new PrismaClient();

export interface AuthResult {
  success: boolean;
  user?: {
    id_usu: number;
    cor_usu: string;
    nom_usu: string;
    ape_usu: string;
    adm_usu: number | null;
    stu_usu: number | null;
    "Administrador": boolean;
  };
  error?: string;
}

export class AuthService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async identifyUser(email: string, password: string): Promise<AuthResult> {
    try {
      const user = await this.prisma.usuarios.findUnique({
        where: { cor_usu: email },
        include: {
          estudiantes: {
            include: {
              nivel: {
                include: {
                  carreras: true
                }
              }
            },
            where: {
              est_activo: 1
            },
            take: 1
          }
        }
      });

      if (!user) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      const isPasswordValid = await comparePassword(password, user.pas_usu);
      if (!isPasswordValid) {
        return { success: false, error: 'Credenciales inválidas' };
      }

      // Extraer nivel del estudiante activo
      const nivel = user.estudiantes && user.estudiantes.length > 0 ? user.estudiantes[0].nivel : null;
      const niv_usu = nivel ? nivel.id_niv : null;

      return {
        success: true,
        user: {
          id_usu: user.id_usu,
          cor_usu: user.cor_usu,
          nom_usu: user.nom_usu,
          nom_seg_usu: user.nom_seg_usu,
          ape_usu: user.ape_usu,
          ape_seg_usu: user.ape_seg_usu,
          ced_usu: user.ced_usu,
          tel_usu: user.tel_usu,
          niv_usu: niv_usu,
          adm_usu: user.adm_usu,
          stu_usu: user.stu_usu,
          "Administrador": user.Administrador,
          nivel: nivel,
        } as any
      };
    } catch (error) {
      console.error('Error en identificación:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  async login(loginData: { email: string; password: string }): Promise<AuthResult> {
    return await this.identifyUser(loginData.email, loginData.password);
  }

  async register(userData: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
  }): Promise<AuthResult> {
    try {
      console.log('📝 Iniciando registro para:', userData.email);
      
      const existingUser = await this.prisma.usuarios.findUnique({
        where: { cor_usu: userData.email }
      });

      if (existingUser) {
        console.log('❌ Usuario ya existe:', userData.email);
        return { success: false, error: 'El usuario ya existe' };
      }

      const hashedPassword = await hashPassword(userData.password);

      // DETERMINAR ROL AUTOMATICAMENTE POR EMAIL
      const rolValidacion = this.determinarRolPorEmail(userData.email);
      console.log('🔍 Validación de rol:', rolValidacion);
      
      // Verificar si hay error en la validación del email
      if (rolValidacion.error) {
        console.log('❌ Error en validación de email:', rolValidacion.error);
        return { success: false, error: rolValidacion.error };
      }

      const { esEstudiante, esAdministrativo, esAdmin } = rolValidacion;

      const newUser = await this.prisma.usuarios.create({
        data: {
          cor_usu: userData.email,
          pas_usu: hashedPassword,
          nom_usu: userData.nombre,
          ape_usu: userData.apellido,
          stu_usu: esEstudiante ? 1 : 0,
          adm_usu: esAdministrativo ? 1 : 0,
          Administrador: esAdmin
        }
      });

      console.log('✅ Usuario creado en BD:', newUser.cor_usu);

      // Si es estudiante, crear registro en tabla estudiantes
      if (esEstudiante) {
        const primerNivel = await this.prisma.niveles.findFirst({
          orderBy: { id_niv: 'asc' }
        });

        if (primerNivel) {
          await this.prisma.estudiantes.create({
            data: {
              id_usu: newUser.id_usu,
              id_niv: primerNivel.id_niv,
              fec_ingreso: new Date(),
              est_activo: 1,
              observaciones: 'Registro automático'
            }
          });
          console.log(`✅ Estudiante registrado: ${newUser.cor_usu}`);
        }
      }

      console.log(`✅ Registro completado para: ${newUser.cor_usu}`);

      return {
        success: true,
        user: {
          id_usu: newUser.id_usu,
          cor_usu: newUser.cor_usu,
          nom_usu: newUser.nom_usu,
          nom_seg_usu: newUser.nom_seg_usu,
          ape_usu: newUser.ape_usu,
          ape_seg_usu: newUser.ape_seg_usu,
          ced_usu: newUser.ced_usu,
          tel_usu: newUser.tel_usu,
          niv_usu: null,
          adm_usu: newUser.adm_usu,
          stu_usu: newUser.stu_usu,
          "Administrador": newUser.Administrador,
          nivel: null,
        } as any
      };
    } catch (error) {
      console.error('❌ Error en registro:', error);
      return { success: false, error: 'Error al registrar usuario' };
    }
  }

  async getProfile(userId: number): Promise<AuthResult> {
    try {
      const user = await this.prisma.usuarios.findUnique({
        where: { id_usu: userId },
        include: {
          estudiantes: {
            include: {
              nivel: {
                include: {
                  carreras: true
                }
              }
            },
            where: {
              est_activo: 1
            },
            take: 1
          }
        }
      });

      if (!user) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      const nivel = user.estudiantes && user.estudiantes.length > 0 ? user.estudiantes[0].nivel : null;
      const niv_usu = nivel ? nivel.id_niv : null;

      return {
        success: true,
        user: {
          id_usu: user.id_usu,
          cor_usu: user.cor_usu,
          nom_usu: user.nom_usu,
          nom_seg_usu: user.nom_seg_usu,
          ape_usu: user.ape_usu,
          ape_seg_usu: user.ape_seg_usu,
          ced_usu: user.ced_usu,
          tel_usu: user.tel_usu,
          niv_usu: niv_usu,
          adm_usu: user.adm_usu,
          stu_usu: user.stu_usu,
          "Administrador": user.Administrador,
          nivel: nivel,
        } as any
      };
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return { success: false, error: 'Error al obtener perfil' };
    }
  }

  private determineUserRole(user: any): string {
    if (user.Administrador) return 'Administrador';
    if (user.adm_usu === 1) return 'administrativo';
    if (user.stu_usu === 1) return 'estudiante';
    return 'user';
  }

  // NUEVO METODO: Determinar rol automaticamente por email
  private determinarRolPorEmail(email: string): { esEstudiante: boolean; esAdministrativo: boolean; esAdmin: boolean; error?: string } {
    const emailLower = email.trim().toLowerCase();

    if (!emailLower.includes('@')) {
      return {
        esEstudiante: false,
        esAdministrativo: false,
        esAdmin: false,
        error: 'Correo inválido'
      };
    }

    const [localPart, domain] = emailLower.split('@');

    // 1) Super admin fijo
    if (emailLower === 'admin@admin.com') {
      return { esEstudiante: false, esAdministrativo: false, esAdmin: true };
    }

    // 2) Dominios .com => externos (no estudiante ni administrativo)
    if (domain.endsWith('.com')) {
      return { esEstudiante: false, esAdministrativo: false, esAdmin: false };
    }

    // 3) Institucional UTA
    if (domain === 'uta.edu.ec') {
      const adminPattern = /^[a-z]+$/i;             // solo letras
      const studentPattern = /^[a-z]+\d{4}$/i;      // letras seguidas de exactamente 4 dígitos

      if (adminPattern.test(localPart)) {
        return { esEstudiante: false, esAdministrativo: true, esAdmin: false };
      }

      if (studentPattern.test(localPart)) {
        return { esEstudiante: true, esAdministrativo: false, esAdmin: false };
      }

      return {
        esEstudiante: false,
        esAdministrativo: false,
        esAdmin: false,
        error: 'Correo institucional inválido. Estudiante: letras + 4 dígitos (ej: juan1234@uta.edu.ec). Administrativo: solo letras (ej: pedrolopez@uta.edu.ec).'
      };
    }

    // 4) Otros dominios => externos
    return { esEstudiante: false, esAdministrativo: false, esAdmin: false };
  }

  async sendVerificationEmail(userId: number): Promise<{ success: boolean; message: string }> {
  try {
    const user = await this.prisma.usuarios.findUnique({
      where: { id_usu: userId }
    });

    if (!user) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    // Validar que no sea email @uta.edu.ec
    if (user.cor_usu.toLowerCase().endsWith('@uta.edu.ec')) {
      return { 
        success: false, 
        message: 'No es posible enviar códigos de verificación a correos institucionales (@uta.edu.ec). Por favor, notifica a la DTIC para verificar tu correo.' 
      };
    }

    const emailService = new EmailService();
    const verificationCode = TokenUtil.generateNumericCode(6);

    // Guardar código en BD temporalmente
    await this.prisma.usuarios.update({
      where: { id_usu: userId },
      data: {
        img_usu: verificationCode // Campo temporal para demo
      }
    });

    const emailSent = await emailService.sendVerificationEmail(user.cor_usu, verificationCode);

    if (!emailSent) {
      return { success: false, message: 'Error enviando email de verificación' };
    }

    return { success: true, message: 'Email de verificación enviado' };

  } catch (error) {
    console.error('Error enviando verificación:', error);
    return { success: false, message: 'Error interno del servidor' };
  }
}

async verifyEmail(userId: number, code: string): Promise<{ success: boolean; message: string }> {
  try {
    const user = await this.prisma.usuarios.findUnique({
      where: { id_usu: userId }
    });

    if (!user) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    // Verificar código (en producción usar tabla separada con expiración)
    if (user.img_usu !== code) {
      return { success: false, message: 'Código de verificación inválido' };
    }

    // Marcar email como verificado y limpiar código
    await this.prisma.usuarios.update({
      where: { id_usu: userId },
      data: {
        img_usu: null, // Limpiar código
        // Agregar campo 'email_verified' si no existe
      }
    });

    return { success: true, message: 'Email verificado exitosamente' };

  } catch (error) {
    console.error('Error verificando email:', error);
    return { success: false, message: 'Error interno del servidor' };
  }
}
}