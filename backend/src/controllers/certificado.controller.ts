// backend/src/controllers/certificado.controller.ts

import { Request, Response } from 'express';
import { CertificadoService } from '../services/certificado.service'; 

const certificadoService = new CertificadoService();

export class CertificadoController {

    async getCertificateData(req: Request, res: Response) {
        try {
            const registrationId = parseInt(req.params.registrationId as string);
            
            if (isNaN(registrationId)) {
                return res.status(400).json({ message: 'ID de registro inválido.' });
            }

            const data = await certificadoService.getCertificateData(registrationId);
            return res.json(data);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                message: 'Error al obtener datos del certificado.', 
                error: (error as Error).message 
            });
        }
    }


    async generateCertificate(req: Request, res: Response) {

        try {
            const certificateBuffer = await certificadoService.generateCertificate(req.body); 

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=certificado.pdf');
            res.send(certificateBuffer);
            
        } catch (error) {
            console.error(error);
            return res.status(501).json({ 
                message: 'Error de implementación en la generación de PDF.', 
                error: (error as Error).message 
            });
        }
    }

    async saveCertificate(req: Request, res: Response) {
        try {
            const { registrationId, certificateUrl } = req.body;

            if (!registrationId || !certificateUrl) {
                return res.status(400).json({ message: 'Faltan campos (registrationId y certificateUrl).' });
            }

            const registrationIdNumber = parseInt(registrationId);
            
            const detalle = await certificadoService.saveCertificateUrl(registrationIdNumber, certificateUrl);
            return res.json({ message: 'URL del certificado guardada con éxito.', detalle });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                message: 'Error al guardar la URL del certificado.', 
                error: (error as Error).message 
            });
        }
    }
}