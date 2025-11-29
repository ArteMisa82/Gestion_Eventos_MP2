-- Migración: Agregar responsable a tabla eventos
-- Base de datos: PostgreSQL
-- Fecha: 2025-11-07

-- 1. Agregar columna id_res_evt a la tabla eventos
ALTER TABLE eventos 
ADD COLUMN id_res_evt INT;

-- 2. Agregar comentario a la columna
COMMENT ON COLUMN eventos.id_res_evt IS 'ID del usuario responsable/coordinador del evento (debe ser adm_usu=1)';

-- 3. Agregar foreign key constraint hacia usuarios
ALTER TABLE eventos
ADD CONSTRAINT fk_eventos_responsable 
FOREIGN KEY (id_res_evt) 
REFERENCES usuarios(id_usu) 
ON DELETE SET NULL
ON UPDATE CASCADE;

-- 4. Crear índice para mejorar rendimiento en consultas
CREATE INDEX idx_eventos_responsable ON eventos(id_res_evt);

-- 5. (OPCIONAL) Si quieres asignar un responsable por defecto a eventos existentes
-- Descomenta la siguiente línea y ajusta el ID del usuario administrador
-- UPDATE eventos SET id_res_evt = 1 WHERE id_res_evt IS NULL;

-- 6. (OPCIONAL) Si quieres hacer el campo NOT NULL después de asignar valores
-- Primero ejecuta el UPDATE de arriba, luego descomenta:
-- ALTER TABLE eventos ALTER COLUMN id_res_evt SET NOT NULL;
