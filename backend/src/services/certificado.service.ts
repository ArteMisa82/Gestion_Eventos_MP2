// backend/src/services/certificado.service.ts

import fs from 'fs';
import prisma from '../config/database';
import PDFDocument from 'pdfkit';
import path from 'path'; // Necesario para construir rutas de archivos

// --- Rutas de las imágenes de logos ---
// Este archivo está en: backend/src/services
// Las imágenes están en: backend/logos
// => subimos dos niveles y entramos a logos
const LOGOS_DIR = path.join(__dirname, '..', '..', 'logos');

// Usa los nombres reales que tienes en la carpeta logos
const UTA_LOGO_PATH = path.join(LOGOS_DIR, 'logo_UTA.png');
const FISEI_LOGO_PATH = path.join(LOGOS_DIR, 'Default_Image.png');

// --- Ruta base para certificados (misma que en el controller) ---
const CERTIFICATES_BASE_DIR = 'C:\\Users\\user\\Documents\\certificado';

// --- Datos de Texto ---
const NOMBRE_UNIVERSIDAD = 'UNIVERSIDAD TÉCNICA DE AMBATO';
const NOMBRE_FACULTAD =
  'FACULTAD DE INGENIERÍA EN SISTEMAS ELECTRÓNICA E INDUSTRIAL';
const NOMBRE_CARRERA = 'CARRERA DE TECNOLOGÍAS DE LA INFORMACIÓN';
const FIRMA_COORDINADOR_TEXT = 'Firma del Coordinador';

// --- Función para asegurar carpeta ---
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

// --- Interfaces ---
interface UsuarioData {
  nom_usu: string;
  ape_usu: string;
  ced_usu: string | null;
}
interface EventoData {
  nom_evt: string;
  fec_evt: Date;
  cos_evt: string;
}
interface DetalleEventoData {
  hor_det: number;
  not_evt_det: number | null;
  asi_evt_det: number | null;
  eventos: EventoData;
}
interface RegistroEventoData {
  detalle_eventos: DetalleEventoData;
}

export interface CertificateData {
  num_reg_per: number;
  usuarios: UsuarioData;
  registro_evento: RegistroEventoData;
  pagos: { pag_o_no: number | null }[];
}

const safeNumberConversion = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  return parseFloat(value.toString());
};

export class CertificadoService {
  async getCertificateData(registrationId: number): Promise<CertificateData> {
    const data = await prisma.registro_personas.findUnique({
      where: { num_reg_per: registrationId },
      select: {
        num_reg_per: true,
        usuarios: { select: { nom_usu: true, ape_usu: true, ced_usu: true } },
        registro_evento: {
          select: {
            detalle_eventos: {
              select: {
                hor_det: true,
                not_fin_evt: true,
                asi_evt_det: true,
                eventos: {
                  select: { nom_evt: true, fec_evt: true, cos_evt: true },
                },
              },
            },
          },
        },
        pagos: { select: { pag_o_no: true } },
      },
    });

    if (!data)
      throw new Error(
        `Registro de persona ID ${registrationId} no encontrado.`
      );

    const formattedData: CertificateData = {
      num_reg_per: data.num_reg_per,
      usuarios: data.usuarios,
      registro_evento: {
        detalle_eventos: {
          ...data.registro_evento.detalle_eventos,
          hor_det:
            safeNumberConversion(data.registro_evento.detalle_eventos.hor_det) ??
            0,
          not_evt_det: safeNumberConversion(
            data.registro_evento.detalle_eventos.not_fin_evt
          ),
          asi_evt_det: safeNumberConversion(
            data.registro_evento.detalle_eventos.asi_evt_det
          ),
        },
      },
      pagos: data.pagos,
    } as CertificateData;

    return formattedData;
  }

