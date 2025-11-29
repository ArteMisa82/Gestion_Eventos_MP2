// backend/src/controllers/pagos.controller.ts

import { Request, Response } from 'express';
import { PagosService } from '../services/pagos.service'; 
// 🛑 IMPORTAMOS EL GENERADOR DE PDF para el método getPaymentOrder
import { generateOrderPdf } from '../utils/pdfGenerator'; 

const pagosService = new PagosService();

// 🛑 ELIMINAMOS LA INTERFAZ MulterRequest para evitar el error de tipado (usaremos (req as any).file)

export class PagosController {

    // --------------------------------------------------------
    // MÉTODOS EXISTENTES 
    // --------------------------------------------------------

    async getTarifas(req: Request, res: Response) {
        const idEvento = req.params.idEvento; 
        try {
            const tarifas = await pagosService.getTarifasByEvento(idEvento);
            return res.json(tarifas);
        } catch (error) {
            return res.status(500).json({ message: 'Error al obtener tarifas.', error: (error as Error).message });
        }
    }

    async registrarPago(req: Request, res: Response) {
        const { idRegistroPersona, valorPago, metodoPago } = req.body; 
        try {
             const nuevoPago = await pagosService.registerPago(
                parseInt(idRegistroPersona),
                parseFloat(valorPago),
                metodoPago
            );
            return res.status(201).json({ message: 'Pago registrado con éxito.', pago: nuevoPago });
        } catch (error) {
             return res.status(500).json({ message: 'Error al registrar el pago.', error: (error as Error).message });
        }
    }
    
    // --------------------------------------------------------
    // MÉTODO: GENERAR ORDEN DE PAGO (PDF)
    // --------------------------------------------------------
    
    async getPaymentOrder(req: Request, res: Response) {
        try {
            const { numRegPer } = req.params;
            const numRegPerId = parseInt(numRegPer, 10);

            if (isNaN(numRegPerId)) {
                return res.status(400).json({ message: 'ID de registro inválido.' });
            }

            // 🛑 1. Obtener la data de la orden COMPLETA desde el servicio (incluyendo datos del estudiante)
            const orderData = await pagosService.getOrderData(numRegPerId);

            // 🛑 2. Manejo de errores y eventos gratuitos
            if (!orderData) {
                return res.status(404).json({ 
                    message: "Error al generar la orden de pago.", 
                    error: "Registro de persona o evento asociado no encontrado."
                });
            }

            if (orderData.val_evt === 0) {
                return res.status(200).json({ 
                    message: `El evento "${orderData.nom_evt}" es GRATUITO. No se requiere orden de pago.` 
                });
            }

            // 🛑 3. Generar el PDF
            const pdfBuffer = await generateOrderPdf(orderData);
            
            // 4. Enviar el PDF para descarga
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=Orden_Pago_${numRegPerId}.pdf`);
            res.send(pdfBuffer);

        } catch (error) {
            console.error('Error al generar la orden de pago:', error);
            const errorMessage = (error as Error).message;
            const statusCode = errorMessage.includes('no encontrado') || errorMessage.includes('Tarifa no definida') ? 404 : 500;
            return res.status(statusCode).json({ 
                message: 'Error al generar la orden de pago.',
                error: errorMessage 
            });
        }
    }

    // --------------------------------------------------------
    // MÉTODO: SUBIR COMPROBANTE (USUARIO) - CORREGIDO
    // --------------------------------------------------------
    async subirComprobante(req: Request, res: Response) {
        // 🛑 Usamos (req as any).file para evitar errores de tipado sin MulterRequest
        const file = (req as any).file; 
        const { numRegPer } = req.params;

        if (!file) {
            return res.status(400).json({ message: 'Debe adjuntar un archivo de comprobante (PDF o imagen).' });
        }

        try {
            // La ruta donde Multer guardó el archivo
            const rutaArchivo = file.path; 
            
            await pagosService.registrarComprobante(
                parseInt(numRegPer), 
                rutaArchivo
            );

            // Se establece el estado en 0 (Pendiente de Revisión)
            return res.status(200).json({ 
                message: 'Comprobante subido correctamente, pendiente de validación administrativa.' 
            });
        } catch (error) {
            const errorMessage = (error as Error).message;
            const statusCode = errorMessage.includes('404') || errorMessage.includes('no encontrado') ? 404 : 500;
            return res.status(statusCode).json({ 
                message: 'Error al procesar el comprobante.', 
                error: errorMessage 
            });
        }
    }

    // --------------------------------------------------------
    // MÉTODO: VALIDAR COMPROBANTE (ENCARGADO/ADMIN) - SIN CAMBIOS
    // --------------------------------------------------------

    /**
     * PUT /pagos/validar/:numRegPer
     * Permite al Encargado/Admin aprobar o rechazar el pago.
     */
    async validarComprobante(req: Request, res: Response) {
        const { numRegPer } = req.params;
        const { estado } = req.body; // Esperamos "APROBAR" o "RECHAZAR"

        try {
            if (estado !== 'APROBAR' && estado !== 'RECHAZAR') {
                return res.status(400).json({ message: 'El campo "estado" debe ser APROBAR o RECHAZAR.' });
            }

            const pagoActualizado = await pagosService.validarComprobante(
                parseInt(numRegPer), 
                estado === 'APROBAR'
            );

            // pag_o_no = 1 para APROBADO, 0 para RECHAZADO
            return res.status(200).json({ 
                message: `Pago ${estado.toLowerCase()} con éxito.`,
                estado_actual: pagoActualizado.pag_o_no === 1 ? 'APROBADO' : 'RECHAZADO'
            });
        } catch (error) {
            const errorMessage = (error as Error).message;
            const statusCode = errorMessage.includes('404') || errorMessage.includes('no encontrado') ? 404 : 500;
            return res.status(statusCode).json({ 
                message: 'Error al validar el comprobante.', 
                error: errorMessage 
            });
        }
    }
}