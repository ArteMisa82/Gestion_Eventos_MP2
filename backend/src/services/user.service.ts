// src/services/user.service.ts

// src/services/user.service.ts

import prisma from "../config/database";
import { IUser } from "../types/user";

export class UserService {
  getAll() {
    return prisma.usuarios.findMany();
  }

  getByCedula(cedula: string) {
    return prisma.usuarios.findFirst({ where: { ced_usu: cedula } });
  }

  getById(id: number) {
    return prisma.usuarios.findUnique({ where: { id_usu: id } });
  }

  create(data: IUser) {
    return prisma.usuarios.create({ data });
  }

  // Actualizar por cédula
  update(cedula: string, data: Partial<IUser>) {
    return prisma.usuarios.updateMany({
      where: { ced_usu: cedula },
      data,
    });
  }

  // Actualizar por ID (para imagen/PDF)
  updateById(id: number, data: Partial<IUser>) {
    return prisma.usuarios.update({
      where: { id_usu: id },
      data,
    });
  }

  delete(cedula: string) {
    return prisma.usuarios.deleteMany({ where: { ced_usu: cedula } });
  }
}
