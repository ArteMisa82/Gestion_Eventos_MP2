"use client";

import React, { useEffect, useState } from "react";
import { Eye, CheckCircle, XCircle, Search } from "lucide-react";
import Swal from "sweetalert2";

interface PagoValidar {
  num_pag: number;
  num_reg_per: number;
  val_pag: number;
  met_pag: string;
  pdf_comp_pag: string | null;
  estado_pago: "Pendiente" | "Aprobado" | "Rechazado";
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
  estado_registro: string;
  fecha_registro: string;
}

export default function ValidacionesResponsable() {
  const [pagos, setPagos] = useState<PagoValidar[]>([]);
  const [filtro, setFiltro] = useState("Todos");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);

  // Cargar pagos pendientes desde la API
  useEffect(() => {
    cargarPagosPendientes();
  }, []);

  const cargarPagosPendientes = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/pagos/pendientes-validacion', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar pagos pendientes');
      }

      const data = await response.json();
      setPagos(data);
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los pagos pendientes'
      });
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // 🟢 Acciones Frontend
  // -----------------------------

  const aprobarPago = async (numRegPer: number) => {
    const confirmacion = await Swal.fire({
      title: '¿Aprobar este pago?',
      text: 'Se completará la inscripción del usuario',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar'
    });

    if (!confirmacion.isConfirmed) return;

    try {
      const response = await fetch(`http://localhost:3001/api/pagos/validar/${numRegPer}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ estado: 'APROBAR' })
      });

      if (!response.ok) {
        throw new Error('Error al aprobar el pago');
      }

      Swal.fire({
        icon: 'success',
        title: 'Pago aprobado',
        text: 'La inscripción ha sido completada',
        timer: 2000,
        showConfirmButton: false,
      });

      // Recargar la lista
      cargarPagosPendientes();

    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo aprobar el pago'
      });
    }
  };

  const rechazarPago = async (numRegPer: number) => {
    const { value: motivo } = await Swal.fire({
      title: 'Motivo del rechazo',
      input: 'textarea',
      inputPlaceholder: 'Describe por qué se rechaza este pago...',
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
      const response = await fetch(`http://localhost:3001/api/pagos/validar/${numRegPer}`, {
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
        throw new Error('Error al rechazar el pago');
      }

      Swal.fire({
        icon: 'success',
        title: 'Pago rechazado',
        text: `El usuario será notificado para volver a subir el comprobante`,
      });

      // Recargar la lista
      cargarPagosPendientes();

    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo rechazar el pago'
      });
    }
  };

  // -----------------------------
  // 🟡 Filtrado y búsqueda
  // -----------------------------

  const filtrarPagos = pagos.filter((pago) => {
    const coincideFiltro = filtro === "Todos" || pago.estado_pago === filtro;

    const coincideBusqueda =
      pago.usuario.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) ||
      pago.usuario.ced_usu.includes(busqueda) ||
      pago.evento.nom_evt.toLowerCase().includes(busqueda.toLowerCase()) ||
      pago.met_pag.toLowerCase().includes(busqueda.toLowerCase());

    return coincideFiltro && coincideBusqueda;
  });

  if (loading) {
    return (
      <div className="p-8 bg-white min-h-screen text-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#581517] mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando pagos pendientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen text-gray-800">

      <h1 className="text-3xl font-semibold text-center text-[#581517] mb-6">
        Validación de Pagos
      </h1>

      {/* 🔍 Buscador */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por usuario, cédula, evento o método de pago..."
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
              <th className="p-3 border">Cédula</th>
              <th className="p-3 border">Evento</th>
              <th className="p-3 border">Método</th>
              <th className="p-3 border">Valor</th>
              <th className="p-3 border">Estado</th>
              <th className="p-3 border">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filtrarPagos.map((pago) => (
              <tr key={pago.num_pag} className="text-sm">
                <td className="p-3 border">{pago.usuario.nombre_completo}</td>
                <td className="p-3 border">{pago.usuario.ced_usu}</td>
                <td className="p-3 border">{pago.evento.nom_evt}</td>
                <td className="p-3 border">
                  <span className="px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700">
                    {pago.met_pag}
                  </span>
                </td>
                <td className="p-3 border">${pago.val_pag.toFixed(2)}</td>

                <td className="p-3 border">
                  <span
                    className={`px-2 py-1 rounded-md text-xs font-semibold
                    ${
                      pago.estado_pago === "Pendiente"
                        ? "bg-yellow-100 text-yellow-700"
                        : pago.estado_pago === "Aprobado"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {pago.estado_pago}
                  </span>
                </td>

                <td className="p-3 border flex gap-2 justify-center">

                  {/* Ver Comprobante */}
                  {pago.pdf_comp_pag && (
                    <button
                      onClick={() => window.open(`http://localhost:3001/${pago.pdf_comp_pag}`, "_blank")}
                      className="text-blue-600 hover:text-blue-800"
                      title="Ver comprobante"
                    >
                      <Eye size={20} />
                    </button>
                  )}

                  {/* Aprobar */}
                  {pago.estado_pago === "Pendiente" && (
                    <button
                      onClick={() => aprobarPago(pago.num_reg_per)}
                      className="text-green-600 hover:text-green-800"
                      title="Aprobar pago"
                    >
                      <CheckCircle size={20} />
                    </button>
                  )}

                  {/* Rechazar */}
                  {pago.estado_pago === "Pendiente" && (
                    <button
                      onClick={() => rechazarPago(pago.num_reg_per)}
                      className="text-red-600 hover:text-red-800"
                      title="Rechazar pago"
                    >
                      <XCircle size={20} />
                    </button>
                  )}
                </td>
              </tr>
            ))}

            {filtrarPagos.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-4 text-gray-500">
                  No hay pagos encontrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
