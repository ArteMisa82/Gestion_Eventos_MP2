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

      const isAuthenticated = (req.session as any).isAuthenticated;
      const userRole = (req.session as any).userRole;

      // Solo admin puede iniciar sesión como comité
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

      // Guardar info de comité en sesión
      (req.session as any).comite = miembro;
      (req.session as any).comiteLoginAt = new Date().toISOString();

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
    const comiteLoginAt = (req.session as any).comiteLoginAt;

    if (!comite) {
      return res.status(404).json({
        success: false,
        message: 'No hay una sesión de comité activa'
      });
    }

    return res.json({
      success: true,
      data: {
        ...comite,
        loginAt: comiteLoginAt || null
      }
    });
  }

  // 🔹 NUEVO: GET /api/comite/estado
  // Resumen simple: ¿hay comité activo o no?
  async getEstado(req: Request, res: Response) {
    const comite = (req.session as any).comite;
    const comiteLoginAt = (req.session as any).comiteLoginAt;

    return res.json({
      success: true,
      data: {
        activo: !!comite,
        miembro: comite || null,
        loginAt: comite ? comiteLoginAt || null : null
      }
    });
  }

  // 🔹 NUEVO: GET /api/comite/miembros
  // Solo admin: lista los miembros configurados en sc_comite
  async getMiembros(req: Request, res: Response) {
    try {
      const isAuthenticated = (req.session as any).isAuthenticated;
      const userRole = (req.session as any).userRole;

      if (!isAuthenticated || userRole !== 'Administrador') {
        return res.status(403).json({
          success: false,
          message: 'Solo un administrador puede listar los miembros del comité'
        });
      }

      const miembros = await this.service.getMiembros();

      return res.json({
        success: true,
        data: miembros
      });
    } catch (error) {
      console.error('Error obteniendo miembros de comité:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // POST /api/comite/logout
  async logout(req: Request, res: Response) {
    if ((req.session as any).comite) {
      delete (req.session as any).comite;
    }
    if ((req.session as any).comiteLoginAt) {
      delete (req.session as any).comiteLoginAt;
    }

    return res.json({
      success: true,
      message: 'Sesión de comité cerrada correctamente'
    });
  }
}
