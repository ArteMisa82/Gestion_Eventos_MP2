"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RecuperarModal from "@/app/login/RecuperarModal";
import VerifyEmailModal from "@/app/login/VerifyEmailModal";
import RegisterForm from "@/app/login/registroForm";
import logo from "../../public/logo_UTA.png";
import { authAPI } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

export default function LoginModal({
  isOpen,
  onClose,
  initialRegister = false,
  onLoginSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialRegister?: boolean;
  onLoginSuccess?: (userData: any) => void;
}) {
  const router = useRouter();
  const { login: authLogin, user: authUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRecoverOpen, setIsRecoverOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(initialRegister);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setShowRegister(initialRegister);
  }, [isOpen, initialRegister]);

  // 🔐 Login totalmente corregido
  const handleLogin = async () => {
    if (!email || !password) {
      Swal.fire({
        title: "Campos vacíos",
        text: "Por favor ingresa correo y contraseña",
        icon: "warning",
        confirmButtonColor: "#581517",
      });
      return;
    }

    setIsLoading(true);

    try {
      // ✅ Usar el hook de autenticación
      await authLogin(email, password);
      
      // Esperar un momento para que el hook actualice el estado
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Obtener el usuario desde localStorage (ya guardado por el hook)
      const storedUser = localStorage.getItem('user');
      let usuario = null;
      
      if (storedUser) {
        usuario = JSON.parse(storedUser);
      }
      
      if (!usuario) {
        throw new Error("Respuesta inválida del servidor");
      }
      
      console.log("=== USUARIO DESPUÉS DEL LOGIN ===");
      console.log("Usuario completo:", usuario);
      
      // Si necesitas el id o propiedades de sesión, úsalas desde `usuario`.
      // Mantén el resto del flujo (mensajes, redirección, verificación de email):
      if (usuario && usuario.email_verified === false) {
        setIsVerifyOpen(true);
      }

      // Redirección + mensaje
      let mensaje = "";
      let ruta = "/home";

      if ( usuario.Administrador === true) {
        // Administradores van a /admin
        mensaje = `Bienvenido ${usuario.nom_usu} 👑`;
        ruta = "/admin";
      } else if(usuario.adm_usu === 1) {
        mensaje = `Bienvenido ${usuario.nom_usu} 👑`;
        ruta = "/usuarios/cursos";

      }else if (usuario.stu_usu === 1) {
        // Estudiantes van a /cursos
        mensaje = `Bienvenido ${usuario.nom_usu} 🎓`;
        ruta = "/cursos";
      } else {
        // Usuarios regulares (potenciales responsables/instructores) van a /responsable
        mensaje = `Bienvenido ${usuario.nom_usu}`;
        ruta = "/responsable";
      }

      await Swal.fire({
        title: mensaje,
        icon: "success",
        confirmButtonColor: "#581517",
        timer: 2000,
        showConfirmButton: false,
      });

      if (onLoginSuccess) onLoginSuccess(usuario);

      setEmail("");
      setPassword("");
      setShowPassword(false);
      setShowRegister(false);

      onClose();
      router.push(ruta);

    } catch (error: any) {
      Swal.fire({
        title: "Error de autenticación",
        text: error.message || "Credenciales incorrectas",
        icon: "error",
        confirmButtonColor: "#581517",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 w-[380px] md:w-[400px] max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#581517] hover:text-[#7a2022]"
            >
              <X size={22} />
            </button>

            <div className="flex justify-center mb-6">
              <Image src={logo} alt="Logo" width={90} height={90} />
            </div>

            <AnimatePresence mode="wait">
              {!showRegister ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                >
                  <h1 className="text-2xl font-bold text-center text-[#581517] mb-6">
                    Iniciar Sesión
                  </h1>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleLogin();
                    }}
                    className="flex flex-col gap-5"
                  >
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-[#bfa66b]" size={20} />
                      <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 pl-10 border border-[#bfa66b]/70 rounded-lg text-[#581517] placeholder-[#bfa66b]/80 focus:ring-2 focus:ring-[#581517]/60 transition"
                        maxLength={100}
                        required
                      />
                    </div>

                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-[#bfa66b]" size={20} />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 pl-10 pr-10 border border-[#bfa66b]/70 rounded-lg text-[#581517] placeholder-[#bfa66b]/80 focus:ring-2 focus:ring-[#581517]/60 transition"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-[#bfa66b] hover:text-[#581517]"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>

                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setIsRecoverOpen(true)}
                        className="text-[#581517] text-sm font-medium hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3 mt-2 rounded-lg text-white font-semibold shadow-md transition-transform transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      style={{ background: "linear-gradient(to right, #581517, #7a2022)" }}
                    >
                      {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
                    </button>
                  </form>

                  <div className="text-center mt-6 text-sm text-gray-700">
                    <p>
                      ¿No tienes una cuenta?{" "}
                      <button
                        onClick={() => setShowRegister(true)}
                        className="text-[#581517] font-semibold hover:underline"
                      >
                        Regístrate aquí
                      </button>
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                >
                  <RegisterForm onClose={() => setShowRegister(false)} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Modal de recuperación */}
          <RecuperarModal
            isOpen={isRecoverOpen}
            onClose={() => setIsRecoverOpen(false)}
            onRecoverySent={(msg) =>
              Swal.fire({
                title: "Éxito",
                text: msg,
                icon: "success",
                confirmButtonColor: "#581517",
              })
            }
          />

          <VerifyEmailModal
            isOpen={isVerifyOpen}
            onClose={() => setIsVerifyOpen(false)}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
