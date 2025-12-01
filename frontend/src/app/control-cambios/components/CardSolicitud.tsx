"use client";
import { ChevronRight } from "lucide-react";
import { Solicitud, getEstadoClasses, WINE } from "./types";

interface CardSolicitudProps {
  solicitud: Solicitud;
  onClick: () => void;
  isSelected: boolean;
}

export default function CardSolicitud({ solicitud, onClick, isSelected }: CardSolicitudProps) {
  const estadoCls = getEstadoClasses(solicitud.estado);
  const pillStyle =
    solicitud.estado === "En revisión"
      ? { backgroundColor: "rgba(110,31,63,0.12)", color: WINE, border: "1px solid rgba(110,31,63,0.18)" }
      : undefined;

  return (
    <button
      onClick={onClick}
      className={`relative text-left p-4 rounded-xl border transition shadow-sm hover:shadow-md bg-white hover:bg-gray-50 overflow-hidden w-full text-sm ${
        isSelected ? "border-gray-300" : "border-gray-200"
      }`}
    >
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-r-xl"
        style={{ background: estadoCls.side }}
      />

      <div className="flex justify-between items-center pl-3">
        <div className="w-11/12">
          <h3 className="font-semibold text-gray-800">{solicitud.titulo}</h3>
          <p className="text-gray-500 mt-1 line-clamp-2">{solicitud.descripcion}</p>
        </div>
        <ChevronRight size={18} className="text-gray-400" />
      </div>

      <div className="flex gap-2 items-center mt-3 pl-3">
        <span
          className={`px-2 py-1 rounded-md text-xs font-medium ${
            estadoCls.pill ? estadoCls.pill : "text-xs"
          }`}
          style={pillStyle}
        >
          {solicitud.estado}
        </span>

        <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
          {solicitud.prioridad}
        </span>

        <span className="ml-auto text-xs text-gray-400">{solicitud.fecha}</span>
      </div>
    </button>
  );
}