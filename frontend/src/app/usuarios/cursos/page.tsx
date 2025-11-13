"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import MisEventos from "./MisEventos";
import MenuDocente from "./MenuDocente";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

export default function CursosPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    // 🔹 Simular obtención del usuario (luego conectas al backend)
    const storedUser = JSON.parse(localStorage.getItem("usuarioLogueado"));
    if (!storedUser) {
      router.push("/login");
      return;
    }

    setUser(storedUser);

    // 🔹 Mostrar alerta si es primer login (faltan datos de perfil)
    if (!storedUser.segundoNombre || !storedUser.segundoApellido) {
      Swal.fire({
        title: "Bienvenido 👋",
        text: "Por favor completa los datos faltantes en tu perfil.",
        icon: "info",
        confirmButtonText: "Ir al perfil",
      }).then(() => {
        router.push("/usuarios/perfil");
      });
    }
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* 🔹 Header con foto y menú de roles */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Mis eventos en proceso
        </h1>

        <div className="flex items-center gap-3">
          {/* Foto del usuario */}
          <Image
            src={user.foto || "/default-avatar.png"}
            alt="Avatar"
            width={40}
            height={40}
            className="rounded-full border cursor-pointer"
            onClick={() => router.push("/usuarios/perfil")}
          />

          {/* Menú para docentes o responsables */}
          {(user.rol === "docente" || user.rol === "responsable") && (
            <div className="relative">
              <ChevronDown
                onClick={() => setMenuOpen(!menuOpen)}
                className="cursor-pointer hover:text-blue-500"
              />
              {menuOpen && (
                <MenuDocente
                  cursos={user.cursosAsignados || []}
                  onSelect={(cursoId) =>
                    router.push(`/${user.rol}/${cursoId}`)
                  }
                />
              )}
            </div>
          )}
        </div>
      </header>

      {/* 🔹 Mostrar solo eventos del usuario */}
      <MisEventos userId={user.id} />
    </div>
  );
}
