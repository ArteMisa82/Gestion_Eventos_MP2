//Se actualizo la ruta y las carpetas del user
import prisma from '../config/database';

export class UserService {
  // Obtener todos
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

  // Buscar por cédula (findFirst porque NO es UNIQUE)
  async getByCedula(cedula: string) {
    return prisma.usuarios.findFirst({
      where: { ced_usu: cedula }
    });
  }

  // Crear usuario
  async create(data: any) {
    return prisma.usuarios.create({
      data: {
        cor_usu: data.cor_usu,
        pas_usu: data.pas_usu,
        ced_usu: data.ced_usu,
        nom_usu: data.nom_usu,
        nom_seg_usu: data.nom_seg_usu || null,
        ape_usu: data.ape_usu,
        ape_seg_usu: data.ape_seg_usu || null,
        tel_usu: data.tel_usu || null,
        img_usu: data.img_usu || null, // base64
        pdf_ced_usu: data.pdf_ced_usu || null,
        stu_usu: data.stu_usu ?? 1,
        niv_usu: data.niv_usu || null,
        adm_usu: data.adm_usu ?? 0,
        Administrador: data.Administrador ?? false
      }
    });
  }

  // Actualizar por cédula
  async update(cedula: string, data: any) {
    return prisma.usuarios.updateMany({
      where: { ced_usu: cedula },
      data: {
        cor_usu: data.cor_usu,
        pas_usu: data.pas_usu,
        nom_usu: data.nom_usu,
        nom_seg_usu: data.nom_seg_usu,
        ape_usu: data.ape_usu,
        ape_seg_usu: data.ape_seg_usu,
        tel_usu: data.tel_usu,
        img_usu: data.img_usu,
        pdf_ced_usu: data.pdf_ced_usu,
        stu_usu: data.stu_usu,
        niv_usu: data.niv_usu,
        adm_usu: data.adm_usu,
        Administrador: data.Administrador
      }
    });
  }

  // Eliminar por cédula
  async delete(cedula: string) {
    return prisma.usuarios.deleteMany({
      where: { ced_usu: cedula }
    });
  }
}


//Capa de aplicación (use cases + lógica del negocio)