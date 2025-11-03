//se creo la arquitectura de rutas para el uso de user
import { Router } from "express";
import { UserController } from "../../infrastructure/controllers/user.controller.js";

const router = Router();

router.get("/", UserController.getAll);
router.get("/:id", UserController.getById);
router.post("/", UserController.create);
router.put("/:id", UserController.update);
router.delete("/:id", UserController.delete);

export default router;
//Se creo el codigo de rutas para user