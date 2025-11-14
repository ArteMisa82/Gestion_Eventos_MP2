"use client";

import { useState } from "react";

export default function PerfilUsuario() {
  const [imagen, setImagen] = useState<string | null>(null);

  const cargarImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImagen(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white shadow-md p-6 rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold text-[#7f1d1d] mb-4">Mi Perfil</h2>

      {/* FOTO */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden border-4 border-[#7f1d1d]">
          {imagen ? (
            <img src={imagen} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-600">
              Sin foto
            </div>
          )}
        </div>

        <label className="mt-3 cursor-pointer bg-[#a3161f] text-white px-4 py-2 rounded-md hover:bg-[#8e1118] transition">
          Subir foto
          <input type="file" className="hidden" accept="image/*" onChange={cargarImagen} />
        </label>
      </div>

      {/* CAMPOS DEL PERFIL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-semibold">Nombre</label>
          <input className="w-full mt-1 border rounded-md p-2" defaultValue="Nombre" />
        </div>

        <div>
          <label className="font-semibold">Apellido</label>
          <input className="w-full mt-1 border rounded-md p-2" defaultValue="Apellido" />
        </div>

        <div>
          <label className="font-semibold">Segundo Nombre</label>
          <input className="w-full mt-1 border rounded-md p-2" placeholder="Ingrese segundo nombre" />
        </div>

        <div>
          <label className="font-semibold">Segundo Apellido</label>
          <input className="w-full mt-1 border rounded-md p-2" placeholder="Ingrese segundo apellido" />
        </div>

        <div>
          <label className="font-semibold">Correo</label>
          <input className="w-full mt-1 border rounded-md p-2" defaultValue="correo@ejemplo.com" disabled />
        </div>

        <div>
          <label className="font-semibold">Contraseña</label>
          <input type="password" className="w-full mt-1 border rounded-md p-2" placeholder="******" />
        </div>
      </div>

      <button className="mt-6 bg-[#7f1d1d] text-white px-6 py-2 rounded-md hover:bg-[#5e1414] transition">
        Guardar Cambios
      </button>
    </div>
  );
}
