import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
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
      return false;
    }
  }

  // Plantilla para recuperación de contraseña
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Recuperación de Contraseña</h2>
        <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <a href="${resetLink}" 
           style="background-color: #2563eb; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 4px; display: inline-block;">
          Restablecer Contraseña
        </a>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, ignora este email.</p>
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