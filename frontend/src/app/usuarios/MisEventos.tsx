"use client";
import { useEffect, useState } from "react";

interface Evento {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: "en_proceso" | "finalizado" | "pendiente";
  imagen?: string;
}

export default function MisEventos({ userId }: { userId: number }) {
  const [eventos, setEventos] = useState<Evento[]>([]);

  useEffect(() => {
    // 🔹 Simulación de datos obtenidos del backend (puedes reemplazar por fetch)
    const dataEjemplo: Evento[] = [
      {
        id: 1,
        nombre: "Curso de React Avanzado",
        fechaInicio: "2025-11-01",
        fechaFin: "2025-12-15",
        estado: "en_proceso",
        imagen: "/img/react-course.jpg",
      },
      {
        id: 2,
        nombre: "Gestión de Proyectos Ágiles",
        fechaInicio: "2025-10-10",
        fechaFin: "2025-11-30",
        estado: "en_proceso",
        imagen: "/img/agiles.jpg",
      },
    ];

    // 🔹 Filtra solo los eventos activos o del usuario logueado
    setEventos(dataEjemplo.filter((e) => e.estado === "en_proceso"));
  }, [userId]);

  if (eventos.length === 0)
    return <p className="text-gray-500">No tienes eventos en proceso.</p>;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {eventos.map((evento) => (
        <div
          key={evento.id}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
        >
          <img
            src={evento.imagen || "/img/default-event.jpg"}
            alt={evento.nombre}
            className="w-full h-40 object-cover"
          />

          <div className="p-4">
            <h3 className="font-semibold text-lg mb-2">{evento.nombre}</h3>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Inicio:</strong> {evento.fechaInicio}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Fin:</strong> {evento.fechaFin}
            </p>
            <span className="inline-block mt-3 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              En proceso
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
