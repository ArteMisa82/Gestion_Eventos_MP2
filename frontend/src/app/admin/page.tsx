"use client";
import React, { useState } from "react";
import { Pencil, Search } from "lucide-react";
import EditEventModal from "./EditarEventoModal";

interface Evento {
  id_evt: string;
  nom_evt: string;
  fec_evt: string;
  lug_evt: string;
  mod_evt: string;
  tip_pub_evt: string;
  est_evt_det: string; 
  img_evt: string;
}

const AdminDashboard: React.FC = () => {
  const [filtro, setFiltro] = useState("EN CURSO");
  const [busqueda, setBusqueda] = useState("");

  const [eventos, setEventos] = useState<Evento[]>([
    {
      id_evt: "EVT001",
      nom_evt: "Curso de React Avanzado",
      fec_evt: "2025-10-12",
      lug_evt: "Online",
      mod_evt: "VIRTUAL",
      tip_pub_evt: "GENERAL",
      est_evt_det: "EN CURSO",
      img_evt: "/Default_Image.png",
    },
    {
      id_evt: "EVT002",
      nom_evt: "Taller de Inteligencia Artificial",
      fec_evt: "2025-08-20",
      lug_evt: "Quito",
      mod_evt: "PRESENCIAL",
      tip_pub_evt: "USUARIOS UTA",
      est_evt_det: "FINALIZADO",
      img_evt: "/Default_Image.png",
    },
    {
      id_evt: "EVT003",
      nom_evt: "Seminario de Marketing Digital",
      fec_evt: "2025-11-25",
      lug_evt: "Ambato",
      mod_evt: "PRESENCIAL",
      tip_pub_evt: "GENERAL",
      est_evt_det: "INSCRIPCIONES",
      img_evt: "/Default_Image.png",
    },
  ]);

  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);

  // Filtra por estado y búsqueda
  const eventosFiltrados = eventos.filter(
    (e) =>
      e.est_evt_det === filtro &&
      e.nom_evt.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="p-8 font-sans text-gray-800 min-h-screen bg-white">
      {/* Título principal */}
      <h1 className="text-3xl font-semibold mb-6 tracking-tight text-center">
        Panel de Administración
      </h1>

      {/* Buscador */}
      <div className="flex justify-center mb-6">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Buscar evento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#581517] text-sm text-gray-700 placeholder-gray-400"
          />
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        </div>
      </div>

      {/* Filtros de estado */}
      <div className="flex justify-center gap-4 mb-8">
        {["INSCRIPCIONES", "EN CURSO", "FINALIZADO"].map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltro(estado)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-all border ${
              filtro === estado
                ? "bg-[#581517] text-white border-[#581517]"
                : "border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {estado === "INSCRIPCIONES"
              ? "Nuevos"
              : estado === "EN CURSO"
              ? "En Proceso"
              : "Finalizados"}
          </button>
        ))}
      </div>

      {/* Tarjetas de cursos */}
      {eventosFiltrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventosFiltrados.map((evt) => (
            <div
  key={evt.id_evt}
  className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-all border border-gray-200"
>
  {/* Imagen del curso */}
  <div className="h-36 w-full overflow-hidden">
    <img
      src={evt.img_evt}
      alt={evt.nom_evt}
      className="w-full h-full object-cover"
    />
      </div>

      {/* Contenido */}
      <div className="p-5">
        <h2 className="text-xl font-semibold mb-2">{evt.nom_evt}</h2>

        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">Fecha:</span> {evt.fec_evt}
        </p>
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">Lugar:</span> {evt.lug_evt}
        </p>
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">Modalidad:</span> {evt.mod_evt}
        </p>
        <p className="text-sm text-gray-600 mb-4">
          <span className="font-medium">Público:</span> {evt.tip_pub_evt}
        </p>

        <div className="flex justify-end">
          <button
            onClick={() => setEventoEditando(evt)}
            className="flex items-center gap-2 text-[#581517] hover:text-[#7a1c1c] text-sm font-medium"
          >
            <Pencil size={16} /> Editar
          </button>
        </div>
      </div>
    </div>

          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10 text-base">
          No hay cursos que coincidan con la búsqueda o el estado seleccionado.
        </p>
      )}

      {/* Modal de edición */}
      {eventoEditando && (
        <EditEventModal
          evento={eventoEditando}
          onClose={() => setEventoEditando(null)}
          onSave={(updatedEvent) => {
            setEventos((prev) =>
              prev.map((evt) =>
                evt.id_evt === updatedEvent.id_evt ? updatedEvent : evt
              )
            );
            setEventoEditando(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
