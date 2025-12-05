// frontend/src/app/solicitudes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // ⬅️ Import agregado
import { ArrowLeft } from "lucide-react"; // ⬅️ Ícono agregado

import SelectorTipoUsuario from "./components/SelectorTipoUsuario";
import DatosGenerales from "./components/DatosGenerales";
import FormUsuarioFinal from "./components/FormUsuarioFinal";
import FormDesarrollador from "./components/FormDesarrollador";
import StepFooter from "./components/stepFooter";

export default function SolicitudCambioPage() {
  const router = useRouter(); // ⬅️ Hook para redirigir
  const [step, setStep] = useState(1);
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
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    const numeroSolicitud = `SCR-${año}${mes}${dia}-${random}`;
    const fecha = ahora.toISOString().split("T")[0];

    setPayloadBase(b => ({ ...b, numeroSolicitud, fechaSolicitud: fecha }));
  }, []);

  const goPrev = () => setStep(s => Math.max(1, s - 1));

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="relative max-w-5xl min-h-[85vh] mx-auto bg-white rounded-2xl shadow-xl p-10 mt-2">

        {/* ⬇️ FLECHA PARA VOLVER AL HOME */}
        <button
          onClick={() => router.push("/home")}
          className="absolute left-4 top-4 text-gray-700 hover:text-gray-900 transition"
        >
          <ArrowLeft size={26} />
        </button>
        {/* ⬆️ FIN DE LA FLECHA */}

        <h1 className="text-2xl font-semibold text-gray-800 text-center mb-6 mt-6">
          Solicitud de Cambio — Gestión
        </h1>

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
          <FormUsuarioFinal base={payloadBase} />
        )}

        {step === 3 && tipoUsuario === "desarrollador" && (
          <FormDesarrollador base={payloadBase} />
        )}

        <StepFooter
          step={step}
          onPrev={goPrev}
          onNext={() => {
            if (step === 1) setStep(2);
            else if (step === 2) setStep(3);
          }}
          showPrev={step > 1}
          showNext={step < 3}
        />
      </div>
    </div>
  );
}
