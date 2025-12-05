import React from "react";
import { Categoria } from "../page";

interface CategoriaCardProps {
  categoria: Categoria;
  onDelete?: (id: string) => void;
}

const OPCIONES_REQUISITOS = [
  "Asistencia requerida",
  "Nota requerida",
  "Carta de motivación",
  "Cédula",
  "Matrícula",
  "Título de tercer nivel"
];

export default function CategoriaCard({ categoria, onDelete }: CategoriaCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const esRequisitoPredefinido = (req: string) => {
    return OPCIONES_REQUISITOS.includes(req);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200 group">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#581517] line-clamp-2">
            {categoria.nombre}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Creada el {formatDate(categoria.fechaCreacion)}
          </p>
        </div>
        
        {onDelete && (
          <button
            onClick={() => onDelete(categoria.id)}
            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all duration-200"
            title="Eliminar categoría"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Requisitos */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            Requisitos ({categoria.requisitos.length})
          </span>
        </div>

        {categoria.requisitos.length > 0 ? (
          <ul className="space-y-2">
            {categoria.requisitos.map((requisito, index) => (
              <li 
                key={index} 
                className="flex items-center justify-between text-sm bg-gray-50 px-3 py-2 rounded-lg group"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    esRequisitoPredefinido(requisito) ? 'bg-green-500' : 'bg-blue-500'
                  }`}></div>
                  <span className="text-gray-600">{requisito}</span>
                  {!esRequisitoPredefinido(requisito) && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Personalizado
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
            <svg className="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">Sin requisitos</p>
          </div>
        )}
      </div>
    </div>
  );
}