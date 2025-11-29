export interface SolicitudCambio {
  id_solicitud?: number;
  titulo: string;
  descripcion: string;
  usuarioId: number;
  estado?: 'pendiente' | 'aprobada' | 'rechazada';
  fechaCreacion?: Date;
}
