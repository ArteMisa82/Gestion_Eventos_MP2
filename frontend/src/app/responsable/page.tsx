"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Edit, Loader2, ArrowLeft } from "lucide-react";
import ModalEditarEvento from "./ModalEditar";
import Swal from "sweetalert2";
import { eventosAPI } from "@/services/api";
import ValidacionesResponsable from "./validaciones";

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

  // 🆕 Nuevo campo
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
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMisEventos = async () => {
      try {
        // ✅ Llamar al endpoint de mis eventos (usa cookies de sesión)
        const response = await eventosAPI.getMisEventos();
        const data = response.data || response; // Extraer data de la respuesta del backend
        
        // Verificar que sea un array antes de mapear
        if (!Array.isArray(data)) {
          console.error("Los datos no son un array:", data);
          throw new Error("Formato de datos inválido recibido del servidor");
        }
        
        // Transformar datos del backend al formato del frontend
        const eventosTransformados: Evento[] = data.map((evento: any) => ({
          id: evento.id_evt,
          id_evt: evento.id_evt,
          nombre: evento.nom_evt,
          nom_evt: evento.nom_evt,
          fechaInicio: evento.fec_evt ? new Date(evento.fec_evt).toLocaleDateString() : "",
          fechaFin: "", // Por definir
          fec_evt: evento.fec_evt,
          modalidad: evento.mod_evt || "",
          mod_evt: evento.mod_evt,
          capacidad: 0, // Por definir desde detalle_eventos
          publico: evento.tip_pub_evt === "PUBLICO" ? "General" : "Estudiantes",
          tip_pub_evt: evento.tip_pub_evt,
          horas: 0, // Por definir desde detalle_eventos
          pago: evento.cos_evt === "GRATIS" ? "Gratis" : "Pago",
          cos_evt: evento.cos_evt,
          carreras: [],
          semestres: [],
          tipoEvento: "",
          camposExtra: {},
          lug_evt: evento.lug_evt,
          des_evt: evento.des_evt,
          est_evt: evento.est_evt,
          estado: evento.est_evt === "PUBLICADO" ? "Publicado" : evento.est_evt === "CERRADO" ? "Cerrado" : "Editando",
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

  const handleGuardar = (eventoActualizado: any) => {
    // Asegurarse de que tenga todas las propiedades necesarias
    const eventoCompleto: Evento = {
      id: eventoActualizado.id,
      nombre: eventoActualizado.nombre,
      fechaInicio: eventoActualizado.fechaInicio || "",
      fechaFin: eventoActualizado.fechaFin || "",
      modalidad: eventoActualizado.modalidad || "",
      capacidad: eventoActualizado.capacidad || 0,
      publico: eventoActualizado.publico || "General",
      horas: eventoActualizado.horas || 0,
      pago: eventoActualizado.pago || "Gratis",
      carreras: eventoActualizado.carreras || [],
      semestres: eventoActualizado.semestres || [],
      tipoEvento: eventoActualizado.tipoEvento || "",
      camposExtra: eventoActualizado.camposExtra || {},
      docente: eventoActualizado.docente,
      estado: eventoActualizado.estado || "Editando",
      // Campos del backend - actualizar con los valores del modal
      id_evt: eventoActualizado.id_evt,
      nom_evt: eventoActualizado.nom_evt,
      fec_evt: eventoActualizado.fechaInicio,
      lug_evt: eventoActualizado.lug_evt,
      mod_evt: eventoActualizado.modalidad,
      tip_pub_evt: eventoActualizado.publico === "General" ? "GENERAL" : "ESTUDIANTES",
      cos_evt: eventoActualizado.pago === "Gratis" ? "GRATUITO" : "DE PAGO",
      des_evt: eventoActualizado.des_evt,
      est_evt: eventoActualizado.est_evt,
    };

    setEventos((prev) =>
      prev.map((ev) => (ev.id === eventoCompleto.id ? eventoCompleto : ev))
    );
    setEventoEditando(null);

    // El mensaje de éxito ya lo muestra el modal
  };

  const handleEstadoChange = async (id: string, nuevoEstado: Evento["estado"]) => {
    try {
      // Mapear el estado del frontend al backend
      let estadoBackend = "EDITANDO";
      if (nuevoEstado === "Publicado") estadoBackend = "PUBLICADO";
      else if (nuevoEstado === "Cerrado") estadoBackend = "CERRADO";

      // ✅ Enviar actualización al backend
      await eventosAPI.update(id, {
        est_evt: estadoBackend
      });

      // Actualizar estado local
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

  {/* Función para colores */}
const getEstadoColor = (estado: string) => {
  switch (estado) {
    case "Publicado":
      return "bg-green-100 text-green-700 border-green-300";
    case "Cerrado":
      return "bg-red-100 text-red-700 border-red-300";
    default:
      return "bg-yellow-100 text-yellow-700 border-yellow-300"; // Editando
  }
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
