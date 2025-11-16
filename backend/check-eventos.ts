import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();

async function checkEventos() {
  try {
    const eventos = await prisma.eventos.findMany({
      include: {
        detalle_eventos: true
      }
    });

    console.log('=== EVENTOS EN LA BASE DE DATOS ===\n');
    
    eventos.forEach((evento: any) => {
      console.log(`Nombre: ${evento.nom_evt}`);
      console.log(`ID: ${evento.id_evt_per}`);
      console.log(`Estado: ${evento.est_evt}`);
      console.log(`Modalidad: ${evento.mod_evt}`);
      console.log(`Tipo Público: ${evento.tip_pub_evt}`);
      console.log(`Costo: ${evento.cos_evt}`);
      console.log(`Detalles: ${evento.detalle_eventos.length}`);
      
      if (evento.detalle_eventos.length > 0) {
        evento.detalle_eventos.forEach((detalle: any) => {
          console.log(`  - Detalle ID: ${detalle.id_evt_det}`);
          console.log(`    Estado: ${detalle.est_evt_det}`);
          console.log(`    Cupo: ${detalle.cup_det}`);
          console.log(`    Área: ${detalle.are_det}`);
        });
      }
      console.log('---\n');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEventos();
