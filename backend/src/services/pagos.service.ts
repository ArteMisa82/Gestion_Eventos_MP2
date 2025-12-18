// backend/src/services/pagos.service.ts

import prisma from '../config/database';
import { generateOrderPdf, OrderData } from '../utils/pdfGenerator';

export class PagosService {

    // ----------------------------------------
    // VALIDACIÓN DE REQUISITOS
    // ----------------------------------------
    private async verificarRequisitos(numRegPer: number) {
        const registro = await prisma.registro_personas.findUnique({
            where: { num_reg_per: numRegPer },
            select: {
                estado_registro: true,           // debe existir en tu BD
                responsable_valida: true,       // NUEVO CAMPO
                registro_evento: {
                    select: {
                        detalle_eventos: {
                            select: {
                                requisitos_completos: true // NUEVO CAMPO
                            }
                        }
                    }
                }
            }
        });

        if (!registro) {
            throw new Error("No existe el registro.");
        }

        // 1. Validar requisitos del evento
        if (!registro.registro_evento.detalle_eventos.requisitos_completos) {
            throw new Error("No puede generar la orden. Faltan requisitos del evento.");
        }

        // 2. Validar que el registro esté completo
        if (registro.estado_registro !== 'COMPLETO') {
            throw new Error("El registro aún no está completo.");
        }

        // 3. Validación del responsable
        if (!registro.responsable_valida) {
            throw new Error("La orden de pago solo se habilita cuando el responsable apruebe.");
        }
    }

    // ----------------------------------------
    // TARIFAS
    // ----------------------------------------

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

    // ----------------------------------------
    // REGISTRAR PAGO
    // ----------------------------------------

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

    // ----------------------------------------
    // DATOS ORDEN DE PAGO
    // ----------------------------------------

    async getOrderData(numRegPer: number): Promise<OrderData & { requisitos_completos: boolean }> {

        const registrationData = await prisma.registro_personas.findUnique({
            where: { num_reg_per: numRegPer },
            include: {
                usuarios: true,
                registro_evento: {
                    include: {
                        detalle_eventos: {
                            include: {
                                eventos: true
                            }
                        }
                    }
                }
            }
        }) as any;

        if (!registrationData?.registro_evento?.detalle_eventos?.eventos) {
            throw new Error('No se encontraron datos del registro, evento o usuario.');
        }

        const event = registrationData.registro_evento.detalle_eventos.eventos;
        const user = registrationData.usuarios;

        // Evento gratuito
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

        return {
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
            requisitos_completos: true // TODO: Implementar lógica de requisitos
        };
    }

    // ----------------------------------------
    // GENERAR ORDEN DE PAGO
    // ----------------------------------------

    async generatePaymentOrder(numRegPer: number): Promise<Buffer | string> {

        // 🚨 VALIDAR TODO ANTES!
        await this.verificarRequisitos(numRegPer);

        const orderData = await this.getOrderData(numRegPer);

        if (!orderData.requisitos_completos) {
            return 'No se puede generar la orden de pago: requisitos incompletos.';
        }

        if (orderData.val_evt === 0) {
            return `El evento "${orderData.nom_evt}" es GRATUITO. No necesita orden de pago.`;
        }

        return generateOrderPdf(orderData);
    }

    // ----------------------------------------
    // SUBIR COMPROBANTE
    // ----------------------------------------

    async registrarComprobante(numRegPer: number, rutaComprobante: string, metodoPago: string) {

        const pagoExistente = await prisma.pagos.findFirst({
            where: { num_reg_per: numRegPer }
        });

        if (!pagoExistente) {
            throw new Error('No existe un pago registrado antes de subir el comprobante.');
        }

        // Actualizar el pago con el comprobante y método de pago
        await prisma.pagos.update({
            where: { num_pag: pagoExistente.num_pag },
            data: {
                pdf_comp_pag: rutaComprobante,
                met_pag: metodoPago,
                pag_o_no: 0, // 0 = Pendiente de validación
            }
        });

        // Actualizar el estado del registro a VALIDACION_PENDIENTE
        await prisma.registro_personas.update({
            where: { num_reg_per: numRegPer },
            data: {
                estado_registro: 'VALIDACION_PENDIENTE'
            }
        });

        return {
            message: 'Comprobante registrado correctamente. Esperando validación del responsable.'
        };
    }

