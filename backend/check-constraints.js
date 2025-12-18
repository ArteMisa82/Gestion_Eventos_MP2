"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./src/generated/prisma");
const prisma = new prisma_1.PrismaClient();
async function checkConstraints() {
    try {
        // Consultar la definición de la restricción CHECK
        const constraints = await prisma.$queryRaw `
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint 
      WHERE conrelid = 'detalle_eventos'::regclass 
        AND contype = 'c'
        AND conname LIKE '%are_det%';
    `;
        console.log('=== RESTRICCIONES CHECK PARA are_det ===\n');
        console.log(JSON.stringify(constraints, null, 2));
        // También intentar obtener valores existentes
        const valoresExistentes = await prisma.$queryRaw `
      SELECT DISTINCT are_det 
      FROM detalle_eventos 
      WHERE are_det IS NOT NULL
      ORDER BY are_det;
    `;
        console.log('\n=== VALORES EXISTENTES DE are_det ===\n');
        console.log(JSON.stringify(valoresExistentes, null, 2));
    }
    catch (error) {
        console.error('Error:', error.message);
    }
    finally {
        await prisma.$disconnect();
    }
}
checkConstraints();
