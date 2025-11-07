//Se actualizo la ruta y las carpetas del user para controles
import { Request, Response } from 'express';
import { UserService } from '@/services/user.service';

const userService = new UserService();

export class UserController {
  async getAll(req: Request, res: Response) {
    const users = await userService.getAll();
    return res.json(users);
  }

  async getById(req: Request, res: Response) {
    const user = await userService.getById(Number(req.params.id));
    return res.json(user);
  }

  async create(req: Request, res: Response) {
    const user = await userService.create(req.body);
    return res.status(201).json(user);
  }

  async update(req: Request, res: Response) {
    const updated = await userService.update(Number(req.params.id), req.body);
    return res.json(updated);
  }

  async delete(req: Request, res: Response) {
    await userService.delete(Number(req.params.id));
    return res.status(204).send();
  }

  async getPanelCursos(req: Request, res: Response) {
    const userId = Number(req.params.id);
    const enProceso = await userService.getCursosEnProceso(userId);
    const completados = await userService.getCursosCompletos(userId);
    return res.json({ enProceso, completados });
  }
}
//Controlador REST que conecta la API con la capa de servicio