"use client";

import React, { useMemo } from "react";
import {
  Users,
  Calendar,
  Star,
  Activity,
  PieChart,
  TrendingUp,
} from "lucide-react";

type EstadoEvento = "NUEVO" | "EN_PROCESO" | "FINALIZADO";

type TipoEvento = "CURSO" | "TALLER" | "SEMINARIO" | "WEBINAR";

interface EventoDashboard {
  id: string;
  nombre: string;
  fecha: string;
  tipo: TipoEvento;
  estado: EstadoEvento;
  inscritos: number;
  esFavorito: boolean;
}

// 🔹 Datos mock (luego se reemplazan por datos del backend)
const eventosMock: EventoDashboard[] = [
  {
    id: "EVT001",
    nombre: "Curso de React Avanzado",
    fecha: "2025-10-12",
    tipo: "CURSO",
    estado: "EN_PROCESO",
    inscritos: 120,
    esFavorito: true,
  },
  {
    id: "EVT002",
    nombre: "Taller de Inteligencia Artificial",
    fecha: "2025-08-20",
    tipo: "TALLER",
    estado: "FINALIZADO",
    inscritos: 95,
    esFavorito: true,
  },
  {
    id: "EVT003",
    nombre: "Seminario de Marketing Digital",
    fecha: "2025-11-25",
    tipo: "SEMINARIO",
    estado: "NUEVO",
    inscritos: 60,
    esFavorito: false,
  },
  {
    id: "EVT004",
    nombre: "Webinar sobre Ciberseguridad",
    fecha: "2025-09-05",
    tipo: "WEBINAR",
    estado: "EN_PROCESO",
    inscritos: 80,
    esFavorito: false,
  },
  {
    id: "EVT005",
    nombre: "Curso de Analítica de Datos",
    fecha: "2025-12-02",
    tipo: "CURSO",
    estado: "NUEVO",
    inscritos: 150,
    esFavorito: true,
  },
];

