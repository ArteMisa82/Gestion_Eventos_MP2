# 📋 Checklist de Deployment - Recuperación de Contraseña

## Paso 1: Preparar Migraciones
```bash
cd backend

# Genererar el cliente Prisma (ya hecho)
npx prisma generate

# Ver estado de migraciones
npx prisma migrate status

# Si necesitas rollback (en desarrollo)
npx prisma migrate reset
```

## Paso 2: Instalar Dependencias
```bash
# Backend ya tiene crypto (built-in de Node.js)
# Verificar que tenga: nodemailer, prisma, bcrypt

cd backend
npm install

# Frontend
cd ../frontend
npm install
```

## Paso 3: Configurar Variables de Entorno

### Backend (.env)
```env
# Variables existentes...
DATABASE_URL="postgresql://postgres:root@localhost:5432/gestionEventos?schema=public"
PORT=3001
NODE_ENV=development
JWT_SECRET="tu_secreto_super_seguro_cambiar_en_produccion_123456"
JWT_EXPIRES_IN="7d"
FRONTEND_URL="http://localhost:3000"

# Email Configuration (para producción)
# Para GMAIL (recomendado):
# 1. Crear contraseña de aplicación: https://myaccount.google.com/apppasswords
# 2. Usar esa contraseña en EMAIL_PASS

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASS=tu-contraseña-de-aplicación
EMAIL_FROM="Gestión Eventos UTA <tu-email@gmail.com>"

# Super administrator
SUPER_ADMIN_EMAIL=admin@admin.com
```

### Frontend (.env.local)
```env
# Verificar que exista:
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## Paso 4: Ejecutar Servidor de Desarrollo

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

**Esperado:**
```
✓ Servidor escuchando en puerto 3001
✓ Conectado a BD gestionEventos
✓ Prisma Client generado
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

**Esperado:**
```
✓ Servidor escuchando en puerto 3000
✓ Conectado a API http://localhost:3001/api
```

## Paso 5: Verificar Funcionamiento

### Verificar Backend APIs
```bash
# Test 1: Solicitar recuperación
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@gmail.com"}'

# Respuesta esperada:
# {"success": true, "message": "Se ha enviado un enlace..."}

# Test 2: Verificar token
curl -X POST http://localhost:3001/api/auth/verify-reset-token \
  -H "Content-Type: application/json" \
  -d '{"token":"[token-del-paso-anterior]"}'

# Respuesta esperada:
# {"success": true, "message": "Token válido"}

# Test 3: Restablecer contraseña
curl -X POST http://localhost:3001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"token":"[token]", "newPassword":"nuevapass123"}'

# Respuesta esperada:
# {"success": true, "message": "Contraseña restablecida exitosamente"}
```

### Verificar en Navegador
```
1. Ir a http://localhost:3000/home
2. Clic en "Iniciar Sesión"
3. Clic en "¿Olvidaste tu contraseña?"
4. Ingresar email de prueba
5. Ver respuesta en consola del backend
6. Copiar token y acceder a:
   http://localhost:3000/restablecer/{token}
7. Ingresar nueva contraseña
8. Verificar cambio con login
```

## Paso 6: Troubleshooting

### Error: "Property 'password_reset' does not exist"
```bash
# Ejecutar generación de Prisma
npx prisma generate
```

### Error: "no existe la relación sc_usuarios_num_sol_seq"
```bash
# Esto es un problema de migraciones previas
# Solución: Ejecutar
npx prisma migrate resolve --rolled-back 20251208201845_add_password_reset
npx prisma generate
```

### No se envían emails
```
En desarrollo esto es NORMAL.
El sistema:
✅ Genera tokens correctamente
✅ Los guarda en BD
✅ Los muestra en consola del backend
✅ Los acepta en reset-password

Para producción:
Configura EMAIL_HOST, EMAIL_USER, EMAIL_PASS
```

### Token expira muy rápido
```typescript
// En backend/src/services/password.service.ts
// Cambiar línea (actualmente es 1 hora):
expirationDate.setHours(expirationDate.getHours() + 1);

// Por ejemplo, para 24 horas:
expirationDate.setHours(expirationDate.getHours() + 24);
```

