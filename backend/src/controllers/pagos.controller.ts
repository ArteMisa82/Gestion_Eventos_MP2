// backend/src/controllers/pagos.controller.ts
import { Request, Response } from 'express';
import { PagosService } from '../services/pagos.service';

const pagosService = new PagosService();

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

        // 1. Obtener la data de la orden completa desde el servicio
        const orderData = await pagosService.getOrderData(numRegPerId);

        // 2. Manejo de errores y eventos gratuitos
        if (!orderData) {
            return res.status(404).json({ 
                message: "Error al generar la orden de pago.", 
                error: "Registro de persona o evento asociado no encontrado."
            });
        }

        // ------------------------------
        // NUEVO: Verificar que se cumplan los requisitos
        // ------------------------------
        if (!orderData.requisitos_completos) {
            return res.status(400).json({
                success: false,
                message: 'No se puede generar la orden de pago: requisitos incompletos.'
            });
        }

        if (orderData.val_evt === 0) {
            return res.status(200).json({ 
                message: `El evento "${orderData.nom_evt}" es GRATUITO. No se requiere orden de pago.` 
            });
        }

        // 3. Generar el PDF
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

async validarComprobante(req: Request, res: Response) {
    const { numRegPer } = req.params;
    const { estado, userId } = req.body; // Se espera userId del auth o frontend

    try {
        if (estado !== 'APROBAR' && estado !== 'RECHAZAR') {
            return res.status(400).json({ message: 'El campo "estado" debe ser APROBAR o RECHAZAR.' });
        }

        // ------------------------------
        // NUEVO: Verificar que el usuario sea responsable o admin
        // ------------------------------
        const pagoData = await pagosService.getPagoData(parseInt(numRegPer));
        if (!pagoData) {
            return res.status(404).json({ message: 'Pago o inscripción no encontrado.' });
        }

        if (!pagoData.esResponsable(userId)) {
            return res.status(403).json({ message: 'No tiene permisos para validar este pago.' });
        }

        // Validar comprobante
        const pagoActualizado = await pagosService.validarComprobante(parseInt(numRegPer), estado === 'APROBAR');

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
