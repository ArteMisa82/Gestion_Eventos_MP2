// frontend/src/app/solicitudes/page.tsx
"use client";

import { useState, useEffect } from "react";
import SelectorTipoUsuario from "./components/SelectorTipoUsuario";
import DatosGenerales from "./components/DatosGenerales";
import FormUsuarioFinal from "./components/FormUsuarioFinal";
import FormDesarrollador from "./components/FormDesarrollador";
import StepFooter from "./components/stepFooter";

export default function SolicitudCambioPage() {
  const [step, setStep] = useState(1); // 1 select user, 2 datos generales, 3 form role
  const [tipoUsuario, setTipoUsuario] = useState<"usuarioFinal" | "desarrollador" | "">("");
  const [payloadBase, setPayloadBase] = useState({
    numeroSolicitud: "",
    nombreProyecto: "",
    fechaSolicitud: "",
    nombreSolicitante: "",
    correo: "",
    contacto: ""
  });

  useEffect(() => {
    // generar numero y fecha al montar
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const numeroSolicitud = `SCR-${año}${mes}${dia}-${random}`;
    const fecha = ahora.toISOString().split("T")[0];

    setPayloadBase(b => ({ ...b, numeroSolicitud, fechaSolicitud: fecha }));
  }, []);

  const goNext = () => setStep(s => s + 1);
  const goPrev = () => setStep(s => Math.max(1, s - 1));

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6">Solicitud de Cambio — Gestión</h1>

        {step === 1 && (
          <SelectorTipoUsuario
            tipoUsuario={tipoUsuario}
            onSelect={(t) => {
              setTipoUsuario(t);
              setTimeout(() => setStep(2), 220);
            }}
          />
        )}

        {step === 2 && (
          <DatosGenerales
            base={payloadBase}
            onChange={(next) => setPayloadBase(prev => ({ ...prev, ...next }))}
          />
        )}

        {step === 3 && tipoUsuario === "usuarioFinal" && (
          <FormUsuarioFinal
            base={payloadBase}
          />
        )}

        {step === 3 && tipoUsuario === "desarrollador" && (
          <FormDesarrollador
            base={payloadBase}
          />
        )}

        <StepFooter
          step={step}
          onNext={() => {
            if (step === 1) setStep(2);
            else if (step === 2) setStep(3);
          }}
          onPrev={goPrev}
          showPrev={step > 1}
          showNext={step < 3}
        />
       
      </div>
    </div>
  );
}
