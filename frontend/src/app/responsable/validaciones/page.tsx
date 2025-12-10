"use client";

import React, { useEffect, useState } from "react";
import { Eye, CheckCircle, XCircle, Search, ArrowLeft, FileText, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface DocumentoValidar {
  id: string;
  tipo: 'REQUISITO' | 'COMPROBANTE_PAGO';
  num_reg_per: number;
  tipo_documento: string;
  descripcion: string | null;
  archivo: string | null;
  valor: any;
  fecha_subida: string | null;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  comentario_validacion: string | null;
  usuario: {
    id_usu: number;
    nombre_completo: string;
    ced_usu: string;
    email: string;
  };
  evento: {
    nom_evt: string;
    id_evt: string;
  };
  id_requisito_persona?: number;
  num_pag?: number;
  met_pag?: string;
}

export default function ValidacionesResponsable() {
  const router = useRouter();
  const [documentos, setDocumentos] = useState<DocumentoValidar[]>([]);
  const [filtro, setFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [documentoModal, setDocumentoModal] = useState<string | null>(null);

  // Cargar documentos pendientes desde la API
  useEffect(() => {
    cargarDocumentosPendientes();
  }, []);

  const cargarDocumentosPendientes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/validaciones/documentos-pendientes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar documentos pendientes');
      }

      const data = await response.json();
      setDocumentos(data);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los documentos pendientes'
      });
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // 🟢 Acciones Frontend
  // -----------------------------

  const aprobarDocumento = async (doc: DocumentoValidar) => {
    const confirmacion = await Swal.fire({
      title: '¿Aprobar este documento?',
      text: doc.tipo === 'COMPROBANTE_PAGO' 
        ? 'Se completará la inscripción del usuario' 
        : 'El requisito será marcado como aprobado',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const tipo = doc.tipo === 'REQUISITO' ? 'requisito' : 'pago';
      const id = doc.tipo === 'REQUISITO' ? doc.id_requisito_persona : doc.num_pag;

      const response = await fetch(`http://localhost:3001/api/validaciones/${tipo}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ estado: 'APROBAR' })
      });

      if (!response.ok) {
        throw new Error('Error al aprobar el documento');
      }

      Swal.fire({
        icon: 'success',
        title: 'Documento aprobado',
        text: doc.tipo === 'COMPROBANTE_PAGO' 
          ? 'La inscripción ha sido completada' 
          : 'El requisito ha sido aprobado',
        timer: 2000,
        showConfirmButton: false,
      });

      cargarDocumentosPendientes();

    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo aprobar el documento'
      });
    }
  };

  const rechazarDocumento = async (doc: DocumentoValidar) => {
    const { value: motivo } = await Swal.fire({
      title: 'Motivo del rechazo',
      input: 'textarea',
      inputPlaceholder: 'Describe por qué se rechaza este documento...',
      confirmButtonText: 'Rechazar',
      confirmButtonColor: '#b91c1c',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) return 'Debes ingresar un motivo';
        return null;
      },
    });

    if (!motivo) return;

    try {
      const tipo = doc.tipo === 'REQUISITO' ? 'requisito' : 'pago';
      const id = doc.tipo === 'REQUISITO' ? doc.id_requisito_persona : doc.num_pag;

      const response = await fetch(`http://localhost:3001/api/validaciones/${tipo}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          estado: 'RECHAZAR',
          comentarios: motivo
        })
      });

      if (!response.ok) {
        throw new Error('Error al rechazar el documento');
      }

      Swal.fire({
        icon: 'success',
        title: 'Documento rechazado',
        text: 'El usuario será notificado para volver a subirlo',
      });

      cargarDocumentosPendientes();

    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo rechazar el documento'
      });
    }
  };

  // -----------------------------
  // 🟡 Filtrado y búsqueda
  // -----------------------------

  const filtrarDocumentos = documentos.filter((doc) => {
    const coincideFiltro = filtro === "Todos" || doc.estado === filtro.toUpperCase();

    const coincideBusqueda =
      doc.usuario.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
      doc.usuario.ced_usu.includes(busqueda) ||
      doc.evento.nom_evt.toLowerCase().includes(busqueda.toLowerCase()) ||
      doc.tipo_documento.toLowerCase().includes(busqueda.toLowerCase());

    return coincideFiltro && coincideBusqueda;
  });

  if (loading) {
    return (
      <div className="p-8 bg-white min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#581517] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando documentos pendientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen text-gray-800">
      {/* 🔙 Botón para regresar */}
      <button
        onClick={() => router.push("/responsable")}
        className="flex items-center gap-2 text-[#581517] hover:text-[#7a1c1c] mb-4 transition"
      >
        <ArrowLeft size={20} />
        Regresar a Mis Eventos
      </button>

      <h1 className="text-3xl font-semibold text-center text-[#581517] mb-6">
        Validación de Documentos
      </h1>

      {/* 🔍 Buscador */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por usuario, cédula, evento o tipo de documento..."
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
              <th className="p-3 border">Tipo</th>
              <th className="p-3 border">Usuario</th>
              <th className="p-3 border">Cédula</th>
              <th className="p-3 border">Evento</th>
              <th className="p-3 border">Documento</th>
              <th className="p-3 border">Estado</th>
              <th className="p-3 border">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filtrarDocumentos.map((doc) => (
              <tr key={doc.id} className="text-sm">
                <td className="p-3 border">
                  <div className="flex items-center gap-2">
                    {doc.tipo === 'COMPROBANTE_PAGO' ? (
                      <>
                        <CreditCard size={16} className="text-green-600" />
                        <span className="text-xs font-semibold">Pago</span>
                      </>
                    ) : (
                      <>
                        <FileText size={16} className="text-blue-600" />
                        <span className="text-xs font-semibold">Requisito</span>
                      </>
                    )}
                  </div>
                </td>
                <td className="p-3 border">{doc.usuario.nombre_completo}</td>
                <td className="p-3 border">{doc.usuario.ced_usu}</td>
                <td className="p-3 border">{doc.evento.nom_evt}</td>
                <td className="p-3 border">
                  <div>
                    <div className="font-semibold">{doc.tipo_documento}</div>
                    {doc.descripcion && (
                      <div className="text-xs text-gray-500">{doc.descripcion}</div>
                    )}
                    {doc.tipo === 'COMPROBANTE_PAGO' && doc.valor && (
                      <div className="text-xs text-green-600 font-semibold">${doc.valor.toFixed(2)}</div>
                    )}
                  </div>
                </td>

                <td className="p-3 border">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-semibold
                    ${
                      doc.estado === "PENDIENTE"
                        ? "bg-yellow-100 text-yellow-700"
                        : doc.estado === "APROBADO"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {doc.estado}
                  </span>
                </td>

                <td className="p-3 border flex gap-2 justify-center">

                  {/* Ver Documento */}
                  {doc.archivo && (
                    <button
                      onClick={() => setDocumentoModal(`http://localhost:3001/${doc.archivo}`)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Ver documento"
                    >
                      <Eye size={20} />
                    </button>
                  )}

                  {/* Aprobar */}
                  {doc.estado === "PENDIENTE" && (
                    <button
                      onClick={() => aprobarDocumento(doc)}
                      className="text-green-600 hover:text-green-800"
                      title="Aprobar documento"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}

                  {/* Rechazar */}
                  {doc.estado === "PENDIENTE" && (
                    <button
                      onClick={() => rechazarDocumento(doc)}
                      className="text-red-600 hover:text-red-800"
                      title="Rechazar documento"
                    >
                      <XCircle size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {filtrarDocumentos.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-4 text-gray-500">
                  No hay documentos encontrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para ver documento con layout nuevo */}
      {documentoModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDocumentoModal(null)}
        >
          <div
            className="bg-white rounded-xl w-[95vw] max-w-6xl h-[90vh] overflow-hidden shadow-2xl border border-gray-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800">Vista previa del documento</h3>
              <button
                onClick={() => setDocumentoModal(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            {/* Body: visor */}
            <div className="flex-1 bg-[#111]">
              <iframe
                src={documentoModal}
                className="w-full h-full border-0"
                title="Vista previa del documento"
              />
            </div>

            {/* Footer compacto */}
            <div className="px-3 py-2 flex items-center justify-between gap-3 border-t bg-white text-xs">
              <p className="text-[11px] text-gray-600 truncate">
                Archivo: <span className="font-mono text-[11px] break-all">{documentoModal}</span>
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={documentoModal}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#581517] text-white rounded-md hover:bg-[#7a1c1c] transition text-sm"
                >
                  📥 Descargar
                </a>
                <button
                  onClick={() => setDocumentoModal(null)}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition text-sm"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
