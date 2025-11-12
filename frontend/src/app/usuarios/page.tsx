"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import MisEventos from "./MisEventos";
//import EventosGenerales from "./EventosGenerales";
import RolMenu from "./RolMenu";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 🔹 Simula obtener datos del usuario (luego se conectará con backend)
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");

    if (!userData.id) {
      router.push("/login");
      return;
    }

    setUser(userData);

    // 🔹 Mostrar alerta si es la primera vez
    if (userData.isFirstLogin) {
      Swal.fire({
        title: "¡Bienvenido!",
        text: "Por favor completa los datos faltantes en tu perfil.",
        icon: "info",
        confirmButtonText: "Ir al perfil",
      }).then(() => router.push("/dashboard/perfil"));
    }
  }, [router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 relative">
      {/* 🔹 Flecha de roles */}
      {(user.role === "docente" || user.role === "responsable") && (
        <RolMenu role={user.role} />
      )}

      {/* 🔹 Sección: Mis eventos */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Mis eventos en proceso</h2>
        <MisEventos userId={user.id} />
      </section>

      {/* 🔹 Sección: Eventos generales 
      <section>
        <h2 className="text-xl font-semibold mb-4">Eventos generales</h2>
        <EventosGenerales />
      </section>*/}
    </div>
  );
}
