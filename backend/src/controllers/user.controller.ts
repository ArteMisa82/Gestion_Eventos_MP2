// src/controllers/user.controller.ts

// src/controllers/user.controller.ts

import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import prisma from '../config/database';
import fs from 'fs';

const userService = new UserService();

const clasificarCorreo = (email: string) => {
  const emailLower = email.trim().toLowerCase();

  if (!emailLower.includes('@')) {
    return { esEstudiante: false, esAdministrativo: false, esAdmin: false, error: 'Correo inválido' };
  }

  const [localPart, domain] = emailLower.split('@');

  if (emailLower === 'admin@admin.com') {
    return { esEstudiante: false, esAdministrativo: false, esAdmin: true };
  }

  if (domain.endsWith('.com')) {
    return { esEstudiante: false, esAdministrativo: false, esAdmin: false };
  }

  if (domain === 'uta.edu.ec') {
    const adminPattern = /^[a-z]+$/i;
    const studentPattern = /^[a-z]+\d{4}$/i;

    if (adminPattern.test(localPart)) {
      return { esEstudiante: false, esAdministrativo: true, esAdmin: false };
    }

    if (studentPattern.test(localPart)) {
      return { esEstudiante: true, esAdministrativo: false, esAdmin: false };
    }

    return {
      esEstudiante: false,
      esAdministrativo: false,
      esAdmin: false,
      error: 'Correo institucional inválido. Estudiante: letras + 4 dígitos (ej: juan1234@uta.edu.ec). Administrativo: solo letras (ej: pedrolopez@uta.edu.ec).'
    };
  }

  return { esEstudiante: false, esAdministrativo: false, esAdmin: false };
};

export class UserController {

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const user = await userService.getById(id);

      if (!user) {
        return res.status(404).json({ 
          success: false,
          msg: "Usuario no encontrado" 
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ 
        success: false,
        msg: "Error interno", 
        error 
      });
    }
  }

  async getByCedula(req: Request, res: Response) {
    try {
      const ced = req.params.ced;
      const user = await userService.getByCedula(ced);
      res.json(user);
    } catch (error) {
      res.status(500).json({ msg: "Error interno" });
    }
  }

  async getAll(req: Request, res: Response) {
    const users = await userService.getAll();
    res.json(users);
  }

  async create(req: Request, res: Response) {
    const data = req.body;
    const created = await userService.create(data);
    res.json(created);
  }

  async updateById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { niv_usu, ...userData } = req.body;
      const existingUser = await prisma.usuarios.findUnique({ where: { id_usu: id } });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }
      
      console.log('Actualizando usuario ID:', id);
      console.log('Datos recibidos:', req.body);

      const emailParaEvaluar = (userData.cor_usu || existingUser.cor_usu || '').trim();
      const roles = clasificarCorreo(emailParaEvaluar);

      if (roles.error) {
        return res.status(400).json({ success: false, message: roles.error });
      }

      if (niv_usu && !roles.esEstudiante) {
        return res.status(400).json({
          success: false,
          message: 'Solo correos de estudiante válidos pueden seleccionar nivel académico.'
        });
      }

      // Actualizar datos básicos del usuario con roles recalculados
      const updated = await userService.updateById(id, {
        ...userData,
        stu_usu: roles.esEstudiante ? 1 : 0,
        adm_usu: roles.esAdministrativo ? 1 : 0,
        Administrador: roles.esAdmin
      });

      // Si se proporciona niv_usu y es estudiante, actualizar en la tabla estudiantes
      if (niv_usu && roles.esEstudiante) {
        console.log('Actualizando nivel del estudiante a:', niv_usu);
        
        // Buscar estudiante activo del usuario
        const estudiante = await prisma.estudiantes.findFirst({
          where: {
            id_usu: id,
            est_activo: 1
          }
        });
        
        if (estudiante) {
          // Actualizar nivel del estudiante existente
          await prisma.estudiantes.update({
            where: { id_est: estudiante.id_est },
            data: { id_niv: niv_usu }
          });
        } else {
          // Crear nuevo registro de estudiante
          await prisma.estudiantes.create({
            data: {
              id_usu: id,
              id_niv: niv_usu,
              fec_ingreso: new Date(),
              est_activo: 1,
              observaciones: 'Creado desde actualización de perfil'
            }
          });
        }
      }

      res.json({
        success: true,
        message: 'Usuario actualizado correctamente',
        data: updated
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al actualizar usuario',
        error 
      });
    }
  }

  async update(req: Request, res: Response) {
    const cedula = req.params.ced;
    const data = req.body;
    const updated = await userService.update(cedula, data);
    res.json(updated);
  }

  async delete(req: Request, res: Response) {
    const cedula = req.params.ced;
    const deleted = await userService.delete(cedula);
    res.json(deleted);
  }

  // -------------------------------------------
  // 📄 NUEVO: SUBIR PDF
  // -------------------------------------------
  async uploadPDF(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ msg: "No llegó ningún PDF" });
      }

      const id = Number(req.params.id);

      // Leer archivo temporal y volverlo base64
      const pdfBase64 = fs.readFileSync(req.file.path, {
        encoding: "base64",
      });

      const updated = await userService.updatePDF(id, pdfBase64);

      res.json({
        msg: "PDF actualizado correctamente",
        pdf_ced_usu: updated?.pdf_ced_usu,
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Error al subir PDF" });
    }
  }
}