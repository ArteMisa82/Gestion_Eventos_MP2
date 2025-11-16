import { randomBytes } from 'crypto';

export class TokenUtil {
  // Generar token único
  static generateToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  // Generar código numérico
  static generateNumericCode(length: number = 6): string {
    let code = '';
    for (let i = 0; i < length; i++) {
      code += Math.floor(Math.random() * 10);
    }
    return code;
  }

  // Calcular fecha de expiración (1 hora por defecto)
  static getExpirationDate(hours: number = 1): Date {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    return date;
  }

  // Verificar si token expiró
  static isTokenExpired(expirationDate: Date): boolean {
    return new Date() > expirationDate;
  }
}