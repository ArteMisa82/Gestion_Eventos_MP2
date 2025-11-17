// src/utils/generarCertificado.ts

export async function generarCertificado(nombre: string, curso: string) {
  // Crear un PDF vacío al estilo "placeholder"
  const pdfContent = `
    Certificado Placeholder
    Estudiante: ${nombre}
    Curso: ${curso}
    (Este PDF será generado por backend más adelante)
  `;

  // Convertimos el texto en un Blob simulando un PDF
  const encoder = new TextEncoder();
  return encoder.encode(pdfContent);
}
