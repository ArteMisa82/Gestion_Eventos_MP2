// backend/src/controllers/favoriteEvents.controller.ts
import { Request, Response } from "express";
import {
  setFavoritoEvento,
  getEventosFavoritos,
} from "../services/favoriteEvents.service";

export const toggleFavorito = async (req: Request, res: Response) => {
  try {
    const { id_evt } = req.params;
    const { favorito } = req.body as { favorito: boolean };

    if (typeof favorito !== "boolean") {
      return res.status(400).json({ message: "El campo 'favorito' debe ser booleano." });
    }

    const evento = await setFavoritoEvento(id_evt, favorito);

    return res.json({
      message: favorito
        ? "Evento marcado como favorito."
        : "Evento removido de favoritos.",
      data: evento,
    });
  } catch (error: any) {
    return res.status(400).json({ message: error.message || "Error al actualizar favorito." });
  }
};

export const listarFavoritos = async (_req: Request, res: Response) => {
  try {
    const favoritos = await getEventosFavoritos();

    return res.json({
      data: favoritos,
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Error al obtener los eventos favoritos." });
  }
};
