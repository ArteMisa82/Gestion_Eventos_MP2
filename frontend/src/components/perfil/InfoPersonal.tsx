"use client";

import { Usuario } from "@/types/usuario";

interface Props {
  usuario: Usuario;
  setUsuario: React.Dispatch<React.SetStateAction<Usuario | null>>;
  setMostrarModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function InfoPersonal({ usuario, setUsuario, setMostrarModal }: Props) {
  const actualizarCampo = (campo: keyof Usuario, valor: string) => {
    setUsuario(prev => prev ? { ...prev, [campo]: valor } : prev);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">Información Personal</h2>

      <div className="space-y-3">
        <input
          type="text"
          value={usuario.nom_usu || ""}
          onChange={e => actualizarCampo("nom_usu", e.target.value)}
          placeholder="Nombre"
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          value={usuario.ape_usu || ""}
          onChange={e => actualizarCampo("ape_usu", e.target.value)}
          placeholder="Apellido"
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          value={usuario.tel_usu || ""}
          onChange={e => actualizarCampo("tel_usu", e.target.value)}
          placeholder="Teléfono"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={() => setMostrarModal(true)}
        className="mt-4 bg-[#7A1C1C] text-white px-6 py-2 rounded-xl"
      >
        Cambiar Contraseña
      </button>
    </div>
  );
}
