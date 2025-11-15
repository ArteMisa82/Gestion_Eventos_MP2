"use client";

import { useState } from "react";

interface ModalCambioContraseñaProps {
  isOpen: boolean;
  onClose: () => void;
  onPasswordChange: (datos: {
    actual: string;
    nueva: string;
    confirmar: string;
  }) => void;
}

export default function ModalCambioContraseña({
  isOpen,
  onClose,
  onPasswordChange,
}: ModalCambioContraseñaProps) {
  const [formData, setFormData] = useState({
    actual: "",
    nueva: "",
    confirmar: "",
  });

  const [ver, setVer] = useState({
    actual: false,
    nueva: false,
    confirmar: false,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.nueva !== formData.confirmar) {
      alert("Las contraseñas no coinciden");
      return;
    }

    if (formData.nueva.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    onPasswordChange(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 mx-4">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#7A1C1C]">Cambiar Contraseña</h2>
          
          <button
            onClick={onClose}
            className="text-[#7A1C1C] hover:text-[#5e1313] transition-colors duration-200 p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {[
            { key: "actual", label: "Contraseña Actual" },
            { key: "nueva", label: "Nueva Contraseña" },
            { key: "confirmar", label: "Confirmar Contraseña" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="font-semibold text-gray-700 text-sm block mb-2">
                {label}
              </label>

              <div className="relative">
                <input
                  type={ver[key as keyof typeof ver] ? "text" : "password"}
                  value={formData[key as keyof typeof formData]}
                  className="w-full p-3 border border-gray-300 rounded-xl 
                             bg-gray-50 text-gray-700
                             focus:ring-2 focus:ring-[#7A1C1C] 
                             focus:border-transparent transition-all duration-200"
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                  placeholder={`Ingresa tu ${label.toLowerCase()}`}
                  required
                />

                <button
                  type="button"
                  onClick={() =>
                    setVer({ ...ver, [key]: !ver[key as keyof typeof ver] })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 
                             text-gray-500 hover:text-[#7A1C1C] transition-colors duration-200"
                >
                  {ver[key as keyof typeof ver] ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {key === "nueva" && (
                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
              )}
            </div>
          ))}

          {/* Botón guardar */}
          <button
            type="submit"
            className="w-full bg-[#7A1C1C] text-white py-3 rounded-xl font-semibold
                       shadow-md hover:bg-[#5e1313] transition-all duration-300 hover:scale-[1.02] mt-4"
          >
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}
