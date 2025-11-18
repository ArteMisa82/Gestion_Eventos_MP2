"use client";

type Usuario = {
  nom_usu: string;
  nom_seg_usu?: string | null;
  ape_usu: string;
  ape_seg_usu?: string | null;
  cor_usu: string;
  id_usu?: number;
};

interface Props {
  usuario: Usuario;
  setUsuario: (usuario: Usuario) => void;
  setMostrarModal: (val: boolean) => void;
}

export default function InfoPersonal({ usuario, setUsuario, setMostrarModal }: Props) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 space-y-4">
      <h2 className="text-2xl font-semibold mb-6 text-[#7A1C1C]">Información Personal</h2>

      <input
        className="p-3 border rounded-xl w-full"
        value={usuario.nom_usu}
        onChange={e => setUsuario({ ...usuario, nom_usu: e.target.value })}
      />
      <input
        className="p-3 border rounded-xl w-full"
        value={usuario.ape_usu}
        onChange={e => setUsuario({ ...usuario, ape_usu: e.target.value })}
      />
      <button onClick={() => setMostrarModal(true)} className="bg-[#7A1C1C] text-white px-4 py-2 rounded-xl">Cambiar Contraseña</button>
    </div>
  );
}
