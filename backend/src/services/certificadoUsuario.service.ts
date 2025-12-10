import fs from 'fs';
import prisma from '../config/database';
import path from 'path';

class CertificadoUsuarioService {

    async generarYGuardar(
    userId: number,
    idEst: number,
    numRegPer: number,
    pdfBuffer: Buffer,
    nombre: string,
    idReqPer?: number
) {
    const dir = path.join(__dirname, '../uploads/certificados/user_' + userId);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const safeName = nombre.replace(/[<>:"/\\|?*]/g, '_');
    const filePath = path.join(dir, `${safeName}.pdf`);
    fs.writeFileSync(filePath, pdfBuffer);

    const relativePath = `uploads/certificados/user_${userId}/${safeName}.pdf`;

    const certificado = await prisma.certificados_usuario.create({
        data: {
            id_usu: userId,
            id_est: idEst,
            num_reg_per: numRegPer,
            nombre,
            url_cert: relativePath
        },
        include: {
            usuarios: true,
            estudiantes: true,
            registro_persona: true
        }
    });

    // Vincular requisito_persona si se pasa
    if (idReqPer) {
        await prisma.certificados_usuario.update({
            where: { id_cert: certificado.id_cert },
            data: {
                requisitos_persona: { connect: { id_req_per: idReqPer } }
            }
        });
    }

    return certificado;
    }

    async listarPorUsuario(userId: number) {
        return prisma.certificados_usuario.findMany({
            where: { id_usu: userId },
            orderBy: { creado_en: 'desc' },
            include: {
                registro_persona: true,
                requisitos_persona: true
            }
        });
    }
}

export const certificadoUsuarioService = new CertificadoUsuarioService();
