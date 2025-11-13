import React, { useEffect, useState } from "react";

export default function MisEventos({ userId }) {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    // 🔹 Aquí luego conectas con backend: fetch(`/api/eventos/${userId}`)
    // Por ahora, simulamos con datos estáticos:
    const mockEventos = [
      { id: 1, nombre: "Curso React Avanzado", estado: "En proceso" },
      { id: 2, nombre: "Next.js Intermedio", estado: "En proceso" },
    ];
    setEventos(mockEventos);
  }, [userId]);

  if (eventos.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-10">
        No tienes eventos en proceso actualmente.
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {eventos.map((e) => (
        <div
          key={e.id}
          className="p-4 bg-white shadow rounded-xl border hover:shadow-md transition"
        >
          <p className="font-semibold text-gray-800">{e.nombre}</p>
          <p className="text-sm text-gray-500">{e.estado}</p>
        </div>
      ))}
    </div>
  );
}
