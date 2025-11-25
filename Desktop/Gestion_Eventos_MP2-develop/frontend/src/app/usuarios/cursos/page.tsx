"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Swal from "sweetalert2";
import { useAuth } from "@/hooks/useAuth";

interface Curso {
  id_reg_per: string;
  num_reg_per: string;
  id_reg_evt: string;
  registro_evento: {
    id_det: string;
    detalle_eventos: {
      id_det: string;
      hor_det: number;
      are_det: string;
      cat_det: string;
      tip_evt: string;
      eventos: {
        id_evt: string;
        nom_evt: string;
        fec_evt: string;
        ima_evt: string | null;
        mod_evt: string;
        lug_evt: string;
      };
    };
  };
}

export default function MisCursosYEventos() {
  const router = useRouter();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<"cursos" | "eventos">("cursos");
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [eventos, setEventos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos del backend
  useEffect(() => {
    const cargarDatos = async () => {
      if (!user || !token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:3001/api/registro-personas/usuario/${user.id_usu}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          const registros: Curso[] = Array.isArray(data) ? data : [];
          
          // Separar cursos y eventos según el tipo
          const cursosList = registros.filter(r => 
            r.registro_evento?.detalle_eventos?.tip_evt === 'CURSO'
          );
          const eventosList = registros.filter(r => 
            r.registro_evento?.detalle_eventos?.tip_evt !== 'CURSO'
          );
          
          setCursos(cursosList);
          setEventos(eventosList);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [user, token]);

  // Al loguearse por primera vez → mostrar mensaje
  useEffect(() => {
    const primeraVez = localStorage.getItem("primeraVez");

    if (!primeraVez && user) {
      const userData = user as any;
      const faltanDatos = !userData.ced_usu || !userData.tel_usu || !userData.niv_usu;

      if (faltanDatos) {
        Swal.fire({
          title: "Bienvenido 👋",
          text: "Completa tus datos faltantes en tu perfil para mejorar tu experiencia.",
          icon: "info",
          confirmButtonText: "Ir al perfil",
          confirmButtonColor: "#7f1d1d",
        }).then(() => {
          router.push("/usuarios/perfil");
        });
      }

      localStorage.setItem("primeraVez", "false");
    }
  }, [router, user]);

  const irAlCurso = (idEvento: string) => {
    router.push(`/cursos/${idEvento}`);
  };

  const irAlEvento = (idEvento: string) => {
    router.push(`/cursos/${idEvento}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Cargando tus cursos y eventos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header con Tabs */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#7f1d1d] mb-4">
            Mi Aprendizaje y Eventos
          </h1>
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab("cursos")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === "cursos"
                  ? "bg-[#7f1d1d] text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Mis Cursos
            </button>
            <button
              onClick={() => setActiveTab("eventos")}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                activeTab === "eventos"
                  ? "bg-[#7f1d1d] text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Mis Eventos
            </button>
          </div>
        </div>

        {/* Sección de Cursos */}
        {activeTab === "cursos" && (
          <section>
            <header className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Mis Cursos Inscritos
              </h2>
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {cursos.length} curso(s)
              </span>
            </header>

            {cursos.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <div className="text-6xl mb-4">📚</div>
                <h2 className="text-xl font-bold mt-4 text-gray-700">
                  Aún no estás inscrito en ningún curso
                </h2>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  Explora nuestros cursos disponibles y empieza tu formación profesional.
                </p>
                <button
                  onClick={() => router.push("/cursos")}
                  className="mt-6 bg-[#7f1d1d] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#991b1b] transition shadow-md hover:shadow-lg"
                >
                  Explorar Cursos Disponibles →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cursos.map((curso) => {
                  const detalle = curso.registro_evento.detalle_eventos;
                  const evento = detalle.eventos;
                  
                  return (
                    <div
                      key={curso.id_reg_per}
                      className="bg-white rounded-xl shadow hover:shadow-xl transition-all duration-200 border border-gray-200 overflow-hidden cursor-pointer"
                      onClick={() => irAlCurso(evento.id_evt)}
                    >
                      {/* Cover */}
                      <div className="relative h-40 w-full">
                        <Image
                          src={evento.ima_evt || "/Default_Image.png"}
                          alt={evento.nom_evt}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-[#7f1d1d] text-white text-xs px-3 py-1 rounded-full font-bold">
                          {detalle.are_det}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4">
                        <h2 className="font-bold text-lg text-gray-900 line-clamp-2">
                          {evento.nom_evt}
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                          Duración: {detalle.hor_det} horas
                        </p>

                        <p className="text-xs text-gray-400 mt-2">
                          N° Registro: {curso.num_reg_per}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          Modalidad: {evento.mod_evt}
                        </p>

                        {/* Botón */}
                        <button
                          className="mt-4 w-full bg-[#7f1d1d] text-white py-2 rounded-lg font-semibold hover:bg-[#991b1b] transition"
                        >
                          Ver Detalles →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Sección de Eventos */}
        {activeTab === "eventos" && (
          <section>
            <header className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Mis Eventos Inscritos
              </h2>
              <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {eventos.length} evento(s)
              </span>
            </header>

            {eventos.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-xl font-bold mt-4 text-gray-700">
                  Aún no estás inscrito en ningún evento
                </h2>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                  Descubre eventos emocionantes y amplía tu red de contactos profesionales.
                </p>
                <button
                  onClick={() => router.push("/cursos")}
                  className="mt-6 bg-[#7f1d1d] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#991b1b] transition shadow-md hover:shadow-lg"
                >
                  Explorar Eventos Disponibles →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventos.map((evento) => {
                  const detalle = evento.registro_evento.detalle_eventos;
                  const evt = detalle.eventos;
                  
                  return (
                    <div
                      key={evento.id_reg_per}
                      className="bg-white rounded-xl shadow hover:shadow-xl transition-all duration-200 border border-gray-200 overflow-hidden cursor-pointer"
                      onClick={() => irAlEvento(evt.id_evt)}
                    >
                      {/* Cover */}
                      <div className="relative h-40 w-full">
                        <Image
                          src={evt.ima_evt || "/Default_Image.png"}
                          alt={evt.nom_evt}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-[#7f1d1d] text-white text-xs px-3 py-1 rounded-full font-bold">
                          {detalle.are_det}
                        </div>
                        <div className="absolute top-2 right-2 bg-purple-100 text-purple-800 border-purple-200 text-xs px-2 py-1 rounded-full border font-semibold">
                          {evt.mod_evt}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-4">
                        <h2 className="font-bold text-lg text-gray-900 line-clamp-2 mb-2">
                          {evt.nom_evt}
                        </h2>

                        <div className="space-y-1 text-sm text-gray-600 mb-3">
                          <p className="flex items-center gap-1">
                            <span className="font-semibold">📅</span> {formatDate(evt.fec_evt)}
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="font-semibold">📍</span> {evt.lug_evt}
                          </p>
                          <p className="flex items-center gap-1">
                            <span className="font-semibold">⏱️</span> {detalle.hor_det} horas
                          </p>
                        </div>

                        <p className="text-xs text-gray-400 mb-2">
                          N° Registro: {evento.num_reg_per}
                        </p>

                        {/* Botón */}
                        <button
                          className="mt-2 w-full bg-[#7f1d1d] text-white py-2 rounded-lg font-semibold hover:bg-[#991b1b] transition"
                        >
                          Ver Detalles →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}