"use client";

import { Usuario } from "@/types/usuario";

interface Props {
  usuario: Usuario;
  setUsuario: React.Dispatch<React.SetStateAction<Usuario | null>>; // corregido
}

export default function FotoPerfil({ usuario, setUsuario }: Props) {
  const cargarImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      return alert("Selecciona una imagen válida");
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;

      // Actualiza el estado verificando que prev no sea null
      setUsuario(prev => prev ? { ...prev, img_usu: base64 } : prev);

      // Subir al backend (usando la ruta por id)
      if (usuario.id_usu) {
        await fetch(`/api/user/id/${usuario.id_usu}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ img_usu: base64 }),
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col items-center">
      <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden mb-4">
        {usuario.img_usu ? (
          <img src={usuario.img_usu} className="w-full h-full object-cover" alt="Foto" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Sin foto
          </div>
        )}
      </div>
      <label className="bg-[#7A1C1C] text-white px-6 py-3 rounded-xl cursor-pointer">
        Cambiar Foto
        <input type="file" className="hidden" accept="image/*" onChange={cargarImagen} />
      </label>
    </div>
  );
}
