"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { FileText } from "lucide-react";

interface Validation {
  id: number;
  name: string;
  documentType: string;
  status: "Pendiente" | "Aprobado" | "Rechazado";
  pdfUrl?: string;
}

const ValidationsPage: React.FC = () => {
  const [docs, setDocs] = useState<Validation[]>([
    {
      id: 1,
      name: "Carlos Pérez",
      documentType: "Informe mensual",
      status: "Pendiente",
      pdfUrl: "/docs/informe-carlos.pdf", // 🔗 ejemplo: futura conexión backend
    },
    {
      id: 2,
      name: "Ana Gómez",
      documentType: "Certificado",
      status: "Aprobado",
      pdfUrl: "/docs/certificado-ana.pdf",
    },
  ]);

  const handleChangeStatus = async (id: number, status: Validation["status"]) => {
    const selectedDoc = docs.find((d) => d.id === id);
    if (!selectedDoc) return;

    const result = await Swal.fire({
      title: `¿Confirmar ${status.toLowerCase()}?`,
      text: `¿Deseas marcar el documento "${selectedDoc.documentType}" de ${selectedDoc.name} como ${status}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#581517",
      cancelButtonColor: "#a0a0a0",
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      setDocs((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status } : d))
      );

      await Swal.fire({
        icon: "success",
        title: `Documento ${status.toLowerCase()}`,
        text: `El documento fue marcado como ${status}.`,
        confirmButtonColor: "#581517",
      });
    }
  };

  const handleViewPDF = (pdfUrl?: string) => {
    if (!pdfUrl) {
      Swal.fire({
        icon: "info",
        title: "Sin archivo disponible",
        text: "Este documento aún no tiene un PDF cargado.",
        confirmButtonColor: "#581517",
      });
      return;
    }
    window.open(pdfUrl, "_blank");
  };

  return (
    <div className="flex flex-col items-center w-full px-6 py-10 text-gray-700">
      <h1 className="text-3xl font-bold text-[#581517] mb-8">
        Validación de Documentos
      </h1>

      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <table className="w-full text-left text-sm md:text-base">
          <thead className="bg-[#581517] text-white uppercase tracking-wide">
            <tr>
              <th className="p-4 font-semibold">Nombre</th>
              <th className="p-4 font-semibold">Tipo de documento</th>
              <th className="p-4 font-semibold">Estado</th>
              <th className="p-4 text-center font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((doc) => (
              <tr
                key={doc.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition"
              >
                <td className="p-4">{doc.name}</td>
                <td className="p-4">{doc.documentType}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      doc.status === "Aprobado"
                        ? "bg-green-100 text-green-700"
                        : doc.status === "Rechazado"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {doc.status}
                  </span>
                </td>
                <td className="p-4 flex justify-center flex-wrap gap-2">
                  <button
                    onClick={() => handleChangeStatus(doc.id, "Aprobado")}
                    className="px-4 py-2 bg-[#581517] text-white rounded-lg text-sm font-medium hover:bg-[#6e1b1b] transition"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleChangeStatus(doc.id, "Rechazado")}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => handleViewPDF(doc.pdfUrl)}
                    className="px-4 py-2 bg-gray-100 text-[#581517] border border-[#581517] rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-[#581517] hover:text-white transition"
                  >
                    <FileText size={16} />
                    Ver PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ValidationsPage;
