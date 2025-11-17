import session from 'express-session';

export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'secreto-sesiones-gestion-eventos-uta',
  resave: false,
  saveUninitialized: true, // true para permitir crear sesión antes del login
  cookie: {
    secure: false, // false en desarrollo (localhost), true en producción con HTTPS
    httpOnly: false, // false permite JavaScript acceder a la cookie (necesario para desarrollo)
    maxAge: 24 * 60 * 60 * 1000, // 1 día
    sameSite: 'lax' as const, // 'lax' permite cookies en navegación normal
    path: '/', // Cookie disponible en todo el sitio
  }
};

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    userEmail?: string;
    userRole?: string;
    isAuthenticated?: boolean;
  }
}