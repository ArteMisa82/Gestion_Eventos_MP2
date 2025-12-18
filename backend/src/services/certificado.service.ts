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


const FISEI_LOGO_PATH = path.join(LOGOS_DIR, 'FiseiUTA.png');
const HEADER_PATH = path.join(LOGOS_DIR, 'header.png');

// Sponsors
const CEDIA_SPONSOR_PATH = path.join(LOGOS_DIR, 'cediaSponsor.png');
const REDI_SPONSOR_PATH = path.join(LOGOS_DIR, 'RediUtaSponsor.png');
const SCOPUS_SPONSOR_PATH = path.join(LOGOS_DIR, 'Scopus_logoSponsor.png');
const DIDE_SPONSOR_PATH = path.join(LOGOS_DIR, 'dideSponsor.jpg');

// --- Rutas de las fuentes elegantes ---
// Carpeta: backend/fonts
const FONTS_DIR = path.join(__dirname, '..', '..', 'fonts');
const FONT_BODY = path.join(FONTS_DIR, 'Lora-Regular.ttf');
const FONT_BODY_BOLD = path.join(FONTS_DIR, 'Lora-Bold.ttf');
const FONT_TITLE = path.join(FONTS_DIR, 'PlayfairDisplay-Bold.ttf');

// --- Ruta base para certificados (misma que en el controller) ---
const CERTIFICATES_BASE_DIR = 'C:\\Users\\user\\Documents\\certificado';

