"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export default function UsuariosLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // 🔹 Estos valores deben venir del backend o del JWT
  const [esResponsable, setEsResponsable] = useState(false);
  const [esDocente, setEsDocente] = useState(false);

  useEffect(() => {
    // Aquí debes reemplazar con tus datos reales del usuario logueado
    // Ejemplo de lectura desde localStorage o API:

    const rolGuardado = JSON.parse(localStorage.getItem("ROL_USUARIO") || "{}");

    setEsResponsable(rolGuardado.esResponsable || false);
    setEsDocente(rolGuardado.esDocente || false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="w-full bg-[#7f1d1d] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Panel de Usuario</h1>

          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 px-3 py-2 bg-[#a3161f] rounded-md hover:bg-[#8e1118] transition"
            >
              Opciones <ChevronDown size={18} />
            </button>

            {/* Menú desplegable */}
            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg p-2">
                <Link
                  href="/usuarios/perfil"
                  className="block px-3 py-2 rounded-md hover:bg-gray-200"
                >
                  Mi Perfil
                </Link>

                <Link
                  href="/usuarios/cursos"
                  className="block px-3 py-2 rounded-md hover:bg-gray-200"
                >
                  Mis Cursos
                </Link>

                <Link
                  href="/usuarios/eventos"
                  className="block px-3 py-2 rounded-md hover:bg-gray-200"
                >
                  Mis Eventos
                </Link>

                {/* 🔹 Panel Responsable solo si fue asignado por el ADMINISTRADOR */}
                {esResponsable && (
                  <Link
                    href="/responsable"
                    className="block px-3 py-2 rounded-md hover:bg-gray-200"
                  >
                    Panel Responsable
                  </Link>
                )}

                {/* 🔹 Panel Docente solo si fue asignado por el RESPONSABLE */}
                {esDocente && (
                  <Link
                    href="/cursos/docente"
                    className="block px-3 py-2 rounded-md hover:bg-gray-200"
                  >
                    Panel Docente
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
