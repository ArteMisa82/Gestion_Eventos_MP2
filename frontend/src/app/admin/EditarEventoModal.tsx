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
  img_evt: string;
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
  const [formData, setFormData] = React.useState<Evento>(evento);
  const [imagePreview, setImagePreview] = React.useState<string>(evento.img_evt);

  // Manejar cambios en los campos de texto
  const handleInputChange = (field: keyof Evento, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Manejar cambio de imagen
  const handleImageChange = (file: File | null) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageURL = reader.result as string;
      setImagePreview(imageURL);
      setFormData(prev => ({ ...prev, img_evt: imageURL }));
    };
    reader.readAsDataURL(file);
  };

  // Validar y enviar formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Campos del formulario
  const formFields = [
    {
      label: "Nombre del evento",
      type: "text" as const,
      key: "nom_evt" as keyof Evento,
      value: formData.nom_evt,
      required: true
    },
    {
      label: "Fecha",
      type: "date" as const,
      key: "fec_evt" as keyof Evento,
      value: formData.fec_evt,
      required: true
    },
    {
      label: "Lugar",
      type: "text" as const,
      key: "lug_evt" as keyof Evento,
      value: formData.lug_evt,
      required: true
    }
  ];

  const selectFields = [
    {
      label: "Modalidad",
      key: "mod_evt" as keyof Evento,
      value: formData.mod_evt,
      options: [
        { value: "VIRTUAL", label: "Virtual" },
        { value: "PRESENCIAL", label: "Presencial" }
      ]
    },
    {
      label: "Público",
      key: "tip_pub_evt" as keyof Evento,
      value: formData.tip_pub_evt,
      options: [
        { value: "GENERAL", label: "General" },
        { value: "USUARIOS UTA", label: "Usuarios UTA" }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md max-h-[90vh] rounded-xl shadow-lg flex flex-col animate-fadeIn">
        {/* Header fijo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-[#581517]">
            Editar Evento
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Cerrar modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Formulario con scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Sección de imagen */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Imagen del evento
              </label>
              
              {/* Preview de imagen */}
              <div className="relative aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Vista previa del evento"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Input de archivo */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
              />
            </div>

            {/* Campos de texto */}
            <div className="space-y-4">
              {formFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#581517] focus:border-transparent transition-colors"
                    required={field.required}
                  />
                </div>
              ))}
            </div>

            {/* Campos de selección */}
            <div className="space-y-4">
              {selectFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <select
                    value={field.value}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#581517] focus:border-transparent transition-colors"
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Acciones fijas en la parte inferior */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#581517] transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-medium text-white bg-[#581517] border border-transparent rounded-md hover:bg-[#7a1c1c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#581517] transition-colors"
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEventModal;