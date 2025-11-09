import session from 'express-session';

export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'secreto-sesiones-gestion-eventos-uta',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true en producción con HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 día
    sameSite: 'lax' as const
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