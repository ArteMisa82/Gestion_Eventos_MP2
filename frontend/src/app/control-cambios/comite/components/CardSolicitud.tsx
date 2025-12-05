"use client";

import { ChevronRight } from "lucide-react";
import { Solicitud, getEstadoStyles } from "./types";

export default function CardSolicitud({
  solicitud,
  onClick,
  isSelected,
}: {
  solicitud: Solicitud;
  onClick: () => void;
  isSelected: boolean;
}) {
  const estados = getEstadoStyles(solicitud.estado);
  const pillStyle =
    solicitud.estado === "En revisión" && (estados as any).pillInline
      ? (estados as any).pillInline
      : undefined;

  return (
    <button
      onClick={onClick}
      className={`relative text-left p-4 rounded-xl border transition-all shadow-sm hover:shadow-md bg-white overflow-hidden w-full text-sm ${
        isSelected 
          ? "border-gray-400 ring-2 ring-blue-100" 
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-r-xl"
        style={{ background: estados.side }}
      />

      <div className="flex justify-between items-start pl-3">
        <div className="w-11/12 pr-2">
          <h3 className="font-semibold text-gray-800 line-clamp-1 leading-tight">
            {solicitud.titulo}
          </h3>
          <p className="text-gray-500 mt-1 line-clamp-2 text-xs leading-relaxed">
            {solicitud.descripcion}
          </p>
        </div>
        <ChevronRight 
          size={18} 
          className={`text-gray-400 flex-shrink-0 mt-1 ${
            isSelected ? "text-blue-500" : ""
          }`}
        />
      </div>

      <div className="flex gap-2 items-center mt-3 pl-3">
        <span
          className={`px-2 py-1 rounded-md text-xs font-medium flex-shrink-0 ${
            pillStyle ? "" : (estados as any).pill || ""
          }`}
          style={pillStyle}
        >
          {solicitud.estado}
        </span>

        <span className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium flex-shrink-0">
          {solicitud.prioridad}
        </span>

        <span className="ml-auto text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
          {solicitud.fecha}
        </span>
      </div>
    </button>
  );
}