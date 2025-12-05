import prisma from './src/config/database';

async function fixAdminUser() {
  try {
    console.log('Buscando usuario admin@admin.com...');
    
    const admin = await prisma.usuarios.findUnique({
      where: { cor_usu: 'admin@admin.com' }
    });

    if (!admin) {
      console.log('Usuario admin@admin.com no encontrado');
      return;
    }

    console.log(`Usuario encontrado: ${admin.cor_usu}`);
    console.log(`Administrador actual: ${admin.Administrador}`);

    // Actualizar el campo Administrador a true
    const updated = await prisma.usuarios.update({
      where: { cor_usu: 'admin@admin.com' },
      data: { Administrador: true }
    });

    console.log(`✅ Usuario actualizado`);
    console.log(`Administrador ahora: ${updated.Administrador}`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAdminUser();
