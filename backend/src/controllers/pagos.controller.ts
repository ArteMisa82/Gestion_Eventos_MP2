// backend/src/controllers/pagos.controller.ts

import { Request, Response } from 'express';
import { PagosService } from '../services/pagos.service'; 

const pagosService = new PagosService();

export class PagosController {

    // --------------------------------------------------------
    // MÉTODOS EXISTENTES
    // --------------------------------------------------------

    async getTarifas(req: Request, res: Response) {
        try {
            const idEvento = req.params.idEvento; 
            
            if (!idEvento) {
                return res.status(400).json({ message: 'ID de evento inválido.' });
            }

            const tarifas = await pagosService.getTarifasByEvento(idEvento);
            return res.json(tarifas);
        } catch (error) {
            return res.status(500).json({ 
                message: 'Error al obtener tarifas.', 
                error: (error as Error).message 
            });
        }
    }

    async registrarPago(req: Request, res: Response) {
        try {
            const { idRegistroPersona, valorPago, metodoPago } = req.body; 

            if (!idRegistroPersona || !valorPago || !metodoPago) {
                return res.status(400).json({ message: 'Faltan campos obligatorios para el pago.' });
            }

            const idReg = parseInt(idRegistroPersona as string);
            const valor = parseFloat(valorPago as string);

            if (isNaN(idReg) || isNaN(valor)) {
                 return res.status(400).json({ message: 'ID de registro o valor de pago inválido.' });
            }

            const nuevoPago = await pagosService.registerPago(
                idReg,
                valor,
                metodoPago
            );

            return res.status(201).json({ 
                message: 'Pago registrado con éxito.',
                pago: nuevoPago
            });
        } catch (error) {
            return res.status(500).json({ 
                message: 'Error al registrar el pago.', 
                error: (error as Error).message 
            });
        }
    }
    
    // --------------------------------------------------------
    // MÉTODO: GENERAR ORDEN DE PAGO (PDF) - CORREGIDO
    // --------------------------------------------------------
    
    async getPaymentOrder(req: Request, res: Response) {
        try {
            const { numRegPer } = req.params;
            const numRegPerId = parseInt(numRegPer, 10);

            if (isNaN(numRegPerId)) {
                return res.status(400).json({ message: 'ID de registro inválido.' });
            }

            // Llamar al servicio, que ahora devuelve Buffer O string
            const result = await pagosService.generatePaymentOrder(numRegPerId);

            // ¡CORRECCIÓN APLICADA! Validar si el resultado es el mensaje de evento gratuito.
            if (typeof result === 'string') {
                return res.status(200).json({ message: result });
            }

            // Si es un Buffer, enviar el PDF para descarga
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Orden_Pago_${numRegPerId}.pdf`);
            res.send(result); // Ahora TypeScript sabe que 'result' es un Buffer aquí.

        } catch (error) {
            console.error('Error al generar la orden de pago:', error);

            // Manejo de errores específicos
            const errorMessage = (error as Error).message;
            if (errorMessage.includes('no encontrado') || errorMessage.includes('Tarifa no definida')) {
                 return res.status(404).json({ message: errorMessage });
            }

            return res.status(500).json({ 
                message: 'Error interno al generar la orden de pago.',
                error: errorMessage 
            });
        }
    }
}