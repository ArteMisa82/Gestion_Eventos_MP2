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

// Función segura para asegurar que la carpeta exista
function ensureDirectoryExists(directory: string) {
  try {
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
      console.log(`📁 Carpeta creada: ${directory}`);
    }
  } catch (err) {
    console.error('❌ Error creando carpeta de certificados:', err);
    throw new Error(`No se pudo crear la carpeta de certificados: ${directory}`);
  }
}

export class CertificadoController {
  /**
   * Flujo principal: Obtiene datos, valida condiciones (Pago, Nota, Asistencia) y genera el PDF.
   */
  async generateCertificate(req: Request, res: Response) {
    const registrationIdParam = req.params.registrationId as string;

    try {
      const registrationId = parseInt(registrationIdParam, 10);

      if (isNaN(registrationId)) {
        return res.status(400).json({ message: 'ID de registro inválido.' });
      }

      // 1. Obtener y validar datos de la DB
      const data = await certificadoService.getCertificateData(registrationId);

      // 2. Generar el certificado (incluye la lógica de validación)
      const certificateBuffer = await certificadoService.generateCertificate(data);

      // 3. Enviar el PDF como descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=certificado_${registrationId}.pdf`
      );
      res.send(certificateBuffer);
    } catch (error) {
      console.error(error);
      const errorMessage = (error as Error).message;
      let statusCode = 500;

      if (errorMessage.includes('no encontrado')) {
        statusCode = 404;
      } else if (
        errorMessage.includes('pago requerido') ||
        errorMessage.includes('no alcanza') ||
        errorMessage.includes('no cumple')
      ) {
        statusCode = 403;
      }

      return res.status(statusCode).json({
        message: `Error al generar el certificado: ${errorMessage}`,
        error: errorMessage,
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
        return res
          .status(400)
          .json({ message: 'Faltan datos del certificado (num_reg_per).' });
      }

      const registrationId = data.num_reg_per;

      // Si no viene PDF, se puede generar automáticamente aquí
      let certificateUrl = data.pdfUrl;
      if (!certificateUrl) {
        // Generamos PDF temporal
        const pdfBuffer = await certificadoService.generateCertificate(data);

        // Usar la ruta absoluta definida y asegurar que exista
        const dir = CERTIFICATES_BASE_DIR;
        ensureDirectoryExists(dir);

        const filePath = path.join(dir, `certificado_${registrationId}.pdf`);
        fs.writeFileSync(filePath, pdfBuffer);

        // URL relativa accesible para el cliente
        certificateUrl = `/certificados/certificado_${registrationId}.pdf`;
      }

      // Guardamos la URL en la DB
      let informe = await prisma.informes.findFirst({
        where: { num_reg_per: registrationId },
      });

      if (!informe) {
        informe = await prisma.informes.create({
          data: { num_reg_per: registrationId },
        });
      }

      const detalle = await prisma.detalle_informe.create({
        data: { num_inf: informe.num_inf, not_det: 0.0, pdf_cer: certificateUrl },
      });

      return res.json({
        message: 'Certificado generado y URL guardada con éxito.',
        certificateUrl,
        detalle,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: 'Error al guardar el certificado.',
        error: (error as Error).message,
      });
    }
  }

  /**
   * Verificar si existe un certificado para un registro y si el archivo PDF está disponible.
   */
  async verifyCertificate(req: Request, res: Response) {
    const registrationIdParam = req.params.registrationId as string;

    try {
      const registrationId = parseInt(registrationIdParam, 10);

      if (isNaN(registrationId)) {
        return res.status(400).json({
          valido: false,
          motivo: 'ID de registro inválido.',
          certificado: null,
        });
      }

      // Buscar el certificado asociado al num_reg_per
      const certificado = await prisma.detalle_informe.findFirst({
        where: {
          informes: {
            num_reg_per: registrationId,
          },
          pdf_cer: {
            not: null,
          },
        },
        orderBy: {
          num_det_inf: 'desc',
        },
        select: {
          num_det_inf: true,
          pdf_cer: true,
          not_det: true,
        },
      });

      if (!certificado) {
        return res.status(404).json({
          valido: false,
          motivo: 'No existe certificado registrado para este participante.',
          certificado: null,
        });
      }

      const url = certificado.pdf_cer as string;

      // Nombre de archivo esperado según la convención usada
      const expectedFileName = `certificado_${registrationId}.pdf`;
      const filePath = path.join(CERTIFICATES_BASE_DIR, expectedFileName);

      let valido = false;
      let motivo = 'Certificado válido.';

      try {
        fs.accessSync(filePath, fs.constants.R_OK);
        valido = true;
      } catch (err) {
        valido = false;
        motivo = (err as Error).message;
      }

      return res.status(200).json({
        valido,
        motivo,
        certificado: {
          id_det_inf: certificado.num_det_inf,
          url,
          nota_registrada: certificado.not_det,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        valido: false,
        motivo: (error as Error).message,
        certificado: null,
      });
    }
  }
}
