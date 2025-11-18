// Se actualizo la ruta y las carpetas del user para controlesuser.routes.ts
// src/routes/user.routes.ts

import { Router } from "express";
import multer from "multer";
import { UserController } from "../controllers/user.controller";

const router = Router();
const controller = new UserController();

const upload = multer({ dest: "uploads/" });

// Buscar usuario por ID
router.get("/id/:id", controller.getById.bind(controller));

// Buscar por cédula
router.get("/ced/:ced", controller.getByCedula.bind(controller));

// Obtener todos
router.get("/", controller.getAll.bind(controller));

// Subir foto
router.put(
  "/upload-image/:id",
  upload.single("file"),
  controller.uploadImage.bind(controller)
);

// Subir PDF
router.put(
  "/upload-pdf/:id",
  upload.single("file"),
  controller.uploadPDF.bind(controller)
);

// Crear usuario
router.post("/", upload.single("file"), controller.create.bind(controller));

// Actualizar usuario
router.put("/ced/:ced", upload.single("file"), controller.update.bind(controller));

// Eliminar usuario
router.delete("/ced/:ced", controller.delete.bind(controller));

export default router;
