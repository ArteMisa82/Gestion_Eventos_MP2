# 🧪 GUÍA DE PRUEBAS RÁPIDAS - Recuperación de Contraseña

## Requisitos Previos

```bash
# 1. Backend ejecutándose
cd backend
npm run dev

# 2. Frontend ejecutándose (en otra terminal)
cd frontend
npm run dev

# 3. BD PostgreSQL disponible
# Verificar: psql -U postgres -d gestionEventos
```

---

## 📋 TEST 1: Solicitar Recuperación (Correo Normal)

### Paso 1: Abrir Modal
```
1. Ir a: http://localhost:3000/home
2. Clic en botón "Iniciar Sesión"
3. Clic en "¿Olvidaste tu contraseña?"
```

### Paso 2: Completar Formulario
```
Email: test.usuario@gmail.com
```

### Paso 3: Verificar Respuesta
```
✅ Esperado:
- Alerta: "Éxito"
- Mensaje: "Se ha enviado un enlace de recuperación..."
- Modal se cierra

🔍 En Backend (consola):
🔑 ========================================
📧 RECUPERACIÓN DE CONTRASEÑA (MODO DEV)
========================================
👤 Email: test.usuario@gmail.com
🔐 Token: a7b2f9e1c5d8f0a2b4c6e8f0a2b4c6e8
🔗 Link: http://localhost:3000/restablecer/a7b2f9e1c5d8f0a2b4c6e8f0a2b4c6e8
========================================
```

### Paso 4: Verificar BD
```sql
-- Abre terminal PostgreSQL
psql -U postgres -d gestionEventos

-- Query:
SELECT * FROM password_reset ORDER BY created_at DESC LIMIT 1;

-- Resultado:
id  │ id_usu │ token                              │ expires_at
────┼────────┼────────────────────────────────────┼──────────────
1   │ 5      │ a7b2f9e1c5d8f0a2b4c6e8f0a2b4c... │ 2024-12-09 21:30:00

-- Verificar que expires_at es 1 hora desde ahora
```

---

## 📋 TEST 2: Bloqueo de @uta.edu.ec

### Paso 1: Abrir Modal
```
1. Ir a: http://localhost:3000/home
2. Clic en "Iniciar Sesión"
3. Clic en "¿Olvidaste tu contraseña?"
```

### Paso 2: Completar Formulario
```
Email: profesor@uta.edu.ec
```

### Paso 3: Verificar Respuesta INMEDIATA
```
✅ Esperado:
- Alerta aparece INSTANTÁNEAMENTE (sin spinner)
- Título: "Correo Institucional"
- Mensaje: "No es posible recuperar la contraseña para correos 
           institucionales (@uta.edu.ec). 
           Acérquese a la DTIC para recuperar tu contraseña."

❌ NO debe:
- Enviar solicitud al backend
- Mostrar "Enviando..."
- Hacer ninguna petición HTTP
```

### Paso 4: Verificar BD
```sql
-- NO debe haber registro nuevo en password_reset
SELECT COUNT(*) FROM password_reset;

-- Debería ser el mismo número que antes del test 2
```

---

## 📋 TEST 3: Restablecimiento de Contraseña

### Paso 1: Obtener Token
```
Desde test 1, copiar token (o de la consola del backend):
a7b2f9e1c5d8f0a2b4c6e8f0a2b4c6e8
```

### Paso 2: Acceder a Página de Reset
```
URL: http://localhost:3000/restablecer/a7b2f9e1c5d8f0a2b4c6e8f0a2b4c6e8

✅ Esperado:
- Página carga
- Muestra spinner "Verificando enlace..."
- Después de 1-2 segundos: spinner desaparece
- Formulario visible
```

### Paso 3: Llenar Formulario
```
Nueva contraseña: MiNuevaPass123
Confirmar: MiNuevaPass123

✅ Esperado:
- Sin errores
- Botón habilitado
```

### Paso 4: Enviar
```
Clic en "Restablecer contraseña"

✅ Esperado:
- Botón muestra "Procesando..."
- Spinner en botón
```

### Paso 5: Verificar Respuesta
```
✅ Esperado después de 2-3 segundos:
- Alerta: "¡Éxito!"
- Mensaje: "Tu contraseña ha sido restablecida 
           correctamente. Ahora puedes iniciar sesión."
- Automáticamente redirige a /home
```

### Paso 6: Verificar BD
```sql
-- 1. Verificar que contraseña fue hasheada
SELECT id_usu, cor_usu, SUBSTRING(pas_usu, 1, 30) as hash_preview
FROM usuarios
WHERE id_usu = 5;

-- Resultado debe mostrar: $2b$10$... (nunca texto plano)

-- 2. Verificar que token fue eliminado
SELECT * FROM password_reset WHERE id_usu = 5;

-- Resultado: (vacío - sin registros)
```

