import { Solicitud } from "../types";
import ActionButton from "./ActionButton";

interface Props {
  selected: Solicitud;
  performAction: (id: number, accion: "Aprobado" | "Rechazado" | "Cancelado" | "RolloutProgramado" | "Implementado" | "Revertido" | "ActualizarCamposComite", extraData?: any) => Promise<void>; // ✅ Cambiar a tipo específico
}

export default function BotonesAccionITIL({ selected, performAction }: Props) {
  const canApprove = selected.estado === "Pendiente" || selected.estado === "En revisión";
  const canReject = selected.estado === "Pendiente" || selected.estado === "En revisión";
  const canStartRollout = selected.estado === "Aprobado";
  const canCompleteRollout = selected.estado === "RolloutProgramado";
  const canBackout = selected.estado === "Implementado";

  return (
    <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-300 mt-4">
      <ActionButton
        label="Cancelar"
        color="gray"
        disabled={!canReject}
        onClick={() => performAction(selected.id, "Cancelado")}
      />
      <ActionButton
        label="Rechazar"
        color="red"
        disabled={!canReject}
        onClick={() => performAction(selected.id, "Rechazado")}
      />
      <ActionButton
        label="Aprobar"
        color="green"
        disabled={!canApprove}
        onClick={() => performAction(selected.id, "Aprobado")}
      />
      <ActionButton
        label="Programar Rollout"
        color="blue"
        disabled={!canStartRollout}
        onClick={() => performAction(selected.id, "RolloutProgramado")}
      />
      <ActionButton
        label="Poner Implementado"
        color="indigo"
        disabled={!canCompleteRollout}
        onClick={() => performAction(selected.id, "Implementado")}
      />
      <ActionButton
        label="Ejecutar Backout"
        color="rose"
        disabled={!canBackout}
        onClick={() => performAction(selected.id, "Revertido")}
      />
    </div>
  );
}