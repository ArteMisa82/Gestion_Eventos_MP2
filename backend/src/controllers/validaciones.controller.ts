// backend/src/controllers/validaciones.controller.ts
import { Request, Response } from 'express';
import { ValidacionesService } from '../services/validaciones.service';

const validacionesService = new ValidacionesService();

export class ValidacionesController {

    // Obtener todos los documentos pendientes de validación
    async getDocumentosPendientes(req: Request, res: Response) {
        try {
            const documentos = await validacionesService.getDocumentosPendientesValidacion();
            return res.status(200).json(documentos);
        } catch (error) {
            return res.status(500).json({ 
                message: 'Error al obtener documentos pendientes.', 
                error: (error as Error).message 
            });
        }
    }

    // Validar un documento (requisito o pago)
    async validarDocumento(req: Request, res: Response) {
        const { tipo, id } = req.params;
        const { estado, comentarios } = req.body;
        const userId = (req as any).userId; // Del middleware de autenticación

        try {
            if (estado !== 'APROBAR' && estado !== 'RECHAZAR') {
                return res.status(400).json({ 
                    message: 'El campo "estado" debe ser APROBAR o RECHAZAR.' 
                });
            }

            const aprobado = estado === 'APROBAR';
            let resultado;

            if (tipo === 'requisito') {
                resultado = await validacionesService.validarRequisitoPersona(
                    parseInt(id), 
                    aprobado, 
                    comentarios,
                    userId
                );
            } else if (tipo === 'pago') {
                resultado = await validacionesService.validarComprobantePago(
                    parseInt(id), 
                    aprobado, 
                    comentarios
                );
            } else {
                return res.status(400).json({ 
                    message: 'Tipo de documento inválido. Use "requisito" o "pago".' 
                });
            }

            return res.status(200).json({ 
                message: resultado.message,
                estado_actual: estado === 'APROBAR' ? 'APROBADO' : 'RECHAZADO'
            });

        } catch (error) {
            const errorMessage = (error as Error).message;
            const statusCode = errorMessage.includes('no encontrado') ? 404 : 500;
            return res.status(statusCode).json({ 
                message: 'Error al validar el documento.', 
                error: errorMessage 
            });
        }
    }
}

export { ValidacionesController };
