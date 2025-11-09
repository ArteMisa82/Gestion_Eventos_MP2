import { PrismaClient } from '../generated/prisma';
import { comparePassword, hashPassword } from '../utils/bcrypt.util';

const prisma = new PrismaClient();

export interface AuthResult {
  success: boolean;
  user?: {
    id_usu: number;
    cor_usu: string;
    nom_usu: string;
    ape_usu: string;
    adm_usu: number | null;
    stu_usu: number | null;
    "Administrador": boolean;
    niv_usu?: string | null;
  };
  error?: string;
}

export class AuthService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async identifyUser(email: string, password: string): Promise<AuthResult> {
    try {
      const user = await this.prisma.usuarios.findUnique({
        where: { cor_usu: email }
      });

      if (!user) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      const isPasswordValid = await comparePassword(password, user.pas_usu);
      if (!isPasswordValid) {
        return { success: false, error: 'Credenciales inválidas' };
      }

      return {
        success: true,
        user: {
          id_usu: user.id_usu,
          cor_usu: user.cor_usu,
          nom_usu: user.nom_usu,
          ape_usu: user.ape_usu,
          adm_usu: user.adm_usu,
          stu_usu: user.stu_usu,
          "Administrador": user.Administrador,
          niv_usu: user.niv_usu
        }
      };
    } catch (error) {
      console.error('Error en identificación:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  async login(loginData: { email: string; password: string }): Promise<AuthResult> {
    return await this.identifyUser(loginData.email, loginData.password);
  }

  async register(userData: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
  }): Promise<AuthResult> {
    try {
      const existingUser = await this.prisma.usuarios.findUnique({
        where: { cor_usu: userData.email }
      });

      if (existingUser) {
        return { success: false, error: 'El usuario ya existe' };
      }

      const hashedPassword = await hashPassword(userData.password);

      const newUser = await this.prisma.usuarios.create({
        data: {
          cor_usu: userData.email,
          pas_usu: hashedPassword,
          nom_usu: userData.nombre,
          ape_usu: userData.apellido,
          stu_usu: 0,
          adm_usu: 0,
          Administrador: false
        }
      });

      return {
        success: true,
        user: {
          id_usu: newUser.id_usu,
          cor_usu: newUser.cor_usu,
          nom_usu: newUser.nom_usu,
          ape_usu: newUser.ape_usu,
          adm_usu: newUser.adm_usu,
          stu_usu: newUser.stu_usu,
          "Administrador": newUser.Administrador,
          niv_usu: newUser.niv_usu
        }
      };
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: 'Error al registrar usuario' };
    }
  }

  async getProfile(userId: number): Promise<AuthResult> {
    try {
      const user = await this.prisma.usuarios.findUnique({
        where: { id_usu: userId },
        select: {
          id_usu: true,
          cor_usu: true,
          nom_usu: true,
          ape_usu: true,
          adm_usu: true,
          stu_usu: true,
          Administrador: true,
          niv_usu: true
        }
      });

      if (!user) {
        return { success: false, error: 'Usuario no encontrado' };
      }

      return {
        success: true,
        user: {
          id_usu: user.id_usu,
          cor_usu: user.cor_usu,
          nom_usu: user.nom_usu,
          ape_usu: user.ape_usu,
          adm_usu: user.adm_usu,
          stu_usu: user.stu_usu,
          "Administrador": user.Administrador,
          niv_usu: user.niv_usu
        }
      };
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return { success: false, error: 'Error al obtener perfil' };
    }
  }

  private determineUserRole(user: any): string {
    if (user.Administrador) return 'Administrador';
    if (user.adm_usu === 1) return 'admin';
    if (user.stu_usu === 1) return 'student';
    return 'user';
  }
}