### Paso 7: Login con Nueva Contraseña
```
1. Ir a: http://localhost:3000/home
2. Clic "Iniciar Sesión"
3. Email: test.usuario@gmail.com
4. Contraseña: MiNuevaPass123
5. Clic "Iniciar sesión"

✅ Esperado:
- Login exitoso
- Alerta: "Bienvenido usuario"
- Redirige según rol (admin/estudiante/responsable)
```

---

## 📋 TEST 4: Token Expirado

### Paso 1: Crear Token "Expirado"
```sql
-- Abrir psql y crear un token con expiration en el pasado
INSERT INTO password_reset (id_usu, token, expires_at)
VALUES (5, 'token-expirado-test-123', NOW() - INTERVAL '5 minutes');

-- Verificar
SELECT * FROM password_reset WHERE token = 'token-expirado-test-123';
```

### Paso 2: Intentar Acceder
```
URL: http://localhost:3000/restablecer/token-expirado-test-123

✅ Esperado:
- Página carga con spinner
- Después de 1-2 segundos aparece alerta
- Alerta: "Token Inválido"
- Mensaje: "El enlace de recuperación es inválido o ha expirado"
- Redirige a /home
```

### Paso 3: Verificar BD
```sql
-- Token debe haber sido eliminado automáticamente
SELECT * FROM password_reset WHERE token = 'token-expirado-test-123';

-- Resultado: (vacío)
```

---

## 📋 TEST 5: Token Inválido/Falso

### Paso 1: Intentar con Token Falso
```
URL: http://localhost:3000/restablecer/token-completamente-falso-xyz-123

✅ Esperado:
- Página carga con spinner
- Después de 1-2 segundos aparece alerta
- Alerta: "Token Inválido"
- Mensaje: "El enlace de recuperación es inválido o ha expirado"
- Redirige a /home
```

### Paso 2: Verificar Logs
```
En consola del backend NO debe haber errores, solo:
Error verificando token: (sin error, manejo correcto)
```

---

## 📋 TEST 6: Validaciones del Formulario

### Test 6a: Contraseña < 6 caracteres
```
Página: http://localhost:3000/restablecer/[token-valido]

Nueva contraseña: 123
Confirmar: 123
Clic "Restablecer"

✅ Esperado:
- Alerta: "Error"
- Mensaje: "La contraseña debe tener al menos 6 caracteres"
- NO envía al backend
- Permanece en página
```

### Test 6b: Contraseñas no coinciden
```
Página: http://localhost:3000/restablecer/[token-valido]

Nueva contraseña: MiPassword123
Confirmar: OtroPassword456
Clic "Restablecer"

✅ Esperado:
- Alerta: "Error"
- Mensaje: "Las contraseñas no coinciden"
- NO envía al backend
- Permanece en página
```

### Test 6c: Campo vacío
```
Página: http://localhost:3000/restablecer/[token-valido]

Nueva contraseña: (vacío)
Confirmar: (vacío)
Clic "Restablecer"

✅ Esperado:
- HTML5 validation message (navegador)
- O alerta personalizada
- NO envía al backend
```

---

## 📋 TEST 7: Rate Limiting (Futuro)

```
Este test es para DESPUÉS de implementar rate limiting

1. Hacer 6 solicitudes de "forgot password" en 15 minutos
2. La 6ª solicitud debe ser rechazada
3. Esperado: "Demasiados intentos, intenta después"

Nota: Aún no implementado en este release
```

---

## 🔍 Verificaciones de Seguridad

### Verificación 1: Contraseña Hasheada
```bash
# En BD, verificar:
# - Nunca se almacena texto plano
# - Siempre comienza con $2b$10$

psql -U postgres -d gestionEventos

SELECT cor_usu, SUBSTRING(pas_usu, 1, 50) as preview
FROM usuarios
WHERE id_usu = 5;

# Esperado: $2b$10$KrHFJ... (nunca el password original)
```

### Verificación 2: Token Único
```sql
-- Verificar que no hay tokens duplicados
SELECT token, COUNT(*) as cantidad
FROM password_reset
GROUP BY token
HAVING COUNT(*) > 1;

-- Resultado debe estar VACÍO
```

### Verificación 3: Expiración Correcta
```sql
-- Verificar que todos los tokens válidos están dentro de 1 hora
SELECT id, token, expires_at, 
  EXTRACT(EPOCH FROM (expires_at - NOW())) / 60 as minutos_restantes
FROM password_reset
WHERE expires_at > NOW();

-- Esperado: minutos_restantes entre 0 y 60
```

