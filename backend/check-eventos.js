"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./src/generated/prisma");
const prisma = new prisma_1.PrismaClient();
async function checkEventos() {
    try {
        const eventos = await prisma.eventos.findMany({
            include: {
                detalle_eventos: true
            }
        });
        console.log('=== EVENTOS EN LA BASE DE DATOS ===\n');
        eventos.forEach((evento) => {
            console.log(`Nombre: ${evento.nom_evt}`);
            console.log(`ID: ${evento.id_evt}`);
            console.log(`Estado: ${evento.est_evt}`);
            console.log(`Modalidad: ${evento.mod_evt}`);
            console.log(`Tipo Público: ${evento.tip_pub_evt}`);
            console.log(`Costo: ${evento.cos_evt}`);
            console.log(`Detalles: ${evento.detalle_eventos.length}`);
            if (evento.detalle_eventos.length > 0) {
                evento.detalle_eventos.forEach((detalle) => {
                    console.log(`  - Detalle ID: ${detalle.id_det}`);
                    console.log(`    Estado: ${detalle.est_evt_det}`);
                    console.log(`    Cupo: ${detalle.cup_det}`);
                    console.log(`    Horas: ${detalle.hor_det}`);
                    console.log(`    Área: ${detalle.are_det}`);
                    console.log(`    Tipo: ${detalle.tip_evt}`);
                });
            }
            console.log('---\n');
        });
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkEventos();
