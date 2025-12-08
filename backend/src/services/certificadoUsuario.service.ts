import fs from 'fs';
import prisma from '../config/database';
import path from 'path';

class CertificadoUsuarioService {

    async generarYGuardar(
        userId: number,
        idEst: number,
        idRegEvt: string,
        pdfBuffer: Buffer,
        nombre: string
    ) {
        const dir = path.join(__dirname, '../uploads/certificados/user_' + userId);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        const safeName = nombre.replace(/[<>:"/\\|?*]/g, '_');
        const filePath = path.join(dir, `${safeName}.pdf`);

        fs.writeFileSync(filePath, pdfBuffer);

        const relativePath = `uploads/certificados/user_${userId}/${nombre}.pdf`;

        const certificado = await prisma.certificados_usuario.create({
            data: {
                id_usu: userId,
                id_est: idEst,
                id_reg_evt: idRegEvt,
                nombre,
                url_cert: relativePath
            }
        });


        return certificado;
    }

    async listarPorUsuario(userId: number) {
        return prisma.certificados_usuario.findMany({
            where: { id_usu: userId },
            orderBy: { creado_en: 'desc' }
        });
    }
}

export const certificadoUsuarioService = new CertificadoUsuarioService();
