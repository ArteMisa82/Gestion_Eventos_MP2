"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { X, User, Type } from "lucide-react";
import { EventItem } from "./types";
import { eventosAPI } from "@/services/api";

interface AddEventModalProps {
  onClose: () => void;
  setEvents: React.Dispatch<React.SetStateAction<EventItem[]>>;
}

interface Responsable {
  id_usu: number;
  nom_usu: string;
  ape_usu: string;
  cor_usu: string;
}

const AddEventModal: React.FC<AddEventModalProps> = ({ onClose, setEvents }) => {
  const [title, setTitle] = useState("");
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
  }, []);

  const handleAdd = async () => {
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
      // ✅ Llamada al backend para crear evento
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No hay sesión activa");
      }

      const nuevoEvento = await eventosAPI.create(token, {
        nom_evt: title,
        fec_evt: new Date().toISOString().split('T')[0], // Fecha actual por defecto
        lug_evt: "Por definir",
        des_evt: "Evento creado desde admin",
        mod_evt: "PRESENCIAL",
        tip_pub_evt: "GENERAL",
        cos_evt: "GRATUITO",
        id_responsable: responsableId,
      });

      // Encontrar nombre del responsable
      const responsable = responsables.find(r => r.id_usu === responsableId);
      const nombreCompleto = responsable 
        ? `${responsable.nom_usu} ${responsable.ape_usu}` 
        : "Sin asignar";

      // Actualizar lista local
      setEvents((prev) => [
        ...prev,
        {
          id: parseInt(nuevoEvento.id_evt),
          title: nuevoEvento.nom_evt,
          person: nombreCompleto,
          start: new Date(nuevoEvento.fec_evt).toLocaleDateString(),
          end: "Por definir",
        },
      ]);

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

      onClose();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error al crear curso",
        text: error.message || "Ocurrió un error inesperado",
        confirmButtonColor: "#581517",
      });
    } finally {
      setIsLoading(false);
    }
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
            onClick={handleAdd}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-[#581517] rounded-lg hover:bg-[#6d1a1a] transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creando..." : "Crear curso"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEventModal;
