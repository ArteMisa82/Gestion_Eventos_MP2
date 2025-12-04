// src/middlewares/comite.middleware.ts
import { Request, Response, NextFunction } from 'express';

export const requireComite = (req: Request, res: Response, next: NextFunction) => {
  const isAuthenticated = (req.session as any).isAuthenticated;
  const userRole = (req.session as any).userRole;
  const comite = (req.session as any).comite;

  if (!isAuthenticated || userRole !== 'Administrador') {
    return res.status(403).json({
      success: false,
      message: 'Debe iniciar sesión como administrador para acceder al comité'
    });
  }

  if (!comite) {
    return res.status(403).json({
      success: false,
      message: 'Debe iniciar sesión como comité para gestionar solicitudes'
    });
  }

  next();
};
