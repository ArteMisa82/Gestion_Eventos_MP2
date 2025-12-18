# 🧪 TEST RÁPIDO - Validación @uta.edu.ec

## ✅ TEST 1: Correo @gmail.com

```
1. Ir a: http://localhost:3000/home
2. Clic en "Iniciar Sesión"
3. Clic en "¿Olvidaste tu contraseña?"
4. Ingresa: usuario@gmail.com
5. Clic en "Enviar enlace"

✅ RESULTADO ESPERADO:
   - Spinner corto (isLoading = true)
   - Alerta: "Éxito"
   - Modal se cierra
   - En consola backend: se ve token generado
```

---

## ❌ TEST 2: Correo @uta.edu.ec

```
1. Ir a: http://localhost:3000/home
2. Clic en "Iniciar Sesión"
3. Clic en "¿Olvidaste tu contraseña?"
4. Ingresa: profesor@uta.edu.ec
5. Clic en "Enviar enlace"

✅ RESULTADO ESPERADO:
   - Alerta INMEDIATA (sin spinner)
   - Título: "Correo Institucional"
   - Mensaje: "No se puede cambiar la contraseña. Diríjase a la DITIC."
   - Botón: [OK]
   - Modal permanece abierto
   - En consola backend: NO hay petición
```

---

## 🔍 Verificación en DevTools

### Network (Pestaña de Red)

**Test 1 (@gmail.com):**
```
POST /api/auth/forgot-password
┌─────────────────────────┐
│ Body: { "email": "usuario@gmail.com" }
│ Status: 200 o 400
│ Response: { "success": true, "message": "..." }
└─────────────────────────┘
```

**Test 2 (@uta.edu.ec):**
```
❌ NO HAY PETICIÓN
(porque frontend bloquea antes de enviar)
```

### Console (Pestaña Consola)

**Test 1:**
```javascript
// En el navegador:
// Alerta SweetAlert2 con título "Éxito"
```

**Test 2:**
```javascript
// En el navegador:
// Alerta SweetAlert2 con título "Correo Institucional"
// En backend: SIN logs de solicitud
```

---

## 📝 Checklist de Validación

### ✅ Frontend (RecuperarModal.tsx)
```
[ ] Valida email.endsWith('@uta.edu.ec')
[ ] Muestra alerta SweetAlert2 inmediata
[ ] NO envía solicitud al backend
[ ] Modal permanece abierto
[ ] Mensaje: "No se puede cambiar la contraseña. Diríjase a la DITIC."
[ ] Para otros emails: procede normalmente
```

### ✅ Backend (password.service.ts)
```
[ ] Valida email.endsWith('@uta.edu.ec')
[ ] Devuelve { success: false, message: '...' }
[ ] NO genera token
[ ] NO envía email
```

### ✅ Backend (auth.controller.ts)
```
[ ] Valida email.endsWith('@uta.edu.ec')
[ ] Devuelve status 403
[ ] Mensaje consistente con password.service
```

---

## 🎯 Casos a Verificar

### Caso 1: Email normal @gmail.com
```
Entrada: usuario@gmail.com
Esperado: ✅ Se envía email
Status: [ ]
```

### Caso 2: Email normal @hotmail.com
```
Entrada: usuario@hotmail.com
Esperado: ✅ Se envía email
Status: [ ]
```

### Caso 3: Email @uta.edu.ec
```
Entrada: profesor@uta.edu.ec
Esperado: ❌ Alerta - "Diríjase a la DITIC"
Status: [ ]
```

### Caso 4: Email @uta.edu.ec (mayúscula)
```
Entrada: ADMIN@UTA.EDU.EC
Esperado: ❌ Alerta (valida con toLowerCase)
Status: [ ]
```

### Caso 5: Email @uta.edu.ec (mixto)
```
Entrada: InStRuCtOr@UtA.eDu.eC
Esperado: ❌ Alerta (valida con toLowerCase)
Status: [ ]
```

---

## 🔐 Verificación de Seguridad

### ✅ La validación NO se puede esquivar

**Intento 1: Cambiar dominio en el navegador**
```
Usuario ve: profesor@uta.edu.ec en el input
Intenta cambiar por: profesor@gmail.com
Clic "Enviar"
Resultado: ✅ Se envía (correcto, nuevo email)
```

**Intento 2: Enviar directo al backend (sin frontend)**
```
POST /api/auth/forgot-password
Body: { "email": "profesor@uta.edu.ec" }
Resultado: ❌ Backend rechaza con 403
```

**Intento 3: Manipular código frontend**
```
Si usuario elimina la validación localmente,
backend la valida nuevamente
Resultado: ❌ Rechazado por backend
```

---

## 💡 Notas Importantes

1. **La validación es DOBLE**
   - Frontend: Bloqueo inmediato (UX)
   - Backend: Bloqueo de seguridad (validación)

2. **Imposible esquivar**
   - No se puede usar localhost con fetch manual
   - Backend siempre valida

3. **Mensaje consistente**
   - Frontend: "No se puede cambiar la contraseña. Diríjase a la DITIC."
   - Backend: "No se puede cambiar la contraseña. Diríjase a la DITIC."

4. **Modal permanece abierto**
   - Usuario puede intentar con otro email
   - O cerrar y contactar a DITIC

---

## ✨ Resumen

✅ **@gmail.com, @hotmail.com, @yahoo.com, etc**
   → Se envía email de recuperación

❌ **@uta.edu.ec**
   → Alerta: "No se puede cambiar la contraseña. Diríjase a la DITIC."

🔐 **Implementación segura en dos niveles**
   → Frontend + Backend

¡**Listo para testear!**
