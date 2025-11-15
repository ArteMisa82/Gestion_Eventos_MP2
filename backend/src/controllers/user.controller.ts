//Se actualizo la ruta y las carpetas del user para controles
// Se actualizó la ruta y estructura del controlador User
import { Request, Response } from 'express';
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

  async create(req: Request, res: Response) {
    const user = await userService.create(req.body);
    return res.status(201).json(user);
  }

  async update(req: Request, res: Response) {
    const ced = req.params.ced;
    const user = await userService.update(ced, req.body);
    return res.json(user);
  }

  async delete(req: Request, res: Response) {
    const ced = req.params.ced;
    await userService.delete(ced);
    return res.status(204).send();
  }
}

//Controlador REST que conecta la API con la capa de servicio