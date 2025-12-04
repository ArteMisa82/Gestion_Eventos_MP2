"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Edit, Loader2, ArrowLeft, Users, GraduationCap } from "lucide-react";
import ModalEditarEvento from "./ModalEditar";
import Swal from "sweetalert2";
import { eventosAPI } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

interface Evento {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  modalidad: string;
  capacidad: number;
  publico: "Estudiantes" | "General" | string;
  horas: number;
  pago: "Gratis" | "Pago" | string;
  carreras: string[];
  semestres: string[];
  tipoEvento: string;
  camposExtra: Record<string, string>;
  estado: "Editando" | "Publicado" | "Cerrado";
  // Campos del backend
  id_evt?: string;
  nom_evt?: string;
  fec_evt?: string;
  lug_evt?: string;
  mod_evt?: string;
  tip_pub_evt?: string;
  cos_evt?: string;
  des_evt?: string;
  est_evt?: string;
  docente?: string;
}

export default function DashboardResponsable() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Proteger la ruta - solo usuarios autenticados que NO sean estudiantes
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user || user.stu_usu === 1)) {
      // Redirigir si no está autenticado o si es estudiante
      router.push("/");
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Función helper para transformar eventos del backend
  const transformarEvento = (evento: any): Evento => {
    // Extraer tarifas desde tarifas_evento
    const tarifaEstudiante = evento.tarifas_evento?.find((t: any) => t.tip_par === "ESTUDIANTE");
    const tarifaPersona = evento.tarifas_evento?.find((t: any) => t.tip_par === "PERSONA");
    
    // Función para extraer solo la fecha (yyyy-MM-dd) sin conversión de zona horaria
    const extraerFecha = (fechaISO: string | undefined): string => {
      if (!fechaISO) return "";
      // Extraer solo la parte de fecha (yyyy-MM-dd) sin conversión
      return fechaISO.split('T')[0];
    };

    // Función para formato de visualización (dd/MM/yyyy)
    const formatearParaVisualizacion = (fechaISO: string | undefined): string => {
      if (!fechaISO) return "";
      const fecha = extraerFecha(fechaISO);
      const [year, month, day] = fecha.split('-');
      return `${day}/${month}/${year}`;
    };
    
    return {
      id: evento.id_evt,
      id_evt: evento.id_evt,
      nombre: evento.nom_evt,
      nom_evt: evento.nom_evt,
      fechaInicio: formatearParaVisualizacion(evento.fec_evt),
      fechaFin: formatearParaVisualizacion(evento.fec_fin_evt),
      fec_evt: evento.fec_evt,
      fec_fin_evt: evento.fec_fin_evt,
      modalidad: evento.mod_evt || "",
      mod_evt: evento.mod_evt,
      capacidad: evento.capacidad || evento.cupos || 0,
      cupos: evento.cupos || evento.capacidad || 0,
      publico: evento.tip_pub_evt === "GENERAL" ? "General" : "Estudiantes",
      tip_pub_evt: evento.tip_pub_evt,
      horas: evento.horas || 0,
      pago: evento.cos_evt === "GRATUITO" ? "Gratis" : "Pago",
      cos_evt: evento.cos_evt,
      precioEstudiantes: tarifaEstudiante?.val_evt || 0,
      precioGeneral: tarifaPersona?.val_evt || 0,
      carreras: evento.carreras || [],
      semestres: evento.semestres || [],
      docentes: evento.docentes || [],
      tipoEvento: evento.tipoEvento || evento.categoria || "",
      categoria: evento.categoria || evento.tipoEvento || "",
      camposExtra: evento.camposExtra || {},
      lugar: evento.lug_evt || "",
      lug_evt: evento.lug_evt,
      horario: evento.horario || "",
      des_evt: evento.des_evt,
      est_evt: evento.est_evt,
      estado: evento.est_evt === "PUBLICADO" ? "Publicado" : evento.est_evt === "CERRADO" ? "Cerrado" : "Editando",
    };
  };

  useEffect(() => {
    const fetchMisEventos = async () => {
      try {
        const response = await eventosAPI.getMisEventos();
        const data = response.data || response;
        
        if (!Array.isArray(data)) {
          console.error("Los datos no son un array:", data);
          throw new Error("Formato de datos inválido recibido del servidor");
        }
        
        const eventosTransformados = data.map(transformarEvento);

        setEventos(eventosTransformados);
      } catch (error: any) {
        console.error("Error al cargar eventos:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudieron cargar tus eventos asignados",
          confirmButtonColor: "#581517",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMisEventos();
  }, []);

  const handleGuardar = async (eventoActualizado: any) => {
    // Recargar el evento completo desde el backend para tener datos actualizados
    try {
      const response = await eventosAPI.getMisEventos();
      const data = response.data || response;
      
      if (Array.isArray(data)) {
        const eventosTransformados = data.map(transformarEvento);
        setEventos(eventosTransformados);
      }
    } catch (error) {
      console.error("Error al recargar eventos:", error);
    }
    
    setEventoEditando(null);
  };

  const handleEstadoChange = async (id: string, nuevoEstado: Evento["estado"]) => {
    try {
      let estadoBackend = "EDITANDO";
      if (nuevoEstado === "Publicado") estadoBackend = "PUBLICADO";
      else if (nuevoEstado === "Cerrado") estadoBackend = "CERRADO";

      // Obtener el evento actual para enviar sus carreras y semestres
      const evento = eventos.find(ev => ev.id === id);
      
      await eventosAPI.update(id, {
        est_evt: estadoBackend,
        // Enviar carreras y semestres para crear los registros de evento
        ...(evento?.carreras && evento.carreras.length > 0 && { carreras: evento.carreras }),
        ...(evento?.semestres && evento.semestres.length > 0 && { semestres: evento.semestres })
      });

      setEventos((prev) =>
        prev.map((ev) =>
          ev.id === id ? { ...ev, estado: nuevoEstado, est_evt: estadoBackend } : ev
        )
      );

      await Swal.fire({
        icon: "success",
        title: "Estado actualizado",
        text: `El evento ahora está ${nuevoEstado}`,
        confirmButtonColor: "#581517",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error: any) {
      console.error("Error al actualizar estado:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo actualizar el estado del evento",
        confirmButtonColor: "#581517",
      });
    }
  };

  const handleCarrerasChange = async (id: string, nuevasCarreras: string[]) => {
    try {
      await eventosAPI.update(id, {
        carreras: nuevasCarreras
      });

      setEventos((prev) =>
        prev.map((ev) =>
          ev.id === id ? { ...ev, carreras: nuevasCarreras } : ev
        )
      );

      await Swal.fire({
        icon: "success",
        title: "Carreras actualizadas",
        text: "Las carreras han sido actualizadas correctamente",
        confirmButtonColor: "#581517",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error: any) {
      console.error("Error al actualizar carreras:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudieron actualizar las carreras",
        confirmButtonColor: "#581517",
      });
    }
  };

  const handleSemestresChange = async (id: string, nuevosSemestres: string[]) => {
    try {
      await eventosAPI.update(id, {
        semestres: nuevosSemestres
      });

      setEventos((prev) =>
        prev.map((ev) =>
          ev.id === id ? { ...ev, semestres: nuevosSemestres } : ev
        )
      );

      await Swal.fire({
        icon: "success",
        title: "Semestres actualizados",
        text: "Los semestres han sido actualizados correctamente",
        confirmButtonColor: "#581517",
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error: any) {
      console.error("Error al actualizar semestres:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudieron actualizar los semestres",
        confirmButtonColor: "#581517",
      });
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Publicado":
        return "bg-green-100 text-green-700 border-green-300";
      case "Cerrado":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
    }
  };

  const carrerasDisponibles = ["Software", "TI", "Telecomunicaciones", "Robótica"];
  const semestresDisponibles = [
    "1er semestre", "2do semestre", "3er semestre", "4to semestre", 
    "5to semestre", "6to semestre", "7mo semestre", "8vo semestre", 
    "9no semestre", "10mo semestre"
  ];

  const toggleCarrera = (eventoId: string, carrera: string) => {
    const evento = eventos.find(ev => ev.id === eventoId);
    if (!evento) return;

    const nuevasCarreras = evento.carreras.includes(carrera)
      ? evento.carreras.filter(c => c !== carrera)
      : [...evento.carreras, carrera];

    handleCarrerasChange(eventoId, nuevasCarreras);
  };

  const toggleSemestre = (eventoId: string, semestre: string) => {
    const evento = eventos.find(ev => ev.id === eventoId);
    if (!evento) return;

    const nuevosSemestres = evento.semestres.includes(semestre)
      ? evento.semestres.filter(s => s !== semestre)
      : [...evento.semestres, semestre];

    handleSemestresChange(eventoId, nuevosSemestres);
  };

  return (
    <div className="p-8 font-sans text-gray-800 min-h-screen bg-white">
      {/* 🔙 Flecha para regresar */}
      <button
        onClick={() => router.push("/usuarios/cursos")}
        className="flex items-center gap-2 text-[#581517] hover:text-[#7a1c1c] mb-4 transition"
      >
        <ArrowLeft size={20} />
        Regresar
      </button>

      {/* Título principal */}
      <h1 className="text-3xl font-semibold mb-6 tracking-tight text-center text-[#581517]">
        Mis Eventos Asignados
      </h1>

      {/* Contenedor de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventos.map((ev) => (
          <div
            key={ev.id}
            className="relative bg-white border border-gray-200 rounded-lg shadow-md p-5 hover:shadow-lg transition-all"
          >
            {/* 🟢 Badge de estado */}
            <span
              className={`absolute top-3 right-3 px-3 py-1 text-xs font-semibold rounded-full border ${getEstadoColor(
                ev.estado
              )}`}
            >
              {ev.estado}
            </span>

            <h2 className="text-lg font-semibold mb-2">{ev.nombre}</h2>

            <p className="text-sm text-gray-600 flex items-center mb-1">
              <Calendar size={16} className="mr-1 text-gray-500" />
              {ev.fechaInicio && ev.fechaFin
                ? `${ev.fechaInicio} - ${ev.fechaFin}`
                : "Fechas no definidas"}
            </p>

            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Modalidad:</span>{" "}
              {ev.modalidad || "Por definir"}
            </p>

            <p className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Público:</span> {ev.publico}
            </p>

            {/* Sección de Carreras y Semestres - SOLO para eventos de Estudiantes */}
            {ev.publico === "Estudiantes" && (
              <div className="mb-4 space-y-3">
                {/* Carreras */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap size={16} className="text-[#581517]" />
                    <label className="text-sm font-medium text-gray-700">
                      Carreras Dirigidas:
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {carrerasDisponibles.map((carrera) => (
                      <button
                        key={carrera}
                        onClick={() => toggleCarrera(ev.id, carrera)}
                        className={`px-2 py-1 rounded text-xs font-medium border transition-all ${
                          ev.carreras.includes(carrera)
                            ? "bg-[#581517] text-white border-[#581517]"
                            : "border-gray-300 text-gray-700 hover:border-[#581517] hover:text-[#581517] bg-white"
                        }`}
                      >
                        {carrera}
                      </button>
                    ))}
                  </div>
                  {ev.carreras.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Seleccionadas: {ev.carreras.length}
                    </p>
                  )}
                </div>

                {/* Semestres */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={16} className="text-[#581517]" />
                    <label className="text-sm font-medium text-gray-700">
                      Semestres Dirigidos:
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {semestresDisponibles.map((semestre) => (
                      <button
                        key={semestre}
                        onClick={() => toggleSemestre(ev.id, semestre)}
                        className={`px-2 py-1 rounded text-xs font-medium border transition-all text-center ${
                          ev.semestres.includes(semestre)
                            ? "bg-[#581517] text-white border-[#581517]"
                            : "border-gray-300 text-gray-700 hover:border-[#581517] hover:text-[#581517] bg-white"
                        }`}
                      >
                        {semestre}
                      </button>
                    ))}
                  </div>
                  {ev.semestres.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Seleccionados: {ev.semestres.length}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Selector de estado */}
            <div className="mb-3">
              <label className="text-sm font-medium text-gray-700">
                Estado del Evento:
              </label>
              <select
                value={ev.estado}
                onChange={(e) => handleEstadoChange(ev.id, e.target.value as Evento["estado"])}
                className="w-full mt-1 p-2 border rounded-md bg-gray-50 text-sm"
              >
                <option value="Editando">Editando</option>
                <option value="Publicado">Publicado</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </div>

            <div className="flex justify-end mt-2">
              <button
                onClick={() => setEventoEditando(ev)}
                className="flex items-center gap-2 text-[#581517] hover:text-[#7a1c1c] text-sm font-medium transition"
              >
                <Edit size={16} /> Editar detalles
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para editar evento */}
      {eventoEditando && (
        <ModalEditarEvento
          evento={eventoEditando}
          onClose={() => setEventoEditando(null)}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  );
}