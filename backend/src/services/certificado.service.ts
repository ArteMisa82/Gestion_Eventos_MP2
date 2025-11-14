// backend/src/services/certificado.service.ts

import prisma from '../config/database'; 

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

    // Requisito 4: Guarda la URL del certificado en detalle_informe.pdf_cer
    async saveCertificateUrl(registrationId: number, certificateUrl: string) {
        // 1. Buscamos o creamos el Informe (FK a registro_personas)
        let informe = await prisma.informes.findFirst({
            where: { num_reg_per: registrationId },
        });

        if (!informe) {
            informe = await prisma.informes.create({
                data: { num_reg_per: registrationId }
            });
        }
        
        // 2. Insertamos el registro en detalle_informe con la URL del certificado.
        // CORRECCIÓN: Usamos 'detalle_informe' ya que así se llama el modelo en el schema.
        const detalle = await prisma.detalle_informe.create({ 
            data: {
                num_inf: informe.num_inf, 
                // Asumiendo que la nota es obligatoria, usa un valor por defecto
                not_det: 0.0, 
                pdf_cer: certificateUrl
            }
        });

        return detalle;
    }

    // Requisito 2: Lógica para generar el PDF (se implementa después con librerías como pdfkit)
    async generateCertificate(data: any): Promise<Buffer> {
        // Lógica de generación del PDF (Placeholder)
        // Por ahora, solo devuelve un Buffer vacío o un mensaje de error
        throw new Error("La generación del PDF no está implementada aún.");
    }
}