"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function NavbarUsuario() {
  const [open, setOpen] = useState(false);

  // Simulación – luego vendrá del backend
  const usuario = {
    nombre: "Juan Pérez",
    rol: "docente", // valores posibles: "usuario", "docente", "responsable"
  };

  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <Link href="/usuarios" className="font-bold text-xl">
        Panel Usuario
      </Link>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 p-2 rounded hover:bg-gray-100"
        >
          <span>{usuario.nombre}</span>
          <ChevronDown size={16} />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 bg-white shadow rounded w-48 p-2">
            <Link
              href="/usuarios/perfil"
              className="block px-2 py-1 hover:bg-gray-100"
            >
              Mi Perfil
            </Link>

            <Link
              href="/usuarios/cursos"
              className="block px-2 py-1 hover:bg-gray-100"
            >
              Mis Cursos
            </Link>

            {usuario.rol === "docente" && (
              <Link
                href="/docente"
                className="block px-2 py-1 hover:bg-gray-100"
              >
                Panel Docente
              </Link>
            )}

            {usuario.rol === "responsable" && (
              <Link
                href="/responsable"
                className="block px-2 py-1 hover:bg-gray-100"
              >
                Panel Responsable
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
