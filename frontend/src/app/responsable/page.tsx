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
      confirmButtonColor: "#2563eb",
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">
        Eventos Asignados
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {eventos.map((ev) => (
          <div
            key={ev.id}
            className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition relative"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {ev.nombre}
            </h2>
            <p className="text-sm text-gray-500 flex items-center">
              <Calendar size={16} className="mr-1" />
              No definido
            </p>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setEventoEditando(ev)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm transition"
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
