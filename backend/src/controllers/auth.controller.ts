import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterDto, LoginDto } from '../types/auth.types';

const authService = new AuthService();

export class AuthController {
  // POST /api/auth/register
  async register(req: Request, res: Response) {
    try {
      const data: RegisterDto = req.body;

      // Validación básica
      if (!data.cor_usu || !data.pas_usu || !data.nom_usu || !data.ape_usu) {
        return res.status(400).json({
          success: false,
          message: 'Los campos correo, contraseña, nombre y apellido son obligatorios'
        });
      }

      // Validar formato de correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.cor_usu)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de correo inválido'
        });
      }

      // Validar longitud de contraseña
      if (data.pas_usu.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
      }

      const result = await authService.register(data);

      // Determinar mensaje según tipo de usuario
      let userTypeMessage = 'Usuario registrado exitosamente';
      if (result.usuario.stu_usu === 1) {
        userTypeMessage = 'Estudiante registrado exitosamente';
      } else if (result.usuario.adm_usu === 1) {
        userTypeMessage = 'Administrador registrado exitosamente';
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

  // POST /api/auth/login
  async login(req: Request, res: Response) {
    try {
      const data: LoginDto = req.body;

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

  // GET /api/auth/profile
  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId; // Viene del middleware de autenticación

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
