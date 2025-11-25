// backend/src/controllers/pagos.controller.ts

import { Request, Response } from 'express';
import { PagosService } from '../services/pagos.service';

const pagosService = new PagosService();

export class PagosController {

    // --------------------------------------------------------
    // OBTENER TARIFAS
    // --------------------------------------------------------
    async getTarifas(req: Request, res: Response) {
        const idEvento = req.params.idEvento;
        try {
            const tarifas = await pagosService.getTarifasByEvento(idEvento);
            return res.json(tarifas);
        } catch (error) {
            return res.status(500).json({
                message: 'Error al obtener tarifas.',
                error: (error as Error).message
            });
        }
    }

    // --------------------------------------------------------
    // REGISTRO DE PAGO
    // --------------------------------------------------------
    async registrarPago(req: Request, res: Response) {
        const { idRegistroPersona, valorPago, metodoPago } = req.body;

        try {
            const nuevoPago = await pagosService.registerPago(
                parseInt(idRegistroPersona),
                parseFloat(valorPago),
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
    // GENERAR ORDEN DE PAGO (PDF)
    // --------------------------------------------------------
    async getPaymentOrder(req: Request, res: Response) {
        try {
            const { numRegPer } = req.params;
            const id = parseInt(numRegPer, 10);

            if (isNaN(id)) {
                return res.status(400).json({
                    message: 'ID de registro inválido.'
                });
            }

            // NUEVO → Esto valida requisitos, aprobación del responsable, etc.
            const pdfOrMsg = await pagosService.generatePaymentOrder(id);

            // Si el servicio devuelve un mensaje, no es PDF (evento gratuito o bloqueo)
            if (typeof pdfOrMsg === 'string') {
                return res.status(400).json({ message: pdfOrMsg });
            }

            // Si es PDF: enviar archivo
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition',
                `attachment; filename=Orden_Pago_${id}.pdf`
            );
            res.send(pdfOrMsg);

        } catch (error) {
            const msg = (error as Error).message;

            return res.status(400).json({
                message: 'No se pudo generar la orden de pago.',
                error: msg
            });
        }
    }

    // --------------------------------------------------------
    // SUBIR COMPROBANTE
    // --------------------------------------------------------
    async subirComprobante(req: Request, res: Response) {
        const file = (req as any).file;
        const { numRegPer } = req.params;

        if (!file) {
            return res.status(400).json({
                message: 'Debe adjuntar un archivo de comprobante.'
            });
        }

        try {
            await pagosService.registrarComprobante(
                parseInt(numRegPer),
                file.path
            );

            return res.status(200).json({
                message: 'Comprobante subido correctamente (pendiente de validación).'
            });

        } catch (error) {
            return res.status(500).json({
                message: 'Error al procesar el comprobante.',
                error: (error as Error).message
            });
        }
    }

    // --------------------------------------------------------
    // VALIDAR COMPROBANTE (RESPONSABLE)
    // --------------------------------------------------------
    async validarComprobante(req: Request, res: Response) {
        const { numRegPer } = req.params;
        const { estado } = req.body;

        try {
            if (estado !== 'APROBAR' && estado !== 'RECHAZAR') {
                return res.status(400).json({
                    message: 'El campo "estado" debe ser APROBAR o RECHAZAR.'
                });
            }

            const pagoActualizado = await pagosService.validarComprobante(
                parseInt(numRegPer),
                estado === 'APROBAR'
            );

            return res.status(200).json({
                message: `Pago ${estado.toLowerCase()} con éxito.`,
                estado_actual: pagoActualizado.pag_o_no === 1
                    ? 'APROBADO'
                    : 'RECHAZADO'
            });

        } catch (error) {
            return res.status(500).json({
                message: 'Error al validar el comprobante.',
                error: (error as Error).message
            });
        }
    }
}
