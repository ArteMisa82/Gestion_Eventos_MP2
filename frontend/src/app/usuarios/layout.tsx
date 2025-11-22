"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function UsuariosLayout({ children }: { children: React.ReactNode }) {
  const { user, token, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [esResponsable, setEsResponsable] = useState(false);
  const [esDocente, setEsDocente] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificarRoles = async () => {
      if (!user || !token) {
        setLoading(false);
        return;
      }

      try {
        // Verificar si el usuario es responsable de algún evento
        const responseEventos = await fetch(
          `http://localhost:3001/api/eventos?id_responsable=${user.id_usu}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (responseEventos.ok) {
          const resultEventos = await responseEventos.json();
          const eventos = resultEventos.data || resultEventos;
          setEsResponsable(Array.isArray(eventos) && eventos.length > 0);
        }

        // Verificar si el usuario es docente (instructor en algún detalle)
        const responseDocente = await fetch(
          `http://localhost:3001/api/estudiantes/instructor/${user.id_usu}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (responseDocente.ok) {
          const resultDocente = await responseDocente.json();
          setEsDocente(resultDocente.success && resultDocente.data?.length > 0);
        }
      } catch (error) {
        console.error('Error verificando roles:', error);
      } finally {
        setLoading(false);
      }
    };

    verificarRoles();
  }, [user, token]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Debes iniciar sesión para acceder a esta página.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="w-full bg-[#7f1d1d] text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Panel de Usuario</h1>
            {user && (
              <p className="text-sm text-gray-200">Bienvenido, {user.nom_usu} {user.ape_usu}</p>
            )}
          </div>

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
