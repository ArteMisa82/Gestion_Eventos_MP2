# INSTRUCCIONES PARA APLICAR LA MIGRACIÓN

## Opción 1: Usando pgAdmin (RECOMENDADO)

1. Abre pgAdmin 4
2. Conecta a tu base de datos `gestion_eventos` (o el nombre que tengas)
3. Click derecho en la base de datos → Query Tool
4. Copia y pega el contenido del archivo:
   `backend/prisma/migrations/add_estado_inscripcion.sql`
5. Ejecuta el script (F5 o botón ▶️)

## Opción 2: Usando psql desde PowerShell

Busca dónde está instalado psql.exe en tu sistema y ejecuta:

```powershell
# Reemplaza la ruta con tu instalación de PostgreSQL
& "C:\Program Files\PostgreSQL\16\bin\psql.exe" -U postgres -d gestion_eventos -f "backend/prisma/migrations/add_estado_inscripcion.sql"
```

## Opción 3: Ejecutar comandos SQL manualmente

Si no puedes ejecutar el archivo, copia estos comandos SQL uno por uno en pgAdmin:

```sql
-- 1. Agregar estado de registro
ALTER TABLE registro_personas 
ADD COLUMN IF NOT EXISTS estado_registro VARCHAR(30) DEFAULT 'PENDIENTE';

-- 2. Agregar validación del responsable
ALTER TABLE registro_personas 
ADD COLUMN IF NOT EXISTS responsable_valida BOOLEAN DEFAULT FALSE;

-- 3. Agregar fecha de validación
ALTER TABLE registro_personas 
ADD COLUMN IF NOT EXISTS fecha_validacion TIMESTAMP;

-- 4. Agregar comentarios
ALTER TABLE registro_personas 
ADD COLUMN IF NOT EXISTS comentarios_responsable TEXT;

-- 5. Agregar requisitos completos en detalle_eventos
ALTER TABLE detalle_eventos 
ADD COLUMN IF NOT EXISTS requisitos_completos BOOLEAN DEFAULT TRUE;

-- 6. Crear índices
CREATE INDEX IF NOT EXISTS idx_registro_personas_estado ON registro_personas(estado_registro);
CREATE INDEX IF NOT EXISTS idx_registro_personas_validacion ON registro_personas(responsable_valida);

-- 7. Actualizar registros existentes
UPDATE registro_personas 
SET estado_registro = 'COMPLETADO' 
WHERE estado_registro IS NULL OR estado_registro = 'PENDIENTE';
```

## Verificar que se aplicó correctamente

Ejecuta esta consulta para verificar:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'registro_personas'
ORDER BY ordinal_position;
```

Deberías ver las nuevas columnas:
- estado_registro
- responsable_valida
- fecha_validacion
- comentarios_responsable

## Después de aplicar la migración

1. Reinicia el backend si está corriendo:
   ```bash
   cd backend
   npm run dev
   ```

2. El servidor debería iniciar sin errores

3. Prueba creando una nueva inscripción en un evento de pago
