// frontend/src/app/solicitudes/components/FormDesarrollador.tsx
import React, { useState } from "react";

export default function FormDesarrollador({ base }: { base: any }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [justificacion, setJustificacion] = useState("");
  const [impactoNoCambio, setImpactoNoCambio] = useState("");
  const [tipoCambio, setTipoCambio] = useState("");
  const [clasificacion, setClasificacion] = useState("");
  const [impactoAlcance, setImpactoAlcance] = useState("");
  const [impactoDias, setImpactoDias] = useState<number | "">("");
  const [recursos, setRecursos] = useState("");
  const [riesgos, setRiesgos] = useState("");
  const [modulos, setModulos] = useState<string[]>([]);

  const modulosList = ["Docente","Administrador","Estudiante","Responsable","Usuario logueado","Usuario no logueado","Otro"];

  const toggleModulo = (m:string) => {
    setModulos(prev => prev.includes(m) ? prev.filter(x=>x!==m) : [...prev, m]);
  };

  const validar = () => {
    if (!titulo.trim() || !descripcion.trim() || !justificacion.trim() || !tipoCambio || !clasificacion) {
      alert("Complete los campos obligatorios.");
      return false;
    }
    return true;
  };

  const enviar = async () => {
    if (!validar()) return;

    const payload = {
      tipoUsuario: "desarrollador",
      numeroSolicitud: base.numeroSolicitud,
      nombreProyecto: base.nombreProyecto,
      fechaSolicitud: base.fechaSolicitud,
      nombreSolicitante: base.nombreSolicitante,
      correo: base.correo,
      contacto: base.contacto,

      titulo,
      descripcion,
      justificacion,
      impactoNoCambio,
      tipoCambio,
      clasificacion,
      impactoAlcance,
      impactoDias,
      recursos,
      riesgos,
      modulos
    };

    try {
      const res = await fetch("/api/crearIssue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Solicitud desarrollador registrada en GitHub ✅");
        location.reload();
      } else {
        const err = await res.json();
        console.error(err);
        alert("Error al registrar la solicitud");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  };

  const opcionesClasificacion = () => {
    if (tipoCambio === "normal") return ["Funcional","Técnico","Documental"];
    if (tipoCambio === "estandar") return ["Mantenimiento","Actualización"];
    if (tipoCambio === "emergencia") return ["Crítico","Seguridad"];
    return [];
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold">Módulos afectados</label>
        <div className="grid grid-cols-2 gap-2">
          {modulosList.map(m => (
            <label key={m} className="inline-flex items-center space-x-2">
              <input type="checkbox" checked={modulos.includes(m)} onChange={()=>toggleModulo(m)} className="w-4 h-4" />
              <span className="text-sm text-gray-600">{m}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold">Título del Cambio</label>
        <input className="mt-1 w-full rounded-lg border p-3" value={titulo} onChange={e=>setTitulo(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-semibold">Descripción Detallada</label>
        <textarea className="mt-1 w-full rounded-lg border p-3 h-28" value={descripcion} onChange={e=>setDescripcion(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-semibold">Justificación</label>
        <textarea className="mt-1 w-full rounded-lg border p-3 h-20" value={justificacion} onChange={e=>setJustificacion(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-semibold">Impacto de no implementar</label>
        <textarea className="mt-1 w-full rounded-lg border p-3 h-20" value={impactoNoCambio} onChange={e=>setImpactoNoCambio(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold">Tipo de Cambio</label>
          <select className="mt-1 w-full rounded-lg border p-3" value={tipoCambio} onChange={e=>{ setTipoCambio(e.target.value); setClasificacion(""); }}>
            <option value="">Seleccione...</option>
            <option value="normal">Normal</option>
            <option value="estandar">Estándar</option>
            <option value="emergencia">Emergencia</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold">Clasificación</label>
          <select className="mt-1 w-full rounded-lg border p-3" value={clasificacion} onChange={e=>setClasificacion(e.target.value)}>
            <option value="">Seleccione...</option>
            {opcionesClasificacion().map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold">Impacto en el Alcance</label>
        <textarea className="mt-1 w-full rounded-lg border p-3 h-20" value={impactoAlcance} onChange={e=>setImpactoAlcance(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-semibold">Impacto en Días</label>
        <input type="number" className="mt-1 w-40 rounded-lg border p-3" value={impactoDias} onChange={e=>setImpactoDias(Number(e.target.value) || "")} />
      </div>

      <div>
        <label className="block text-sm font-semibold">Recursos Necesarios</label>
        <textarea className="mt-1 w-full rounded-lg border p-3 h-20" value={recursos} onChange={e=>setRecursos(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-semibold">Riesgos Identificados</label>
        <textarea className="mt-1 w-full rounded-lg border p-3 h-20" value={riesgos} onChange={e=>setRiesgos(e.target.value)} />
      </div>

      <div className="flex justify-end">
        <button onClick={enviar} className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">Enviar Solicitud</button>
      </div>
    </div>
  );
}
