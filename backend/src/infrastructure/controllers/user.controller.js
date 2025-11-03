//se creo la arquitectura para poder controlar de los user
import { UserUseCase } from "../../application/user.usecase.js";

const memoryDB = []; // simulación temporal
const userRepo = {
  findAll: async () => memoryDB,
  findById: async (id) => memoryDB.find(u => u.id === id) || null,
  create: async (data) => {
    const newUser = { id: String(memoryDB.length + 1), ...data };
    memoryDB.push(newUser);
    return newUser;
  },
  update: async (id, data) => {
    const index = memoryDB.findIndex(u => u.id === id);
    if (index === -1) return null;
    memoryDB[index] = { ...memoryDB[index], ...data };
    return memoryDB[index];
  },
  delete: async (id) => {
    const index = memoryDB.findIndex(u => u.id === id);
    if (index === -1) return false;
    memoryDB.splice(index, 1);
    return true;
  }
};

const useCase = new UserUseCase(userRepo);

export class UserController {
  static async getAll(req, res) {
    const users = await useCase.getAll();
    res.json(users);
  }

  static async getById(req, res) {
    const user = await useCase.getById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  }

  static async create(req, res) {
    const newUser = await useCase.create(req.body);
    res.status(201).json(newUser);
  }

  static async update(req, res) {
    const updated = await useCase.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: "User not found" });
    res.json(updated);
  }

  static async delete(req, res) {
    const deleted = await useCase.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  }
}
//Aquí no hay base de datos todavía, solo simulación temporal (array en memoria).