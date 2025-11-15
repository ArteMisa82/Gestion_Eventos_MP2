// backend/src/services/certificado.service.ts

import prisma from '../config/database'; 
import PDFDocument from 'pdfkit'; 
import { Writable } from 'stream'; 

export class CertificadoService {

    async getCertificateData(registrationId: number) {
        const data = await prisma.registro_personas.findUnique({
            where: { num_reg_per: registrationId },
            select: {
                usuarios: {
                    select: {
                        nom_usu: true,
                        ape_usu: true,
                        ced_usu: true,
                    }
                },
                registro_evento: {
                    select: {
                        detalle_eventos: {
                            select: {
                                eventos: {
                                    select: {
                                        nom_evt: true, 
                                        fec_evt: true, 
                                    }
                                },
                                hor_det: true, 
                            }
                        }
                    }
                }
            }
        });

        if (!data) {
            throw new Error(`Registro de persona ID ${registrationId} no encontrado.`);
        }

        return data;
    }

    async saveCertificateUrl(registrationId: number, certificateUrl: string) {
        let informe = await prisma.informes.findFirst({
            where: { num_reg_per: registrationId },
        });

        if (!informe) {
            informe = await prisma.informes.create({
                data: { num_reg_per: registrationId }
            });
        }
        
        const detalle = await prisma.detalle_informe.create({ 
            data: {
                num_inf: informe.num_inf, 
                not_det: 0.0, 
                pdf_cer: certificateUrl
            }
        });

        return detalle;
    }

    async generateCertificate(data: any): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            
            const doc = new PDFDocument({ 
                layout: 'landscape', 
                size: 'A4' 
            });

            const buffers: Buffer[] = [];
            
            doc.on('data', (chunk: Buffer) => {
                buffers.push(chunk);
            });

            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });

            doc.on('error', (err) => {
                reject(err);
            });


            const fullName = `${data.usuarios.nom_usu} ${data.usuarios.ape_usu}`;
            const eventDetails = data.registro_evento.detalle_eventos; 
            const eventName = eventDetails.eventos.nom_evt;
            const eventHours = eventDetails.hor_det;
            const eventDate = new Date(eventDetails.eventos.fec_evt).toLocaleDateString('es-ES', { 
                year: 'numeric', month: 'long', day: 'numeric' 
            });

            const pageWidth = doc.page.width;
            const textCenter = pageWidth / 2;

            doc
                .font('Helvetica-Bold')
                .fontSize(28)
                .fillColor('#333')
                .text('CERTIFICADO DE PARTICIPACIÓN', 0, 100, { align: 'center' })
                .moveDown(1.5);

            doc
                .font('Helvetica')
                .fontSize(16)
                .text('Otorgado a:', { align: 'center' })
                .moveDown(0.5);

            doc
                .font('Helvetica-Bold')
                .fontSize(36)
                .fillColor('#0056b3')
                .text(fullName.toUpperCase(), { align: 'center' })
                .moveDown(1.5);
            
            doc
                .font('Helvetica')
                .fontSize(16)
                .fillColor('#333')
                .text(`Por su valiosa participación en el evento:`, { align: 'center' })
                .moveDown(0.5)
                .font('Helvetica-Bold')
                .fontSize(20)
                .text(eventName.toUpperCase(), { align: 'center' })
                .moveDown(0.5);

            doc
                .font('Helvetica')
                .fontSize(14)
                .text(`Con una duración de ${eventHours} horas, realizado el día ${eventDate}.`, { align: 'center' })
                .moveDown(3);

            // Líneas de firma (opcional)
            const signatureY = doc.y;
            doc.moveTo(textCenter - 100, signatureY)
               .lineTo(textCenter + 100, signatureY)
               .stroke();
            
            doc.font('Helvetica').fontSize(12)
               .text('Firma del Responsable', textCenter - 100, signatureY + 5, { width: 200, align: 'center' });

            doc.end();
        });
    }
}