    // ----------------------------------------
    // VALIDAR PAGO POR RESPONSABLE
    // ----------------------------------------

    async validarComprobante(numRegPer: number, aprobado: boolean, comentarios?: string) {

        const pagoExistente = await prisma.pagos.findFirst({
            where: { num_reg_per: numRegPer }
        });

        if (!pagoExistente) {
            throw new Error('No se encontró pago para este registro.');
        }

        // Actualizar el estado del pago
        await prisma.pagos.update({
            where: { num_pag: pagoExistente.num_pag },
            data: { pag_o_no: aprobado ? 1 : -1 } // 1 = Aprobado, -1 = Rechazado
        });

        // Actualizar el estado del registro
        await prisma.registro_personas.update({
            where: { num_reg_per: numRegPer },
            data: {
                estado_registro: aprobado ? 'COMPLETADO' : 'RECHAZADO',
                responsable_valida: aprobado,
                fecha_validacion: new Date(),
                comentarios_responsable: comentarios
            }
        });

        return {
            message: aprobado 
                ? 'Comprobante aprobado. Inscripción completada.' 
                : 'Comprobante rechazado. El usuario debe volver a subir el comprobante.'
        };
    }

    // --------------------------------------------------------
    // NUEVO MÉTODO: OBTENER DATA DEL PAGO (PARA VERIFICACIÓN DE RESPONSABLE)
    // --------------------------------------------------------
    async getPagoData(numRegPer: number) {

        const pago = await prisma.pagos.findFirst({
            where: { num_reg_per: numRegPer },
            include: {
                registro_personas: {
                    include: {
                        usuarios: true
                    }
                }
            }
        }) as any;

        if (!pago) return null;

        return {
            ...pago,
            esResponsable: (userId: number) => {
                // Lógica: si el userId coincide con el usuario del registro o es admin
                return pago.registro_personas.id_usu === userId || pago.registro_personas.usuarios?.adm_usu === 1;
            }
        };
    }

    // --------------------------------------------------------
    // OBTENER PAGOS PENDIENTES DE VALIDACIÓN
    // --------------------------------------------------------
    async getPagosPendientesValidacion() {
        const pagosPendientes = await prisma.pagos.findMany({
            where: { 
                pag_o_no: 0 // Pendiente de validación
            },
            include: {
                registro_personas: {
                    include: {
                        usuarios: true,
                        registro_evento: {
                            include: {
                                detalle_eventos: {
                                    include: {
                                        eventos: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                num_pag: 'desc' // Más recientes primero
            }
        });

        return pagosPendientes.map((pago: any) => ({
            num_pag: pago.num_pag,
            num_reg_per: pago.num_reg_per,
            val_pag: pago.val_pag.toNumber(),
            met_pag: pago.met_pag,
            pdf_comp_pag: pago.pdf_comp_pag,
            estado_pago: pago.pag_o_no === 0 ? 'Pendiente' : pago.pag_o_no === 1 ? 'Aprobado' : 'Rechazado',
            usuario: {
                id_usu: pago.registro_personas.usuarios.id_usu,
                nombre_completo: `${pago.registro_personas.usuarios.nom_usu} ${pago.registro_personas.usuarios.ape_usu}`,
                ced_usu: pago.registro_personas.usuarios.ced_usu,
                email: pago.registro_personas.usuarios.email_usu
            },
            evento: {
                nom_evt: pago.registro_personas.registro_evento.detalle_eventos.eventos.nom_evt,
                id_evt: pago.registro_personas.registro_evento.detalle_eventos.eventos.id_evt
            },
            estado_registro: pago.registro_personas.estado_registro,
            fecha_registro: pago.registro_personas.fec_reg_per
        }));
    }
}

export { PagosService };
