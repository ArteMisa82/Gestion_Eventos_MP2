"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./src/config/database"));
async function fixAdminUser() {
    try {
        console.log('Buscando usuario admin@admin.com...');
        const admin = await database_1.default.usuarios.findUnique({
            where: { cor_usu: 'admin@admin.com' }
        });
        if (!admin) {
            console.log('Usuario admin@admin.com no encontrado');
            return;
        }
        console.log(`Usuario encontrado: ${admin.cor_usu}`);
        console.log(`Administrador actual: ${admin.Administrador}`);
        // Actualizar el campo Administrador a true
        const updated = await database_1.default.usuarios.update({
            where: { cor_usu: 'admin@admin.com' },
            data: { Administrador: true }
        });
        console.log(`✅ Usuario actualizado`);
        console.log(`Administrador ahora: ${updated.Administrador}`);
    }
    catch (error) {
        console.error('Error:', error);
    }
    finally {
        await database_1.default.$disconnect();
    }
}
fixAdminUser();
