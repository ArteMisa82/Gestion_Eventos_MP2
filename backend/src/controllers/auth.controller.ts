import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { successResponse } from '../utils/response.util';

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
      req.session.userRole = result.user!.Administrador ? 'Administrador' : 
                            result.user!.adm_usu === 1 ? 'admin' : 'user';
      req.session.isAuthenticated = true;

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
      req.session.userRole = result.user!.Administrador ? 'Administrador' : 
                            result.user!.adm_usu === 1 ? 'admin' : 'user';
      req.session.isAuthenticated = true;

      console.log(`✅ Sesión creada para: ${result.user!.cor_usu}`);

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
}