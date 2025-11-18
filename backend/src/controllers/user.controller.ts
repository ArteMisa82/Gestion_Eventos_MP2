// src/controllers/user.controller.ts
// src/controllers/user.controller.ts

import { Request, Response } from "express";
import fs from "fs";
import { UserService } from "../services/user.service";

const userService = new UserService();

export class UserController {
  async getById(req: Request, res: Response) {
    const id = Number(req.params.id);
    const user = await userService.getById(id);
    if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });
    res.json(user);
  }

  async getByCedula(req: Request, res: Response) {
    const ced = req.params.ced;
    const user = await userService.getByCedula(ced);
    res.json(user);
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

  async update(req: Request, res: Response) {
    const cedula = req.params.ced;
    const updated = await userService.update(cedula, req.body);
    res.json(updated);
  }

  //-----------------------------
  // SUBIR IMAGEN
  //-----------------------------
  async uploadImage(req: Request, res: Response) {
    if (!req.file)
      return res.status(400).json({ msg: "No llegó ninguna imagen" });

    const base64 = fs.readFileSync(req.file.path).toString("base64");
    fs.unlinkSync(req.file.path);

    const updated = await userService.updateById(Number(req.params.id), {
      img_usu: base64,
    });

    res.json({
      msg: "Imagen actualizada correctamente",
      img_usu: updated?.img_usu,
    });
  }

  //-----------------------------
  // SUBIR PDF
  //-----------------------------
  async uploadPDF(req: Request, res: Response) {
    if (!req.file)
      return res.status(400).json({ msg: "No llegó ningún PDF" });

    const base64 = fs.readFileSync(req.file.path).toString("base64");
    fs.unlinkSync(req.file.path);

    const updated = await userService.updateById(Number(req.params.id), {
      pdf_ced_usu: base64,
    });

    res.json({
      msg: "PDF actualizado correctamente",
      pdf_ced_usu: updated?.pdf_ced_usu,
    });
  }

  async delete(req: Request, res: Response) {
    const cedula = req.params.ced;
    const deleted = await userService.delete(cedula);
    res.json(deleted);
  }
}
