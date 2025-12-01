export type Estado =
  | "Pendiente"
  | "En revisión"
  | "Aprobado"
  | "RolloutProgramado"
  | "Implementado"
  | "Revertido"
  | "Rechazado"
  | "Cancelado";

export type Accion = {
  actorNombre: string;
  actorApellido: string;
  actorEmail: string;
  accion: string;
  comentario?: string;
  fecha: string;
};

export type Solicitud = {
  id: number;
  titulo: string;
  descripcion: string;
  justificacion?: string;

  modulos?: string[];
  clasificacion?: string;

  impactoDias?: number | null;
  estado: Estado;
  fecha: string;

  solicitanteNombre: string;
  solicitanteApellido?: string;
  solicitanteEmail: string;
  solicitanteContacto: string;

  prioridad: "Alta" | "Media" | "Baja";

  /** 👇 ESTE ES EL HISTORIAL OFICIAL */
  acciones?: Accion[];

  numeroSolicitud: string;

  impactoNoImplementar: string;
  tipoCambio: "Normal" | "Estandar" | "Emergencia";
  clasificacionCambio: string;
  recursosNecesarios: string;
  riesgos: string;
};

export const currentUser = {
  nombre: "Ana",
  apellido: "Gómez",
  email: "ana.gomez@example.com",
};

export const WINE = "#6e1f3f";

export function getEstadoStyles(estado: Estado) {
  switch (estado) {
    case "Pendiente":
      return { side: "#D1D5DB", pill: "bg-gray-100 text-gray-700" };
    case "En revisión":
      return {
        side: WINE,
        pillInline: {
          backgroundColor: "rgba(110,31,63,0.12)",
          color: WINE,
          border: "1px solid rgba(110,31,63,0.18)",
          unicodeBidi: "isolate",
        },
      };
    case "Aprobado":
      return { side: "#16A34A", pill: "bg-green-100 text-green-700" };
    case "Rechazado":
      return { side: "#741c1c", pill: "bg-red-100 text-red-700" };
    case "Cancelado":
      return { side: "#6B7280", pill: "bg-gray-200 text-gray-700" };
    default:
      return { side: "#D1D5DB", pill: "bg-gray-100 text-gray-700" };
  }
}
