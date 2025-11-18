"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import Swal from "sweetalert2";

interface Evento {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  modalidad: string;
  capacidad: number;
  publico: string;
  horas: number;
  pago: string;
  carreras: string[];
  semestres: string[];
  tipoEvento: string;
  docente?: string;
}

interface ModalEditarEventoProps {
  evento: Evento | null;
  onClose: () => void;
  onGuardar: (data: Evento) => void;
}

export default function ModalEditarEvento({
  evento,
  onClose,
  onGuardar,
}: ModalEditarEventoProps) {
  // 🔒 Evita error si evento llega undefined
  if (!evento) return null;

  const hoy = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState<Evento>({
    ...evento,
    fechaInicio: evento.fechaInicio || "",
    fechaFin: evento.fechaFin || "",
    modalidad: evento.modalidad || "",
    capacidad: evento.capacidad || 0,
    publico: evento.publico || "",
    horas: evento.horas || 0,
    pago: evento.pago || "",
    carreras: evento.carreras || [],
    semestres: evento.semestres || [],
    tipoEvento: evento.tipoEvento || "",
    docente: evento.docente || "",
  });

  const carrerasDisponibles = [
    "Software",
    "TI",
    "Telecomunicaciones",
    "Robótica",
  ];
  const semestresDisponibles = [
    "1er semestre",
    "2do semestre",
    "3er semestre",
    "4to semestre",
    "5to semestre",
    "6to semestre",
    "7mo semestre",
    "8vo semestre",
    "9no semestre",
    "10mo semestre",
  ];
  const tiposEventos = [
    "CONFERENCIA",
    "CURSO",
    "WEBINAR",
    "CONGRESO",
    "CASAS ABIERTAS",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMultiSelect = (name: string, value: string) => {
    setFormData((prev) => {
      const lista = prev[name as keyof Evento] as string[];
      return {
        ...prev,
        [name]: lista.includes(value)
          ? lista.filter((v) => v !== value)
          : [...lista, value],
      };
    });
  };

  const handleGuardar = () => {
    if (!formData.fechaInicio || !formData.fechaFin) {
      Swal.fire({
        icon: "warning",
        title: "Fechas requeridas",
        text: "Debes ingresar la fecha de inicio y de fin del evento.",
        confirmButtonColor: "#581517",
      });
      return;
    }

    if (formData.fechaFin < formData.fechaInicio) {
      Swal.fire({
        icon: "error",
        title: "Fechas inválidas",
        text: "La fecha de fin no puede ser anterior a la de inicio.",
        confirmButtonColor: "#581517",
      });
      return;
    }

    onGuardar(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-xl p-6 relative border border-gray-200 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#581517]">
            Editar Evento
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-500 hover:text-[#581517]" />
          </button>
        </div>

        {/* Formulario */}
        <div className="space-y-6">
          {/* Información Básica */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Evento
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  disabled
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Evento
                </label>
                <select
                  name="tipoEvento"
                  value={formData.tipoEvento}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517] focus:border-transparent"
                >
                  <option value="">Seleccionar tipo</option>
                  {tiposEventos.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Público Objetivo
                </label>
                <select
                  name="publico"
                  value={formData.publico}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517] focus:border-transparent"
                >
                  <option value="">Seleccionar público</option>
                  <option value="Estudiantes">Estudiantes</option>
                  <option value="General">Público General</option>
                </select>
              </div>
            </div>
          </section>

          {/* Fechas y Horarios */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              Fechas y Horarios
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  name="fechaInicio"
                  min={hoy}
                  value={formData.fechaInicio}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Fin
                </label>
                <input
                  type="date"
                  name="fechaFin"
                  min={formData.fechaInicio || hoy}
                  value={formData.fechaFin}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (horas)
                </label>
                <input
                  type="number"
                  name="horas"
                  value={formData.horas}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517] focus:border-transparent"
                  min={1}
                />
              </div>
            </div>
          </section>

          {/* Configuración del Evento */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              Configuración del Evento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modalidad
                </label>
                <select
                  name="modalidad"
                  value={formData.modalidad}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517] focus:border-transparent"
                >
                  <option value="">Seleccionar modalidad</option>
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="VIRTUAL">Virtual</option>
                  <option value="HIBRIDA">Híbrida</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad
                </label>
                <input
                  type="number"
                  name="capacidad"
                  value={formData.capacidad}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517] focus:border-transparent"
                  min={1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Pago
                </label>
                <select
                  name="pago"
                  value={formData.pago}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517] focus:border-transparent"
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="Gratis">Gratuito</option>
                  <option value="Pago">De Pago</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Docente Asignado
                </label>
                <input
                  type="text"
                  name="docente"
                  placeholder="Nombre del docente"
                  value={formData.docente}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517] focus:border-transparent"
                />
              </div>
            </div>
          </section>

          {/* Público Objetivo Específico */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
              Público Objetivo Específico
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Carreras Dirigidas
                </label>
                <div className="flex flex-wrap gap-2">
                  {carrerasDisponibles.map((carrera) => (
                    <button
                      key={carrera}
                      onClick={() => handleMultiSelect("carreras", carrera)}
                      type="button"
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                        formData.carreras.includes(carrera)
                          ? "bg-[#581517] text-white border-[#581517] shadow-sm"
                          : "border-gray-300 text-gray-700 hover:border-[#581517] hover:text-[#581517] bg-white"
                      }`}
                    >
                      {carrera}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Semestres Dirigidos
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {semestresDisponibles.map((semestre) => (
                    <button
                      key={semestre}
                      onClick={() => handleMultiSelect("semestres", semestre)}
                      type="button"
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                        formData.semestres.includes(semestre)
                          ? "bg-[#581517] text-white border-[#581517] shadow-sm"
                          : "border-gray-300 text-gray-700 hover:border-[#581517] hover:text-[#581517] bg-white"
                      }`}
                    >
                      {semestre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer con Botones */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            className="px-6 py-2 rounded-lg bg-[#581517] text-white hover:bg-[#6e1c1e] font-medium transition-colors shadow-sm"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}