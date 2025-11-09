"use client";
import React from "react";
import { X } from "lucide-react";

interface Evento {
  id_evt: string;
  nom_evt: string;
  fec_evt: string;
  lug_evt: string;
  mod_evt: string;
  tip_pub_evt: string;
  est_evt_det: string;
}

interface EditEventModalProps {
  evento: Evento;
  onClose: () => void;
  onSave: (updatedEvent: Evento) => void;
}

const EditEventModal: React.FC<EditEventModalProps> = ({
  evento,
  onClose,
  onSave,
}) => {
  const [data, setData] = React.useState(evento);

  const handleChange = (key: keyof Evento, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onSave(data);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-[#581517]">
          Editar Evento
        </h2>

        <div className="flex flex-col gap-3">
          <label className="text-sm text-gray-600 font-medium">
            Nombre del evento
            <input
              type="text"
              value={data.nom_evt}
              onChange={(e) => handleChange("nom_evt", e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517] focus:outline-none"
            />
          </label>

          <label className="text-sm text-gray-600 font-medium">
            Fecha
            <input
              type="date"
              value={data.fec_evt}
              onChange={(e) => handleChange("fec_evt", e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517] focus:outline-none"
            />
          </label>

          <label className="text-sm text-gray-600 font-medium">
            Lugar
            <input
              type="text"
              value={data.lug_evt}
              onChange={(e) => handleChange("lug_evt", e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517] focus:outline-none"
            />
          </label>

          <label className="text-sm text-gray-600 font-medium">
            Modalidad
            <select
              value={data.mod_evt}
              onChange={(e) => handleChange("mod_evt", e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517] focus:outline-none"
            >
              <option value="VIRTUAL">VIRTUAL</option>
              <option value="PRESENCIAL">PRESENCIAL</option>
            </select>
          </label>

          <label className="text-sm text-gray-600 font-medium">
            Público
            <select
              value={data.tip_pub_evt}
              onChange={(e) => handleChange("tip_pub_evt", e.target.value)}
              className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517] focus:outline-none"
            >
              <option value="GENERAL">GENERAL</option>
              <option value="USUARIOS UTA">USUARIOS UTA</option>
            </select>
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-sm rounded-md bg-[#581517] text-white hover:bg-[#7a1c1c]"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;
