"use client";
import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import AddEventModal from "./AgregarEventModal";
import EditEventModal from "./EditarModal"; 
import { EventItem } from "./types";
import Swal from "sweetalert2";
import { eventosAPI } from "@/services/api";

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EventItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🔄 Cargar eventos reales desde el backend
  useEffect(() => {
    const fetchEventos = async () => {
      try {
        const response = await eventosAPI.getAll();
        const data = response.data || response; // Extraer data de la respuesta del backend
        
        // Verificar que sea un array antes de mapear
        if (!Array.isArray(data)) {
          console.error("Los datos de eventos no son un array:", data);
          setEvents([]);
          return;
        }
        
        // Transformar datos del backend al formato del frontend
        const eventosTransformados: EventItem[] = data.map((evento: any, index: number) => ({
          id: index + 1, // Usar índice temporal para la UI
          realId: evento.id_evt, // Guardar el ID real del backend
          title: evento.nom_evt,
          person: evento.responsable 
            ? `${evento.responsable.nom_usu} ${evento.responsable.ape_usu}`
            : "Sin asignar",
          start: new Date(evento.fec_evt).toLocaleDateString(),
          end: "Por definir",
        }));

        setEvents(eventosTransformados);
      } catch (error) {
        console.error("Error al cargar eventos:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los eventos",
          confirmButtonColor: "#581517",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventos();
  }, []);

  // 🔍 Filtro por búsqueda
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.person.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🗑️ Confirmar eliminación
  const handleDelete = async (event: EventItem) => {
    const result = await Swal.fire({
      title: "¿Eliminar curso?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#581517",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        // Usar el ID real del backend
        const idToDelete = event.realId || event.id.toString();
        await eventosAPI.delete(idToDelete);
        
        setEvents((prev) => prev.filter((e) => e.id !== event.id));
        
        Swal.fire({
          icon: "success",
          title: "Curso eliminado",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error al eliminar",
          text: error.message || "No se pudo eliminar el curso",
          confirmButtonColor: "#581517",
        });
      }
    }
  };

  // 💾 Guardar cambios desde el modal de edición
  const handleSaveEdit = (updatedEvent: EventItem) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e))
    );
    setEventToEdit(null);
    Swal.fire({
      icon: "success",
      title: "Curso actualizado",
      showConfirmButton: false,
      timer: 1500,
    });
  };

  return (
    <div className="p-8 font-sans text-gray-800 min-h-screen bg-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Cursos Registrados</h2>

        {/* Buscador */}
        <div className="relative w-full md:w-1/3">
          <input
            type="text"
            placeholder="Buscar curso o responsable..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#581517] focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search
            size={18}
            className="absolute left-3 top-2.5 text-gray-500 pointer-events-none"
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-[#581517] text-white px-4 py-2 rounded-lg hover:bg-[#6d1a1a] transition"
          disabled={isLoading}
        >
          <Plus size={18} /> Añadir curso
        </button>
      </div>

      {/* Lista de cursos */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Cargando eventos...</p>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event) => (
            <div
              key={event.realId || event.id}
              className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition rounded-xl p-5 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {event.title}
                </h3>
                <p className="text-sm text-gray-600">
                  Responsable: {event.person}
                </p>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setEventToEdit(event)}
                  className="p-2 text-gray-600 hover:text-blue-600 transition"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(event)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">
          No se encontraron cursos.
        </p>
      )}

      {/* Modal de agregar */}
      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          setEvents={setEvents}
        />
      )}

      {/* Modal de editar */}
      {eventToEdit && (
        <EditEventModal
          event={eventToEdit}
          onClose={() => setEventToEdit(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default EventsPage;
