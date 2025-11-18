// backend/src/controllers/certificado.controller.ts

import { Request, Response } from 'express';
import { CertificadoService, CertificateData } from '../services/certificado.service'; 
import fs from 'fs';
import path from 'path';
import prisma from '../config/database'; 
const certificadoService = new CertificadoService();

// Define la ruta base estática deseada para el directorio de certificados
// NOTA: En un entorno de producción o real, usar una ruta relativa al proyecto
// o una variable de entorno es más robusto.
const CERTIFICATES_BASE_DIR = 'C:\\Users\\user\\Documents\\certificado'; 

export class CertificadoController {

    /**
     * Flujo principal: Obtiene datos, valida condiciones (Pago, Nota, Asistencia) y genera el PDF.
     */
    async generateCertificate(req: Request, res: Response) {
        const registrationIdParam = req.params.registrationId as string;

        try {
            const registrationId = parseInt(registrationIdParam);
            
            if (isNaN(registrationId)) {
                return res.status(400).json({ message: 'ID de registro inválido.' });
            }

            // 1. Obtener y validar datos de la DB
            const data = await certificadoService.getCertificateData(registrationId);
            
            // 2. Generar el certificado (incluye la lógica de validación)
            const certificateBuffer = await certificadoService.generateCertificate(data); 

            // 3. Enviar el PDF como descarga
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=certificado_${registrationId}.pdf`);
            res.send(certificateBuffer);
            
        } catch (error) {
            console.error(error);
            const errorMessage = (error as Error).message;
            let statusCode = 500;
            
            if (errorMessage.includes('no encontrado')) {
                statusCode = 404;
            } else if (errorMessage.includes('pago requerido') || errorMessage.includes('no alcanza')) {
                statusCode = 403;
            }

            return res.status(statusCode).json({ 
                message: `Error al generar el certificado: ${errorMessage}`, 
                error: errorMessage 
            });
        }
    }

    /**
     * Guarda la URL del certificado generado o lo genera si no viene PDF.
     */
    async saveCertificate(req: Request, res: Response) {
        try {
            const data: CertificateData & { pdfUrl?: string } = req.body;

            if (!data || !data.num_reg_per) {
                return res.status(400).json({ message: 'Faltan datos del certificado (num_reg_per).' });
            }

            const registrationId = data.num_reg_per;

            // Si no viene PDF, se puede generar automáticamente aquí
            let certificateUrl = data.pdfUrl;
            if (!certificateUrl) {
                // Generamos PDF temporal
                const pdfBuffer = await certificadoService.generateCertificate(data);

                // *************************************************************
                // CAMBIO CLAVE AQUÍ: Usar la ruta absoluta definida
                // *************************************************************
                const dir = CERTIFICATES_BASE_DIR;
                
                // Crear la carpeta 'certificado' si no existe
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                
                const filePath = path.join(dir, `certificado_${registrationId}.pdf`);
                fs.writeFileSync(filePath, pdfBuffer);
                
                // NOTA IMPORTANTE: La URL que guardas en la DB y envías al cliente
                // DEBE ser una ruta a la que el cliente pueda acceder.
                // Si usas una ruta de Windows (C:\Users\...), el cliente no podrá acceder.
                // Mantenemos la lógica de URL relativa para la DB por ahora, pero 
                // ten en cuenta que el archivo NO estará en `public/certificados`.
                certificateUrl = `/certificados/certificado_${registrationId}.pdf`; 
            }

            // Guardamos la URL en la DB
            // ... (resto del código de la DB es el mismo)
            let informe = await prisma.informes.findFirst({ where: { num_reg_per: registrationId } });
            if (!informe) {
                informe = await prisma.informes.create({ data: { num_reg_per: registrationId } });
            }

            const detalle = await prisma.detalle_informe.create({
                data: { num_inf: informe.num_inf, not_det: 0.0, pdf_cer: certificateUrl }
            });

            return res.json({ message: 'Certificado generado y URL guardada con éxito.', certificateUrl, detalle });

        } catch (error) {
            console.error(error);
            return res.status(500).json({ 
                message: 'Error al guardar el certificado.', 
                error: (error as Error).message 
            });
        }
    }
}