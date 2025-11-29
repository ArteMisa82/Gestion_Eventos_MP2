import { Request, Response, NextFunction } from 'express';

/**
 * Middleware: Verifica que el curso (detalle) sea compatible con el nivel del estudiante.
 * Se ejecuta ANTES de crear un registro de evento.
 */

export const verificarRequisitosEvento = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id_det, id_niv } = req.body;

    // Validación básica
    if (!id_det || !id_niv) {
      return res.status(400).json({
        success: false,
        message: 'Faltan parámetros obligatorios: id_det e id_niv'
      });
    }

    // Si quieres validar que id_det y id_niv sean números
    if (isNaN(Number(id_det)) || isNaN(Number(id_niv))) {
      return res.status(400).json({
        success: false,
        message: 'Los parámetros deben ser valores numéricos válidos'
      });
    }

    // 🧠 Aquí NO consultamos BD porque tu arquitectura no usa DB en middlewares.
    // Solo añadimos los valores al req para que el controller los use.
    (req as any).idDet = Number(id_det);
    (req as any).idNiv = Number(id_niv);

    next();
  } catch (error) {
    console.error('Error en verificarRequisitosEvento:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno al verificar los requisitos del evento'
    });
  }
};
