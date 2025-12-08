// src/controllers/user.controller.ts

// src/controllers/user.controller.ts

import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import prisma from '../config/database';
import fs from 'fs';

const userService = new UserService();

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
      const { niv_usu, id_car, ...userData } = req.body;

      console.log('Actualizando usuario ID:', id);
      console.log('Datos recibidos:', req.body);

      // Actualizar datos básicos del usuario
      const updated = await userService.updateById(id, userData);

      // Si se proporciona niv_usu, actualizar en la tabla estudiantes
      // ✅ Nivel / carrera como STRING (compatibilidad Prisma)
      let idNivelFinal: string | null = null;

      // Si llega carrera, buscar nivel por id_car (string)
      if (id_car) {
        const nivel = await prisma.nivel.findFirst({
          where: { id_car: String(id_car) }
        });

        if (nivel) {
          idNivelFinal = String(nivel.id_niv);
        }
      }
      // Si llega nivel directo
      else if (niv_usu) {
        idNivelFinal = String(niv_usu);
      }

      // Guardar en estudiantes
      if (idNivelFinal) {
        const estudiante = await prisma.estudiantes.findFirst({
          where: {
            id_usu: id,
            est_activo: 1
          }
        });

        if (estudiante) {
          await prisma.estudiantes.update({
            where: { id_est: estudiante.id_est },
            data: { id_niv: idNivelFinal }
          });
        } else {
          await prisma.estudiantes.create({
            data: {
              id_usu: id,
              id_niv: idNivelFinal,
              fec_ingreso: new Date(),
              est_activo: 1,
              observaciones: 'Asignado desde perfil'
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
