"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("./src/generated/prisma");
const prisma = new prisma_1.PrismaClient();
async function runMigration() {
    try {
        console.log('🚀 Ejecutando migración: Actualizar cat_det...\n');
        // Eliminar constraint antiguo
        await prisma.$executeRawUnsafe(`
      ALTER TABLE detalle_eventos 
      DROP CONSTRAINT IF EXISTS detalle_eventos_cat_det_check;
    `);
        console.log('✅ Constraint antiguo eliminado');
        // Crear nuevo constraint
        await prisma.$executeRawUnsafe(`
      ALTER TABLE detalle_eventos 
      ADD CONSTRAINT detalle_eventos_cat_det_check 
      CHECK (cat_det::text = ANY (ARRAY[
          'CURSO'::character varying, 
          'CONGRESO'::character varying, 
          'WEBINAR'::character varying, 
          'CONFERENCIAS'::character varying, 
          'SOCIALIZACIONES'::character varying, 
          'CASAS ABIERTAS'::character varying,
          'SEMINARIOS'::character varying, 
          'OTROS'::character varying
      ]::text[]));
    `);
        console.log('✅ Nuevo constraint creado con CASAS ABIERTAS');
        // Verificar
        const result = await prisma.$queryRaw `
      SELECT 
        conname as constraint_name,
        pg_get_constraintdef(oid) as constraint_definition
      FROM pg_constraint 
      WHERE conrelid = 'detalle_eventos'::regclass 
        AND contype = 'c'
        AND conname = 'detalle_eventos_cat_det_check';
    `;
        console.log('\n📋 Constraint actualizado:');
        console.log(JSON.stringify(result, null, 2));
        console.log('\n✅ Migración completada exitosamente!');
    }
    catch (error) {
        console.error('❌ Error en la migración:', error.message);
    }
    finally {
        await prisma.$disconnect();
    }
}
runMigration();
