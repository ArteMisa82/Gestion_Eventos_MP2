# 🔄 CAMBIOS DE CÓDIGO - Comparativa Antes/Después

## 1. BASE DE DATOS - Prisma Schema

### ANTES
```prisma
model usuarios {
  id_usu               Int                    @id @default(autoincrement())
  cor_usu              String                 @unique @db.VarChar(100)
  pas_usu              String                 @db.VarChar(255)
  pdf_ced_usu          String?                
  // ... otros campos ...
}
// ❌ NO hay tabla de recuperación de contraseña
// ❌ pdf_ced_usu se usaba como campo temporal
```

### DESPUÉS
```prisma
model usuarios {
  id_usu               Int                    @id @default(autoincrement())
  cor_usu              String                 @unique @db.VarChar(100)
  pas_usu              String                 @db.VarChar(255)
  pdf_ced_usu          String?                
  // ... otros campos ...
  password_reset       password_reset?        // ✅ NUEVA RELACIÓN
}

// ✅ NUEVA TABLA
model password_reset {
  id              Int       @id @default(autoincrement())
  id_usu          Int       @unique
  token           String    @unique
  expires_at      DateTime
  created_at      DateTime  @default(now())
  usuario         usuarios  @relation(fields: [id_usu], references: [id_usu], onDelete: Cascade)

  @@index([token], map: "idx_password_reset_token")
  @@index([id_usu], map: "idx_password_reset_usuario")
}
```

**Cambios Clave:**
- ✅ Tabla separada para tokens
- ✅ Expiración con TIMESTAMP
- ✅ Índices para performance
- ✅ Cascada para integridad

---

## 2. SERVICIO DE CONTRASEÑA

### ANTES
```typescript
import { TokenUtil } from '../utils/token.util';  // ❌ No existe

async requestPasswordReset(email: string) {
  // Guardar en campo temporal
  await prisma.usuarios.update({
    where: { id_usu: user.id_usu },
    data: {
      pdf_ced_usu: resetToken  // ❌ Mal uso de campo
    }
  });
}

async resetPassword(token: string, newPassword: string) {
  // Buscar en campo temporal
  const user = await prisma.usuarios.findFirst({
    where: { pdf_ced_usu: token }  // ❌ Sin expiración
  });
  
  // Limpiar campo
  await prisma.usuarios.update({
    data: { pdf_ced_usu: null }
  });
}
```

### DESPUÉS
```typescript
import crypto from 'crypto';  // ✅ Built-in de Node.js

async requestPasswordReset(email: string) {
  // ✅ Validación de @uta.edu.ec
  if (email.toLowerCase().endsWith('@uta.edu.ec')) {
    return {
      success: false,
      message: 'No es posible recuperar...'
    };
  }

  // ✅ Token seguro
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // ✅ Expiración clara
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() + 1);

  // ✅ Eliminar tokens previos
  await prisma.password_reset.deleteMany({
    where: { id_usu: user.id_usu }
  });

  // ✅ Guardar en tabla correcta
  await prisma.password_reset.create({
    data: {
      id_usu: user.id_usu,
      token: resetToken,
      expires_at: expirationDate
    }
  });
}

async resetPassword(token: string, newPassword: string) {
  // ✅ Buscar en tabla correcta
  const passwordReset = await prisma.password_reset.findUnique({
    where: { token }
  });

  // ✅ Validar expiración
  if (passwordReset.expires_at < now()) {
    await prisma.password_reset.delete({ where: { token } });
    return { success: false, message: 'Expirado' };
  }

  // ✅ Hash seguro
  const hashedPassword = await hashPassword(newPassword);

  // ✅ Transacción atómica
  await prisma.$transaction([
    prisma.usuarios.update({
      where: { id_usu: passwordReset.id_usu },
      data: { pas_usu: hashedPassword }
    }),
    prisma.password_reset.delete({ where: { token } })
  ]);
}
```

**Cambios Clave:**
- ✅ De campo temporal a tabla separada
- ✅ De TokenUtil a crypto.randomBytes
- ✅ De sin expiración a TIMESTAMP de 1 hora
- ✅ De operaciones separadas a transacción atómica
- ✅ Validación de @uta.edu.ec

---

## 3. SERVICIO DE EMAIL

