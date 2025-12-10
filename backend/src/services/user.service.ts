// src/services/user.service.ts

import prisma from "../config/database";
import { IUser } from "../types/user";

export class UserService {

  async getAll(): Promise<IUser[]> {
    return prisma.usuarios.findMany();
  }

  async getByCedula(cedula: string): Promise<IUser | null> {
    return prisma.usuarios.findFirst({ where: { ced_usu: cedula } });
  }

  async getById(id: number): Promise<IUser | null> {
  const user = await prisma.usuarios.findUnique({ 
    where: { id_usu: id },
    include: {
      // ✅ CERTIFICADOS DEL USUARIO
      certificados: true,

      // ✅ Relación con estudiante
      estudiantes: {
        include: {
          nivel: {
            include: {
              carreras: true
            }
          }
        },
        where: { est_activo: 1 },
        take: 1
      },

      // ✅ Eventos asignados
      eventos: {
        select: {
          id_evt: true,
          nom_evt: true,
          est_evt: true
        }
      },

      // ✅ Instructor en detalles
      detalle_instructores: {
        select: {
          id_det: true,
          rol_instructor: true,
          usuarios: {
            select: {
              id_usu: true,
              nom_usu: true,
              ape_usu: true,
              cor_usu: true
            }
          }
        }
      }
    }
  });
  
  return user as any;
}

  async create(data: IUser): Promise<IUser> {
    return prisma.usuarios.create({ data });
  }

  async updateById(id: number, data: Partial<IUser>) {
    return prisma.usuarios.update({
      where: { id_usu: id },
      data,
    });
  }

  async update(cedula: string, data: Partial<IUser>) {
    return prisma.usuarios.updateMany({
      where: { ced_usu: cedula },
      data,
    });
  }

  async delete(cedula: string) {
    return prisma.usuarios.deleteMany({ where: { ced_usu: cedula } });
  }

  // -----------------------------------------
  // 📄 NUEVO: ACTUALIZAR PDF BASE64
  // -----------------------------------------
  async updatePDF(id: number, pdf: string) {
    return prisma.usuarios.update({
      where: { id_usu: id },
      data: {
        pdf_ced_usu: pdf
      }
    });
  }
}
