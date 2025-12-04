"use client";
import React, { useState } from "react";
import CategoriaModal from "./components/CategoriaModal";
import CategoriaCard from "./components/CategoriaCard";
import { useCategorias } from "@/contexts/CategoriasContext";

export default function CategoriasPage() {
  const { categorias, agregarCategoria, eliminarCategoria } = useCategorias();
  const [showModal, setShowModal] = useState(false);

  const handleAddCategoria = (categoriaData: { nombre: string; requisitos: string[] }) => {
    agregarCategoria(categoriaData);
    setShowModal(false);
  };

  const handleDeleteCategoria = (id: string) => {
    eliminarCategoria(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#581517]">Gestión de Categorías</h1>
            <p className="text-gray-600 mt-1">Administra las categorías y sus requisitos</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-[#581517] text-white rounded-lg hover:bg-[#6f1a1d] transition-colors duration-200 font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nueva categoría
          </button>
        </div>

        {/* Estadísticas */}
        {categorias.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#581517]">{categorias.length}</div>
                <div className="text-gray-600">Total categorías</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#581517]">
                  {categorias.reduce((acc, cat) => acc + cat.requisitos.length, 0)}
                </div>
                <div className="text-gray-600">Requisitos totales</div>
              </div>
            </div>
          </div>
        )}

        {/* Grid de categorías */}
        {categorias.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay categorías</h3>
            <p className="text-gray-500 mb-4">Comienza creando tu primera categoría</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-[#581517] text-white rounded-md hover:bg-[#6f1a1d] transition-colors"
            >
              Crear categoría
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categorias.map((categoria) => (
              <CategoriaCard 
                key={categoria.id} 
                categoria={categoria}
                onDelete={handleDeleteCategoria}
              />
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <CategoriaModal
            onClose={() => setShowModal(false)}
            onSave={handleAddCategoria}
          />
        )}
      </div>
    </div>
  );
}