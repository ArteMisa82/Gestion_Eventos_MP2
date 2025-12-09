-- ============================================================
-- SCRIPT PARA AGREGAR TABLA PASSWORD_RESET
-- ============================================================
-- Esta tabla almacena los tokens de recuperación de contraseña
-- con expiración de 1 hora

-- Crear tabla password_reset
CREATE TABLE IF NOT EXISTS public.password_reset (
    id SERIAL PRIMARY KEY,
    id_usu INTEGER NOT NULL UNIQUE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_password_reset_usuario 
        FOREIGN KEY (id_usu) 
        REFERENCES public.usuarios(id_usu) 
        ON DELETE CASCADE
);

-- Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_password_reset_token ON public.password_reset(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_usuario ON public.password_reset(id_usu);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON public.password_reset(expires_at);

-- ============================================================
-- Listo. Puedes copiar y pegar este script en pgAdmin
-- ============================================================
