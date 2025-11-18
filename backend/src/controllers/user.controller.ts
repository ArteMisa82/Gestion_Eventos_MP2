// src/controllers/user.controller.ts

import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const user = await userService.getById(id);

      if (!user) {
        return res.status(404).json({ msg: "Usuario no encontrado" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ msg: "Error interno", error });
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
}
