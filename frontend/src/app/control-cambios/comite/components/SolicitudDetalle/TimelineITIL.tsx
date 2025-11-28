"use client";

import { useState } from "react";
import { Accion, Estado } from "../types";

interface Props {
  acciones?: Accion[];
  estadoActual: Estado;
}

const estadosITIL: Estado[] = [
  "Pendiente",
  "En revisión",
  "Aprobado",
  "RolloutProgramado",
  "Implementado",
  "Revertido",
];

export default function TimelineITIL({ acciones, estadoActual }: Props) {
  const [showTimelineHist, setShowTimelineHist] = useState(true);

  const getEstadoLabel = (estado: Estado) => {
    switch (estado) {
      case "RolloutProgramado":
        return "Rollout Programado";
      case "Implementado":
        return "Implementado";
      case "Revertido":
        return "Revertido";
      default:
        return estado;
    }
  };

  return (
    <div className="mt-10">
      <p className="font-medium text-gray-800 mb-3">Flujo ITIL</p>

      {/* Timeline Horizontal */}
      <div className="flex items-center gap-4 overflow-x-auto py-4">
        {estadosITIL.map((estado, index) => {
          const reached =
            estado === estadoActual ||
            acciones?.some((a: any) => a.accion === estado);

          return (
            <div key={estado} className="flex items-center">
              {/* Punto del estado */}
              <div
                className={`w-4 h-4 rounded-full border-2 transition ${
                  reached
                    ? "bg-purple-600 border-purple-600"
                    : "bg-gray-200 border-gray-300"
                }`}
              ></div>

              {/* Texto del estado */}
              <p
                className={`ml-2 text-sm whitespace-nowrap ${
                  reached ? "text-purple-700 font-semibold" : "text-gray-400"
                }`}
              >
                {getEstadoLabel(estado)}
              </p>

              {/* Línea conectora (excepto el último) */}
              {index < estadosITIL.length - 1 && (
                <div
                  className={`w-10 h-0.5 mx-3 ${
                    reached ? "bg-purple-500" : "bg-gray-300"
                  }`}
                ></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Botón Mostrar/Ocultar Historial */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setShowTimelineHist((v) => !v)}
          className="px-3 py-1 text-sm rounded-lg bg-gray-100 hover:bg-gray-200 transition"
        >
          {showTimelineHist ? "Ocultar historial" : "Mostrar historial"}
        </button>
      </div>

      {/* Historial de Acciones */}
      {showTimelineHist && (
        <div className="mt-4 bg-gray-50 border rounded-xl p-4">
          <p className="text-sm font-medium text-gray-600">
            Acciones registradas:
          </p>

          {acciones && acciones.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {acciones.map((accion, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-700 border-b pb-1 last:border-0"
                >
                  <span className="font-bold text-purple-700">
                    {accion.accion}
                  </span>{" "}
                  •{" "}
                  <span className="text-gray-500">
                    {new Date(accion.fecha).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <br />
                  <span className="text-xs text-gray-400">
                    {accion.actorNombre} {accion.actorApellido}
                  </span>
                  {accion.comentario && (
                    <p className="text-xs text-gray-500 mt-1">
                      {accion.comentario}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-sm mt-2">
              No hay acciones registradas.
            </p>
          )}
        </div>
      )}
    </div>
  );
}