//Se actualizo la ruta y las carpetas del user
import prisma from '@/config/database';

export class UserService {
  async getAll() {
    return prisma.personas.findMany({
      select: {
        ced_per: true,
        nom_per: true,
        ape_per: true,
        tel_per: true,
        img_perfil: true, // base64
      },
    });
  }

  async getByCedula(cedula: string) {
    return prisma.personas.findUnique({
      where: { ced_per: cedula },
      include: { credenciales: true },
    });
  }

  async create(data: any) {
    return prisma.personas.create({
      data: {
        ced_per: data.ced_per,
        nom_per: data.nom_per,
        ape_per: data.ape_per,
        tel_per: data.tel_per,
        img_perfil: data.img_perfil || null,
      },
    });
  }

  async update(cedula: string, data: any) {
    return prisma.personas.update({
      where: { ced_per: cedula },
      data: {
        nom_per: data.nom_per,
        ape_per: data.ape_per,
        tel_per: data.tel_per,
        img_perfil: data.img_perfil ?? undefined,
      },
    });
  }

  async delete(cedula: string) {
    return prisma.personas.delete({
      where: { ced_per: cedula },
    });
  }
}

//Capa de aplicación (use cases + lógica del negocio)