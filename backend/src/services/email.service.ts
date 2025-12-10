import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV !== 'production';
    
    // Solo crear transporter si hay configuración de email
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    } else {
      console.warn('⚠️ Email no configurado - usando modo desarrollo');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Si no hay transporter (modo desarrollo), solo logueamos
      if (!this.transporter) {
        console.log('📧 [MODO DESARROLLO] Email que se enviaría:');
        console.log(`   To: ${options.to}`);
        console.log(`   Subject: ${options.subject}`);
        console.log(`   HTML: ${options.html.substring(0, 200)}...`);
        return true;
      }

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      console.log(`✅ Email enviado a: ${options.to}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      // En desarrollo, no fallar si no se puede enviar email
      return this.isDevelopment;
    }
  }

  // Plantilla para recuperación de contraseña
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetLink = `${process.env.FRONTEND_URL}/restablecer/${resetToken}`;
    
    // 🔥 En modo desarrollo, mostrar el token en consola
    if (this.isDevelopment || !this.transporter) {
      console.log('\n🔑 ========================================');
      console.log('📧 RECUPERACIÓN DE CONTRASEÑA (MODO DEV)');
      console.log('========================================');
      console.log(`👤 Email: ${email}`);
      console.log(`🔐 Token: ${resetToken}`);
      console.log(`🔗 Link: ${resetLink}`);
      console.log('========================================\n');
    }
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #581517; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h2 style="margin: 0; font-size: 24px;">🔐 Recuperación de Contraseña</h2>
        </div>
        <div style="padding: 30px; background-color: #f9fafb;">
          <p style="color: #374151; font-size: 16px;">Hemos recibido una solicitud para restablecer tu contraseña en <strong>Gestión Eventos UTA</strong>.</p>
          
          <p style="color: #374151; font-size: 16px; margin-top: 20px;">Haz clic en el siguiente botón para crear una nueva contraseña:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background-color: #581517; color: white; padding: 14px 32px; 
                      text-decoration: none; border-radius: 8px; display: inline-block;
                      font-weight: bold; font-size: 16px; transition: background-color 0.3s;">
              Restablecer Contraseña
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px;">
            <strong>⏰ Importante:</strong> Este enlace expirará en <strong>1 hora</strong>. Si esperas más, deberás solicitar uno nuevo.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Si no solicitaste este cambio, ignora este email. Tu contraseña seguirá siendo la misma.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:
          </p>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; word-break: break-all;">
            ${resetLink}
          </p>
        </div>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            © 2024 Gestión Eventos UTA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Recuperación de Contraseña - Gestión Eventos UTA',
      html,
    });
  }

  // Plantilla para verificación de email
  async sendVerificationEmail(email: string, verificationCode: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Verificación de Email</h2>
        <p>Gracias por registrarte en Gestión Eventos UTA.</p>
        <p>Tu código de verificación es:</p>
        <div style="background-color: #f3f4f6; padding: 16px; text-align: center; 
                    font-size: 24px; font-weight: bold; letter-spacing: 4px; 
                    border-radius: 8px; margin: 20px 0;">
          ${verificationCode}
        </div>
        <p>Ingresa este código en la aplicación para completar tu registro.</p>
        <p>Este código expirará en 24 horas.</p>
      </div>
    `;

    return await this.sendEmail({
      to: email,
      subject: 'Verificación de Email - Gestión Eventos UTA',
      html,
    });
  }
}