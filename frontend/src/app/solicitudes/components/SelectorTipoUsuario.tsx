// frontend/src/app/solicitudes/components/SelectorTipoUsuario.tsx
import React from "react";

export default function SelectorTipoUsuario({ tipoUsuario, onSelect }: {
  tipoUsuario: string,
  onSelect: (t: "usuarioFinal" | "desarrollador") => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-center text-gray-600">Seleccione el tipo de usuario</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <button
          onClick={() => onSelect("usuarioFinal")}
          className="p-6 bg-white border rounded-xl hover:shadow-md transition-colors text-left"
        >
          <div className="text-3xl">👤</div>
          <h3 className="mt-2 text-lg font-medium">Usuario Final</h3>
          <p className="mt-1 text-sm text-gray-500">Reporta o solicita un cambio funcional.</p>
        </button>

        <button
          onClick={() => onSelect("desarrollador")}
          className="p-6 bg-white border rounded-xl hover:shadow-md transition-colors text-left"
        >
          <div className="text-3xl">💻</div>
          <h3 className="mt-2 text-lg font-medium">Desarrollador</h3>
          <p className="mt-1 text-sm text-gray-500">Propone modificaciones técnicas o de mantenimiento.</p>
        </button>
      </div>
    </div>
  );
}
