import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Intentar autenticación con JWT token primero
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const payload = verifyToken(token);
      
      (req as any).userId = payload.id_usu;
      (req as any).userEmail = payload.cor_usu;
      (req as any).isAdmin = payload.adm_usu === 1;
      (req as any).userRole = payload.adm_usu === 1 ? 'administrativo' : 'user';
      
      console.log(`Autenticado via JWT: ${payload.cor_usu}`);
      return next();
    } catch (error) {
      console.log('JWT token inválido, intentando con sesión...');
    }
  }
  
  // Si no hay JWT o es inválido, intentar con sesión
  if (req.session.isAuthenticated && req.session.userId) {
    (req as any).userId = req.session.userId;
    (req as any).userEmail = req.session.userEmail;
    (req as any).userRole = req.session.userRole;
    (req as any).isAdmin = req.session.userRole === 'admin' || req.session.userRole === 'Administrador';
    
    console.log(`Autenticado via sesión: ${req.session.userEmail}`);
    return next();
  }
  
  // Si ninguna forma de autenticación funciona
  res.status(401).json({
    success: false,
    error: 'No autenticado'
  });
};

export const requireAdministrativo = (req: Request, res: Response, next: NextFunction) => {
  const userRole = (req as any).userRole || req.session.userRole;
  if (userRole === 'administrativo' || userRole === 'Administrador') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Se requieren permisos de administrativo o administrador'
    });
  }
};

// ACTUALIZAR requireAdmin para solo Administrador
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = (req as any).userRole || req.session.userRole;
  if (userRole === 'Administrador') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Se requieren permisos de Administrador'
    });
  }
};

// Middleware para estudiantes
export const requireStudent = (req: Request, res: Response, next: NextFunction) => {
  const userRole = (req as any).userRole || req.session.userRole;
  if (userRole === 'estudiante') {
    next();
  } else {
    res.status(403).json({
      success: false,
      error: 'Se requieren permisos de estudiante'
    });
  }
};