"use client";
import { useState } from "react";
import { authAPI } from "@/services/api";
import Swal from "sweetalert2";

interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecoverySent: (message: string) => void;
}

export default function RecoveryModal({ isOpen, onClose, onRecoverySent }: RecoveryModalProps) {
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ Validar que NO sea correo @uta.edu.ec
    if (recoveryEmail.toLowerCase().endsWith('@uta.edu.ec')) {
      Swal.fire({
        title: "Correo Institucional",
        text: "No se puede cambiar la contraseña. Diríjase a la DITIC.",
        icon: "warning",
        confirmButtonColor: "#581517"
      });
      return;
    }
    
    // ✅ Aceptar solo correos personales (@gmail.com, @hotmail.com, etc)
    setIsLoading(true);
    try {
      const res = await authAPI.forgotPassword(recoveryEmail);

      // backend may return { message } or { data }
      const message = (res && (res.message || res.data || res)) || "Se ha enviado un enlace de recuperación a tu correo ✅";
      onRecoverySent(typeof message === 'string' ? message : JSON.stringify(message));
      setRecoveryEmail("");
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      // If blocked (e.g., @uta.edu.ec) backend should return 403 with message
      const text = err?.message || "No se pudo procesar la solicitud";
      Swal.fire({ title: "Error", text, icon: "error", confirmButtonColor: "#581517" });
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Decoración superior */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#581517]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-[#bfa66b]/10 rounded-full blur-3xl" />

        {/* Contenido */}
        <div className="p-6 relative z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-[#581517]">Recuperar contraseña</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-[#581517] text-2xl font-bold transition"
            >
              &times;
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              className="w-full p-3 border border-[#bfa66b]/70 rounded-lg bg-white text-[#581517] placeholder-[#bfa66b]/80 focus:outline-none focus:ring-2 focus:ring-[#581517]/50 transition"
              required
            />

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-[#bfa66b]/70 text-[#581517] rounded-lg font-semibold hover:bg-[#f5f0f0] transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#581517] to-[#7a2022] text-white py-3 rounded-lg font-semibold hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar enlace"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
