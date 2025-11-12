"use client";
import React, { useState, useEffect } from "react";
import { Calendar, Edit, Loader2 } from "lucide-react";
import ModalEditarEvento from "./ModalEditar";
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
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMisEventos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No hay sesión activa");
        }

        // ✅ Llamar al endpoint de mis eventos
        const data = await eventosAPI.getMisEventos(token);
        
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

  return (
    <div className="p-8 font-sans text-gray-800 min-h-screen bg-white">
      {/* Título principal */}
      <h1 className="text-3xl font-semibold mb-6 tracking-tight text-center text-[#581517]">
        Mis Eventos Asignados
      </h1>

      {/* Estado de carga */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="animate-spin text-[#581517] mb-4" size={48} />
          <p className="text-gray-600">Cargando tus eventos...</p>
        </div>
      ) : eventos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No tienes eventos asignados aún</p>
        </div>
      ) : (
        <>
          {/* Contenedor de tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventos.map((ev) => (
              <div
                key={ev.id}
                className="bg-white border border-gray-200 rounded-lg shadow-md p-5 hover:shadow-lg transition-all"
              >
                <h2 className="text-lg font-semibold mb-2 text-[#581517]">{ev.nombre}</h2>
                
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600 flex items-center">
                    <Calendar size={16} className="mr-2 text-gray-500" />
                    {ev.fechaInicio || "Fecha no definida"}
                  </p>
                  
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Modalidad:</span>{" "}
                    {ev.modalidad || <span className="text-amber-600 italic">Por definir</span>}
                  </p>
                  
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Lugar:</span>{" "}
                    {ev.lug_evt || <span className="text-amber-600 italic">Por definir</span>}
                  </p>
                  
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Público:</span> {ev.publico}
                  </p>
                  
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Costo:</span> {ev.pago}
                  </p>
                  
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Estado:</span>{" "}
                    <span className={`font-semibold ${
                      ev.est_evt === "EDITANDO" ? "text-amber-600" :
                      ev.est_evt === "PUBLICADO" ? "text-green-600" :
                      "text-gray-600"
                    }`}>
                      {ev.est_evt || "Sin definir"}
                    </span>
                  </p>
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
        </>
      )}

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
