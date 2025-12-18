// backend/src/services/validaciones.service.ts

import prisma from '../config/database';

export class ValidacionesService {

    // --------------------------------------------------------
    // OBTENER TODOS LOS DOCUMENTOS PENDIENTES DE VALIDACIÓN
    // --------------------------------------------------------
    async getDocumentosPendientesValidacion() {
        // 1. Obtener requisitos de personas pendientes
        const requisitosPersona = await prisma.requisitos_persona.findMany({
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
                },
                requisitos_evento: true
            },
            orderBy: {
                fec_val: 'desc'
            }
        });

        // 2. Obtener pagos pendientes
        const pagosPendientes = await prisma.pagos.findMany({
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
                num_pag: 'desc'
            }
        });

        // 3. Formatear requisitos de personas
        const requisitosFormateados = requisitosPersona.map((req: any) => ({
            id: `req-${req.id_req_per}`,
            tipo: 'REQUISITO',
            num_reg_per: req.num_reg_per,
            tipo_documento: req.requisitos_evento.tip_req,
            descripcion: req.requisitos_evento.des_req,
            archivo: req.archivo_documento,
            valor: req.val_req,
            fecha_subida: req.fec_val,
            estado: req.estado_validacion,
            comentario_validacion: req.comentario_validacion,
            usuario: {
                id_usu: req.registro_personas.usuarios.id_usu,
                nombre_completo: `${req.registro_personas.usuarios.nom_usu} ${req.registro_personas.usuarios.ape_usu}`,
                ced_usu: req.registro_personas.usuarios.ced_usu,
                email: req.registro_personas.usuarios.email_usu
            },
            evento: {
                nom_evt: req.registro_personas.registro_evento.detalle_eventos.eventos.nom_evt,
                id_evt: req.registro_personas.registro_evento.detalle_eventos.eventos.id_evt
            },
            id_requisito_persona: req.id_req_per
        }));

        // 4. Formatear pagos
        const pagosFormateados = pagosPendientes.map((pago: any) => {
            // ✅ Asegurar que la ruta tenga extensión .pdf
            const rutaArchivo = pago.pdf_comp_pag.endsWith('.pdf') 
                ? pago.pdf_comp_pag 
                : `${pago.pdf_comp_pag}.pdf`;
            
            console.log('📋 [VALIDACIONES] Pago encontrado:', {
                num_pag: pago.num_pag,
                archivo_original: pago.pdf_comp_pag,
                archivo_formateado: rutaArchivo,
                met_pag: pago.met_pag,
                estado: pago.pag_o_no
            });
            
            return {
                id: `pago-${pago.num_pag}`,
                tipo: 'COMPROBANTE_PAGO',
                num_reg_per: pago.num_reg_per,
                tipo_documento: 'Comprobante de Pago',
                descripcion: `Método: ${pago.met_pag}`,
                archivo: rutaArchivo,
                valor: pago.val_pag.toNumber(),
                fecha_subida: null,
                estado: pago.pag_o_no === 0 ? 'PENDIENTE' : pago.pag_o_no === 1 ? 'APROBADO' : 'RECHAZADO',
                comentario_validacion: null,
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
                num_pag: pago.num_pag,
                met_pag: pago.met_pag
            };
        });

        // 5. Combinar y ordenar por fecha
        const todosDocumentos = [...requisitosFormateados, ...pagosFormateados];
        
        return todosDocumentos.sort((a, b) => {
            const fechaA = a.fecha_subida ? new Date(a.fecha_subida).getTime() : 0;
            const fechaB = b.fecha_subida ? new Date(b.fecha_subida).getTime() : 0;
            return fechaB - fechaA;
        });
    }

    // --------------------------------------------------------
    // VALIDAR REQUISITO DE PERSONA
    // --------------------------------------------------------
    async validarRequisitoPersona(idReqPer: number, aprobado: boolean, comentarios?: string, validadoPor?: number) {
        const requisito = await prisma.requisitos_persona.findUnique({
            where: { id_req_per: idReqPer }
        });

        if (!requisito) {
            throw new Error('Requisito no encontrado');
        }

        // Actualizar el requisito
        await prisma.requisitos_persona.update({
            where: { id_req_per: idReqPer },
            data: {
                estado_validacion: aprobado ? 'APROBADO' : 'RECHAZADO',
                comentario_validacion: comentarios,
                fecha_validacion: new Date(),
                validado_por: validadoPor
            }
        });

        return {
            message: aprobado 
                ? 'Requisito aprobado correctamente' 
                : 'Requisito rechazado. El usuario debe volver a subirlo.'
        };
    }

    // --------------------------------------------------------
    // VALIDAR COMPROBANTE DE PAGO
    // --------------------------------------------------------
    async validarComprobantePago(numPag: number, aprobado: boolean, comentarios?: string) {
        const pago = await prisma.pagos.findUnique({
            where: { num_pag: numPag },
            include: {
                registro_personas: true
            }
        });

        if (!pago) {
            throw new Error('Pago no encontrado');
        }

        // Actualizar el estado del pago
        await prisma.pagos.update({
            where: { num_pag: numPag },
            data: { pag_o_no: aprobado ? 1 : -1 }
        });

        // Actualizar el estado del registro
        await prisma.registro_personas.update({
            where: { num_reg_per: pago.num_reg_per },
            data: {
                estado_registro: aprobado ? 'COMPLETADO' : 'RECHAZADO',
                responsable_valida: aprobado,
                fecha_validacion: new Date(),
                comentarios_responsable: comentarios
            }
        });

        return {
            message: aprobado 
                ? 'Pago aprobado. Inscripción completada.' 
                : 'Pago rechazado. El usuario debe volver a subir el comprobante.'
        };
    }
}

export { ValidacionesService };
