import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.isAuthenticated && req.session.userId) {
    (req as any).userId = req.session.userId;
    (req as any).userEmail = req.session.userEmail;
    (req as any).userRole = req.session.userRole;
    (req as any).isAdmin = req.session.userRole === 'admin' || req.session.userRole === 'Administrador';
    next();
  } else {
    res.status(401).json({
      success: false,
      error: 'No autenticado'
    });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = (req as any).userRole || req.session.userRole;
  if (userRole === 'admin' || userRole === 'Administrador') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Se requieren permisos de administrador'
    });
  }
};