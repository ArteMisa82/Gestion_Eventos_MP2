//Se actualizo la ruta y las carpetas del user para controles
// Se actualizó la ruta y estructura del controlador User
import { Request, Response } from 'express';
import { UserService } from '../services/user.service'; // 👈 corregido: ruta relativa segura

const userService = new UserService();

export class UserController {
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const users = await userService.getAll();
      return res.json(users);
    } catch (error) {
      console.error('❌ Error al obtener usuarios:', error);
      return res.status(500).json({ message: 'Error al obtener usuarios' });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      const user = await userService.getById(id);

      if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

      return res.json(user);
    } catch (error) {
      console.error('❌ Error al obtener usuario:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const user = await userService.create(req.body);
      return res.status(201).json(user);
    } catch (error) {
      console.error('❌ Error al crear usuario:', error);
      return res.status(400).json({ message: 'Error al crear usuario' });
    }
  }

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      const updated = await userService.update(id, req.body);
      return res.json(updated);
    } catch (error) {
      console.error('❌ Error al actualizar usuario:', error);
      return res.status(400).json({ message: 'Error al actualizar usuario' });
    }
  }

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const id = Number(req.params.id);
      await userService.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('❌ Error al eliminar usuario:', error);
      return res.status(400).json({ message: 'Error al eliminar usuario' });
    }
  }

  async getPanelCursos(req: Request, res: Response): Promise<Response> {
    try {
      const userId = Number(req.params.id);
      const enProceso = await userService.getCursosEnProceso(userId);
      const completados = await userService.getCursosCompletos(userId);
      return res.json({ enProceso, completados });
    } catch (error) {
      console.error('❌ Error al obtener panel de cursos:', error);
      return res.status(500).json({ message: 'Error al cargar panel de cursos' });
    }
  }
}

//Controlador REST que conecta la API con la capa de servicio