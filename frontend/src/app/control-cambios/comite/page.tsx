"use client";

import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";

import FiltersBar from "./components/FiltersBar";
import SolicitudDetalle from "./components/SolicitudDetalle";
import SolicitudesList from "./components/SolicitudesList";

import { Solicitud, Accion, currentUser, Estado } from "./components/types";

/* ------------------ Datos de ejemplo ------------------ */
const MOCK: Solicitud[] = [
  {
    id: 1,
    titulo: "Actualización del módulo de facturación",
    descripcion: "Se requiere agregar validación automática de impuestos.",
    justificacion: "Evitar errores manuales del departamento contable.",
    modulos: ["Facturación", "Contabilidad"],
    clasificacion: "Funcional",
    impactoDias: 3,
    estado: "Pendiente",
    fecha: "2025-02-10",
    solicitanteNombre: "Carlos",
    solicitanteApellido: "López",
    solicitanteEmail: "carlos.lopez@example.com",
    solicitanteContacto: "809-555-1122",
    prioridad: "Alta",
    acciones: [],
    numeroSolicitud: "CC-2025-001",
    impactoNoImplementar:
      "Errores en cálculos fiscales y retrasos en reportes.",
    tipoCambio: "Normal",
    clasificacionCambio: "Software",
    recursosNecesarios: "1 Desarrollador Backend, 1 QA",
    riesgos: "Fallos en cálculos si no se valida bien."
  },
  {
    id: 2,
    titulo: "Nuevo dashboard para reportes",
    descripcion: "Dashboard dinámico para resumen de ventas.",
    justificacion: "Mejorar la visibilidad de KPIs.",
    modulos: ["Reportes"],
    clasificacion: "UI/UX",
    impactoDias: 5,
    estado: "En revisión",
    fecha: "2025-02-08",
    solicitanteNombre: "María",
    solicitanteApellido: "Fernández",
    solicitanteEmail: "maria.fernandez@example.com",
    solicitanteContacto: "809-555-8833",
    prioridad: "Media",
    acciones: [
      {
        actorNombre: "Ana",
        actorApellido: "Gómez",
        actorEmail: "ana.gomez@example.com",
        accion: "Solicitó info",
        comentario: "¿Cuáles métricas deben incluirse exactamente?",
        fecha: "2025-02-09T15:20:00"
      }
    ],
    numeroSolicitud: "CC-2025-002",
    impactoNoImplementar: "Las gerencias no podrán ver KPIs en tiempo real.",
    tipoCambio: "Normal",
    clasificacionCambio: "UI",
    recursosNecesarios: "1 Frontend, 1 Data Analyst",
    riesgos: "Lentitud si no se cachean consultas."
  },
  {
    id: 3,
    titulo: "Corrección en módulo de inventario",
    descripcion: "Ajustes en el cálculo del stock reservado.",
    justificacion: "Evitar inconsistencias en reportes.",
    modulos: ["Inventario"],
    clasificacion: "Bugfix",
    impactoDias: 1,
    estado: "Aprobado",
    fecha: "2025-02-01",
    solicitanteNombre: "Laura",
    solicitanteApellido: "Ramírez",
    solicitanteEmail: "laura.ramirez@example.com",
    solicitanteContacto: "829-555-5588",
    prioridad: "Baja",
    acciones: [
      {
        actorNombre: "Ana",
        actorApellido: "Gómez",
        actorEmail: "ana.gomez@example.com",
        accion: "Aprobado",
        comentario: "Listo para implementar.",
        fecha: "2025-02-02T09:10:00"
      }
    ],
    numeroSolicitud: "CC-2025-003",
    impactoNoImplementar: "Errores leves en reportes.",
    tipoCambio: "Normal",
    clasificacionCambio: "Bug",
    recursosNecesarios: "1 Backend",
    riesgos: "Afectar módulo de ventas si no se prueba bien."
  }
];



