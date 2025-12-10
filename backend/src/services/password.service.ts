import { PrismaClient } from '../generated/prisma';
import { EmailService } from './email.service';
import { hashPassword } from '../utils/bcrypt.util';
import crypto from 'crypto';

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
      // ✅ Validar que NO sea email @uta.edu.ec
      if (email.toLowerCase().endsWith('@uta.edu.ec')) {
        return {
          success: false,
          message: 'No se puede cambiar la contraseña. Diríjase a la DITIC.'
        };
      }

      // Verificar si usuario existe
      const user = await prisma.usuarios.findUnique({
        where: { cor_usu: email }
      });

      if (!user) {
        // Por seguridad, no revelar si el email existe o no
        return {
          success: true,
          message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación en tu correo'
        };
      }

      // Generar token único y seguro
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Token válido por 1 hora (3600 segundos)
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 1);

      // Eliminar token anterior si existe
      await prisma.password_reset.deleteMany({
        where: { id_usu: user.id_usu }
      });

      // Guardar token en BD
      await prisma.password_reset.create({
        data: {
          id_usu: user.id_usu,
          token: resetToken,
          expires_at: expirationDate
        }
      });

      // Enviar email
      const emailSent = await emailService.sendPasswordResetEmail(email, resetToken);

      if (!emailSent) {
        return {
          success: false,
          message: 'Error enviando email de recuperación. Intenta nuevamente más tarde.'
        };
      }

      return {
        success: true,
        message: 'Se ha enviado un enlace de recuperación a tu correo. Válido por 1 hora.',
        resetToken: resetToken // Solo para testing/desarrollo
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
      // Validar longitud mínima de contraseña
      if (!newPassword || newPassword.length < 6) {
        return {
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        };
      }

      // Buscar token válido
      const passwordReset = await prisma.password_reset.findUnique({
        where: { token }
      });

      if (!passwordReset) {
        return {
          success: false,
          message: 'Token inválido o expirado'
        };
      }

      // Verificar si el token ha expirado
      const now = new Date();
      if (passwordReset.expires_at < now) {
        // Eliminar token expirado
        await prisma.password_reset.delete({
          where: { token }
        });
        
        return {
          success: false,
          message: 'El enlace de recuperación ha expirado. Solicita uno nuevo.'
        };
      }

      // Hashear nueva contraseña
      const hashedPassword = await hashPassword(newPassword);

      // Actualizar contraseña del usuario en una transacción
      await prisma.$transaction([
        // Actualizar la contraseña
        prisma.usuarios.update({
          where: { id_usu: passwordReset.id_usu },
          data: {
            pas_usu: hashedPassword
          }
        }),
        // Eliminar el token de recuperación
        prisma.password_reset.delete({
          where: { token }
        })
      ]);

      return {
        success: true,
        message: 'Contraseña restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.'
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
      const passwordReset = await prisma.password_reset.findUnique({
        where: { token }
      });

      if (!passwordReset) {
        return false;
      }

      // Verificar si el token ha expirado
      const now = new Date();
      if (passwordReset.expires_at < now) {
        // Eliminar token expirado
        await prisma.password_reset.delete({
          where: { token }
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error verificando token:', error);
      return false;
    }
  }
}