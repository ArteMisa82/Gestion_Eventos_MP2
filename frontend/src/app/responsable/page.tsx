"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Edit, Loader2, ArrowLeft, Users, ClipboardList, Lock } from "lucide-react";
import ModalEditarEvento from "./ModalEditar";
import ModalAsistenciaNotas from "./ModalAsistenciaNota";
import Swal from "sweetalert2";
import { eventosAPI } from "@/services/api";

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
  estado: "Editando" | "Publicado" | "Cerrado" | "Finalizado";
  
  // Campos para configuración de evaluación
  requiereAsistencia: boolean;
  requiereNota: boolean;
  evaluacionCompletada: boolean;
  
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

interface Inscrito {
  id: string;
  nombre: string;
  email: string;
  carrera?: string;
  semestre?: string;
  asistio?: boolean;
  nota?: number;
  observaciones?: string;
  asistenciaModificadaPor?: "docente" | "responsable";
  notaModificadaPor?: "docente" | "responsable";
  fechaModificacion?: string;
}

export default function DashboardResponsable() {
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);
  const [eventoAsistencia, setEventoAsistencia] = useState<Evento | null>(null);
  const [inscritos, setInscritos] = useState<Inscrito[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInscritos, setIsLoadingInscritos] = useState(false);

  useEffect(() => {
    const fetchMisEventos = async () => {
      try {
        const response = await eventosAPI.getMisEventos();
        const data = response.data || response;
        
        if (!Array.isArray(data)) {
          console.error("Los datos no son un array:", data);
          throw new Error("Formato de datos inválido recibido del servidor");
        }
        
        const eventosTransformados: Evento[] = data.map((evento: any) => ({
          id: evento.id_evt,
          id_evt: evento.id_evt,
          nombre: evento.nom_evt,
          nom_evt: evento.nom_evt,
          fechaInicio: evento.fec_evt ? new Date(evento.fec_evt).toLocaleDateString() : "",
          fechaFin: evento.fec_fin_evt ? new Date(evento.fec_fin_evt).toLocaleDateString() : "",
          fec_evt: evento.fec_evt,
          modalidad: evento.mod_evt || "",
          mod_evt: evento.mod_evt,
          capacidad: evento.cap_evt || 0,
          publico: evento.tip_pub_evt === "PUBLICO" ? "General" : "Estudiantes",
          tip_pub_evt: evento.tip_pub_evt,
          horas: evento.hrs_evt || 0,
          pago: evento.cos_evt === "GRATIS" ? "Gratis" : "Pago",
          cos_evt: evento.cos_evt,
          carreras: evento.carreras || [],
          semestres: evento.semestres || [],
          tipoEvento: evento.tip_evt || "",
          camposExtra: evento.campos_extra || {},
          lug_evt: evento.lug_evt,
          des_evt: evento.des_evt,
          est_evt: evento.est_evt,
          estado: mapEstadoBackendToFrontend(evento.est_evt),
          requiereAsistencia: determinarRequiereAsistencia(evento.tip_evt),
          requiereNota: determinarRequiereNota(evento.tip_evt),
          evaluacionCompletada: evento.eval_completada || false,
        }));

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

  const determinarRequiereAsistencia = (tipoEvento: string): boolean => {
    const tiposConAsistencia = [
      "TALLER", "CURSO", "SEMINARIO", "WORKSHOP", "CAPACITACION", "CONFERENCIA"
    ];
    return tiposConAsistencia.includes(tipoEvento.toUpperCase());
  };

  const determinarRequiereNota = (tipoEvento: string): boolean => {
    const tiposConNota = [
      "CURSO", "EVALUACION", "EXAMEN", "TALLER_EVALUADO", "SEMINARIO_CERTIFICADO"
    ];
    return tiposConNota.includes(tipoEvento.toUpperCase());
  };

  const mapEstadoBackendToFrontend = (estadoBackend: string): Evento["estado"] => {
    switch (estadoBackend) {
      case "PUBLICADO": return "Publicado";
      case "CERRADO": return "Cerrado";
      case "FINALIZADO": return "Finalizado";
      default: return "Editando";
    }
  };

  const mapEstadoFrontendToBackend = (estadoFrontend: Evento["estado"]): string => {
    switch (estadoFrontend) {
      case "Publicado": return "PUBLICADO";
      case "Cerrado": return "CERRADO";
      case "Finalizado": return "FINALIZADO";
      default: return "EDITANDO";
    }
  };

  const handleGuardar = (eventoActualizado: any) => {
    const eventoCompleto: Evento = {
      ...eventoActualizado,
      estado: eventoActualizado.estado || "Editando",
    };

    setEventos((prev) =>
      prev.map((ev) => (ev.id === eventoCompleto.id ? eventoCompleto : ev))
    );
    setEventoEditando(null);
  };

  const handleEstadoChange = async (id: string, nuevoEstado: Evento["estado"]) => {
    try {
      const estadoBackend = mapEstadoFrontendToBackend(nuevoEstado);

      await eventosAPI.update(id, {
        est_evt: estadoBackend
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

  /**const cargarInscritos = async (eventoId: string): Promise<Inscrito[]> => {
    setIsLoadingInscritos(true);
    try {
      //const response = await eventosAPI.getInscritosConEvaluacion(eventoId);
      const datosInscritos = response.data || [];
      
      setInscritos(datosInscritos);
      return datosInscritos;
    } catch (error: any) {
      console.error("Error al cargar inscritos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar los participantes del evento",
        confirmButtonColor: "#581517",
      });
      return [];
    } finally {
      setIsLoadingInscritos(false);
    }
  };**/

  const handleAbrirAsistencia = async (evento: Evento) => {
    if (!puedeEditarEvaluacion(evento)) {
      Swal.fire({
        icon: "warning",
        title: "Edición bloqueada",
        text: "La evaluación de este evento ya ha sido completada y no se puede modificar",
        confirmButtonColor: "#581517",
      });
      return;
    }

    if (evento.estado === "Editando") {
      Swal.fire({
        icon: "warning",
        title: "Evento en edición",
        text: "Debes publicar el evento antes de gestionar asistencia",
        confirmButtonColor: "#581517",
      });
      return;
    }

    //const inscritos = await cargarInscritos(evento.id);
    if (inscritos.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Sin participantes",
        text: "No hay participantes inscritos en este evento",
        confirmButtonColor: "#581517",
      });
      return;
    }

    setEventoAsistencia(evento);
  };

  const handleGuardarAsistencia = async (datosAsistencia: any[]) => {
    try {
      const datosConResponsable = datosAsistencia.map(inscrito => ({
        ...inscrito,
        asistenciaModificadaPor: 'responsable',
        notaModificadaPor: inscrito.nota !== undefined ? 'responsable' : undefined,
        fechaModificacion: new Date().toISOString()
      }));

      //await eventosAPI.guardarAsistencia(eventoAsistencia!.id, datosConResponsable);
      
      const evaluacionCompleta = verificarEvaluacionCompleta(datosConResponsable, eventoAsistencia!);
      
      if (evaluacionCompleta) {
        //await eventosAPI.marcarEvaluacionCompleta(eventoAsistencia!.id);
        
        setEventos(prev => prev.map(ev => 
          ev.id === eventoAsistencia!.id 
            ? { ...ev, evaluacionCompletada: true }
            : ev
        ));
      }

      Swal.fire({
        icon: "success",
        title: "Datos guardados",
        text: `Los datos de ${obtenerTextoEvaluacion(eventoAsistencia!)} se han guardado correctamente${evaluacionCompleta ? '. Evaluación completada.' : ''}`,
        confirmButtonColor: "#581517",
      });
      
      setEventoAsistencia(null);
    } catch (error: any) {
      console.error("Error al guardar asistencia:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron guardar los datos",
        confirmButtonColor: "#581517",
      });
    }
  };

  const verificarEvaluacionCompleta = (inscritos: Inscrito[], evento: Evento): boolean => {
    for (const inscrito of inscritos) {
      if (evento.requiereAsistencia && inscrito.asistio === undefined) {
        return false;
      }
      if (evento.requiereNota && inscrito.nota === undefined) {
        return false;
      }
    }
    return true;
  };

  const puedeEditarEvaluacion = (evento: Evento): boolean => {
    return !evento.evaluacionCompletada && evento.estado !== "Cerrado";
  };

  const obtenerTextoEvaluacion = (evento: Evento): string => {
    if (evento.requiereAsistencia && evento.requiereNota) {
      return "asistencia y notas";
    } else if (evento.requiereAsistencia) {
      return "asistencia";
    } else if (evento.requiereNota) {
      return "notas";
    }
    return "evaluación";
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Publicado":
        return "bg-green-100 text-green-700 border-green-300";
      case "Cerrado":
        return "bg-red-100 text-red-700 border-red-300";
      case "Finalizado":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
    }
  };

  const getEvaluacionColor = (evento: Evento) => {
    if (!puedeEditarEvaluacion(evento)) {
      return "bg-gray-100 text-gray-700 border-gray-300";
    }
    if (evento.evaluacionCompletada) {
      return "bg-green-100 text-green-700 border-green-300";
    }
    return "bg-orange-100 text-orange-700 border-orange-300";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#581517]">
          <Loader2 size={24} className="animate-spin" />
          <span>Cargando eventos...</span>
        </div>
      </div>
    );
  }

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

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-[#581517]">{eventos.length}</div>
          <div className="text-sm text-gray-600">Total Eventos</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {eventos.filter(e => e.estado === "Publicado").length}
          </div>
          <div className="text-sm text-gray-600">Publicados</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {eventos.filter(e => e.estado === "Finalizado").length}
          </div>
          <div className="text-sm text-gray-600">Finalizados</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {eventos.filter(e => e.evaluacionCompletada).length}
          </div>
          <div className="text-sm text-gray-600">Evaluados</div>
        </div>
      </div>

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

            {/* 🔒 Badge de evaluación */}
            <span
              className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded-full border ${getEvaluacionColor(ev)}`}
            >
              {!puedeEditarEvaluacion(ev) ? <Lock size={10} className="inline mr-1" /> : ""}
              {ev.evaluacionCompletada ? "Evaluado" : "Por evaluar"}
            </span>

            <h2 className="text-lg font-semibold mb-2 pr-20 pl-12">{ev.nombre}</h2>

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

            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Evaluación:</span>{" "}
              {ev.requiereAsistencia && ev.requiereNota 
                ? "Asistencia y Nota" 
                : ev.requiereAsistencia 
                ? "Solo Asistencia" 
                : ev.requiereNota 
                ? "Solo Nota" 
                : "Sin evaluación"}
            </p>

            <p className="text-sm text-gray-600 mb-3">
              <span className="font-medium">Capacidad:</span> {ev.capacidad} personas
            </p>

            {/* Selector de estado */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700">
                Estado del Evento:
              </label>
              <select
                value={ev.estado}
                onChange={(e) => handleEstadoChange(ev.id, e.target.value as Evento["estado"])}
                className="w-full mt-1 p-2 border rounded-md bg-gray-50 text-sm focus:ring-2 focus:ring-[#581517] focus:border-transparent"
                disabled={ev.evaluacionCompletada}
              >
                <option value="Editando">Editando</option>
                <option value="Publicado">Publicado</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-2 justify-between">
              <button
                onClick={() => setEventoEditando(ev)}
                className="flex items-center gap-2 text-[#581517] hover:text-[#7a1c1c] text-sm font-medium transition px-3 py-2 rounded-md hover:bg-gray-50"
              >
                <Edit size={16} /> Editar
              </button>

              {(ev.requiereAsistencia || ev.requiereNota) && puedeEditarEvaluacion(ev) && (
                <button
                  onClick={() => handleAbrirAsistencia(ev)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition px-3 py-2 rounded-md hover:bg-blue-50"
                >
                  <Users size={16} /> {obtenerTextoEvaluacion(ev)}
                </button>
              )}
            </div>

            {/* Mensaje si no se puede editar */}
            {!puedeEditarEvaluacion(ev) && (ev.requiereAsistencia || ev.requiereNota) && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {ev.evaluacionCompletada 
                  ? "Evaluación completada - No editable" 
                  : "Evento cerrado - No editable"}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Mensaje cuando no hay eventos */}
      {eventos.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <ClipboardList size={64} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            No tienes eventos asignados
          </h3>
          <p className="text-gray-500">
            Los eventos que te sean asignados aparecerán aquí.
          </p>
        </div>
      )}

      {/* Modal para editar evento */}
      {eventoEditando && (
        <ModalEditarEvento
          evento={eventoEditando}
          onClose={() => setEventoEditando(null)}
          onGuardar={handleGuardar}
        />
      )}

      {/* Modal para gestión de asistencia y notas */}
      {eventoAsistencia && (
        <ModalAsistenciaNotas
          evento={eventoAsistencia}
          inscritos={inscritos}
          isLoading={isLoadingInscritos}
          onClose={() => setEventoAsistencia(null)}
          onGuardar={handleGuardarAsistencia}
        />
      )}
    </div>
  );
}