"use client";
import React, { useState } from "react";
import { X } from "lucide-react";

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

interface ModalEditarEventoProps {
  evento: Evento;
  onClose: () => void;
  onGuardar: (evento: Evento) => void;
}

const tiposEvento = [
  "CONFERENCIA",
  "CURSO",
  "WEBINAR",
  "CONGRESO",
  "CASAS ABIERTAS",
];

const carrerasEjemplo = [
  "Administración",
  "Ingeniería de Software",
  "Derecho",
  "Psicología",
  "Arquitectura",
];

const semestresEjemplo = [
  "1°",
  "2°",
  "3°",
  "4°",
  "5°",
  "6°",
  "7°",
  "8°",
  "9°",
  "10°",
];

export default function ModalEditarEvento({
  evento,
  onClose,
  onGuardar,
}: ModalEditarEventoProps) {
  const [datos, setDatos] = useState<Evento>(evento);

  const handleChange = (key: keyof Evento, value: any) => {
    setDatos((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar(datos);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
          onClick={onClose}
        >
          <X size={22} />
        </button>

        <h2 className="text-xl font-bold text-blue-700 mb-4">
          Editar Evento: {evento.nombre}
        </h2>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold">Fecha de Inicio</label>
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={datos.fechaInicio}
              onChange={(e) => handleChange("fechaInicio", e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold">Fecha de Fin</label>
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={datos.fechaFin}
              onChange={(e) => handleChange("fechaFin", e.target.value)}
            />
          </div>

          <div>
            <label className="block font-semibold">Modalidad</label>
            <select
              className="border p-2 rounded w-full"
              value={datos.modalidad}
              onChange={(e) => handleChange("modalidad", e.target.value)}
            >
              <option value="">Seleccionar</option>
              <option value="Presencial">Presencial</option>
              <option value="Virtual">Virtual</option>
              <option value="Híbrido">Híbrido</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold">Capacidad</label>
            <input
              type="number"
              min={1}
              className="border p-2 rounded w-full"
              value={datos.capacidad}
              onChange={(e) =>
                handleChange("capacidad", Number(e.target.value))
              }
            />
          </div>

          <div>
            <label className="block font-semibold">
              Público (Estudiantes / General)
            </label>
            <select
              className="border p-2 rounded w-full"
              value={datos.publico}
              onChange={(e) =>
                handleChange("publico", e.target.value as "Estudiantes" | "General")
              }
            >
              <option value="Estudiantes">Estudiantes</option>
              <option value="General">Público General</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold">Horas</label>
            <input
              type="number"
              min={1}
              className="border p-2 rounded w-full"
              value={datos.horas}
              onChange={(e) => handleChange("horas", Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block font-semibold">Costo</label>
            <select
              className="border p-2 rounded w-full"
              value={datos.pago}
              onChange={(e) =>
                handleChange("pago", e.target.value as "Gratis" | "Pago")
              }
            >
              <option value="Gratis">Gratis</option>
              <option value="Pago">De Pago</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold">Carreras</label>
            <select
              multiple
              className="border p-2 rounded w-full"
              value={datos.carreras}
              onChange={(e) =>
                handleChange(
                  "carreras",
                  Array.from(e.target.selectedOptions, (opt) => opt.value)
                )
              }
            >
              {carrerasEjemplo.map((car) => (
                <option key={car} value={car}>
                  {car}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold">Semestres</label>
            <select
              multiple
              className="border p-2 rounded w-full"
              value={datos.semestres}
              onChange={(e) =>
                handleChange(
                  "semestres",
                  Array.from(e.target.selectedOptions, (opt) => opt.value)
                )
              }
            >
              {semestresEjemplo.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold">Tipo de Evento</label>
            <select
              className="border p-2 rounded w-full"
              value={datos.tipoEvento}
              onChange={(e) => handleChange("tipoEvento", e.target.value)}
            >
              <option value="">Seleccionar</option>
              {tiposEvento.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Campos dinámicos */}
          {datos.tipoEvento === "CONGRESO" && (
            <div className="md:col-span-2">
              <label className="block font-semibold">N° de ponentes</label>
              <input
                type="number"
                className="border p-2 rounded w-full"
                value={datos.camposExtra.ponentes || ""}
                onChange={(e) =>
                  setDatos((prev) => ({
                    ...prev,
                    camposExtra: { ...prev.camposExtra, ponentes: e.target.value },
                  }))
                }
              />
            </div>
          )}

          <div className="md:col-span-2 text-right mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
