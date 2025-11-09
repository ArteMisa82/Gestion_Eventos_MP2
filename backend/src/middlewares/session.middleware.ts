import { Request, Response, NextFunction } from 'express';

// Middleware PRINCIPAL: verificar si usuario está autenticado via sesión
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.isAuthenticated && req.session.userId) {
    // Agregar datos del usuario al request para usar en controllers
    (req as any).userId = req.session.userId;
    (req as any).userEmail = req.session.userEmail;
    (req as any).userRole = req.session.userRole;
    (req as any).isAdmin = req.session.userRole === 'admin' || req.session.userRole === 'Administrador';
    
    console.log(`🔐 Usuario autenticado: ${req.session.userEmail} (ID: ${req.session.userId})`);
    return next(); // Usuario autenticado, continuar
  }
  
  console.log('❌ Intento de acceso no autenticado');
  return res.status(401).json({
    success: false,
    error: 'No autenticado - Inicia sesión primero'
  });
};

// Middleware para verificar rol de ADMINISTRADOR
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.session.userRole || (req as any).userRole;
  const isAdmin = userRole === 'admin' || userRole === 'Administrador';
  
  if (isAdmin) {
    console.log(`👑 Acceso admin permitido: ${req.session.userEmail}`);
    return next();
  }
  
  console.log(`🚫 Intento de acceso admin denegado: ${req.session.userEmail}`);
  return res.status(403).json({
    success: false,
    error: 'Se requieren permisos de administrador'
  });
};

// Middleware para verificar rol de ESTUDIANTE
export const requireStudent = (req: Request, res: Response, next: NextFunction) => {
  const userRole = req.session.userRole || (req as any).userRole;
  const isStudent = userRole === 'student' || userRole === 'estudiante';
  
  if (isStudent) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    error: 'Se requieren permisos de estudiante'
  });
};

// Middleware OPCIONAL: verificar sesión sin bloquear (para rutas públicas)
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session.isAuthenticated && req.session.userId) {
    // Usuario está autenticado, agregar datos al request
    (req as any).userId = req.session.userId;
    (req as any).userEmail = req.session.userEmail;
    (req as any).userRole = req.session.userRole;
    (req as any).isAdmin = req.session.userRole === 'admin' || req.session.userRole === 'Administrador';
    
    console.log(`🔍 Usuario opcionalmente autenticado: ${req.session.userEmail}`);
  } else {
    console.log('🔍 Usuario no autenticado (acceso opcional)');
  }
  next();
};

// Middleware para loguear actividad de autenticación
export const authLogger = (req: Request, res: Response, next: NextFunction) => {
  const authStatus = req.session.isAuthenticated ? 'AUTENTICADO' : 'NO AUTENTICADO';
  const userEmail = req.session.userEmail || 'Anónimo';
  
  console.log(`📝 Auth Check: ${userEmail} - ${authStatus} - Ruta: ${req.method} ${req.path}`);
  next();
};