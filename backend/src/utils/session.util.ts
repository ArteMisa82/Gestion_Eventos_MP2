import session from 'express-session';
import pgSession from 'connect-pg-simple';
import { Pool } from 'pg';

const PostgresSessionStore = pgSession(session);

// Configurar pool de PostgreSQL para sessions
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const sessionConfig = {
  store: new PostgresSessionStore({
    pool: pool,
    tableName: 'user_sessions' // Tabla donde se guardarán las sesiones
  }),
  secret: process.env.SESSION_SECRET || 'secreto-sesiones-gestion-eventos',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS en producción
    httpOnly: true, // Prevenir XSS
    maxAge: 24 * 60 * 60 * 1000, // 1 día
    sameSite: 'lax'
  }
};

// Interfaz para TypeScript
declare module 'express-session' {
  interface SessionData {
    userId?: number;
    userEmail?: string;
    userRole?: string;
    isAuthenticated?: boolean;
  }
}