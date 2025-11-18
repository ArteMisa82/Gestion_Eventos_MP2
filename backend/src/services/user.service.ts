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
    return prisma.usuarios.findUnique({ where: { id_usu: id } });
  }

  async create(data: IUser): Promise<IUser> {
    return prisma.usuarios.create({ data });
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
