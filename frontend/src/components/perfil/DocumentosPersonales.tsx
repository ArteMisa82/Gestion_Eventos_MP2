"use client";

import { Usuario } from "@/types/usuario";

interface Props {
  usuario: Usuario;
  setUsuario: React.Dispatch<React.SetStateAction<Usuario | null>>;
}

export default function DocumentosPersonales({ usuario, setUsuario }: Props) {
  const cargarPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return alert("Selecciona un archivo PDF");
    if (file.type !== "application/pdf") return alert("Debe ser un PDF");

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch(
        `http://localhost:3001/api/user/upload-pdf/${usuario.id_usu}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (!res.ok) return alert("Error al subir el PDF");

      const data = await res.json();

      // Guarda el PDF BASE64 recibido
      setUsuario(prev =>
        prev
          ? { ...prev, pdf_ced_usu: data?.pdf || data?.pdf_ced_usu }
          : prev
      );

      alert("PDF subido correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al subir PDF");
    }
  };

  // Convertir Base64 a Blob URL para poder abrirlo
  const generarURLPDF = () => {
    if (!usuario.pdf_ced_usu) return null;

    // Si ya viene como URL normal, úsalo
    if (usuario.pdf_ced_usu.startsWith("http")) return usuario.pdf_ced_usu;

    // Caso usual: base64
    const byteCharacters = atob(usuario.pdf_ced_usu);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });

    return URL.createObjectURL(blob);
  };

  const pdfURL = generarURLPDF();

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      {/* BOTÓN SUBIR PDF */}
      <label className="bg-[#a3161f] text-white px-6 py-3 rounded-xl cursor-pointer">
        Subir PDF
        <input
          type="file"
          className="hidden"
          accept="application/pdf"
          onChange={cargarPDF}
        />
      </label>

      {/* BOTÓN VER PDF */}
      {pdfURL && (
        <a
          href={pdfURL}
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