const AdminDashboard: React.FC = () => {
  // 📊 Cálculos centralizados (luego vendrán del backend)
  const {
    totalEventos,
    totalInscritos,
    eventosNuevos,
    eventosEnProceso,
    eventosFinalizados,
    favoritos,
    porcentajePorTipo,
    recientes,
  } = useMemo(() => {
    const totalEventos = eventosMock.length;
    const totalInscritos = eventosMock.reduce(
      (acc, evt) => acc + evt.inscritos,
      0
    );

    const eventosNuevos = eventosMock.filter(
      (e) => e.estado === "NUEVO"
    ).length;
    const eventosEnProceso = eventosMock.filter(
      (e) => e.estado === "EN_PROCESO"
    ).length;
    const eventosFinalizados = eventosMock.filter(
      (e) => e.estado === "FINALIZADO"
    ).length;
    const favoritos = eventosMock.filter((e) => e.esFavorito).length;

    // Distribución por tipo (porcentaje según inscritos)
    const totalInscritosPorTipo: Record<TipoEvento, number> = {
      CURSO: 0,
      TALLER: 0,
      SEMINARIO: 0,
      WEBINAR: 0,
    };

    eventosMock.forEach((evt) => {
      totalInscritosPorTipo[evt.tipo] += evt.inscritos;
    });

    const totalInscritosGlobal = Object.values(
      totalInscritosPorTipo
    ).reduce((a, b) => a + b, 0);

    const porcentajePorTipo = (Object.keys(
      totalInscritosPorTipo
    ) as TipoEvento[]).map((tipo) => {
      const valor = totalInscritosPorTipo[tipo];
      const porcentaje =
        totalInscritosGlobal === 0
          ? 0
          : Math.round((valor / totalInscritosGlobal) * 100);
      return { tipo, valor, porcentaje };
    });

    // Ordenar eventos recientes por fecha (desc)
    const recientes = [...eventosMock].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );

    return {
      totalEventos,
      totalInscritos,
      eventosNuevos,
      eventosEnProceso,
      eventosFinalizados,
      favoritos,
      porcentajePorTipo,
      recientes,
    };
  }, []);

  return (
    <div className="p-8 font-sans text-gray-800 min-h-screen bg-white">
      {/* Encabezado */}
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-[#581517]">
          Panel de Administración
        </h1>
        <p className="text-sm text-gray-500">
          Resumen general del comportamiento de los eventos y estudiantes
          inscritos. Este dashboard está listo para conectarse al backend
          cuando el módulo de estadísticas esté implementado.
        </p>
      </header>

      {/* Tarjetas principales */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {/* Total estudiantes */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 rounded-full bg-[#581517]/10">
            <Users className="w-6 h-6 text-[#581517]" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Estudiantes inscritos
            </p>
            <p className="text-2xl font-semibold text-gray-800">
              {totalInscritos}
            </p>
            <p className="text-[11px] text-gray-400">
              Total acumulado en todos los eventos
            </p>
          </div>
        </div>

        {/* Total eventos */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 rounded-full bg-amber-100">
            <Calendar className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Eventos creados
            </p>
            <p className="text-2xl font-semibold text-gray-800">
              {totalEventos}
            </p>
            <p className="text-[11px] text-gray-400">
              Nuevos, en proceso y finalizados
            </p>
          </div>
        </div>

        {/* Favoritos */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 rounded-full bg-yellow-100">
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Eventos favoritos
            </p>
            <p className="text-2xl font-semibold text-gray-800">
              {favoritos}
            </p>
            <p className="text-[11px] text-gray-400">
              Marcados con mayor interés por los estudiantes
            </p>
          </div>
        </div>

        {/* Actividad */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 rounded-full bg-blue-100">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Actividad actual
            </p>
            <p className="text-2xl font-semibold text-gray-800">
              {eventosEnProceso} en curso
            </p>
            <p className="text-[11px] text-gray-400">
              Monitoreo rápido de eventos activos
            </p>
          </div>
        </div>
      </section>

      {/* Sección principal: estados + gráfico por tipo */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Resumen de estados */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 xl:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#581517]" />
              Resumen por estado
            </h2>
          </div>

          <div className="space-y-4">
            <EstadoItem
              label="Nuevos"
              value={eventosNuevos}
              color="bg-emerald-500"
              description="Eventos recién creados, en fase de inscripción."
            />
            <EstadoItem
              label="En proceso"
              value={eventosEnProceso}
              color="bg-blue-500"
              description="Eventos que están actualmente activos."
            />
            <EstadoItem
              label="Finalizados"
              value={eventosFinalizados}
              color="bg-gray-500"
              description="Eventos que ya han concluido."
            />
          </div>
        </div>

        {/* Gráfico porcentual por tipo de evento */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#581517]" />
              Distribución por tipo de evento
            </h2>
            <span className="text-[11px] text-gray-400">
              Porcentaje según número de estudiantes inscritos
            </span>
          </div>

          <div className="space-y-3">
            {porcentajePorTipo.map(({ tipo, porcentaje, valor }) => (
              <div key={tipo} className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span className="font-medium">
                    {tipo === "CURSO"
                      ? "Cursos"
                      : tipo === "TALLER"
                      ? "Talleres"
                      : tipo === "SEMINARIO"
                      ? "Seminarios"
                      : "Webinars"}
                  </span>
                  <span>
                    {porcentaje}% · {valor} estudiantes
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-[#581517] rounded-full transition-all"
                    style={{ width: `${porcentaje}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eventos recientes */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#581517]" />
            Eventos recientes
          </h2>
          <span className="text-[11px] text-gray-400">
            Vista rápida de los últimos eventos registrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-gray-400 border-b">
                <th className="py-2 pr-4">Evento</th>
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4">Estado</th>
                <th className="py-2 pr-4 text-right">Inscritos</th>
              </tr>
            </thead>
            <tbody>
              {recientes.map((evt) => (
                <tr key={evt.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">
                    <span className="font-medium text-gray-800">
                      {evt.nombre}
                    </span>
                    {evt.esFavorito && (
                      <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-yellow-500">
                        <Star className="w-3 h-3" />
                        Favorito
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-gray-600">{evt.fecha}</td>
                  <td className="py-2 pr-4 text-gray-600">
                    {evt.tipo === "CURSO"
                      ? "Curso"
                      : evt.tipo === "TALLER"
                      ? "Taller"
                      : evt.tipo === "SEMINARIO"
                      ? "Seminario"
                      : "Webinar"}
                  </td>
                  <td className="py-2 pr-4">
                    <EstadoBadge estado={evt.estado} />
                  </td>
                  <td className="py-2 pr-4 text-right text-gray-800">
                    {evt.inscritos}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

// 🔹 Subcomponentes pequeños para mantener limpio el JSX

interface EstadoItemProps {
  label: string;
  value: number;
  color: string; // clase Tailwind, ej: "bg-blue-500"
  description: string;
}

const EstadoItem: React.FC<EstadoItemProps> = ({
  label,
  value,
  color,
  description,
}) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-800">{label}</p>
      <p className="text-[11px] text-gray-400">{description}</p>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-xl font-semibold text-gray-800">{value}</span>
      <span className={`w-3 h-3 rounded-full ${color}`} />
    </div>
  </div>
);

const EstadoBadge: React.FC<{ estado: EstadoEvento }> = ({ estado }) => {
  const map: Record<
    EstadoEvento,
    { label: string; classes: string }
  > = {
    NUEVO: {
      label: "Nuevo",
      classes:
        "bg-emerald-50 text-emerald-700 border border-emerald-100",
    },
    EN_PROCESO: {
      label: "En proceso",
      classes: "bg-blue-50 text-blue-700 border border-blue-100",
    },
    FINALIZADO: {
      label: "Finalizado",
      classes: "bg-gray-100 text-gray-700 border border-gray-200",
    },
  };

  const { label, classes } = map[estado];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${classes}`}
    >
      {label}
    </span>
  );
};

export default AdminDashboard;
