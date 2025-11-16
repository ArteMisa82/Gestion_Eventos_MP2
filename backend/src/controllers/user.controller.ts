// src/controllers/user.controller.ts
// Se actualizó la ruta y estructura del controlador User

import { Request, Response } from 'express';
import fs from 'fs';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
  async getAll(req: Request, res: Response) {
    const data = await userService.getAll();
    return res.json(data);
  }

  async getByCedula(req: Request, res: Response) {
    const ced = req.params.ced;
    const user = await userService.getByCedula(ced);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
    return res.json(user);
  }

  // 🔥 NUEVO: obtener usuario por ID
  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);

    const user = await userService.getById(id);
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

    return res.json(user);
  }

  async create(req: Request, res: Response) {
    console.log("➡ BODY RECIBIDO:", req.body);

    let imgBase64: string | null = null;
    if (req.file) {
      const fileData = fs.readFileSync(req.file.path, { encoding: 'base64' });
      imgBase64 = `data:${req.file.mimetype};base64,${fileData}`;
      fs.unlinkSync(req.file.path);
    }

    const userData = { ...req.body, img_usu: imgBase64 };
    const user = await userService.create(userData);
    return res.status(201).json(user);
  }

  async update(req: Request, res: Response) {
    const ced = req.params.ced;

    let imgBase64: string | null = null;
    if (req.file) {
      const fileData = fs.readFileSync(req.file.path, { encoding: 'base64' });
      imgBase64 = `data:${req.file.mimetype};base64,${fileData}`;
      fs.unlinkSync(req.file.path);
    }

    const userData = { ...req.body };
    if (imgBase64) userData.img_usu = imgBase64;

    const user = await userService.update(ced, userData);
    return res.json(user);
  }

  async delete(req: Request, res: Response) {
    const ced = req.params.ced;
    await userService.delete(ced);
    return res.status(204).send();
  }
}
