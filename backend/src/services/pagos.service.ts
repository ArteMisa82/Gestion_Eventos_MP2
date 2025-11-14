// backend/src/services/pagos.service.ts

import prisma from '../config/database';

export class PagosService {

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
}