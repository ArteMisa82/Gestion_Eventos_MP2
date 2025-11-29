"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";

export interface Categoria {
  id: string;
  nombre: string;
  requisitos: string[];
  fechaCreacion: Date;
}

interface CategoriasContextType {
  categorias: Categoria[];
  agregarCategoria: (categoria: Omit<Categoria, 'id' | 'fechaCreacion'>) => void;
  eliminarCategoria: (id: string) => void;
}

const CategoriasContext = createContext<CategoriasContextType | undefined>(undefined);

export const CategoriasProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const agregarCategoria = (categoriaData: Omit<Categoria, 'id' | 'fechaCreacion'>) => {
    const nuevaCategoria: Categoria = {
      ...categoriaData,
      id: Date.now().toString(),
      fechaCreacion: new Date()
    };
    setCategorias((prev) => [...prev, nuevaCategoria]);
  };

  const eliminarCategoria = (id: string) => {
    setCategorias((prev) => prev.filter(cat => cat.id !== id));
  };

  return (
    <CategoriasContext.Provider value={{ categorias, agregarCategoria, eliminarCategoria }}>
      {children}
    </CategoriasContext.Provider>
  );
};

export const useCategorias = () => {
  const context = useContext(CategoriasContext);
  if (context === undefined) {
    throw new Error('useCategorias debe ser usado dentro de un CategoriasProvider');
  }
  return context;
};