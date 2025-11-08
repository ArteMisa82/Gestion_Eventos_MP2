import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/bcrypt.util';
import { generateToken } from '../utils/jwt.util';

interface RegisterDto {
  cor_usu: string;
  pas_usu: string;
  nom_usu: string;
  ape_usu: string;
  nom_seg_usu?: string;
  ape_seg_usu?: string;
  tel_usu?: string;
  ced_usu?: string;
  niv_usu?: string;
}

interface LoginDto {
  cor_usu: string;
  pas_usu: string;
}

export class AuthService {
  /**
   * Detecta el tipo de usuario basado en el correo institucional
   * IMPORTANTE: Solo existe UN administrador en el sistema (admin@admin.com)
   * NO se permite crear más administradores mediante registro
   * @param email - Correo del usuario
   * @returns { isStudent: boolean, isAdministrativo: boolean, isAdministrador: boolean }
   */
  private detectUserType(email: string): { isStudent: boolean; isAdministrativo: boolean; isAdministrador: boolean } {
    // BLOQUEAR registro de administradores
    // El único administrador es admin@admin.com que ya existe en la BD
    if (
      email === 'admin@uta.edu.ec' || 
      email === 'administrador@uta.edu.ec' ||
      email === 'admin@admin.com'
    ) {
      throw new Error('No se permite crear nuevos administradores. El administrador del sistema ya existe.');
    }

    // Verificar si termina en @uta.edu.ec
    if (!email.endsWith('@uta.edu.ec')) {
      // Correo externo
      return { isStudent: false, isAdministrativo: false, isAdministrador: false };
    }

    // Extraer la parte antes del @
    const localPart = email.split('@')[0];

    // Verificar si contiene exactamente 4 dígitos consecutivos
    const fourDigitsMatch = localPart.match(/\d{4}/);

    if (fourDigitsMatch) {
      // Tiene 4 números consecutivos -> Es estudiante
      return { isStudent: true, isAdministrativo: false, isAdministrador: false };
    }

    // Verificar si NO contiene ningún número
    const hasNoNumbers = !/\d/.test(localPart);

    if (hasNoNumbers) {
      // No tiene números -> Es usuario administrativo (profesor, secretaría)
      return { isStudent: false, isAdministrativo: true, isAdministrador: false };
    }

    // Tiene @uta.edu.ec pero no cumple ninguna de las condiciones anteriores
    return { isStudent: false, isAdministrativo: false, isAdministrador: false };
  }

  async register(data: RegisterDto) {
    // Verificar si el correo ya existe
    const existingUser = await prisma.usuarios.findUnique({
      where: { cor_usu: data.cor_usu }
    });

    if (existingUser) {
      throw new Error('El correo ya está registrado');
    }

    // Si se proporciona cédula, verificar que no exista
    if (data.ced_usu) {
      const existingCedula = await prisma.usuarios.findFirst({
        where: { ced_usu: data.ced_usu }
      });

      if (existingCedula) {
        throw new Error('La cédula ya está registrada');
      }
    }

    // Detectar tipo de usuario por correo
    const { isStudent, isAdministrativo, isAdministrador } = this.detectUserType(data.cor_usu);

    // Si se detecta como estudiante pero no se proporciona nivel, lanzar error
    if (isStudent && !data.niv_usu) {
      throw new Error('Los estudiantes deben especificar un nivel académico');
    }

    // Verificar que el nivel existe (si se proporciona)
    if (data.niv_usu) {
      const nivelExists = await prisma.nivel.findUnique({
        where: { id_niv: data.niv_usu }
      });

      if (!nivelExists) {
        throw new Error('El nivel especificado no existe');
      }
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword(data.pas_usu);

    // Crear usuario con tipo detectado automáticamente
    const newUser = await prisma.usuarios.create({
      data: {
        cor_usu: data.cor_usu,
        pas_usu: hashedPassword,
        nom_usu: data.nom_usu,
        ape_usu: data.ape_usu,
        nom_seg_usu: data.nom_seg_usu,
        ape_seg_usu: data.ape_seg_usu,
        tel_usu: data.tel_usu,
        ced_usu: data.ced_usu,
        niv_usu: data.niv_usu,
        stu_usu: isStudent ? 1 : 0,
        adm_usu: isAdministrativo ? 1 : 0,
        Administrador: isAdministrador
      },
      select: {
        id_usu: true,
        cor_usu: true,
        nom_usu: true,
        ape_usu: true,
        adm_usu: true,
        stu_usu: true,
        Administrador: true
      }
    });

    // Generar token
    const token = generateToken({
      id_usu: newUser.id_usu,
      cor_usu: newUser.cor_usu,
      adm_usu: newUser.adm_usu
    });

    return { token, usuario: newUser };
  }

  async login(data: LoginDto) {
    // Buscar usuario por correo
    const user = await prisma.usuarios.findUnique({
      where: { cor_usu: data.cor_usu },
      select: {
        id_usu: true,
        cor_usu: true,
        pas_usu: true,
        nom_usu: true,
        ape_usu: true,
        adm_usu: true,
        stu_usu: true,
        Administrador: true
      }
    });

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await comparePassword(data.pas_usu, user.pas_usu);

    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token
    const token = generateToken({
      id_usu: user.id_usu,
      cor_usu: user.cor_usu,
      adm_usu: user.adm_usu
    });

    // Excluir password de la respuesta
    const { pas_usu, ...userWithoutPassword } = user;

    return { token, usuario: userWithoutPassword };
  }

  async getProfile(userId: number) {
    const user = await prisma.usuarios.findUnique({
      where: { id_usu: userId },
      select: {
        id_usu: true,
        cor_usu: true,
        nom_usu: true,
        nom_seg_usu: true,
        ape_usu: true,
        ape_seg_usu: true,
        tel_usu: true,
        ced_usu: true,
        img_usu: true,
        stu_usu: true,
        adm_usu: true,
        Administrador: true,
        niv_usu: true,
        nivel: {
          select: {
            id_niv: true,
            nom_niv: true,
            org_cur_niv: true,
            carreras: {
              select: {
                id_car: true,
                nom_car: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    return user;
  }
}
