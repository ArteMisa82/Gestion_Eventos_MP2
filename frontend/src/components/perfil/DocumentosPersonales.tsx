"use client";

import { Usuario } from "@/types/usuario";

interface Props {
  usuario: Usuario;
  setUsuario: React.Dispatch<React.SetStateAction<Usuario | null>>; // coherente con FotoPerfil
}

export default function DocumentosPersonales({ usuario, setUsuario }: Props) {
  const cargarPDF = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      return alert("Solo se permiten archivos PDF");
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;

      // Actualiza el estado verificando que prev no sea null
      setUsuario(prev => prev ? { ...prev, pdf_ced_usu: base64 } : prev);

      // Subir al backend (ruta por id)
      if (usuario.id_usu) {
        await fetch(`/api/user/id/${usuario.id_usu}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pdf_ced_usu: base64 }),
        });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      <label className="bg-[#a3161f] text-white px-6 py-3 rounded-xl cursor-pointer">
        Subir PDF
        <input type="file" className="hidden" accept="application/pdf" onChange={cargarPDF} />
      </label>

      {usuario.pdf_ced_usu && (
        <a
          href={usuario.pdf_ced_usu}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-4 text-[#7f1d1d]"
        >
          Ver PDF
        </a>
      )}
    </div>
  );
}
