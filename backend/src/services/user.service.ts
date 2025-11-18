import prisma from '../config/database';
import { IUser } from '../types/user';

export class UserService {
  async getAll() {
    return prisma.usuarios.findMany({
      select: {
        id_usu: true,
        cor_usu: true,
        nom_usu: true,
        ape_usu: true,
        tel_usu: true,
        img_usu: true
      }
    });
  }

  async getByCedula(cedula: string) {
    return prisma.usuarios.findFirst({ where: { ced_usu: cedula } });
  }

  async getById(id: number) {
    return prisma.usuarios.findUnique({ where: { id_usu: id } });
  }

  async create(data: IUser) {
    return prisma.usuarios.create({ data });
  }

  async update(cedula: string, data: Partial<IUser>) {
    return prisma.usuarios.updateMany({
      where: { ced_usu: cedula },
      data
    });
  }

  async delete(cedula: string) {
    return prisma.usuarios.deleteMany({ where: { ced_usu: cedula } });
  }
}
