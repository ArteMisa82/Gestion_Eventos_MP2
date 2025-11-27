import { Router } from "express";
import {
  toggleFavorito,
  listarFavoritos,
} from "../controllers/favoriteEvents.controller";  // Importar los controladores

const router = Router();    

// Ruta para marcar/desmarcar evento como favorito
router.patch("/:id_evt/favorito", toggleFavorito);

// Ruta para obtener los eventos favoritos
router.get("/favoritos/list", listarFavoritos);

export default router;  // Exportar las rutas para ser usadas en `main.ts`
