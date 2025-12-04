// frontend/src/app/solicitudes/components/FormUsuarioFinal.tsx
import React, { useState } from "react";

export default function FormUsuarioFinal({ base }: { base: any }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [justificacion, setJustificacion] = useState("");
  const [modulos, setModulos] = useState<string[]>([]);

  const modulosList = ["Docente","Administrador","Estudiante","Responsable","Usuario logueado","Usuario no logueado","Otro"];

  const toggleModulo = (m:string) => {
    setModulos(prev => prev.includes(m) ? prev.filter(x=>x!==m) : [...prev, m]);
  };

  const validar = () => {
    if (!titulo.trim() || !descripcion.trim() || !justificacion.trim()) {
      alert("Por favor complete los campos obligatorios.");
      return false;
    }
    return true;
  };

  const enviar = async () => {
    if (!validar()) return;

    const payload = {
      tipoUsuario: "usuarioFinal",
      numeroSolicitud: base.numeroSolicitud,
      nombreProyecto: base.nombreProyecto,
      fechaSolicitud: base.fechaSolicitud,
      nombreSolicitante: base.nombreSolicitante,
      correo: base.correo,
      contacto: base.contacto,
      titulo,
      descripcion,
      justificacion,
      modulos
    };

    try {
      const res = await fetch("/api/crearIssue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Solicitud registrada en GitHub ✅");
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

  return (
    <div className="space-y-4">
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
        <label className="block text-sm font-semibold mb-2">Módulos / Tipo de usuario afectado</label>
        <div className="grid grid-cols-2 gap-2">
          {modulosList.map(m => (
            <label key={m} className="inline-flex items-center space-x-2">
              <input type="checkbox" checked={modulos.includes(m)} onChange={()=>toggleModulo(m)} className="w-4 h-4" />
              <span className="text-sm text-gray-600">{m}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={enviar} className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">Enviar Solicitud</button>
      </div>
    </div>
  );
}