### Verificación 4: Cascada de Eliminación
```
1. Nota el id_usu de un registro password_reset
   SELECT id_usu FROM password_reset LIMIT 1;

2. Elimina el usuario:
   DELETE FROM usuarios WHERE id_usu = [id];

3. Verifica que password_reset también se eliminó:
   SELECT * FROM password_reset WHERE id_usu = [id];

   Esperado: Vacío (cascada funcionó)
```

---

## 📊 Matriz de Pruebas

| # | Test | Entrada | Resultado Esperado | Status |
|---|------|---------|-------------------|--------|
| 1 | Email normal | test@gmail.com | Email enviado ✅ | [ ] |
| 2 | Email @uta | user@uta.edu.ec | Bloqueado inmediato | [ ] |
| 3 | Reset válido | Token válido | Contraseña cambiada | [ ] |
| 4 | Token expirado | Token viejo | Alerta expirado | [ ] |
| 5 | Token falso | Token-xyz | Alerta inválido | [ ] |
| 6a | Pass < 6 char | "123" | Rechazo frontend | [ ] |
| 6b | Pass no coincide | "pass1" vs "pass2" | Rechazo frontend | [ ] |
| 7 | Hash correcto | BD | $2b$10$... | [ ] |
| 8 | Login nuevo pass | Nueva contraseña | Login exitoso | [ ] |

---

## 🐛 Debugging

### Si falla Test 1 (Email normal)
```
Checklist:
❌ ¿Backend está corriendo?
   → npm run dev en backend/

❌ ¿BD está disponible?
   → psql -U postgres -d gestionEventos

❌ ¿El correo existe?
   → SELECT * FROM usuarios WHERE cor_usu = 'test@gmail.com';

❌ ¿Hay error en consola backend?
   → Busca "Error en recuperación de password"

Solución:
→ Verificar logs en consola del backend
→ Usar Prisma Studio: npx prisma studio
```

### Si falla Test 2 (Bloqueo @uta)
```
Checklist:
❌ ¿El modal valida localmente?
   → Check DevTools → Console

❌ ¿Frontend tiene el código?
   → Verificar RecuperarModal.tsx línea 20+

Solución:
→ F12 → Console → Ver errores JS
→ Verificar que el if() de @uta esté presente
```

### Si falla Test 3 (Reset)
```
Checklist:
❌ ¿Token existe en BD?
   → SELECT * FROM password_reset;

❌ ¿Token en URL es correcto?
   → Copiar exactamente de BD o consola

❌ ¿Página verifica token?
   → F12 → Network → Ver petición a verify-reset-token

Solución:
→ Abrir DevTools (F12)
→ Tab Network
→ Ver respuesta de verify-reset-token
→ Buscar errores en Console
```

### Si falla Test 8 (Login nuevo pass)
```
Checklist:
❌ ¿Contraseña fue actualizada?
   → SELECT pas_usu FROM usuarios WHERE id_usu = 5;

❌ ¿Está hasheada?
   → Debe comenzar con $2b$10$

Solución:
→ Intentar login con contraseña antigua (debe fallar)
→ Intentar login con nueva (debe funcionar)
→ Si ambas funcionan → contraseña no fue actualizada
```

---

## ✅ Checklist Final

Marca cada test completado:

```
[ ] Test 1: Solicitar recuperación (correo normal) ✓
[ ] Test 2: Bloqueo de @uta.edu.ec ✓
[ ] Test 3: Restablecimiento de contraseña ✓
[ ] Test 4: Token expirado ✓
[ ] Test 5: Token inválido ✓
[ ] Test 6a: Validación password < 6 char ✓
[ ] Test 6b: Validación password no coincide ✓
[ ] Test 7: Verificación hash correcto ✓
[ ] Test 8: Login con nueva contraseña ✓

🎉 Si todos están marcados: ¡Sistema funcionando perfectamente!
```

---

## 📞 Soporte Rápido

| Problema | Solución |
|----------|----------|
| Generador Prisma falló | `npx prisma generate` |
| BD no accesible | `psql -U postgres -c "CREATE DATABASE gestionEventos"` |
| Port 3001 en uso | `netstat -ano \| findstr 3001` luego kill el proceso |
| Port 3000 en uso | `netstat -ano \| findstr 3000` luego kill el proceso |
| Token no aparece en consola | Verificar `NODE_ENV=development` en .env |
| Email no llega | Completamente NORMAL en dev, revisar consola |

🎯 **¡Listo para probar!**
