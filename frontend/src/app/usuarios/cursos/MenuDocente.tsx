import React from "react";

export default function MenuDocente({ cursos, onSelect }) {
  return (
    <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-xl p-2 w-48 border">
      {cursos.length > 0 ? (
        cursos.map((c) => (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            className="block w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50"
          >
            {c.nombre}
          </button>
        ))
      ) : (
        <p className="text-sm text-gray-500 text-center py-2">Sin cursos</p>
      )}
    </div>
  );
}
