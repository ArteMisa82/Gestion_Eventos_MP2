import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

// ===========================
//   INTERFAZ DE ORDEN
// ===========================
export interface OrderData {
    num_orden: number;
    nom_evt: string;
    val_evt: number;
    tip_par: string;
    fec_limite: string;
    metodos_pago: string;

    nom_per: string;
    ape_per: string;
    ced_per: string | null;
}

// ===========================
//   RUTA CORRECTA DEL LOGO
// ===========================
const LOGO_PATH = path.join(__dirname, 'logo_UTA.png');

console.log("Ruta del logo:", LOGO_PATH);
console.log("Existe:", fs.existsSync(LOGO_PATH));

// ===========================
//   GENERAR PDF
// ===========================
export const generateOrderPdf = (data: OrderData): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        const buffers: Buffer[] = [];
        doc.on('data', b => buffers.push(b));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        // ===============================
        // ENCABEZADO
        // ===============================
        const startY = 40;

        try {
            if (fs.existsSync(LOGO_PATH)) {
                doc.image(LOGO_PATH, 50, startY, { width: 70 });
            } else {
                console.warn("⚠ Logo no encontrado:", LOGO_PATH);
            }
        } catch (err) {
            console.warn("❌ No se pudo cargar el logo:", err);
        }

        doc.fillColor("black")
            .font("Helvetica-Bold")
            .fontSize(16)
            .text("Universidad Técnica De Ambato - U.T.A", 140, startY + 5);

        doc.font("Helvetica")
            .fontSize(10)
            .text("Dirección: Av. Colombia y Chile | Teléfono: 555-0123", 140, startY + 25);

        const blockX = 380;

        const infoY = startY + 45;  // 🔥 Lo baja debajo de la dirección

        doc.font("Helvetica-Bold")
            .fontSize(14)
            .text("RUC: 1860001450001", blockX, infoY);

        doc.font("Helvetica")
            .fontSize(11)
            .text(`ORDEN DE PAGO: ${data.num_orden}`, blockX, infoY + 20)
            .text(`Fecha Límite: ${data.fec_limite}`, blockX, infoY + 40);

        // ===============================
        // DATOS DEL ESTUDIANTE
        // ===============================
        const datosY = startY + 90;

        doc.font("Helvetica-Bold")
            .fontSize(12)
            .text("RAZÓN SOCIAL / Nombres y Apellidos:", 50, datosY);

        doc.font("Helvetica")
            .fontSize(11)
            .text(`${data.nom_per} ${data.ape_per}`, 50, datosY + 18);

        const idY = datosY + 10;   // 👈🔥 Ajuste: baja un poco

        doc.font("Helvetica-Bold")
            .text("Identificación:", 350, idY);

        doc.font("Helvetica")
            .text(`${data.ced_per ?? ""}`, 350, idY + 18);

        // ===============================
        // DETALLES DE INSCRIPCIÓN
        // ===============================
        const detalleY = datosY + 60;

        doc.font("Helvetica-Bold")
            .fontSize(12)
            .text("DETALLES DE INSCRIPCIÓN", 50, detalleY);

        doc.font("Helvetica")
            .fontSize(10)
            .text(`Concepto: Inscripción a ${data.nom_evt}`, 50, detalleY + 20)
            .text(`Tipo de Participante: ${data.tip_par}`, 50, detalleY + 35);

        // ===============================
        // TABLA DE VALORES
        // ===============================
        const tableTop = detalleY + 70;
        const col1X = 50;
        const col2X = 380;
        const col3X = 490;
        const tableWidth = 510;

        doc.rect(col1X, tableTop, tableWidth, 22).fill('#CCCCCC');
        doc.fillColor("black")
            .font("Helvetica-Bold")
            .fontSize(10)
            .text("CÓD. PRINCIPAL / DESCRIPCIÓN", col1X + 5, tableTop + 6)
            .text("VALOR UNITARIO", col2X, tableTop + 6, { width: 100, align: "right" })
            .text("PRECIO TOTAL", col3X, tableTop + 6, { width: 70, align: "right" });

        const rowY = tableTop + 22;

        doc.rect(col1X, rowY, tableWidth, 22).fill('white').stroke();
        doc.fillColor("black")
            .font("Helvetica")
            .text("Inscripción al Evento", col1X + 5, rowY + 6)
            .text(`$${data.val_evt.toFixed(2)}`, col2X, rowY + 6, { width: 100, align: "right" })
            .text(`$${data.val_evt.toFixed(2)}`, col3X, rowY + 6, { width: 70, align: "right" });

        // ===============================
        // SUBTOTALES
        // ===============================
        let currentY = rowY + 40;
        const subtotalX = 380;

        const addValue = (label: string, value: number, bold = false) => {
            doc.font(bold ? "Helvetica-Bold" : "Helvetica")
                .fontSize(10)
                .text(label, subtotalX, currentY, { width: 120 })
                .text(`$${value.toFixed(2)}`, subtotalX + 120, currentY, {
                    width: 60, align: "right"
                });
            currentY += 15;
        };

        addValue("Subtotal Base IVA 0%", data.val_evt);
        addValue("Subtotal:", data.val_evt);
        addValue("IVA:", 0);
        addValue("Descuento:", 0);

        doc.rect(subtotalX, currentY, 180, 20).fill('#DDDDDD');
        doc.fillColor("black")
            .font("Helvetica-Bold")
            .fontSize(12)
            .text("TOTAL:", subtotalX + 5, currentY + 3)
            .text(`$${data.val_evt.toFixed(2)}`, subtotalX + 120, currentY + 3, {
                width: 60, align: "right"
            });

        // ===============================
        // INSTRUCCIONES
        // ===============================
        doc.fillColor("black")
            .fontSize(12)
            .text("INSTRUCCIONES DE PAGO:", 50, currentY + 40);

        let instY = currentY + 60;

        const instrucciones = data.metodos_pago.split("\n");
        instrucciones.forEach(line => {
            doc.fontSize(10).text(line.trim(), 50, instY);
            instY += 14;
        });

        doc.end();
    });
};