// Solo dejamos el texto de la firma
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
        razon = `la Asistencia (${asistenciaActual * 100}%) es menor al ${ASISTENCIA_MINIMA * 100
          }% requerido.`;
      }
      throw new Error(`El participante no cumple con ${razon}`);
    }

    // 🎨 DISEÑO DEL CERTIFICADO (similar a CSEI)
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ layout: 'landscape', size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // ====== REGISTRO DE FUENTES (con fallback) ======
      let BODY_FONT = 'Helvetica';
      let BODY_FONT_BOLD = 'Helvetica-Bold';
      let TITLE_FONT = 'Helvetica-Bold';

      if (fs.existsSync(FONT_BODY)) {
        doc.registerFont('Body', FONT_BODY);
        BODY_FONT = 'Body';
      }
      if (fs.existsSync(FONT_BODY_BOLD)) {
        doc.registerFont('BodyBold', FONT_BODY_BOLD);
        BODY_FONT_BOLD = 'BodyBold';
      }
      if (fs.existsSync(FONT_TITLE)) {
        doc.registerFont('Title', FONT_TITLE);
        TITLE_FONT = 'Title';
      }

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
      const margin = 40;

      const borderTop = margin / 2;
      const borderBottom = pageHeight - margin / 2;
      const borderLeft = margin / 2;
      const borderRight = pageWidth - margin / 2;

      const FULL_X = borderLeft;
      const FULL_W = borderRight - borderLeft;

      // === MARCO EXTERIOR ===
      doc
        .lineWidth(2)
        .rect(borderLeft, borderTop, FULL_W, borderBottom - borderTop)
        .stroke('#999999');

      // === HEADER ROJO O IMAGEN ===
      const headerHeight = 110;

      if (fs.existsSync(HEADER_PATH)) {
        // Imagen de header completa (ya incluye textos de universidad)
        doc.image(HEADER_PATH, borderLeft, borderTop, {
          width: FULL_W,
          height: headerHeight,
        });
      } else {
        // Rectángulo rojo si no hay imagen
        doc
          .save()
          .rect(borderLeft, borderTop, FULL_W, headerHeight)
          .fill('#B1001A')
          .restore();
      }

      // Logos en el header
      // Logo FISEI (más grande en el header)
      const logoSize = 200; // antes 75

      if (fs.existsSync(FISEI_LOGO_PATH)) {
        // 🔼 Más arriba: antes borderTop + 20
        doc.image(FISEI_LOGO_PATH, borderRight - logoSize - 85, borderTop + -22, {
          width: logoSize,
        });
      }

      // === CONTENIDO PRINCIPAL ===
      let y = borderTop + headerHeight + 25;

      // Nombre del evento grande (similar a "CSEI IV")
      doc
        .font(TITLE_FONT)
        .fontSize(28)
        .fillColor('#333366')
        .text(eventName.toUpperCase(), FULL_X, y, {
          width: FULL_W,
          align: 'center',
        });

      y = doc.y + 8;

      // Frase tipo certificado
      // Frase tipo certificado (color negro)
      doc
        .font(TITLE_FONT)
        .fontSize(20)
        .fillColor('#000000') // negro
        .text('EL PRESENTE CERTIFICADO SE OTORGA A', FULL_X, y, {
          width: FULL_W,
          align: 'center',
        });

      y = doc.y + 15;

      // Etiqueta tipo "TO:"
      doc
        .font(BODY_FONT_BOLD)
        .fontSize(16)
        .fillColor('#000000')
        .text('A:', borderLeft + 80, y + 4);

      // Nombre grande alineado con "A:"
      doc
        .font(TITLE_FONT)
        .fontSize(26)
        .text(fullName.toUpperCase(), borderLeft + 120, y, {
          width: FULL_W - 160,
          align: 'left',
        });

      // Línea bajo el nombre
      const nameLineY = doc.y + 5;
      doc
        .moveTo(borderLeft + 70, nameLineY)
        .lineTo(borderRight - 70, nameLineY)
        .lineWidth(1)
        .stroke('#000000');

      y = nameLineY + 20;

      // Texto descriptivo
      doc
        .font(BODY_FONT)
        .fontSize(11.5)
        .fillColor('#000000')
        .text(
          `Por su participación en el evento "${eventName}", ` +
          `con una duración de ${eventHours} horas académicas, ` +
          `realizado el ${eventDate}.`,
          FULL_X,   // centrado horizontalmente
          y,
          {
            width: FULL_W, // usa todo el ancho
            align: 'center', // centrado
          }
        );


      // === BLOQUE DE NOTA / ASISTENCIA (opcional) ===
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
        if (nota && asistencia) infoAdicional = `${nota} · ${asistencia}`;
        else if (nota) infoAdicional = nota;
        else if (asistencia) infoAdicional = asistencia;

        if (infoAdicional) {
          const boxY = doc.y + 20;
          const boxHeight = 36;
          const boxWidth = FULL_W / 2;
          const boxX = borderLeft + (FULL_W - boxWidth) / 2;

          doc
            .save()
            .roundedRect(boxX, boxY, boxWidth, boxHeight, 8)
            .fill('#f8f8ff')
            .restore();

          doc
            .font(BODY_FONT)
            .fontSize(11)
            .fillColor('#333366')
            .text(infoAdicional, boxX + 10, boxY + 10, {
              width: boxWidth - 20,
              align: 'center',
            });

          y = boxY + boxHeight + 10;
        } else {
          y = doc.y + 30;
        }
      } else {
        y = doc.y + 40;
      }

      // === FIRMA CENTRAL ===
      const signatureY = borderBottom - 100;

      doc
        .moveTo(pageWidth / 2 - 120, signatureY)
        .lineTo(pageWidth / 2 + 120, signatureY)
        .lineWidth(1)
        .stroke('#555555');

      doc
        .font(BODY_FONT)
        .fontSize(11)
        .fillColor('#000000')
        .text(
          FIRMA_COORDINADOR_TEXT,
          pageWidth / 2 - 120,
          signatureY + 5,
          {
            width: 240,
            align: 'center',
          }
        );

      // === SPONSORS ABAJO (fila centrada) ===
      const sponsors: string[] = [];
      if (fs.existsSync(CEDIA_SPONSOR_PATH)) sponsors.push(CEDIA_SPONSOR_PATH);
      if (fs.existsSync(REDI_SPONSOR_PATH)) sponsors.push(REDI_SPONSOR_PATH);
      if (fs.existsSync(SCOPUS_SPONSOR_PATH)) sponsors.push(SCOPUS_SPONSOR_PATH);
      if (fs.existsSync(DIDE_SPONSOR_PATH)) sponsors.push(DIDE_SPONSOR_PATH);

      if (sponsors.length > 0) {
        const sponsorWidth = 70;
        const gap = 25;
        const totalWidth =
          sponsors.length * sponsorWidth + (sponsors.length - 1) * gap;
        let x = (pageWidth - totalWidth) / 2;
        const sponsorY = borderBottom - 55;

        sponsors.forEach((logoPath) => {
          doc.image(logoPath, x, sponsorY, { width: sponsorWidth });
          x += sponsorWidth + gap;
        });
      }

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
