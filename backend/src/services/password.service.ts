import { PrismaClient } from '../generated/prisma';
import { TokenUtil } from '../utils/token.util';
import { EmailService } from './email.service';
import { hashPassword } from '../utils/bcrypt.util';

const prisma = new PrismaClient();
const emailService = new EmailService();

export interface PasswordResetResult {
  success: boolean;
  message: string;
  resetToken?: string;
}

export class PasswordService {
  // Solicitar recuperación de contraseña
  async requestPasswordReset(email: string): Promise<PasswordResetResult> {
    try {
      // Verificar si usuario existe
      const user = await prisma.usuarios.findUnique({
        where: { cor_usu: email }
      });

      if (!user) {
        // Por seguridad, no revelar si el email existe o no
        return {
          success: true,
          message: 'Si el email existe, recibirás un enlace de recuperación'
        };
      }

      // Generar token único
      const resetToken = TokenUtil.generateToken();
      const expirationDate = TokenUtil.getExpirationDate(1); // 1 hora

      // Guardar token en BD (usaremos la tabla usuarios temporalmente)
      await prisma.usuarios.update({
        where: { id_usu: user.id_usu },
        data: {
          // Usaremos un campo temporal - en producción usar tabla separada
          pdf_ced_usu: resetToken // Campo temporal para demo
        }
      });

      // Enviar email
      const emailSent = await emailService.sendPasswordResetEmail(email, resetToken);

      if (!emailSent) {
        return {
          success: false,
          message: 'Error enviando email de recuperación'
        };
      }

      return {
        success: true,
        message: 'Email de recuperación enviado',
        resetToken: resetToken // Solo para testing
      };

    } catch (error) {
      console.error('Error en recuperación de password:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Restablecer contraseña con token
  async resetPassword(token: string, newPassword: string): Promise<PasswordResetResult> {
    try {
      // Buscar usuario con el token
      const user = await prisma.usuarios.findFirst({
        where: { pdf_ced_usu: token }
      });

      if (!user) {
        return {
          success: false,
          message: 'Token inválido o expirado'
        };
      }

      // Hashear nueva contraseña
      const hashedPassword = await hashPassword(newPassword);

      // Actualizar contraseña y limpiar token
      await prisma.usuarios.update({
        where: { id_usu: user.id_usu },
        data: {
          pas_usu: hashedPassword,
          pdf_ced_usu: null // Limpiar token
        }
      });

      return {
        success: true,
        message: 'Contraseña restablecida exitosamente'
      };

    } catch (error) {
      console.error('Error restableciendo password:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // Verificar validez del token
  async verifyResetToken(token: string): Promise<boolean> {
    try {
      const user = await prisma.usuarios.findFirst({
        where: { pdf_ced_usu: token }
      });
      return !!user;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  }
}