"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { Solicitud, MOCK } from "./components/types";
import CardSolicitud from "./components/CardSolicitud";

export default function ControlCambiosPage() {
  const [selected, setSelected] = useState<Solicitud | null>(null);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("");
  const [filterPrioridad, setFilterPrioridad] = useState<string>("");
  const router = useRouter();

  const handleIrAlComite = () => {
    const CLAVE_COMITE = "C0M1T32025";

    Swal.fire({
      title: "Acceso al Comité",
      text: "Ingrese la clave de acceso",
      input: "password",
      inputPlaceholder: "Clave",
      showCancelButton: true,
      confirmButtonText: "Ingresar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#1f2937",
      cancelButtonColor: "#6b7280",
    }).then((result) => {
      if (result.isConfirmed) {
        if (result.value === CLAVE_COMITE) {
          Swal.fire({
            icon: "success",
            title: "Acceso concedido",
            timer: 1200,
            showConfirmButton: false,
          }).then(() => {
            router.push("/control-cambios/comite");
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Clave incorrecta",
            text: "Verifique la clave e intente nuevamente.",
            confirmButtonColor: "#7f1d1d",
          });
        }
      }
    });
  };

  // Memoizamos filtrado (real-time)
  const filtered = useMemo(() => {
    return MOCK.filter((s) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        q === "" ||
        s.titulo.toLowerCase().includes(q) ||
        s.descripcion.toLowerCase().includes(q) ||
        (s.solicitante && s.solicitante.toLowerCase().includes(q));
      const matchEstado = !filterEstado || s.estado === filterEstado;
      const matchPrioridad = !filterPrioridad || s.prioridad === filterPrioridad;
      return matchSearch && matchEstado && matchPrioridad;
    });
  }, [search, filterEstado, filterPrioridad]);

  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">Panel de Cambios</h1>
            <p className="text-sm text-gray-500 mt-1">Vista para desarrolladores — revisa solicitudes y abre detalles.</p>
          </div>

          <button
            onClick={handleIrAlComite}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition"
          >
            Ir al Comité
          </button>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
          <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3 w-full max-w-lg shadow-sm">
            <Search className="text-gray-500" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título, descripción o solicitante..."
              className="w-full bg-transparent outline-none text-gray-700 text-sm"
            />
          </div>

          <div className="flex gap-3 w-full lg:w-auto">
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 shadow-sm"
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="En revisión">En revisión</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Rechazado">Rechazado</option>
            </select>

            <select
              value={filterPrioridad}
              onChange={(e) => setFilterPrioridad(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-700 shadow-sm"
            >
              <option value="">Todas las prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
        </div>

        {/* Layout: lista + detalle */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista con scroll */}
          <div className="lg:col-span-1 border border-gray-200 rounded-2xl p-4 shadow-sm bg-white flex flex-col">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Solicitudes ({filtered.length})</h2>
            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-12rem)]"> {/* Scroll aquí */}
              <div className="flex flex-col gap-3 pr-2"> {/* Padding para el scroll */}
                {filtered.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">No hay solicitudes que coincidan.</div>
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


          {/* Detalle */}
          <div className="lg:col-span-2 border border-gray-200 rounded-2xl p-8 shadow-sm bg-white min-h-[320px]">
            {selected ? (
              <>
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-semibold text-gray-900">
                      {selected.titulo}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Solicitado por {selected.solicitante} • {selected.fecha}
                      {selected.referencia && ` • Ref: ${selected.referencia}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {selected.clasificacion || "-"} / {selected.tipoCambio || "-"}
                    </span>
                    <button
                      onClick={() => setSelected(null)}
                      className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>

                {/* Contenido */}
                <div className="mt-8 text-gray-700 space-y-6">
                  {/* Información de contacto */}
                  {(selected.contacto || selected.telefono) && (
                    <div className="grid grid-cols-2 gap-4">
                      {selected.contacto && (
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                          <p className="text-sm text-gray-500">Contacto</p>
                          <p className="mt-1 text-gray-900 font-medium">{selected.contacto}</p>
                        </div>
                      )}
                      {selected.telefono && (
                        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                          <p className="text-sm text-gray-500">Teléfono</p>
                          <p className="mt-1 text-gray-900 font-medium">{selected.telefono}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Descripción */}
                  <div>
                    <p className="text-sm text-gray-500">Descripción</p>
                    <div className="mt-2 bg-gray-50 p-4 rounded-lg text-gray-700">
                      {selected.descripcion}
                    </div>
                  </div>

                  {/* Justificación */}
                  {selected.justificacion && (
                    <div>
                      <p className="text-sm text-gray-500">Justificación</p>
                      <div className="mt-2 bg-gray-50 p-4 rounded-lg text-gray-700">
                        {selected.justificacion}
                      </div>
                    </div>
                  )}

                  {/* Campos adicionales */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selected.impactoNoImplementar && (
                      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <p className="text-sm text-gray-500">Impacto de NO implementar</p>
                        <p className="mt-1 text-gray-700">{selected.impactoNoImplementar}</p>
                      </div>
                    )}
                    {selected.recursosNecesarios && selected.recursosNecesarios.length > 0 && (
                      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <p className="text-sm text-gray-500">Recursos necesarios</p>
                        <div className="mt-1 text-gray-700">
                          <ul className="list-disc list-inside space-y-1">
                            {selected.recursosNecesarios.map((recurso, index) => (
                              <li key={index}>{recurso}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    {selected.riesgos && (
                      <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                        <p className="text-sm text-gray-500">Riesgos del cambio</p>
                        <p className="mt-1 text-gray-700">{selected.riesgos}</p>
                      </div>
                    )}
                  </div>

                  {/* Grid Info */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <p className="text-sm text-gray-500">Estado</p>
                      <p className="mt-1 text-gray-900 font-medium">{selected.estado}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <p className="text-sm text-gray-500">Prioridad</p>
                      <p className="mt-1 text-gray-900 font-medium">{selected.prioridad}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <p className="text-sm text-gray-500">Módulos afectados</p>
                      <p className="mt-1 text-gray-900">
                        {(selected.modulos || []).join(", ") || "-"}
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                      <p className="text-sm text-gray-500">Impacto (días)</p>
                      <p className="mt-1 text-gray-900">
                        {selected.impactoDias ?? "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-lg">
                Selecciona una solicitud para ver los detalles
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}