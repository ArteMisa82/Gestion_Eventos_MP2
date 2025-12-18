-- ✅ SCRIPT DE PRUEBA: Verificar Documentos de Inscripciones
-- Este script verifica que los documentos se están guardando correctamente en BD

-- 1. VER ESTRUCTURA DE LA TABLA
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'registro_personas'
  AND column_name LIKE '%documento%' 
     OR column_name LIKE '%carta%'
     OR column_name LIKE '%fec_envio%'
ORDER BY ordinal_position;

-- 2. BUSCAR INSCRIPCIONES CON DOCUMENTOS
SELECT 
  num_reg_per,
  id_usu,
  id_reg_evt,
  fec_reg_per,
  estado_registro,
  CASE WHEN carta_motivacion IS NOT NULL THEN '✅ Sí' ELSE '❌ No' END as "Tiene Carta",
  CASE WHEN documento_especifico IS NOT NULL THEN '✅ Sí' ELSE '❌ No' END as "Tiene Doc Especifico",
  CASE WHEN documento_extra_1 IS NOT NULL THEN '✅ Sí' ELSE '❌ No' END as "Tiene Doc Extra 1",
  CASE WHEN documento_extra_2 IS NOT NULL THEN '✅ Sí' ELSE '❌ No' END as "Tiene Doc Extra 2",
  fec_envio_documentos
FROM registro_personas
WHERE carta_motivacion IS NOT NULL 
   OR documento_especifico IS NOT NULL
   OR documento_extra_1 IS NOT NULL
   OR documento_extra_2 IS NOT NULL
ORDER BY fec_envio_documentos DESC;

-- 3. VER DETALLES COMPLETOS DE UNA INSCRIPCIÓN (CAMBIAR num_reg_per)
SELECT 
  num_reg_per,
  id_usu,
  id_reg_evt,
  fec_reg_per,
  estado_registro,
  '---DOCUMENTOS---' as "",
  carta_motivacion,
  documento_especifico,
  documento_especifico_url,
  documento_extra_1,
  documento_extra_1_url,
  documento_extra_2,
  documento_extra_2_url,
  fec_envio_documentos
FROM registro_personas
WHERE num_reg_per = 5; -- CAMBIAR ESTE NÚMERO

-- 4. CONTAR INSCRIPCIONES POR ESTADO Y DOCUMENTACIÓN
SELECT 
  estado_registro,
  COUNT(*) as "Total Inscripciones",
  SUM(CASE WHEN carta_motivacion IS NOT NULL THEN 1 ELSE 0 END) as "Con Carta",
  SUM(CASE WHEN documento_especifico IS NOT NULL THEN 1 ELSE 0 END) as "Con Doc Especifico",
  SUM(CASE WHEN documento_extra_1 IS NOT NULL OR documento_extra_2 IS NOT NULL THEN 1 ELSE 0 END) as "Con Docs Extra"
FROM registro_personas
GROUP BY estado_registro;

-- 5. BUSCAR INSCRIPCIONES SIN DOCUMENTOS (INCOMPLETAS)
SELECT 
  num_reg_per,
  id_usu,
  id_reg_evt,
  fec_reg_per,
  estado_registro,
  'DOCUMENTOS PENDIENTES' as estado_docs
FROM registro_personas
WHERE carta_motivacion IS NULL 
  AND documento_especifico IS NULL
  AND documento_extra_1 IS NULL
  AND documento_extra_2 IS NULL
ORDER BY fec_reg_per DESC;

-- 6. ACTUALIZAR DOCUMENTOS DE UNA INSCRIPCIÓN (PARA TESTING)
-- DESCOMENTAR PARA USAR:
/*
UPDATE registro_personas
SET 
  carta_motivacion = 'Mi motivación es participar en este evento porque...',
  documento_especifico = 'Certificado_Licenciatura',
  documento_especifico_url = '/uploads/docs/licenciatura.pdf',
  documento_extra_1 = 'Experiencia_Laboral',
  documento_extra_1_url = '/uploads/docs/experiencia.pdf',
  fec_envio_documentos = NOW()
WHERE num_reg_per = 5; -- CAMBIAR ESTE NÚMERO
*/

-- 7. CREAR INSCRIPCIÓN DE PRUEBA CON DOCUMENTOS
-- DESCOMENTAR PARA USAR:
/*
INSERT INTO registro_personas (
  id_usu,
  id_reg_evt,
  fec_reg_per,
  estado_registro,
  carta_motivacion,
  documento_especifico,
  documento_especifico_url,
  fec_envio_documentos
) VALUES (
  14, -- ID del usuario
  'REG123456', -- ID del evento registrado
  NOW(),
  'PENDIENTE',
  'Esta es mi carta de motivación...',
  'Certificado',
  '/uploads/cert.pdf',
  NOW()
);
*/

-- 8. VERIFICAR INTEGRIDAD DE DATOS
SELECT 
  COUNT(*) as "Total Registros",
  SUM(CASE WHEN num_reg_per IS NOT NULL THEN 1 ELSE 0 END) as "Con ID",
  SUM(CASE WHEN carta_motivacion IS NOT NULL OR documento_especifico IS NOT NULL THEN 1 ELSE 0 END) as "Con Documentos",
  SUM(CASE WHEN fec_envio_documentos IS NOT NULL THEN 1 ELSE 0 END) as "Con Timestamp"
FROM registro_personas;
