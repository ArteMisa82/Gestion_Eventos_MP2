# Guía: Gestión de Documentos en Inscripciones

## 📋 Resumen

Los documentos de una inscripción se guardan **automáticamente en la Base de Datos** cuando se completan en el modal. No importa si se ven visualmente o no, los datos SE GUARDAN en la BD.

## 🗄️ Campos Disponibles en `registro_personas`

Cuando un usuario se inscribe, se crea un registro con los siguientes campos para documentos:

```
- carta_motivacion (TEXT)          → Texto de la carta de motivación
- documento_especifico (VARCHAR)   → Nombre/tipo del documento específico
- documento_especifico_url (VARCHAR) → URL/ruta del documento
- documento_extra_1 (VARCHAR)      → Nombre del documento adicional 1
- documento_extra_1_url (VARCHAR)  → URL/ruta del documento adicional 1
- documento_extra_2 (VARCHAR)      → Nombre del documento adicional 2
- documento_extra_2_url (VARCHAR)  → URL/ruta del documento adicional 2
- fec_envio_documentos (TIMESTAMP) → Fecha/hora del envío
```

## 📡 Endpoints Disponibles

### 1. Guardar Documentos de una Inscripción

**Endpoint:**
```
POST /api/inscripciones/{num_reg_per}/documentos
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body (opcional, envía solo los que tengas):**
```json
{
  "carta_motivacion": "Estimados evaluadores...",
  "documento_especifico": "Certificado_Pregrado",
  "documento_especifico_url": "/uploads/certs/cert-123.pdf",
  "documento_extra_1": "Experiencia_Laboral",
  "documento_extra_1_url": "/uploads/docs/exp-456.pdf",
  "documento_extra_2": "Recomendacion",
  "documento_extra_2_url": "/uploads/docs/rec-789.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Documentos guardados exitosamente",
  "data": {
    "num_reg_per": 5,
    "id_usu": 14,
    "id_reg_evt": "REG123456",
    "fec_reg_per": "2025-12-08",
    ...
  }
}
```

### 2. Obtener Documentos de una Inscripción

**Endpoint:**
```
GET /api/inscripciones/{num_reg_per}/documentos
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Documentos obtenidos exitosamente",
  "data": {
    "num_reg_per": 5,
    "carta_motivacion": "Estimados evaluadores...",
    "documento_especifico": "Certificado_Pregrado",
    "documento_especifico_url": "/uploads/certs/cert-123.pdf",
    "documento_extra_1": "Experiencia_Laboral",
    "documento_extra_1_url": "/uploads/docs/exp-456.pdf",
    "documento_extra_2": "Recomendacion",
    "documento_extra_2_url": "/uploads/docs/rec-789.pdf",
    "fec_envio_documentos": "2025-12-08T14:30:00Z",
    "usuarios": {
      "id_usu": 14,
      "nom_usu": "Juan",
      "ape_usu": "Pérez",
      "cor_usu": "juan@example.com"
    }
  }
}
```

## 🔄 Flujo Completo de Inscripción con Documentos

### Paso 1: Usuario se Inscribe
```bash
POST /api/inscripciones
{
  "id_usu": 14,
  "id_reg_evt": "REG123456"
}
```
✅ Se crea `registro_personas` con `num_reg_per = 5`

### Paso 2: Usuario Completa Documentos
```bash
POST /api/inscripciones/5/documentos
{
  "carta_motivacion": "Mi motivación es...",
  "documento_especifico": "Licenciatura",
  "documento_especifico_url": "/uploads/docs/lic.pdf"
}
```
✅ Los documentos se guardan en la BD para `num_reg_per = 5`

### Paso 3: Responsable Verifica Documentos
```bash
GET /api/inscripciones/5/documentos
```
✅ Obtiene todos los documentos almacenados

### Paso 4: Usuario Sube Más Documentos Después
```bash
POST /api/inscripciones/5/documentos
{
  "documento_extra_1": "Experiencia",
  "documento_extra_1_url": "/uploads/docs/exp.pdf"
}
```
✅ Se agregan más documentos sin sobrescribir los anteriores

## 📝 Notas Importantes

1. **Los datos SE GUARDAN en BD automáticamente** - No es necesario hacer nada especial
2. **Visualización opcional** - Los campos pueden no mostrarse en el UI pero existen en BD
3. **URLs relativas o absolutas** - Puedes guardar rutas relativas o URLs completas
4. **Actualizaciones parciales** - Puedes enviar solo algunos campos
5. **Timestamps automáticos** - `fec_envio_documentos` se actualiza cada vez que se guarden documentos
6. **Logs detallados** - El backend registra toda operación con emojis (📦, ✅) para debugging

## 🔍 Verificar en Base de Datos

Para verificar directamente en PostgreSQL:

```sql
SELECT 
  num_reg_per,
  carta_motivacion,
  documento_especifico,
  documento_especifico_url,
  documento_extra_1,
  documento_extra_1_url,
  documento_extra_2,
  documento_extra_2_url,
  fec_envio_documentos
FROM registro_personas
WHERE num_reg_per = 5;
```

## ✅ Ejemplo Completo con CURL

```bash
# 1. Inscribirse
curl -X POST http://localhost:3001/api/inscripciones \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "id_usu": 14,
    "id_reg_evt": "REG123456"
  }'

# 2. Guardar documentos (devuelve num_reg_per = 5)
curl -X POST http://localhost:3001/api/inscripciones/5/documentos \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "carta_motivacion": "Mi motivación...",
    "documento_especifico": "Licenciatura",
    "documento_especifico_url": "/uploads/lic.pdf"
  }'

# 3. Obtener documentos
curl -X GET http://localhost:3001/api/inscripciones/5/documentos \
  -H "Authorization: Bearer {token}"

# 4. Agregar más documentos
curl -X POST http://localhost:3001/api/inscripciones/5/documentos \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "documento_extra_1": "Experiencia",
    "documento_extra_1_url": "/uploads/exp.pdf"
  }'
```

## 🎯 Resumen

| Acción | Endpoint | Método | Resultado |
|--------|----------|--------|-----------|
| Guardar docs | `/api/inscripciones/{num_reg_per}/documentos` | POST | ✅ Datos en BD |
| Ver docs | `/api/inscripciones/{num_reg_per}/documentos` | GET | ✅ Lee desde BD |
| Inscribirse | `/api/inscripciones` | POST | ✅ Crea registro |

**Todo se guarda en BD automáticamente. Los documentos están disponibles para consulta en cualquier momento.**
