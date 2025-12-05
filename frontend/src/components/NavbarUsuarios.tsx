"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

export default function NavbarUsuario() {
  const [open, setOpen] = useState(false);

  const { user, isLoading } = useAuth();

  // Determinar roles a partir del perfil cargado
  const esDocente = !!(user?.detalle_instructores && user.detalle_instructores.length > 0);
  const esResponsable = !!(user?.eventos && user.eventos.length > 0);

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
          <span>{user?.nom_usu || 'Usuario'}</span>
          <ChevronDown size={16} />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 bg-white shadow rounded w-48 p-2">
            <Link href="/usuarios/perfil" className="block px-2 py-1 hover:bg-gray-100">Mi Perfil</Link>

            <Link href="/usuarios/cursos" className="block px-2 py-1 hover:bg-gray-100">Mis Cursos</Link>

            {esDocente && (
              <Link
                href="/docente"
                className="block px-2 py-1 hover:bg-gray-100"
              >
                Panel Docente
              </Link>
            )}

            {esResponsable && (
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
