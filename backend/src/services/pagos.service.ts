// backend/src/services/pagos.service.ts

import prisma from '../config/database';
import { generateOrderPdf, OrderData } from '../utils/pdfGenerator';

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
                eventos: { select: { nom_evt: true } }
            }
        });

        if (!tarifas || tarifas.length === 0) {
            throw new Error(`No se encontraron tarifas para el evento ID: ${idEvento}`);
        }

        return tarifas.map(t => ({
            ...t,
            val_evt: t.val_evt.toNumber(),
            nom_evt: t.eventos.nom_evt
        }));
    }

    async registerPago(idRegistroPersona: number, valorPago: number, metodoPago: string) {

        const registro = await prisma.registro_personas.findUnique({
            where: { num_reg_per: idRegistroPersona },
        });

        if (!registro) {
            throw new Error(`El ID de registro ${idRegistroPersona} no existe.`);
        }

        return prisma.pagos.create({
            data: {
                num_reg_per: idRegistroPersona,
                val_pag: valorPago,
                met_pag: metodoPago,
                pag_o_no: 1,
            }
        });
    }

    // --------------------------------------------------------
    // MÉTODO AUXILIAR: OBTENER DATOS PARA LA ORDEN DE PAGO
    // --------------------------------------------------------

    async getOrderData(numRegPer: number): Promise<OrderData & { requisitos_completos: boolean }> {

        const registrationData = await prisma.registro_personas.findUnique({
            where: { num_reg_per: numRegPer },
            select: {
                usuarios: {
                    select: {
                        nom_usu: true,
                        ape_usu: true,
                        ced_usu: true,
                    }
                },
                registro_evento: {
                    select: {
                        detalle_eventos: {
                            select: {
                                id_evt_per: true,
                                eventos: {
                                    select: {
                                        nom_evt: true,
                                        cos_evt: true,
                                    }
                                }
                            }
                        }
                    }
                },
                requisitos: true, // <- Asumimos que existe un campo que indica requisitos completados
            }
        });

        if (!registrationData || !registrationData.registro_evento || !registrationData.usuarios) {
            throw new Error('No se encontraron datos del registro, evento o usuario.');
        }

        const event = registrationData.registro_evento.detalle_eventos.eventos;
        const user = registrationData.usuarios;

        // EVENTO GRATUITO
        if (event.cos_evt && event.cos_evt.toUpperCase() === 'GRATUITO') {
            return {
                num_orden: numRegPer,
                nom_evt: event.nom_evt,
                val_evt: 0,
                tip_par: "",
                nom_per: user.nom_usu,
                ape_per: user.ape_usu,
                ced_per: user.ced_usu ?? "",
                fec_limite: "",
                metodos_pago: "",
                requisitos_completos: true
            };
        }

        const eventId = registrationData.registro_evento.detalle_eventos.id_evt_per;

        const tarifa = await prisma.tarifas_evento.findFirst({
            where: { id_evt: eventId },
            select: { val_evt: true, tip_par: true }
        });

        if (!tarifa) {
            throw new Error('El evento requiere pago, pero no existe tarifa definida.');
        }

        const orderData: OrderData & { requisitos_completos: boolean } = {
            num_orden: numRegPer,
            nom_evt: event.nom_evt,
            val_evt: tarifa.val_evt.toNumber(),
            tip_par: tarifa.tip_par,
            nom_per: user.nom_usu,
            ape_per: user.ape_usu,
            ced_per: user.ced_usu ?? "",
            fec_limite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            metodos_pago:
                'Transferencia bancaria a cuenta UTA: XXXXXX\n' +
                'Pago en ventanilla Banco Pichincha.',
            requisitos_completos: registrationData.requisitos ?? false
        };

        return orderData;
    }

    // --------------------------------------------------------
    // GENERAR ORDEN DE PAGO
    // --------------------------------------------------------

    async generatePaymentOrder(numRegPer: number): Promise<Buffer | string> {

        const orderData = await this.getOrderData(numRegPer);

        if (!orderData.requisitos_completos) {
            return 'No se puede generar la orden de pago: requisitos incompletos.';
        }

        if (orderData.val_evt === 0) {
            return `El evento "${orderData.nom_evt}" es GRATUITO. No necesita orden de pago.`;
        }

        return generateOrderPdf(orderData);
    }

    // --------------------------------------------------------
    // REGISTRAR COMPROBANTE
    // --------------------------------------------------------

    async registrarComprobante(numRegPer: number, rutaComprobante: string) {

        const pagoExistente = await prisma.pagos.findFirst({
            where: { num_reg_per: numRegPer }
        });

        if (!pagoExistente) {
            throw new Error('No existe un pago registrado antes de subir el comprobante.');
        }

        return prisma.pagos.update({
            where: { num_pag: pagoExistente.num_pag },
            data: {
                pdf_comp_pag: rutaComprobante,
                pag_o_no: 0,
            }
        });
    }

    // --------------------------------------------------------
    // VALIDAR COMPROBANTE
    // --------------------------------------------------------

    async validarComprobante(numRegPer: number, aprobado: boolean) {

        const pagoExistente = await prisma.pagos.findFirst({
            where: { num_reg_per: numRegPer }
        });

        if (!pagoExistente) {
            throw new Error('No se encontró pago para este registro.');
        }

        return prisma.pagos.update({
            where: { num_pag: pagoExistente.num_pag },
            data: { pag_o_no: aprobado ? 1 : 0 }
        });
    }

    // --------------------------------------------------------
    // NUEVO MÉTODO: OBTENER DATA DEL PAGO (PARA VERIFICACIÓN DE RESPONSABLE)
    // --------------------------------------------------------
    async getPagoData(numRegPer: number) {

        const pago = await prisma.pagos.findFirst({
            where: { num_reg_per: numRegPer },
            include: {
                registro_personas: true, // Para acceder a quien puede validar
            }
        });

        if (!pago) return null;

        return {
            ...pago,
            esResponsable: (userId: number) => {
                // Lógica: si el userId coincide con el responsable o es admin
                return pago.registro_personas.responsable_id === userId || pago.registro_personas.es_admin;
            }
        };
    }
}