### Contraseña rechazada en reset
```
Validaciones:
- Mínimo 6 caracteres
- No puede estar vacía
- Debe coincidir en confirmación

Código en:
frontend/src/app/restablecer/[token]/page.tsx
backend/src/services/password.service.ts
```

## Paso 7: Verificar Seguridad

### Validación @uta.edu.ec
```typescript
// ✅ Validado en frontend (UX inmediata)
// ✅ Validado en backend (seguridad)
// ✅ Mensaje claro: "Acérquese a la DTIC"

// Test:
// 1. Intentar con usuario@uta.edu.ec en login modal
// 2. Debe mostrar alerta inmediatamente
```

### Expiración de Tokens
```sql
-- Ver tokens en BD:
SELECT * FROM password_reset;

-- Tokens vencidos automáticamente se eliminan:
-- - Al intentar usar un token expirado
-- - Cuando se genera un nuevo token (máximo 1 por usuario)
```

### Contraseña Hasheada
```sql
-- Verificar que contraseña está hasheada:
SELECT id_usu, cor_usu, SUBSTRING(pas_usu, 1, 20) as hash_preview 
FROM usuarios 
LIMIT 5;

-- La columna pas_usu debe mostrar hash bcrypt:
-- $2b$10$... (nunca texto plano)
```

## Paso 8: Configuración en Producción

### Considerar
```
1. HTTPS obligatorio (no HTTP)
2. Rate limiting en endpoints de password
3. Logging de intentos fallidos
4. Email verificado (no @gmail.com)
5. Dominios permitidos configurables
6. Expiración ajustable por política
7. Notificación de cambio de contraseña
```

### Ejemplo de Implementación de Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const passwordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  message: 'Demasiados intentos de cambio de contraseña, intenta después'
});

router.post('/forgot-password', passwordLimiter, controller.forgotPassword.bind(controller));
```

## Paso 9: Testing Automatizado (Futuro)

```typescript
// Ejemplo de test unitario
describe('Password Reset', () => {
  it('should send reset email for valid user', async () => {
    const result = await passwordService.requestPasswordReset('user@example.com');
    expect(result.success).toBe(true);
    expect(result.resetToken).toBeDefined();
  });

  it('should reject @uta.edu.ec emails', async () => {
    const result = await passwordService.requestPasswordReset('user@uta.edu.ec');
    expect(result.success).toBe(false);
  });

  it('should verify token validity', async () => {
    // Crear token...
    const isValid = await passwordService.verifyResetToken(token);
    expect(isValid).toBe(true);
  });
});
```

## Paso 10: Documentación para Usuarios

### Crear Página de Ayuda
```markdown
# ¿Olvidaste tu contraseña?

1. **Haz clic en "¿Olvidaste tu contraseña?"** en la página de login
2. **Ingresa tu correo electrónico**
3. **Revisa tu correo** (incluye spam)
4. **Haz clic en el enlace** del email
5. **Ingresa tu nueva contraseña** (mínimo 6 caracteres)
6. **Listo!** Ahora puedes iniciar sesión

## ⚠️ Importante

- El enlace es válido por **1 hora**
- Si expires, solicita uno nuevo
- **Usuarios @uta.edu.ec**: Contacta a la DTIC

## Si algo no funciona

- Verifica que el correo sea correcto
- Revisa la carpeta de SPAM
- Prueba desde otro navegador
- Contacta a soporte: soporte@uta.edu.ec
```

---

## ✅ Checklist Final

- [ ] Prisma generate ejecutado
- [ ] Variables de entorno configuradas
- [ ] Backend iniciado (puerto 3001)
- [ ] Frontend iniciado (puerto 3000)
- [ ] Test manual completado
- [ ] Emails en consola (desarrollo) o enviados (producción)
- [ ] Validación @uta.edu.ec funcionando
- [ ] Token expira correctamente
- [ ] Contraseña se hasheada
- [ ] Documentación actualizada

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de backend (consola)
2. Abre DevTools del navegador (F12)
3. Revisa errores de red en pestaña Network
4. Verifica BD con: `npx prisma studio`

¡Listo! Tu sistema de recuperación de contraseña está funcionando correctamente. 🚀
