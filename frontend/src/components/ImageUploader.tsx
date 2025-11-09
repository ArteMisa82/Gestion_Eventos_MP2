"use client";
import React, { useRef } from "react";
import { Upload, Image, X, Replace } from "lucide-react";

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

export default function ImageUploader({ label, value, onChange }: ImageUploaderProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) onChange(reader.result.toString());
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    onChange("");
    if (fileInput.current) {
      fileInput.current.value = "";
    }
  }

  function handleClick() {
    fileInput.current?.click();
  }

  return (
    <div className="mb-6">
      <label className="block mb-3 text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Columna izquierda - Vista previa de la imagen */}
        <div className="w-full md:w-1/2">
          {value ? (
            <div className="relative group">
              <div className="relative bg-gray-100 rounded-lg border-2 border-gray-200 p-4">
                <img
                  src={value}
                  alt="Vista previa"
                  className="w-full h-64 object-contain rounded-md"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">
                Vista previa de la imagen actual
              </p>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 p-8 text-center h-64 flex items-center justify-center">
              <div className="text-gray-400">
                <Image className="w-16 h-16 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No hay imagen seleccionada</p>
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha - Controles de subida */}
        <div className="w-full md:w-1/2 space-y-4">
          {/* Área de subida principal */}
          <div
            onClick={handleClick}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer transition-all duration-200 hover:border-[#581517] hover:bg-gray-50 bg-white"
          >
            <div className="flex flex-col items-center justify-center">
              <Upload className="w-10 h-10 text-gray-400 mb-3" />
              <span className="text-sm font-medium text-gray-700 mb-1">
                {value ? "Cambiar imagen" : "Seleccionar imagen"}
              </span>
              <span className="text-xs text-gray-500">
                Haz clic aquí para {value ? "cambiar" : "subir"} la imagen
              </span>
            </div>
          </div>

          {/* Botón alternativo */}
          {value && (
            <button
              onClick={handleClick}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#581517] text-white rounded-lg font-medium hover:bg-[#6e1b1b] transition-all shadow-sm"
            >
              <Replace size={18} />
              Seleccionar otra imagen
            </button>
          )}

          {/* Información de formatos */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="text-xs font-semibold text-blue-800 mb-2">
              Información importante:
            </h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Formatos: PNG, JPG, JPEG</li>
              <li>• Tamaño máximo: 5MB</li>
              <li>• Relación recomendada: 16:9</li>
              <li>• Calidad: Mínimo 800x450px</li>
            </ul>
          </div>

          {/* Estado actual */}
          {value && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-700 font-medium">
                ✓ Imagen cargada correctamente
              </p>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/png, image/jpeg, image/jpg"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}