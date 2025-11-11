"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { X, User, Type } from "lucide-react";
import { EventItem } from "./types";
import { eventosAPI } from "@/services/api";

interface EditEventModalProps {
  onClose: () => void;
  event: EventItem;
  onSave: (updatedEvent: EventItem) => void;
}

interface Responsable {
  id_usu: number;
  nom_usu: string;
  ape_usu: string;
  cor_usu: string;
}

const EditEventModal: React.FC<EditEventModalProps> = ({ onClose, event, onSave }) => {
  const [title, setTitle] = useState(event.title);
  const [responsableId, setResponsableId] = useState<number>(0);
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 🔄 Cargar responsables reales desde el backend
  useEffect(() => {
    const fetchResponsables = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No hay sesión activa");
        }
        const data = await eventosAPI.getResponsables(token);
        setResponsables(data);

        // TODO: Preseleccionar el responsable actual del evento
        // Necesitarías tener el id_res_evt en EventItem
      } catch (error) {
        console.error("Error al cargar responsables:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los responsables",
          confirmButtonColor: "#581517",
        });
      }
    };
    fetchResponsables();
  }, [event]);

  const handleSave = async () => {
    if (!title.trim() || !responsableId) {
      await Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Por favor completa el nombre del curso y selecciona un responsable.",
        confirmButtonColor: "#581517",
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay sesión activa");
      }

      // ✅ Actualizar evento en el backend usando el ID real
      const idToUpdate = event.realId || event.id.toString();
      await eventosAPI.update(token, idToUpdate, {
        nom_evt: title,
        id_responsable: responsableId,
      });

      // Encontrar nombre del responsable
      const responsable = responsables.find(r => r.id_usu === responsableId);
      const nombreCompleto = responsable 
        ? `${responsable.nom_usu} ${responsable.ape_usu}` 
        : "Sin asignar";

      const updated = {
        ...event,
        title,
        person: nombreCompleto,
      };

      onSave(updated);

      await Swal.fire({
        icon: "success",
        title: "Curso actualizado",
        text: "Los cambios se han guardado correctamente.",
        confirmButtonColor: "#581517",
        timer: 2000,
        showConfirmButton: false,
      });

      onClose();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: error.message || "Ocurrió un error inesperado",
        confirmButtonColor: "#581517",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Fondo translúcido (no negro)
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
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
          Editar curso
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

          {/* Selector de responsable */}
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
              <User size={16} /> Responsable asignado
            </label>

            <select
              value={responsableId}
              onChange={(e) => setResponsableId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#581517]"
            >
              <option value={0}>-- Seleccionar responsable --</option>
              {responsables.map((r) => (
                <option key={r.id_usu} value={r.id_usu}>
                  {r.nom_usu} {r.ape_usu} - {r.cor_usu}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#581517] rounded-lg hover:bg-[#6d1a1a] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;
