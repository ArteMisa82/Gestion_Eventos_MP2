export interface Solicitud {
  id: number;
  numeroSolicitud: string;
  titulo: string;
  descripcion: string;
  tipoUsuario: "usuarioFinal" | "desarrollador";
  modulos?: string[];
  estado: "recibido" | "revision" | "aprobado" | "rechazado";
  comentarios?: string;
}
