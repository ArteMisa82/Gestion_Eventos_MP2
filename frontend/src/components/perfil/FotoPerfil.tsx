"use client";

import React from "react";
import { Usuario } from "@/types/usuario";

interface Props {
  usuario: Usuario;
  setUsuario: React.Dispatch<React.SetStateAction<Usuario | null>>;
}

export default function FotoPerfil({ usuario, setUsuario }: Props) {
  const cargarImagen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      return alert("Selecciona una imagen válida");
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string; // contiene data:image/xxx;base64,...

      // Actualiza localmente la imagen inmediatamente
      setUsuario(prev => prev ? { ...prev, img_usu: base64 } : prev);

      try {
        // Enviar al backend solo el Base64 puro (sin data:image)
        const base64Pure = base64.split(",")[1];

        const res = await fetch(
          `http://localhost:3001/api/user/upload-image/${usuario.id_usu}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: base64Pure, type: file.type }),
          }
        );

        if (!res.ok) return alert("Error al subir la imagen");

        const data = await res.json();

        // Asegurarse de que la imagen tenga prefijo correcto al mostrar
        setUsuario(prev =>
          prev ? { ...prev, img_usu: `data:${file.type};base64,${data.img_usu}` } : prev
        );
      } catch (error) {
        console.error(error);
        alert("Error al subir la imagen");
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 flex flex-col items-center">
      <div className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden mb-4">
        {usuario.img_usu ? (
          <img
            src={usuario.img_usu}
            alt="Foto de perfil"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Sin foto
          </div>
        )}
      </div>

      <label className="bg-[#7A1C1C] text-white px-6 py-3 rounded-xl cursor-pointer">
        Cambiar Foto
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={cargarImagen}
        />
      </label>
    </div>
  );
}
