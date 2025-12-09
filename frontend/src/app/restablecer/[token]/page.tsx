"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { authAPI } from "@/services/api";

export default function RestablecerPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = params;

  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // Verificar validez del token al cargar la página
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await authAPI.verifyResetToken(token);
        
        if (response && response.success) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          await Swal.fire({
            title: "Token Inválido",
            text: response?.message || "El enlace de recuperación es inválido o ha expirado. Solicita uno nuevo.",
            icon: "error",
            confirmButtonColor: "#581517",
            allowOutsideClick: false,
            allowEscapeKey: false
          });
          router.push("/home");
        }
      } catch (error: any) {
        setTokenValid(false);
        const message = error?.message || "Error al verificar el token";
        await Swal.fire({
          title: "Error",
          text: message,
          icon: "error",
          confirmButtonColor: "#581517",
          allowOutsideClick: false,
          allowEscapeKey: false
        });
        router.push("/home");
      } finally {
        setVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      Swal.fire("Error", "La contraseña debe tener al menos 6 caracteres", "error");
      return;
    }

    if (password !== confirmar) {
      Swal.fire("Error", "Las contraseñas no coinciden", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.resetPassword(token, password);

      if (response && response.success) {
        await Swal.fire({
          title: "¡Éxito!",
          text: "Tu contraseña ha sido restablecida correctamente. Ahora puedes iniciar sesión.",
          icon: "success",
          confirmButtonColor: "#581517"
        });

        router.push("/home");
      } else {
        Swal.fire({
          title: "Error",
          text: response?.message || "No se pudo restablecer la contraseña",
          icon: "error",
          confirmButtonColor: "#581517"
        });
      }
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error?.message || "No se pudo restablecer la contraseña",
        icon: "error",
        confirmButtonColor: "#581517"
      });
    }

    setLoading(false);
  };

  // Mostrar estado de carga mientras se verifica el token
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg border border-gray-200 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#581517] mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando enlace de recuperación...</p>
        </div>
      </div>
    );
  }

  // Si el token no es válido, no mostrar el formulario
  if (!tokenValid) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#581517] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">Restablecer Contraseña</h2>
          <p className="text-gray-600">Ingresa tu nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Nueva Contraseña */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nueva contraseña
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#581517] focus:border-transparent transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              disabled={loading}
            />
          </div>

          {/* Campo Confirmar Contraseña */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Confirmar contraseña
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#581517] focus:border-transparent transition-colors"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Repite tu contraseña"
              required
              disabled={loading}
            />
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200
              ${loading 
                ? "bg-gray-400 cursor-not-allowed text-gray-600" 
                : "bg-[#581517] hover:bg-[#7a1c1c] text-white shadow-md hover:shadow-lg"
              }
            `}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Procesando...
              </div>
            ) : (
              "Restablecer contraseña"
            )}
          </button>
        </form>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            🔒 Tu contraseña debe tener al menos 6 caracteres y ser segura
          </p>
        </div>
      </div>
    </div>
  );
}
