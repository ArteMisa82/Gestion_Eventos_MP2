"use client";
import React, { useState } from "react";

const OPCIONES_REQUISITOS = [
  "Asistencia requerida",
  "Nota requerida",
  "Carta de motivación",
  "Cédula",
  "Matrícula",
  "Título de tercer nivel"
];

interface CategoriaModalProps {
  onClose: () => void;
  onSave: (categoria: { nombre: string; requisitos: string[] }) => void;
}

export default function CategoriaModal({ onClose, onSave }: CategoriaModalProps) {
  const [name, setName] = useState("");
  const [requisitos, setRequisitos] = useState<string[]>([]);
  const [nuevoRequisito, setNuevoRequisito] = useState("");
  const [errors, setErrors] = useState<{ nombre?: string; nuevoRequisito?: string }>({});
  const [mostrarAgregarRequisito, setMostrarAgregarRequisito] = useState(false);

  const toggleRequisito = (req: string) => {
    setRequisitos((prev) =>
      prev.includes(req) ? prev.filter((r) => r !== req) : [...prev, req]
    );
  };

  const agregarRequisitoPersonalizado = () => {
    if (!nuevoRequisito.trim()) {
      setErrors({ ...errors, nuevoRequisito: "El requisito no puede estar vacío" });
      return;
    }

    if (requisitos.includes(nuevoRequisito.trim())) {
      setErrors({ ...errors, nuevoRequisito: "Este requisito ya existe" });
      return;
    }

    setRequisitos((prev) => [...prev, nuevoRequisito.trim()]);
    setNuevoRequisito("");
    setErrors({ ...errors, nuevoRequisito: undefined });
    setMostrarAgregarRequisito(false);
  };

  const eliminarRequisito = (req: string) => {
    setRequisitos((prev) => prev.filter((r) => r !== req));
  };

  const validateForm = () => {
    const newErrors: { nombre?: string } = {};
    
    if (!name.trim()) {
      newErrors.nombre = "El nombre es obligatorio";
    } else if (name.trim().length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    // Primero llamar a onSave con los datos
    onSave({
      nombre: name.trim(),
      requisitos,
    });

    // Luego cerrar el modal
    onClose();

    // Y finalmente resetear el formulario (esto es opcional, ya que el componente se desmonta)
    // setName("");
    // setRequisitos([]);
    // setNuevoRequisito("");
    // setErrors({});
    // setMostrarAgregarRequisito(false);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const esRequisitoPredefinido = (req: string) => {
    return OPCIONES_REQUISITOS.includes(req);
  };

  // Manejar la tecla Escape para cerrar el modal
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50 animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform animate-slideUp max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#581517]/10 rounded-lg">
                <svg className="w-6 h-6 text-[#581517]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Crear categoría
                </h2>
                <p className="text-sm text-gray-600">Agrega una nueva categoría al sistema</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
              title="Cerrar (Esc)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la categoría
              <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
                errors.nombre 
                  ? "border-red-300 focus:ring-red-200" 
                  : "border-gray-300 focus:border-[#581517] focus:ring-[#581517]/20"
              }`}
              placeholder="Ej: MasterClass, Taller, Curso..."
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.nombre) {
                  setErrors({ ...errors, nombre: undefined });
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          {/* Requisitos */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Requisitos
              </label>
              <button
                type="button"
                onClick={() => setMostrarAgregarRequisito(true)}
                className="text-sm bg-[#581517] text-white px-3 py-1 rounded-lg hover:bg-[#6f1a1d] transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar
              </button>
            </div>

            {/* Agregar requisito personalizado */}
            {mostrarAgregarRequisito && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nuevo requisito personalizado
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${
                      errors.nuevoRequisito 
                        ? "border-red-300 focus:ring-red-200" 
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                    placeholder="Ej: Certificado de idiomas..."
                    value={nuevoRequisito}
                    onChange={(e) => {
                      setNuevoRequisito(e.target.value);
                      if (errors.nuevoRequisito) {
                        setErrors({ ...errors, nuevoRequisito: undefined });
                      }
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        agregarRequisitoPersonalizado();
                      }
                    }}
                  />
                  <button
                    onClick={agregarRequisitoPersonalizado}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    title="Agregar requisito"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setMostrarAgregarRequisito(false);
                      setNuevoRequisito("");
                      setErrors({ ...errors, nuevoRequisito: undefined });
                    }}
                    className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    title="Cancelar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {errors.nuevoRequisito && (
                  <p className="mt-1 text-sm text-red-600">{errors.nuevoRequisito}</p>
                )}
              </div>
            )}

            {/* Lista de requisitos seleccionados */}
            {requisitos.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Requisitos seleccionados:</h4>
                <div className="space-y-2">
                  {requisitos.map((req) => (
                    <div 
                      key={req} 
                      className="flex items-center justify-between p-3 rounded-lg border bg-white group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          esRequisitoPredefinido(req) ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                        <span className="text-sm text-gray-700">{req}</span>
                        {!esRequisitoPredefinido(req) && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Personalizado
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => eliminarRequisito(req)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                        title="Eliminar requisito"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requisitos predefinidos */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Requisitos predefinidos:</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {OPCIONES_REQUISITOS.map((req) => (
                  <label 
                    key={req} 
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-gray-50 ${
                      requisitos.includes(req) 
                        ? "border-[#581517] bg-[#581517]/5" 
                        : "border-gray-200"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-[#581517] focus:ring-[#581517] border-gray-300 rounded"
                      checked={requisitos.includes(req)}
                      onChange={() => toggleRequisito(req)}
                    />
                    <span className="text-sm text-gray-700">{req}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contador */}
            <p className="mt-3 text-sm text-gray-500">
              {requisitos.length} requisito{requisitos.length !== 1 ? 's' : ''} seleccionado{requisitos.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#581517] text-white rounded-lg hover:bg-[#6f1a1d] transition-colors font-medium shadow-sm"
            >
              Crear categoría
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}