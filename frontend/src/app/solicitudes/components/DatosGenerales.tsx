// frontend/src/app/solicitudes/components/DatosGenerales.tsx
import React from "react";

export default function DatosGenerales({ base, onChange }: {
  base: any,
  onChange: (next: Partial<typeof base>) => void
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700">Número de Solicitud</label>
        <input
          className="mt-1 w-full rounded-lg border p-3 bg-gray-50"
          value={base.numeroSolicitud}
          readOnly
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700">Nombre del Proyecto</label>
        <select
          className="mt-1 w-full rounded-lg border p-3 bg-white"
          value={base.nombreProyecto || ""}
          onChange={(e) => onChange({ nombreProyecto: e.target.value })}
        >
          <option value="">Seleccione un proyecto...</option>
          <option value="gestionVentosCursos">Gestión de Eventos y Cursos</option>
          <option value="sistemaInventarios">Sistema de Gestión de Inventarios</option>
          <option value="portalClientes">Portal de Clientes Web</option>
          <option value="appMovilVentas">Aplicación Móvil de Ventas</option>
          <option value="sistemaRRHH">Sistema de Recursos Humanos</option>
          <option value="plataformaElearning">Plataforma de E-Learning</option>
          <option value="sistemaContabilidad">Sistema de Contabilidad Integral</option>
          <option value="otros">Otros</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Fecha de Solicitud</label>
          <input
            type="date"
            className="mt-1 w-full rounded-lg border p-3 bg-white"
            value={base.fechaSolicitud || ""}
            onChange={(e) => onChange({ fechaSolicitud: e.target.value })}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Nombre del Solicitante</label>
          <input
            className="mt-1 w-full rounded-lg border p-3 bg-white"
            value={base.nombreSolicitante || ""}
            onChange={(e) => onChange({ nombreSolicitante: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700">Correo Electrónico</label>
          <input
            type="email"
            className="mt-1 w-full rounded-lg border p-3 bg-white"
            value={base.correo || ""}
            onChange={(e) => onChange({ correo: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700">Número de Contacto</label>
          <input
            className="mt-1 w-full rounded-lg border p-3 bg-white"
            value={base.contacto || ""}
            onChange={(e) => onChange({ contacto: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
