"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function DetalleCurso() {
  const { id } = useParams();
  const router = useRouter();

  const CURSOS = [
    { 
      id: 1, 
      title: "Liderazgo Estratégico", 
      progress: 70, 
      nota: 0, 
      asistencia: 0,
      categoria: "Desarrollo Personal",
      duracion: "8 semanas",
      instructor: "María González",
      descripcion: "Desarrolla habilidades de liderazgo para gestionar equipos de alto rendimiento.",
      materiales: [
        { tipo: "pdf", nombre: "Guía del curso", descargado: true },
        { tipo: "video", nombre: "Video introductorio", descargado: false },
        { tipo: "tarea", nombre: "Actividad 1 - Autoevaluación", descargado: true }
      ]
    },
    { 
      id: 2, 
      title: "Marketing Digital", 
      progress: 100, 
      nota: 96, 
      asistencia: 88,
      categoria: "Marketing",
      duracion: "6 semanas",
      instructor: "Carlos Rodríguez",
      descripcion: "Domina las estrategias digitales para potenciar tu marca en línea.",
      materiales: [
        { tipo: "pdf", nombre: "Manual de Marketing Digital", descargado: true },
        { tipo: "video", nombre: "Fundamentos del SEO", descargado: true },
        { tipo: "caso", nombre: "Estudio de caso - Campaña exitosa", descargado: true }
      ]
    },
  ];

  const [curso, setCurso] = useState<any>(null);

  useEffect(() => {
    const data = CURSOS.find((c) => c.id === Number(id));
    setCurso(data);
  }, [id]);

  if (!curso) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7f1d1d] mx-auto"></div>
        <p className="mt-4 text-gray-600">Cargando curso...</p>
      </div>
    </div>
  );

  const getMaterialIcon = (tipo: string) => {
    switch (tipo) {
      case "pdf": return "📘";
      case "video": return "🎥";
      case "tarea": return "📝";
      case "caso": return "📊";
      default: return "📄";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8">
      <div className="max-w-4xl mx-auto">

        {/* 🔙 FLECHA ATRÁS */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#7f1d1d] hover:text-[#991b1b] mb-6 transition p-3 rounded-xl hover:bg-white hover:shadow"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Volver a cursos</span>
        </button>

        {/* CARD PRINCIPAL */}
        <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-8">

          {/* ENCABEZADO */}
          <h1 className="text-3xl font-bold text-[#7f1d1d] mb-2">{curso.title}</h1>
          <p className="text-gray-700 mb-6">{curso.descripcion}</p>

          {/* INFORMACIÓN */}
          <div className="flex flex-wrap gap-6 text-gray-600 text-sm mb-6">
            <span>👨‍🏫 Instructor: {curso.instructor}</span>
            <span>⏳ Duración: {curso.duracion}</span>
            <span className="bg-gray-100 px-3 py-1 rounded-full border text-[#7f1d1d] font-medium">
              {curso.categoria}
            </span>
          </div>

          {/* PROGRESO */}
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-gray-700 font-medium">Progreso</span>
              <span className="text-[#7f1d1d] font-semibold">{curso.progress}%</span>
            </div>
            <div className="bg-gray-200 h-3 rounded-full">
              <div
                className="h-3 rounded-full transition-all"
                style={{
                  width: `${curso.progress}%`,
                  backgroundColor: curso.progress === 100 ? "#15803d" : "#7f1d1d",
                }}
              ></div>
            </div>
          </div>

          {/* CONTENIDO SEGÚN ESTADO */}
          {curso.progress < 100 ? (
            <>
              {/* ALERTA EN PROCESO */}
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 mb-6">
                <p className="font-semibold text-amber-800">Curso en progreso</p>
                <p className="text-amber-700 text-sm">Continúa con el material para avanzar</p>
              </div>

              {/* MATERIALES */}
              <h3 className="text-xl font-bold text-[#7f1d1d] mb-4">Material del curso</h3>

              <div className="grid gap-4">
  {curso.materiales.map((m: any, i: number) => (
    <div
      key={i}
      className="p-4 border border-[#7f1d1d]/30 rounded-xl bg-white shadow-sm relative overflow-hidden 
                 hover:shadow-md transition group"
    >
      {/* Línea lateral animada */}
      <div className="absolute left-0 top-0 h-full w-1 bg-[#7f1d1d] rounded-r-xl transform scale-y-0 group-hover:scale-y-100 origin-top transition duration-300"></div>

                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                    <span className="text-2xl">{getMaterialIcon(m.tipo)}</span>

                    <div>
                        <p className="font-semibold text-gray-700">{m.nombre}</p>
                        <p className="text-gray-500 text-sm capitalize">{m.tipo}</p>
                    </div>
                    </div>

                    <button className="bg-[#7f1d1d] text-white px-4 py-2 rounded-lg hover:bg-[#991b1b] transition">
                    {m.descargado ? "Descargar" : "Ver"}
                    </button>
                </div>
                </div>
            ))}
            </div>

            </>
          ) : (
            <>
              <div className="bg-green-50 border border-green-300 p-4 rounded-xl mb-6">
                <p className="font-semibold text-green-800">🎉 ¡Curso completado!</p>
                <p className="text-green-700 text-sm">Has finalizado este curso</p>
              </div>

              {/* ESTADISTICAS */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-100 border p-4 rounded-xl text-center">
                  <p className="text-gray-600 text-sm">Nota Final</p>
                  <p className="text-2xl text-[#7f1d1d] font-bold">{curso.nota}/100</p>
                </div>

                <div className="bg-gray-100 border p-4 rounded-xl text-center">
                  <p className="text-gray-600 text-sm">Asistencia</p>
                  <p className="text-2xl text-[#7f1d1d] font-bold">{curso.asistencia}%</p>
                </div>
              </div>

              {/* BOTÓN CERTIFICADO */}
              <button className="w-full bg-[#7f1d1d] text-white py-4 rounded-xl font-semibold hover:bg-[#991b1b] transition">
                Descargar Certificado 📄
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
