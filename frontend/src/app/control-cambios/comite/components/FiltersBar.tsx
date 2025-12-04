"use client";

import { Search } from "lucide-react";

export default function FiltersBar({
  search,
  setSearch,
  filterEstado,
  setFilterEstado,
  filterPrioridad,
  setFilterPrioridad,
}: any) {
  return (
    <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
      {/* Buscar */}
      <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3 w-full max-w-lg shadow-sm">
        <Search className="text-gray-500" size={18} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título, descripción o solicitante..."
          className="w-full bg-transparent outline-none text-gray-700 text-sm"
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-3 w-full lg:w-auto">
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 shadow-sm"
        >
          <option value="">Estado (todos)</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En revisión">En revisión</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Rechazado">Rechazado</option>
          <option value="Cancelado">Cancelado</option>
        </select>

        <select
          value={filterPrioridad}
          onChange={(e) => setFilterPrioridad(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 shadow-sm"
        >
          <option value="">Prioridad (todas)</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
      </div>
    </div>
  );
}
