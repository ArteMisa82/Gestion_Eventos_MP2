// backend/src/controllers/dashboard.controller.ts
import { Request, Response } from "express";
import { getDashboardMetrics } from "../services/dashboard.service";

export const getDashboardSummary = async (_req: Request, res: Response) => {
  try {
    const summary = await getDashboardMetrics();

    return res.json({
      message: "Resumen de dashboard obtenido correctamente",
      data: summary,
    });
  } catch (error: any) {
    console.error("Error obteniendo dashboard:", error);
    return res
      .status(500)
      .json({ message: "Error al obtener los datos del dashboard" });
  }
};
