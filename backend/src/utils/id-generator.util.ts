import prisma from '../config/database';

/**
 * Genera un ID único para eventos
 * Formato: EVT + timestamp de 6 dígitos
 */
export async function generateEventoId(): Promise<string> {
  const timestamp = Date.now().toString().slice(-6);
  const id = `EVT${timestamp}`;
  
  // Verificar que no exista
  const exists = await prisma.eventos.findUnique({
    where: { id_evt: id }
  });
  
  if (exists) {
    // Si existe, intentar de nuevo con un número aleatorio
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `EVT${random}${timestamp.slice(-3)}`;
  }
  
  return id;
}

/**
 * Genera un ID único para detalles de eventos
 * Formato: DET + timestamp de 7 dígitos
 */
export async function generateDetalleId(): Promise<string> {
  const timestamp = Date.now().toString().slice(-7);
  const id = `DET${timestamp}`;
  
  // Verificar que no exista
  const exists = await prisma.detalle_eventos.findUnique({
    where: { id_det: id }
  });
  
  if (exists) {
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `DET${random}${timestamp.slice(-5)}`;
  }
  
  return id;
}
