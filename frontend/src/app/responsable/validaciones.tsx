"use client";

import React, { useEffect, useState } from "react";
import { Eye, CheckCircle, XCircle, Search } from "lucide-react";
import Swal from "sweetalert2";

interface DocumentoValidar {
  id: string;
  usuario: string;
  tipoDocumento: string;
  evento: string;
  estado: "Pendiente" | "Aprobado" | "Rechazado";
  urlArchivo: string;
}

export default function ValidacionesResponsable() {
  const [documentos, setDocumentos] = useState<DocumentoValidar[]>([]);
  const [filtro, setFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");

  // 🔥 Mock data de ejemplo (puedes sustituirla luego por tu API)
  useEffect(() => {
    setDocumentos([
      {
        id: "1",
        usuario: "Juan Pérez",
        tipoDocumento: "Cédula",
        evento: "MasterClass de Fotografía",
        estado: "Pendiente",
        urlArchivo: "/ejemplos/cedula.pdf",
      },
      {
        id: "2",
        usuario: "María López",
        tipoDocumento: "Certificado Médico",
        evento: "Conferencia Salud 2024",
        estado: "Aprobado",
        urlArchivo: "/ejemplos/certificado.pdf",
      },
      {
        id: "3",
        usuario: "Carlos Jiménez",
        tipoDocumento: "Autorización de Representante",
        evento: "Campamento Deportivo",
        estado: "Rechazado",
        urlArchivo: "/ejemplos/autorizacion.pdf",
      },
    ]);
  }, []);

  // -----------------------------
  // 🟢 Acciones Frontend
  // -----------------------------

  const aprobarDocumento = async (id: string) => {
    setDocumentos((prev) =>
      prev.map((d) => (d.id === id ? { ...d, estado: "Aprobado" } : d))
    );

    Swal.fire({
      icon: "success",
      title: "Documento aprobado",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const rechazarDocumento = async (id: string) => {
    const { value: motivo } = await Swal.fire({
      title: "Motivo del rechazo",
      input: "textarea",
      inputPlaceholder: "Describe por qué se rechaza este documento...",
      confirmButtonText: "Rechazar",
      confirmButtonColor: "#b91c1c",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return "Debes ingresar un motivo";
        return null;
      },
    });

    if (!motivo) return;

    setDocumentos((prev) =>
      prev.map((d) => (d.id === id ? { ...d, estado: "Rechazado" } : d))
    );

    Swal.fire({
      icon: "success",
      title: "Documento rechazado",
      text: `Motivo: ${motivo}`,
    });
  };

  // -----------------------------
  // 🟡 Filtrado y búsqueda
  // -----------------------------

  const filtrarDocumentos = documentos.filter((doc) => {
    const coincideFiltro = filtro === "Todos" || doc.estado === filtro;

    const coincideBusqueda =
      doc.usuario.toLowerCase().includes(busqueda.toLowerCase()) ||
      doc.tipoDocumento.toLowerCase().includes(busqueda.toLowerCase()) ||
      doc.evento.toLowerCase().includes(busqueda.toLowerCase());

    return coincideFiltro && coincideBusqueda;
  });

  return (
    <div className="p-8 bg-white min-h-screen text-gray-800">

      <h1 className="text-3xl font-semibold text-center text-[#581517] mb-6">
        Validaciones de Documentos
      </h1>

      {/* 🔍 Buscador */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por usuario, documento o evento..."
            className="w-full border rounded-md p-2 pl-10"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-6">
        {["Todos", "Pendiente", "Aprobado", "Rechazado"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-2 rounded-md border ${
              filtro === f
                ? "bg-[#581517] text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="overflow-auto">
        <table className="min-w-full border rounded-lg">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="p-3 border">Usuario</th>
              <th className="p-3 border">Tipo de Documento</th>
              <th className="p-3 border">Evento</th>
              <th className="p-3 border">Estado</th>
              <th className="p-3 border">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filtrarDocumentos.map((doc) => (
              <tr key={doc.id} className="text-sm">
                <td className="p-3 border">{doc.usuario}</td>
                <td className="p-3 border">{doc.tipoDocumento}</td>
                <td className="p-3 border">{doc.evento}</td>

                <td className="p-3 border">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-semibold
                    ${
                      doc.estado === "Pendiente"
                        ? "bg-yellow-100 text-yellow-700"
                        : doc.estado === "Aprobado"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {doc.estado}
                  </span>
                </td>

                <td className="p-3 border flex gap-2 justify-center">

                  {/* Ver PDF */}
                  <button
                    onClick={() => window.open(doc.urlArchivo, "_blank")}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye size={20} />
                  </button>

                  {/* Aprobar */}
                  {doc.estado === "Pendiente" && (
                    <button
                      onClick={() => aprobarDocumento(doc.id)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}

                  {/* Rechazar */}
                  {doc.estado === "Pendiente" && (
                    <button
                      onClick={() => rechazarDocumento(doc.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XCircle size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {filtrarDocumentos.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">
                  No hay documentos encontrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
