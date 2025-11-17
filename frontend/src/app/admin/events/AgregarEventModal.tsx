"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { X, User, Type } from "lucide-react";
import { EventItem } from "./types";

interface AddEventModalProps {
  onClose: () => void;
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
}

interface Usuario {
  id: number;
  nombre: string;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ onClose, setEvents }) => {
  const [title, setTitle] = useState("");
  const [responsables, setResponsables] = useState<number[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // 🔄 Simula carga de usuarios (listo para conexión al backend)
  useEffect(() => {
    setUsuarios([
      { id: 1, nombre: "Ana López" },
      { id: 2, nombre: "Carlos Ruiz" },
      { id: 3, nombre: "María Gómez" },
      { id: 4, nombre: "John Smith" },
    ]);
  }, []);

  const handleAdd = async () => {
    if (!title.trim() || responsables.length === 0) {
      await Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa el nombre del curso y selecciona al menos un responsable.",
        confirmButtonColor: "#581517",
      });
      return;
    }

    const responsablesNombres = usuarios
      .filter((u) => responsables.includes(u.id))
      .map((u) => u.nombre)
      .join(", ");

    setEvents((prev) => [
      ...prev,
      {
        id: Date.now(),
        title,
        person: responsablesNombres,
        start: "Por definir",
        end: "Por definir",
      },
    ]);

    await Swal.fire({
      icon: "success",
      title: "Curso añadido",
      text: "El nuevo curso ha sido agregado correctamente.",
      confirmButtonColor: "#581517",
    });

    onClose();
  };

  const handleSelectResponsable = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = Number(e.target.value);
    if (!selected) return;
    if (responsables.includes(selected)) return;

    if (responsables.length >= 1) {
        await Swal.fire({
          icon: "info",
          title: "Solo un responsable",
          text: "Este curso solo puede tener un responsable asignado.",
          confirmButtonColor: "#581517",
        });
        return;
      }

      setResponsables([selected]); // siempre reemplaza al anterior

  };

  const handleRemoveResponsable = (id: number) => {
    setResponsables((prev) => prev.filter((r) => r !== id));
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-[95%] max-w-md p-6 relative border border-gray-200 animate-fadeIn">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
        >
          <X size={20} />
        </button>

        {/* Título */}
        <h3 className="text-xl font-semibold text-gray-800 mb-5 text-center">
          Añadir nuevo curso
        </h3>

        {/* Campos */}
        <div className="space-y-5">
          {/* Nombre del curso */}
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
              <Type size={16} /> Nombre del curso
            </label>
            <input
              type="text"
              placeholder="Ej. Curso de Liderazgo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#581517]"
            />
          </div>

          {/* Combo de responsables */}
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
              <User size={16} /> Responsable(s) asignado(s)
            </label>

            <div className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-[#581517]">
              <select
                value=""
                onChange={handleSelectResponsable}
                className="w-full outline-none bg-transparent"
              >
                <option value="">-- Seleccionar responsable --</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Chips de responsables seleccionados */}
            {responsables.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {responsables.map((id) => {
                  const user = usuarios.find((u) => u.id === id);
                  return (
                    <div
                      key={id}
                      className="flex items-center gap-2 bg-[#581517]/10 text-[#581517] px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {user?.nombre}
                      <button
                        onClick={() => handleRemoveResponsable(id)}
                        className="text-[#581517] hover:text-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 text-sm font-medium text-white bg-[#581517] rounded-lg hover:bg-[#6d1a1a] transition"
          >
            Crear curso
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
