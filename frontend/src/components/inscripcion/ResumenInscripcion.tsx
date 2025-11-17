"use client";

interface Props {
  curso: any;
  usuario: any;
}
interface ResumenInscripcionProps {
  id: string;
}


export default function ResumenInscripcion({ curso }: Props) {
  return (
    <div className="p-4 rounded-lg shadow bg-white">
      <h2 className="text-xl font-semibold mb-4">Resumen de Inscripción</h2>

      <div className="flex justify-between pb-3 border-b border-gray-200">
        <span className="text-gray-600">Curso:</span>
        <span className="font-medium">{curso.nombre}</span>
      </div>

      <div className="flex justify-between pb-3 mt-4 border-b border-gray-200">
        <span className="text-gray-600">Categoría:</span>
        <span className="font-medium">{curso.categoria}</span>
      </div>

      <div className="flex justify-between pb-3 mt-4">
        <span className="text-gray-600">Precio:</span>
        <span className="font-medium">${curso.precio}</span>
      </div>
    </div>
  );
}
