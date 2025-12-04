import { Solicitud } from "../types";

interface Props {
  selected: Solicitud;
}

export default function InformacionSolicitante({ selected }: Props) {
  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case "RolloutProgramado": return "Rollout Programado";
      case "Implementado": return "Implementado";
      case "Revertido": return "Revertido";
      default: return estado;
    }
  };

  return (
    <>
      {/* Información del solicitante */}
      <div>
        <p className="text-sm text-gray-500">
          Solicitado por{" "}
          <span className="font-medium text-gray-700">
            {selected.solicitanteNombre} {selected.solicitanteApellido || ""}
          </span> • {selected.fecha}
        </p>
        <p className="text-sm text-gray-500">
          Correo:{" "}
          <span className="font-medium text-gray-700">
            {selected.solicitanteEmail}
          </span>
        </p>
        <p className="text-sm text-gray-500">
          Contacto:{" "}
          <span className="font-medium text-gray-700">
            {selected.solicitanteContacto}
          </span>
        </p>
      </div>

      {/* Estado actual */}
      <div>
        <p className="text-sm text-gray-500">Estado actual</p>
        <div className="mt-2 inline-block px-3 py-1 rounded-lg bg-gray-100 text-gray-700 text-sm">
          {getEstadoLabel(selected.estado)}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <p className="text-sm text-gray-500">Descripción</p>
        <p className="mt-2 bg-gray-50 p-4 rounded-lg">
          {selected.descripcion}
        </p>
      </div>

      {/* Justificación */}
      {selected.justificacion && (
        <div>
          <p className="text-sm text-gray-500">Justificación</p>
          <p className="mt-2 bg-gray-50 p-4 rounded-lg">
            {selected.justificacion}
          </p>
        </div>
      )}
    </>
  );
}