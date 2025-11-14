// backend/src/controllers/pagos.controller.ts

import { Request, Response } from 'express';
import { PagosService } from '../services/pagos.service'; 

const pagosService = new PagosService();

export class PagosController {

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
}