"use client";

type Usuario = {
  id_usu?: number;
  pdf_ced_usu?: string | null;
};

interface Props {
  usuario: Usuario;
  setUsuario: (usuario: Usuario) => void;
}

export default function DocumentosPersonales({ usuario, setUsuario }: Props) {
  const cargarPDF = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/pdf") return alert("Solo PDFs");

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setUsuario({ ...usuario, pdf_ced_usu: base64 });

      await fetch(`/api/user/${usuario.id_usu}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdf_ced_usu: base64 }),
      });
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
        <a href={usuario.pdf_ced_usu} target="_blank" className="block mt-4 text-[#7f1d1d]">
          Ver PDF
        </a>
      )}
    </div>
  );
}