export default function ComitePage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(MOCK);
  const [selected, setSelected] = useState<Solicitud | null>(null);
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterPrioridad, setFilterPrioridad] = useState("");

  /* ------------------ Filtro ------------------ */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return solicitudes.filter((s) => {
      const match =
        q === "" ||
        s.titulo.toLowerCase().includes(q) ||
        s.descripcion.toLowerCase().includes(q);

      const byEstado = !filterEstado || s.estado === filterEstado;
      const byPrioridad = !filterPrioridad || s.prioridad === filterPrioridad;

      return match && byEstado && byPrioridad;
    });
  }, [search, filterEstado, filterPrioridad, solicitudes]);

  /* ------------------ Acciones ------------------ */
  const performAction = async (
  solId: number,
  nuevaAccion: "Aprobado" | "Rechazado" | "Cancelado" | "RolloutProgramado" | "Implementado" | "Revertido" | "ActualizarCamposComite"
) => {

  const solicitud = solicitudes.find((s) => s.id === solId);
  if (!solicitud) return;

  if (nuevaAccion === "ActualizarCamposComite") {
      // Esta acción se maneja de forma diferente en SolicitudDetalle
      return;
  }

  let nuevaAccionTexto = "";
  let nuevoEstado: Estado | null = null;

  switch (nuevaAccion) {
    case "Aprobado":
      nuevaAccionTexto = "Aprobado";
      nuevoEstado = "Aprobado";
      break;

    case "Rechazado":
      nuevaAccionTexto = "Rechazado";
      nuevoEstado = "Rechazado";
      break;

    case "Cancelado":
      nuevaAccionTexto = "Cancelado";
      nuevoEstado = "Cancelado";
      break;

    case "RolloutProgramado":
      nuevaAccionTexto = "Rollout iniciado";
      nuevoEstado = "En revisión";
      break;

    case "Implementado":
      nuevaAccionTexto = "Rollout completado";
      nuevoEstado = "Implementado";
      break;

    case "Revertido":
      nuevaAccionTexto = "Backout ejecutado";
      nuevoEstado = "Revertido";
      break;
  }

  const { value: comentario, isConfirmed } = await Swal.fire({
    title: nuevaAccionTexto,
    input: "textarea",
    showCancelButton: true,
  });

  if (!isConfirmed) return;

  const accion: Accion = {
    actorNombre: currentUser.nombre,
    actorApellido: currentUser.apellido,
    actorEmail: currentUser.email,
    accion: nuevaAccionTexto,
    comentario: comentario || undefined,
    fecha: new Date().toISOString(),
  };

  setSolicitudes((prev) =>
    prev.map((s) =>
      s.id === solId
        ? {
            ...s,
            estado: nuevoEstado || s.estado,
            acciones: [...(s.acciones || []), accion],
          }
        : s
    )
  );

  if (selected?.id === solId) {
    setSelected((prev) =>
      prev
        ? {
            ...prev,
            estado: nuevoEstado || prev.estado,
            acciones: [...(prev.acciones || []), accion],
          }
        : prev
    );
  }

  Swal.fire({
    icon: "success",
    title: `Solicitud ${nuevaAccionTexto.toLowerCase()}`,
    showConfirmButton: false,
    timer: 1200,
  });
};


  return (
    <div className="min-h-screen bg-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">
          Panel del Comité
        </h1>

        {/* Filtros */}
        <FiltersBar
          search={search}
          setSearch={setSearch}
          filterEstado={filterEstado}
          setFilterEstado={setFilterEstado}
          filterPrioridad={filterPrioridad}
          setFilterPrioridad={setFilterPrioridad}
        />

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SolicitudesList
            filtered={filtered}
            selected={selected}
            setSelected={setSelected}
          />

          <SolicitudDetalle
            selected={selected}
            setSelected={setSelected}
            performAction={performAction}
          />
        </div>
      </div>
    </div>
  );
}