### ANTES
```typescript
async sendPasswordResetEmail(email: string, resetToken: string) {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  // Simple, sin mucho formato
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="color: #2563eb;">Recuperación de Contraseña</h2>
      <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
      <a href="${resetLink}">Restablecer Contraseña</a>
      <p>Este enlace expirará en 1 hora.</p>
    </div>
  `;
}
```

### DESPUÉS
```typescript
async sendPasswordResetEmail(email: string, resetToken: string) {
  // ✅ URL actualizada a estructura correcta
  const resetLink = `${process.env.FRONTEND_URL}/restablecer/${resetToken}`;
  
  // ✅ 🔥 Modo desarrollo mejorado
  if (this.isDevelopment || !this.transporter) {
    console.log('\n🔑 ========================================');
    console.log('📧 RECUPERACIÓN DE CONTRASEÑA (MODO DEV)');
    console.log('========================================');
    console.log(`👤 Email: ${email}`);
    console.log(`🔐 Token: ${resetToken}`);
    console.log(`🔗 Link: ${resetLink}`);
    console.log('========================================\n');
  }
  
  // ✅ HTML profesional con branding UTA
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px;">
      <div style="background-color: #581517; color: white; padding: 20px;">
        <h2 style="margin: 0;">🔐 Recuperación de Contraseña</h2>
      </div>
      <div style="padding: 30px; background-color: #f9fafb;">
        <p>Hemos recibido una solicitud para restablecer tu contraseña...</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #581517; color: white; 
                    padding: 14px 32px; display: inline-block;">
            Restablecer Contraseña
          </a>
        </div>
        
        <p><strong>⏰ Importante:</strong> Este enlace expirará en 1 HORA</p>
        
        <p>Si no solicitaste esto, ignora este email.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #9ca3af; font-size: 12px;">
          Si no puedes hacer clic, copia: <br>
          ${resetLink}
        </p>
      </div>
      <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px;">
          © 2024 Gestión Eventos UTA
        </p>
      </div>
    </div>
  `;
}
```

**Cambios Clave:**
- ✅ URL: `/reset-password?token=` → `/restablecer/{token}`
- ✅ HTML mejorado con estilos profesionales
- ✅ Branding UTA (color #581517)
- ✅ Logging mejorado en modo dev
- ✅ Fallback de URL en plain text
- ✅ Diseño responsive

---

## 4. CONTROLADOR DE AUTENTICACIÓN

### ANTES
```typescript
async forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido'
      });
    }
    
    // Validación básica
    if (email.toLowerCase().endsWith('@uta.edu.ec')) {
      return res.status(403).json({
        success: false,
        message: 'No es posible recuperar... acérquese a la DTIC'
      });
    }
    
    const result = await passwordService.requestPasswordReset(email);
    // ...
  }
}
```

### DESPUÉS
```typescript
async forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;

    // ✅ Validación clara
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email es requerido'
      });
    }

    // ✅ Validación de @uta en backend (redundancia de seguridad)
    if (email.toLowerCase().endsWith('@uta.edu.ec')) {
      return res.status(403).json({
        success: false,
        message: 'No es posible recuperar la contraseña para correos 
                  institucionales (@uta.edu.ec). 
                  Por favor, notifica a la DTIC para recuperar tu contraseña.'
      });
    }

    const result = await passwordService.requestPasswordReset(email);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message
      });
    }

    res.json(successResponse(
      { resetToken: result.resetToken },
      result.message
    ));
  } catch (error) {
    console.error('Error en forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
}
```

**Nota:** Ya estaba implementado correctamente, se mantiene igual.

---

## 5. COMPONENTE FRONTEND - RecuperarModal

### ANTES
```typescript
export default function RecoveryModal({ isOpen, onClose, onRecoverySent }) {
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authAPI.forgotPassword(recoveryEmail);
      // ... resto del código ...
    } catch (err: any) {
      // error handling
    }
  };
  // ...
}
```

### DESPUÉS
```typescript
export default function RecoveryModal({ isOpen, onClose, onRecoverySent }) {
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ VALIDACIÓN NUEVA: Bloqueo inmediato de @uta.edu.ec
    if (recoveryEmail.toLowerCase().endsWith('@uta.edu.ec')) {
      Swal.fire({
        title: "Correo Institucional",
        text: "No es posible recuperar la contraseña para correos 
              institucionales (@uta.edu.ec). 
              Por favor, acérquese a la DTIC para recuperar tu contraseña.",
        icon: "warning",
        confirmButtonColor: "#581517"
      });
      return;  // ✅ NO continúa al backend
    }
    
    setIsLoading(true);
    try {
      const res = await authAPI.forgotPassword(recoveryEmail);
      
      const message = (res && (res.message || res.data || res)) || 
                      "Se ha enviado un enlace de recuperación a tu correo ✅";
      onRecoverySent(typeof message === 'string' ? message : JSON.stringify(message));
      setRecoveryEmail("");
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      const text = err?.message || "No se pudo procesar la solicitud";
      Swal.fire({ 
        title: "Error", 
        text, 
        icon: "error", 
        confirmButtonColor: "#581517" 
      });
      setIsLoading(false);
    }
  };
  // ...
}
```

**Cambios Clave:**
- ✅ Validación de @uta.edu.ec ANTES de enviar
- ✅ Alerta inmediata sin spinner
- ✅ Mejores mensajes de error
- ✅ UX más responsiva

---

## 6. PÁGINA DE RESTABLECIMIENTO

### ANTES
```typescript
export default function RestablecerPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const { token } = params;
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      Swal.fire("Error", "La contraseña debe tener al menos 6 caracteres", "error");
      return;
    }

    if (password !== confirmar) {
      Swal.fire("Error", "Las contraseñas no coinciden", "error");
      return;
    }

    setLoading(true);

    try {
      // FUTURA CONEXIÓN AL BACKEND
      // (solo simulación)
      
      await new Promise((r) => setTimeout(r, 1500)); // Simulación

      Swal.fire({
        title: "¡Listo!",
        text: "Tu contraseña ha sido restablecida",
        icon: "success",
        confirmButtonColor: "#581517"
      });

      router.push("/home");

    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo restablecer la contraseña",
        icon: "error",
        confirmButtonColor: "#581517"
      });
    }

    setLoading(false);
  };

  return (
    // Formulario simple
  );
}
```

### DESPUÉS
```typescript
export default function RestablecerPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = params;

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);  // ✅ NUEVO
  const [tokenValid, setTokenValid] = useState(false);  // ✅ NUEVO

  // ✅ VERIFICAR TOKEN AL CARGAR
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await authAPI.verifyResetToken(token);  // ✅ API REAL
        
        if (response && response.success) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          await Swal.fire({
            title: "Token Inválido",
            text: response?.message || 
                  "El enlace de recuperación es inválido o ha expirado...",
            icon: "error",
            confirmButtonColor: "#581517",
            allowOutsideClick: false,
            allowEscapeKey: false
          });
          router.push("/home");
        }
      } catch (error: any) {
        setTokenValid(false);
        const message = error?.message || "Error al verificar el token";
        await Swal.fire({
          title: "Error",
          text: message,
          icon: "error",
          confirmButtonColor: "#581517",
          allowOutsideClick: false,
          allowEscapeKey: false
        });
        router.push("/home");
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      Swal.fire("Error", "La contraseña debe tener al menos 6 caracteres", "error");
      return;
    }

    if (password !== confirmar) {
      Swal.fire("Error", "Las contraseñas no coinciden", "error");
      return;
    }

    setLoading(true);

    try {
      // ✅ CONEXIÓN REAL AL BACKEND
      const response = await authAPI.resetPassword(token, password);

      if (response && response.success) {
        await Swal.fire({
          title: "¡Éxito!",
          text: "Tu contraseña ha sido restablecida correctamente. 
                 Ahora puedes iniciar sesión.",
          icon: "success",
          confirmButtonColor: "#581517"
        });

        router.push("/home");
      } else {
        Swal.fire({
          title: "Error",
          text: response?.message || "No se pudo restablecer la contraseña",
          icon: "error",
          confirmButtonColor: "#581517"
        });
      }
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error?.message || "No se pudo restablecer la contraseña",
        icon: "error",
        confirmButtonColor: "#581517"
      });
    }

    setLoading(false);
  };

  // ✅ MOSTRAR SPINNER MIENTRAS SE VERIFICA
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg border border-gray-200 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#581517] mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando enlace de recuperación...</p>
        </div>
      </div>
    );
  }

  // ✅ NO MOSTRAR SI TOKEN NO ES VÁLIDO
  if (!tokenValid) {
    return null;
  }

  return (
    // Formulario con campos disabled durante carga
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Nueva contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}  // ✅ DESHABILITAR DURANTE CARGA
          required
        />
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Confirmar contraseña
        </label>
        <input
          type="password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          disabled={loading}  // ✅ DESHABILITAR DURANTE CARGA
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={loading}  // ✅ DESHABILITAR DURANTE CARGA
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Procesando...
          </div>
        ) : (
          "Restablecer contraseña"
        )}
      </button>
    </form>
  );
}
```

**Cambios Clave:**
- ✅ Verificación de token al cargar (no simulado)
- ✅ Spinner mientras se verifica
- ✅ API real (authAPI.resetPassword)
- ✅ Manejo de tokens inválidos/expirados
- ✅ Campos deshabilitados durante carga
- ✅ Mensajes mejorados
- ✅ Redirecciones lógicas

---

## 📊 Resumen de Cambios

| Archivo | Líneas | Tipo | Estado |
|---------|--------|------|--------|
| schema.prisma | +30 | Nuevo modelo | ✅ |
| password.service.ts | ~180 | Reescrita | ✅ |
| email.service.ts | ~40 | Mejorada | ✅ |
| auth.controller.ts | ~20 | Verificado | ✅ |
| RecuperarModal.tsx | ~10 | Mejorada | ✅ |
| restablecer/[token] | ~100 | Completada | ✅ |
| api.ts | 0 | Verificado | ✅ |

**Total: ~380 líneas nuevas/modificadas**

---

## 🎯 Impacto

### Seguridad ⬆️
```
Antes: ❌ Tokens sin expiración, guardados en campo temporal
Después: ✅ Tokens seguros (64 hex), expiración 1 hora, tabla separada
```

### Funcionalidad ⬆️
```
Antes: ❌ Email no enviado, página de reset simulada
Después: ✅ Email real, página funcional, validaciones completas
```

### UX ⬆️
```
Antes: ❌ Spinner en modal @uta, sin feedback claro
Después: ✅ Alerta inmediata @uta, validaciones en cliente
```

### Performance ⬇️ (mejorado)
```
Antes: ❌ Búsqueda en campo sin índice
Después: ✅ Búsqueda con índices, tabla optimizada
```

🎉 **¡Flujo completamente actualizado!**
