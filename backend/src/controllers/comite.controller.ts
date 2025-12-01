// src/controllers/comite.controller.ts
import { Request, Response } from 'express';
import { ComiteService } from '../services/comite.service';

export class ComiteController {
  private service: ComiteService;

  constructor() {
    this.service = new ComiteService();
  }

  // POST /api/comite/login
  async login(req: Request, res: Response) {
    try {
      const { cor_com, tok_seg } = req.body;

      if (!cor_com || !tok_seg) {
        return res.status(400).json({
          success: false,
          message: 'El correo y el token del comité son obligatorios'
        });
      }

      // ✅ Usar la info REAL que guardas en sesión
      const isAuthenticated = (req.session as any).isAuthenticated;
      const userRole = (req.session as any).userRole;

      // Solo puede usar comité quien esté logueado y sea Administrador
      if (!isAuthenticated || userRole !== 'Administrador') {
        return res.status(403).json({
          success: false,
          message: 'Solo un administrador puede iniciar sesión como comité'
        });
      }

      const miembro = await this.service.loginComite(cor_com, tok_seg);

      if (!miembro) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales de comité inválidas'
        });
      }

      // Guardar info de comité en la sesión de Express
      (req.session as any).comite = miembro;

      return res.json({
        success: true,
        message: 'Sesión de comité iniciada correctamente',
        data: miembro
      });
    } catch (error) {
      console.error('Error en login de comité:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // GET /api/comite/session
  async getCurrentSession(req: Request, res: Response) {
    const comite = (req.session as any).comite;

    if (!comite) {
      return res.status(404).json({
        success: false,
        message: 'No hay una sesión de comité activa'
      });
    }

    return res.json({
      success: true,
      data: comite
    });
  }

  // POST /api/comite/logout
  async logout(req: Request, res: Response) {
    if ((req.session as any).comite) {
      delete (req.session as any).comite;
    }

    return res.json({
      success: true,
      message: 'Sesión de comité cerrada correctamente'
    });
  }
}
