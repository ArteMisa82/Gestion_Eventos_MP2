"use client";

interface Props {
  id: string;
}

export default function DatosUsuario({ id }: Props) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Datos del Usuario</h2>

      <p className="text-gray-600 text-sm mb-2">Nombre</p>
      <p className="text-gray-800 font-medium">Usuario {id}</p>
    </div>
  );
}
