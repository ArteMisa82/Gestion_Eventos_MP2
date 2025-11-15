"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";

const CURSOS_EN_PROCESO = [
  {
    id: 1,
    title: "Liderazgo Estratégico",
    cover: "/Default_Image.png",
    progress: 70,
    career: "SOFTWARE",
    hours: 20,
  },
  {
    id: 2,
    title: "Marketing Digital",
    cover: "/Default_Image.png",
    progress: 45,
    career: "TI",
    hours: 18,
  },
];

export default function MisCursos() {
  const router = useRouter();

  // 🔹 Al loguearse por primera vez → mostrar mensaje
  useEffect(() => {
    const primeraVez = localStorage.getItem("primeraVez");

    if (!primeraVez) {
      Swal.fire({
        title: "Bienvenido 👋",
        text: "Completa tus datos faltantes en tu perfil para mejorar tu experiencia.",
        icon: "info",
        confirmButtonText: "Ir al perfil",
        confirmButtonColor: "#7f1d1d",
      }).then(() => {
        router.push("/usuarios/perfil");
      });

      localStorage.setItem("primeraVez", "false");
    }
  }, [router]);

  const irAlCurso = (id: number) => {
    router.push(`/usuarios/cursos/${id}`);
  };

  const irACursosGenerales = () => {
    router.push("/cursos");
  };

  return (
    <div className="min-h-screen">

      <main className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-[#7f1d1d]">
            Mis Cursos en Proceso
          </h1>
          <span className="text-sm text-gray-600">
            {CURSOS_EN_PROCESO.length} curso(s)
          </span>
        </header>

        {/* 🔹 Si no hay cursos, mostrar mensaje */}
        {CURSOS_EN_PROCESO.length === 0 && (
          <div className="text-center py-16">
            <Image
              src="/no_courses.svg"
              width={180}
              height={180}
              alt="Sin cursos"
              className="mx-auto opacity-80"
            />
            <h2 className="text-xl font-bold mt-4 text-gray-700">
              Aún no estás inscrito en ningún curso
            </h2>
            <p className="text-gray-500 mt-2">
              Explora nuestros cursos disponibles y empieza tu formación.
            </p>

            <button
              onClick={irACursosGenerales}
              className="mt-6 bg-[#7f1d1d] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#991b1b] transition"
            >
              Ver cursos disponibles →
            </button>
          </div>
        )}

        {/* 🔹 Mostrar cursos en proceso */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CURSOS_EN_PROCESO.map((curso) => (
            <div
              key={curso.id}
              className="bg-white rounded-xl shadow hover:shadow-xl transition-all duration-200 border border-gray-200 overflow-hidden"
            >
              {/* Cover */}
              <div className="relative h-40 w-full">
                <Image
                  src={curso.cover}
                  alt={curso.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 bg-[#7f1d1d] text-white text-xs px-3 py-1 rounded-full font-bold">
                  {curso.career}
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                <h2 className="font-bold text-lg text-gray-900 line-clamp-2">
                  {curso.title}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Duración: {curso.hours} horas
                </p>

                {/* Progress */}
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-full bg-[#7f1d1d] rounded-full transition-all"
                      style={{ width: `${curso.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Progreso: {curso.progress}%
                  </p>
                </div>

                {/* Botón */}
                <button
                  onClick={() => irAlCurso(curso.id)}
                  className="mt-4 w-full bg-[#7f1d1d] text-white py-2 rounded-lg font-semibold hover:bg-[#991b1b] transition"
                >
                  Continuar →
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
