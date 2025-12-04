import { Solicitud } from "../types";

interface Props {
  selected: Solicitud;
  setSelected: (s: Solicitud | null) => void;
}

export default function HeaderDetalle({ selected, setSelected }: Props) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">
          {selected.titulo}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          N.º de Solicitud:{" "}
          <span className="font-medium text-gray-700">
            {selected.numeroSolicitud}
          </span>
        </p>
      </div>
      <button
        onClick={() => setSelected(null)}
        className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
      >
        Cerrar
      </button>
    </div>
  );
}