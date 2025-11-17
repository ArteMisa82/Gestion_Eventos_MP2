"use client";

import { useState } from "react";

interface Props {
  documentos: Record<string, boolean>;
  onSelect?: (doc: string) => void; // futura conexión backend
}

export default function DocumentosRequeridos({ documentos, onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (doc: string) => {
    setSelected(doc);
    if (onSelect) onSelect(doc);
  };

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Documentos Requeridos</h2>

      <ul className="space-y-2">
        {Object.entries(documentos).map(([doc, status]) => (
          <li
            key={doc}
            className={`p-4 rounded-lg border flex items-center justify-between cursor-pointer transition
                        ${selected === doc ? "border-blue-500" : "border-gray-300"}
                       `}
            onClick={() => handleSelect(doc)}
          >
            <span className="font-medium capitalize">{doc.replace("_", " ")}</span>

            {status ? (
              <span className="text-green-600 font-semibold">✔ Enviado</span>
            ) : (
              <span className="text-red-600 font-semibold">Pendiente</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
