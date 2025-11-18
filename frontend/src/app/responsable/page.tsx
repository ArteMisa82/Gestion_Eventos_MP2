"use client";
import React, { useState, useEffect } from "react";
import { Calendar, Edit } from "lucide-react";
import ModalEditarEvento from "./ModalEditar";
import Swal from "sweetalert2";

interface Evento {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  modalidad: string;
  capacidad: number;
  publico: "Estudiantes" | "General";
  horas: number;
  pago: "Gratis" | "Pago";
  carreras: string[];
  semestres: string[];
  tipoEvento: string;
  camposExtra: Record<string, string>;
}

export default function DashboardResponsable() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);

  useEffect(() => {
    // 🔜 Aquí se conectará con el backend
    // fetch("/api/eventos-responsable?id_usuario=123")
    //   .then(res => res.json())
    //   .then(data => setEventos(data));

    const mockEventos: Evento[] = [
      {
        id: "EVT001",
        nombre: "Congreso de Innovación 2025",
        fechaInicio: "",
        fechaFin: "",
        modalidad: "",
        capacidad: 0,
        publico: "General",
        horas: 0,
        pago: "Gratis",
        carreras: [],
        semestres: [],
        tipoEvento: "",
        camposExtra: {},
      },
      {
        id: "EVT002",
        nombre: "Taller de Desarrollo Web",
        fechaInicio: "",
        fechaFin: "",
        modalidad: "",
        capacidad: 0,
        publico: "Estudiantes",
        horas: 0,
        pago: "Pago",
        carreras: [],
        semestres: [],
        tipoEvento: "",
        camposExtra: {},
      },
    ];
    setEventos(mockEventos);
  }, []);

  const handleGuardar = (eventoActualizado: Evento) => {
    setEventos((prev) =>
      prev.map((ev) => (ev.id === eventoActualizado.id ? eventoActualizado : ev))
    );
    setEventoEditando(null);

    Swal.fire({
      icon: "success",
      title: "Datos guardados",
      text: `El evento "${eventoActualizado.nombre}" fue actualizado correctamente.`,
      confirmButtonColor: "#581517",
    });
  };

  return (
    <div className="p-8 font-sans text-gray-800 min-h-screen bg-white">
      {/* Título principal */}
      <h1 className="text-3xl font-semibold mb-6 tracking-tight text-center text-[#581517]">
        Eventos Asignados
      </h1>

      {/* Contenedor de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventos.map((ev) => (
          <div
            key={ev.id}
            className="bg-white border border-gray-200 rounded-lg shadow-md p-5 hover:shadow-lg transition-all"
          >
            <h2 className="text-lg font-semibold mb-2">{ev.nombre}</h2>
            <p className="text-sm text-gray-600 flex items-center mb-1">
              <Calendar size={16} className="mr-1 text-gray-500" />
              {ev.fechaInicio && ev.fechaFin
                ? `${ev.fechaInicio} - ${ev.fechaFin}`
                : "Fechas no definidas"}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Modalidad:</span>{" "}
              {ev.modalidad || "Por definir"}
            </p>
            <p className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Público:</span> {ev.publico}
            </p>

            <div className="flex justify-end mt-2">
              <button
                onClick={() => setEventoEditando(ev)}
                className="flex items-center gap-2 text-[#581517] hover:text-[#7a1c1c] text-sm font-medium transition"
              >
                <Edit size={16} /> Editar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para editar evento */}
      {eventoEditando && (
        <ModalEditarEvento
          evento={eventoEditando}
          onClose={() => setEventoEditando(null)}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  );
}
