// backend/src/services/pagos.service.ts

import prisma from '../config/database';
import { generateOrderPdf } from '../utils/pdfGenerator'; // Importar la función de generación de PDF

export class PagosService {

    // --------------------------------------------------------
    // MÉTODOS EXISTENTES
    // --------------------------------------------------------

    async getTarifasByEvento(idEvento: string) {
        const tarifas = await prisma.tarifas_evento.findMany({
            where: { id_evt: idEvento },
            select: {
                id_tar_evt: true,
                val_evt: true,         
                tip_par: true,           
                eventos: {
                    select: { nom_evt: true }
                }
            }
        });

        if (!tarifas || tarifas.length === 0) {
            throw new Error(`No se encontraron tarifas para el evento ID: ${idEvento}`);
        }

        return tarifas;
    }

    async registerPago(
        idRegistroPersona: number,
        valorPago: number,
        metodoPago: string,
    ) {

        const registro = await prisma.registro_personas.findUnique({
            where: { num_reg_per: idRegistroPersona },
        });

        if (!registro) {
            throw new Error(`El ID de registro de persona ${idRegistroPersona} no existe.`);
        }
        
        // En un flujo real, 'pag_o_no: 1' se usaría después de que el administrador valida el comprobante.
        // Aquí lo dejamos en 1 para simular un registro rápido.
        const nuevoPago = await prisma.pagos.create({
            data: {
                num_reg_per: idRegistroPersona, 
                val_pag: valorPago,          
                met_pag: metodoPago,           
                pag_o_no: 1, 
            }
        });

        return nuevoPago;
    }

    // --------------------------------------------------------
    // NUEVO MÉTODO: GENERAR ORDEN DE PAGO
    // --------------------------------------------------------

    /**
     * Obtiene datos del registro, la tarifa y genera el PDF de la Orden de Pago, 
     * o devuelve un mensaje si el evento es gratuito.
     * @param numRegPer ID del registro de persona (e.g., 1)
     * @returns Buffer del PDF o string de mensaje.
     */
    async generatePaymentOrder(numRegPer: number): Promise<Buffer | string> { // <-- TIPO DE RETORNO MODIFICADO
        const registrationData = await prisma.registro_personas.findUnique({
            where: { num_reg_per: numRegPer },
            select: {
                registro_evento: {
                    select: {
                        detalle_eventos: {
                            select: {
                                id_evt_per: true,
                                eventos: { 
                                    select: { 
                                        nom_evt: true,
                                        cos_evt: true // <-- Campo de costo añadido
                                    } 
                                }
                            }
                        }
                    }
                },
            }
        });

        if (!registrationData) {
            throw new Error('Registro de persona no encontrado.');
        }

        const event = registrationData.registro_evento.detalle_eventos.eventos;

        // 1. LÓGICA DE VALIDACIÓN DE EVENTO GRATUITO
        if (event.cos_evt && event.cos_evt.toUpperCase() === 'GRATUITO') {
             // Si es GRATUITO, retorna un string con el mensaje.
             return `El evento "${event.nom_evt}" es GRATUITO. No se requiere orden de pago.`;
        }

        const eventId = registrationData.registro_evento.detalle_eventos.id_evt_per;

        // 2. Búsqueda de tarifa (solo si no fue GRATUITO)
        const tarifa = await prisma.tarifas_evento.findFirst({
            where: { id_evt: eventId },
            select: { val_evt: true, tip_par: true }
        });

        if (!tarifa) {
            // Si no fue marcado como GRATUITO, pero no tiene tarifa, sigue siendo un error.
            throw new Error('El evento requiere pago, pero la tarifa no ha sido definida.');
        }

        // 3. Preparación de datos y generación de PDF
        const orderData = {
            num_orden: numRegPer,
            nom_evt: event.nom_evt,
            val_evt: tarifa.val_evt.toNumber(), 
            tip_par: tarifa.tip_par,
            fec_limite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            metodos_pago: 'Transferencia Bancaria a Cuenta UTA: XXXXXX | Pago en ventanilla en Banco Pichincha.' 
        };

        return generateOrderPdf(orderData);
    }
}