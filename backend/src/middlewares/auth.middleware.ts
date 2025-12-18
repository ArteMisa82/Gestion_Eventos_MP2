import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.util';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar token
    const payload = verifyToken(token);

    // Agregar datos del usuario al request
    (req as any).userId = payload.id_usu;
    (req as any).userEmail = payload.cor_usu;
    // Acepta Administrador (super admin) o adm_usu == 1 (admin/responsable)
    (req as any).isAdmin = payload.Administrador === true || payload.adm_usu === 1;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

// Middleware para verificar si es admin
export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!(req as any).isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador o responsable'
    });
  }
  next();
};
