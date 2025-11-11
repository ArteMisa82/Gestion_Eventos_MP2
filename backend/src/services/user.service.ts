//Se actualizo la ruta y las carpetas del user
import prisma from '@/config/database';

export class UserService {
  async getAll() {
    return await prisma.usuarios.findMany({
      select: {
        id_usu: true,
        nom_usu: true,
        ape_usu: true,
        cor_usu: true,
        img_perfil: true, // 🔥 texto base64
      },
    });
  }

  async getById(id: number) {
    return await prisma.usuarios.findUnique({
      where: { id_usu: id },
      include: { cursos: true },
    });
  }

  async create(data: any) {
    return await prisma.usuarios.create({
      data: {
        nom_usu: data.nom_usu,
        ape_usu: data.ape_usu,
        cor_usu: data.cor_usu,
        img_perfil: data.img_perfil || null, // 🔥 base64 o null
      },
    });
  }

  async update(id: number, data: any) {
    return await prisma.usuarios.update({
      where: { id_usu: id },
      data: {
        nom_usu: data.nom_usu,
        ape_usu: data.ape_usu,
        cor_usu: data.cor_usu,
        img_perfil: data.img_perfil ?? undefined,
      },
    });
  }

  async delete(id: number) {
    return await prisma.usuarios.delete({
      where: { id_usu: id },
    });
  }

  async getCursosEnProceso(userId: number) {
    return await prisma.cursos.findMany({
      where: {
        usuarioId: userId,
        estado: 'en_proceso',
      },
    });
  }

  async getCursosCompletos(userId: number) {
    return await prisma.cursos.findMany({
      where: {
        usuarioId: userId,
        estado: 'completado',
      },
    });
  }
}

//Capa de aplicación (use cases + lógica del negocio)