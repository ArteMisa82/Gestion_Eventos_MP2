import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse } from '../utils/response.util';
import { PasswordService } from '../services/password.service';

const passwordService = new PasswordService();

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, nombre, apellido } = req.body;
      
      const result = await authService.register({
        email,
        password,
        nombre,
        apellido
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.error
        });
      }

      // CREAR SESIÓN después del registro
      req.session.userId = result.user!.id_usu;
      req.session.userEmail = result.user!.cor_usu;

      let userRole = 'user';
      if (result.user!.Administrador) userRole = 'Administrador';
      else if (result.user!.adm_usu === 1) userRole = 'administrativo';
      else if (result.user!.stu_usu === 1) userRole = 'estudiante';

      req.session.userRole = userRole;
      req.session.isAuthenticated = true;

      console.log(`Sesión creada para: ${result.user!.cor_usu} (Rol: ${userRole})`);

      res.json(successResponse({
        user: result.user
      }, 'Usuario registrado exitosamente'));
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      
      const result = await authService.login({ email, password });

      if (!result.success) {
        return res.status(401).json({
          success: false,
          message: result.error
        });
      }

      // CREAR SESIÓN después del login
      req.session.userId = result.user!.id_usu;
      req.session.userEmail = result.user!.cor_usu;
      
      let userRole = 'user';
      if (result.user!.Administrador) userRole = 'Administrador';
      else if (result.user!.adm_usu === 1) userRole = 'administrativo';
      else if (result.user!.stu_usu === 1) userRole = 'estudiante';

      req.session.userRole = userRole;
      req.session.isAuthenticated = true;

      console.log(`Sesión creada para: ${result.user!.cor_usu} (Rol: ${userRole})`);

      res.json(successResponse({
        user: result.user
      }, 'Login exitoso'));
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      
      const result = await authService.getProfile(userId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.error
        });
      }

      res.json(successResponse({
        user: result.user
      }, 'Perfil obtenido exitosamente'));
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Error cerrando sesión:', err);
          return res.status(500).json({
            success: false,
            message: 'Error al cerrar sesión'
          });
        }

        res.clearCookie('connect.sid');
        
        res.json(successResponse(null, 'Sesión cerrada exitosamente'));
      });
    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email es requerido'
        });
      }

      // Validar estructura de email
      if (email.toLowerCase().endsWith('@uta.edu.ec')) {
        return res.status(403).json({
          success: false,
          message: 'No es posible recuperar la contraseña para correos institucionales (@uta.edu.ec). Por favor, notifica a la DTIC para recuperar tu contraseña.'
        });
      }

      const result = await passwordService.requestPasswordReset(email);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.json(successResponse(
        { resetToken: result.resetToken }, // Solo para testing
        result.message
      ));
    } catch (error) {
      console.error('Error en forgot password:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Token y nueva contraseña son requeridos'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
      }

      const result = await passwordService.resetPassword(token, newPassword);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.json(successResponse(null, result.message));
    } catch (error) {
      console.error('Error en reset password:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async verifyResetToken(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Token es requerido'
        });
      }

      const isValid = await passwordService.verifyResetToken(token);

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Token inválido o expirado'
        });
      }

      res.json(successResponse(null, 'Token válido'));
    } catch (error) {
      console.error('Error verificando token:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async sendVerificationEmail(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      // Obtener usuario para validar email
      const authService = new AuthService();
      const user = await (authService as any).prisma.usuarios.findUnique({
        where: { id_usu: userId }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      // Validar estructura de email
      if (user.cor_usu.toLowerCase().endsWith('@uta.edu.ec')) {
        return res.status(403).json({
          success: false,
          message: 'No es posible enviar códigos de verificación a correos institucionales (@uta.edu.ec). Por favor, notifica a la DTIC para verificar tu correo.'
        });
      }

      const result = await authService.sendVerificationEmail(userId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.json(successResponse(null, result.message));
    } catch (error) {
      console.error('Error enviando verificación:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  async verifyEmail(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Código de verificación es requerido'
        });
      }

      const result = await authService.verifyEmail(userId, code);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.json(successResponse(null, result.message));
    } catch (error) {
      console.error('Error verificando email:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}
      const result = await authService.register(data);

      // Determinar mensaje según tipo de usuario
      let userTypeMessage = 'Usuario registrado exitosamente';
      if (result.usuario.Administrador) {
        userTypeMessage = 'Administrador del sistema registrado exitosamente';
      } else if (result.usuario.stu_usu === 1) {
        userTypeMessage = 'Estudiante registrado exitosamente';
      } else if (result.usuario.adm_usu === 1) {
        userTypeMessage = 'Usuario administrativo registrado exitosamente';
      } else {
        userTypeMessage = 'Usuario externo registrado exitosamente';
      }

      res.status(201).json({
        success: true,
        message: userTypeMessage,
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Error al registrar usuario'
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data = req.body;

      // Validación básica
      if (!data.cor_usu || !data.pas_usu) {
        return res.status(400).json({
          success: false,
          message: 'Correo y contraseña son obligatorios'
        });
      }

      const result = await authService.login(data);

      res.json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        message: error.message || 'Error en el login'
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      const user = await authService.getProfile(userId);

      res.json({
        success: true,
        message: 'Perfil obtenido',
        data: user
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Error al obtener perfil'
      });
    }
  }
}
