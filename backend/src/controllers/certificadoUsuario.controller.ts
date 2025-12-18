import { Request, Response } from "express";
import { CertificadoService } from '../services/certificado.service';
import { certificadoUsuarioService } from "../services/certificadoUsuario.service";

const certificadoService = new CertificadoService();

export class CertificadoUsuarioController {

    async generar(req: Request, res: Response) {
        try {
            const userId = Number(req.params.id);
            const data = req.body;

            if (!userId || !data?.nombre || !data?.id_est || !data?.num_reg_per) {
                return res.status(400).json({ message: "Faltan datos obligatorios: nombre, id_est, num_reg_per." });
            }

            // 1. Generar PDF desde instancia
            const pdf = await certificadoService.generateCertificate(data);

            // 2. Guardar registro
            const certificado = await certificadoUsuarioService.generarYGuardar(
                userId,
                data.id_est,
                data.num_reg_per,
                pdf,
                data.nombre
            );

            return res.json({
                message: "Certificado generado y guardado.",
                certificado
            });

        } catch (error) {
            return res.status(500).json({
                message: "Error generando certificado.",
                error: (error as Error).message
            });
        }
    }

    async listar(req: Request, res: Response) {
        try {
            const userId = Number(req.params.id);

            const certificados = await certificadoUsuarioService.listarPorUsuario(userId);

            return res.json(certificados);
        } catch (error) {
            return res.status(500).json({
                message: "Error obteniendo certificados.",
                error: (error as Error).message
            });
        }
    }
}

export const certificadoUsuarioController = new CertificadoUsuarioController();
