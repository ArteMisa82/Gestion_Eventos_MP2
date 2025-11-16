import PDFDocument from 'pdfkit';

interface OrderData {
    num_orden: number;
    nom_evt: string;
    val_evt: number;
    tip_par: string;
    fec_limite: string;
    metodos_pago: string;
}

export const generateOrderPdf = (data: OrderData): Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const buffers: Buffer[] = [];

        doc.on('data', (buffer) => buffers.push(buffer));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', reject);

        doc.fontSize(20).text('ORDEN DE PAGO DE INSCRIPCIÓN', { align: 'center' });
        doc.moveDown();

        doc.fontSize(12).text(`N° de Orden: ${data.num_orden}`, { align: 'left' });
        doc.text(`Fecha Límite de Pago: ${data.fec_limite}`, { align: 'right' });
        doc.moveDown(2);

        doc.fontSize(14).text('DETALLES DEL EVENTO', { underline: true });
        doc.moveDown();
        doc.fontSize(12).text(`Evento: ${data.nom_evt}`);
        doc.text(`Tipo de Participante: ${data.tip_par}`);
        doc.moveDown();

        // Valor a pagar en rojo, con fuente bold
        doc.font('Helvetica-Bold')
            .fontSize(18)
            .fillColor('red')
            .text(`VALOR A PAGAR: $${Number(data.val_evt).toFixed(2)}`, { align: 'center' });
        doc.fillColor('black').font('Helvetica');
        doc.moveDown(2);

        doc.fontSize(14).text('INSTRUCCIONES DE PAGO', { underline: true });
        doc.moveDown();

        // Viñetas manuales
        data.metodos_pago.split('\n').forEach(line => {
            doc.fontSize(12).text(`• ${line}`);
        });

        doc.moveDown();

        doc.fontSize(10).text(
            'IMPORTANTE: Debe adjuntar esta orden y el comprobante de pago en el portal de inscripción para finalizar el proceso.',
            { align: 'center' }
        );

        doc.end();
    });
};
