// backend/src/routes/favoriteEvents.routes.ts
import { Router } from "express";
import {
  toggleFavorito,
  listarFavoritos,
} from "../controllers/favoriteEvents.controller";
import {
  requireAuth,
  requireAdmin,
} from "../middlewares/session.middleware";

const router = Router();

// Solo un usuario autenticado **y** Administrador
// puede marcar / desmarcar favoritos
router.patch(
  "/:id_evt/favorito",
  requireAuth,
  requireAdmin,
  toggleFavorito
);

// La lista de favoritos SÍ puede ser pública
// (si quieren también se puede proteger)
router.get("/favoritos/list", listarFavoritos);

export default router;