  async generateCertificate(data: CertificateData): Promise<Buffer> {
    const detalle = data.registro_evento.detalle_eventos;
    const costoEvento = detalle.eventos.cos_evt;

    const costoLimpio = costoEvento ? costoEvento.trim() : null;
    const eventoEsGratuito =
      !costoLimpio ||
      costoLimpio.toUpperCase() === 'GRATUITO' ||
      costoLimpio === 'GRATIS' ||
      costoLimpio === '0';

    // Validación de pago si NO es gratuito
    if (!eventoEsGratuito) {
      const pagoCompleto = data.pagos.some(
        (p: { pag_o_no: number | null }) => {
          const estadoPago = p.pag_o_no;
          return (
            estadoPago !== null &&
            estadoPago !== undefined &&
            parseInt(estadoPago.toString()) === 1
          );
        }
      );

      if (!pagoCompleto) {
        throw new Error(
          'El participante no ha completado el pago requerido para el certificado.'
        );
      }
    }

    const NOTA_MINIMA = 70;
    const ASISTENCIA_MINIMA = 0.8;
    let esAptoParaCertificado = false;

    const notaAprobada =
      detalle.not_evt_det !== null && detalle.not_evt_det >= NOTA_MINIMA;
    const asistenciaActual = detalle.asi_evt_det ?? 1.0;
    const asistenciaAprobada = asistenciaActual >= ASISTENCIA_MINIMA;

    if (detalle.not_evt_det !== null && detalle.asi_evt_det !== null) {
      esAptoParaCertificado = notaAprobada && asistenciaAprobada;
    } else if (detalle.not_evt_det !== null) {
      esAptoParaCertificado = notaAprobada;
    } else if (detalle.asi_evt_det !== null) {
      esAptoParaCertificado = asistenciaAprobada;
    } else {
      esAptoParaCertificado = true;
    }

    if (!esAptoParaCertificado) {
      let razon = 'las condiciones de Nota/Asistencia.';
      if (detalle.not_evt_det !== null && !notaAprobada) {
        razon = `la Nota (${detalle.not_evt_det}) es menor al ${NOTA_MINIMA}% requerido.`;
      } else if (detalle.asi_evt_det !== null && !asistenciaAprobada) {
        razon = `la Asistencia (${asistenciaActual * 100}%) es menor al ${
          ASISTENCIA_MINIMA * 100
        }% requerido.`;
      }
      throw new Error(`El participante no cumple con ${razon}`);
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const fullName = `${data.usuarios.nom_usu} ${data.usuarios.ape_usu}`;
      const eventName = detalle.eventos.nom_evt;
      const eventHours = detalle.hor_det;
      const eventDate = new Date(detalle.eventos.fec_evt).toLocaleDateString(
        'es-ES',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }
      );

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const logoWidth = 80;
      const margin = 50;

      // 🖼️ Logos solo si existen (para no romper el PDF si falta algún archivo)
      if (fs.existsSync(UTA_LOGO_PATH)) {
        doc.image(UTA_LOGO_PATH, margin, margin, { width: logoWidth });
      }
      if (fs.existsSync(FISEI_LOGO_PATH)) {
        doc.image(FISEI_LOGO_PATH, pageWidth - margin - logoWidth, margin, {
          width: logoWidth,
        });
      }

      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#000')
        .text(NOMBRE_UNIVERSIDAD, margin + logoWidth + 10, margin + 5, {
          width: pageWidth - (margin + logoWidth + 10) * 2,
          align: 'center',
        });
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .text(NOMBRE_FACULTAD, margin + logoWidth + 10, undefined, {
          width: pageWidth - (margin + logoWidth + 10) * 2,
          align: 'center',
        });
      doc
        .font('Helvetica')
        .fontSize(9)
        .text(NOMBRE_CARRERA, margin + logoWidth + 10, undefined, {
          width: pageWidth - (margin + logoWidth + 10) * 2,
          align: 'center',
        })
        .moveDown(1.5);

      doc
        .font('Helvetica-Bold')
        .fontSize(28)
        .fillColor('#333')
        .text('CERTIFICADO DE PARTICIPACIÓN', 0, doc.y + 20, {
          align: 'center',
        })
        .moveDown(2);

      doc
        .font('Helvetica')
        .fontSize(16)
        .fillColor('#000')
        .text(`Otorgado a: ${fullName}`, { align: 'center' })
        .moveDown(1);

      doc
        .font('Helvetica')
        .fontSize(14)
        .text(`Por haber participado en el evento: ${eventName}`, {
          align: 'center',
        })
        .text(`Con una duración de ${eventHours} horas académicas.`, {
          align: 'center',
        })
        .text(`Realizado el ${eventDate}.`, { align: 'center' })
        .moveDown(2);

      if (detalle.not_evt_det !== null || detalle.asi_evt_det !== null) {
        const nota =
          detalle.not_evt_det !== null
            ? `Nota: ${detalle.not_evt_det}`
            : '';
        const asistencia =
          detalle.asi_evt_det !== null
            ? `Asistencia: ${(detalle.asi_evt_det * 100).toFixed(2)}%`
            : '';

        let infoAdicional = '';
        if (nota && asistencia) infoAdicional = `${nota} y ${asistencia}.`;
        else if (nota) infoAdicional = `${nota}.`;
        else if (asistencia) infoAdicional = `${asistencia}.`;

        if (infoAdicional) {
          doc
            .font('Helvetica')
            .fontSize(12)
            .text(`(Detalles: ${infoAdicional})`, { align: 'center' })
            .moveDown(1);
        }
      }

      const signatureY = pageHeight - margin - 50;
      doc
        .moveTo(pageWidth / 2 - 100, signatureY)
        .lineTo(pageWidth / 2 + 100, signatureY)
        .stroke();

      doc
        .font('Helvetica')
        .fontSize(10)
        .text(FIRMA_COORDINADOR_TEXT, pageWidth / 2 - 100, signatureY + 5, {
          width: 200,
          align: 'center',
        });

      doc.end();
    });
  }

  async saveCertificateUrl(registrationId: number, certificateUrl: string) {
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

    return detalle;
  }

  // --- MÉTODO COMPLETO: Generar, guardar y registrar URL ---
  async generateAndSaveCertificate(registrationId: number): Promise<string> {
    const certificateData = await this.getCertificateData(registrationId);
    const buffer = await this.generateCertificate(certificateData);

    // Asegurar carpeta base
    ensureDirectoryExists(CERTIFICATES_BASE_DIR);

    const fileName = `certificado_${registrationId}.pdf`;
    const filePath = path.join(CERTIFICATES_BASE_DIR, fileName);
    fs.writeFileSync(filePath, buffer);

    const certificateUrl = `/certificados/${fileName}`;
    await this.saveCertificateUrl(registrationId, certificateUrl);

    return certificateUrl;
  }
}
