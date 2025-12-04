"use client";

import CardSolicitud from "./CardSolicitud";
import { Solicitud } from "./types";

export default function SolicitudesList({
  filtered,
  selected,
  setSelected,
}: {
  filtered: Solicitud[];
  selected: Solicitud | null;
  setSelected: (s: Solicitud | null) => void;
}) {
  return (
    <div className="lg:col-span-1 border border-gray-200 rounded-2xl p-4 shadow-sm bg-white flex flex-col h-full">
      {/* Header fijo */}
      <div className="flex-shrink-0">
        <h2 className="text-lg font-medium text-gray-700 mb-4">
          Solicitudes ({filtered.length})
        </h2>
      </div>

      {/* Lista con scroll */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-3 pr-1">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No hay solicitudes que coincidan.
            </div>
          ) : (
            filtered.map((s) => (
              <CardSolicitud
                key={s.id}
                solicitud={s}
                onClick={() => setSelected(s)}
                isSelected={selected?.id === s.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}