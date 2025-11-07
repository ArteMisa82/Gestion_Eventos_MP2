"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import { Eye, EyeOff, Lock, Mail, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RecuperarModal from "@/app/login/RecuperarModal";
import RegisterForm from "@/app/login/registroForm";
import logo from "../../public/logo_UTA.png";

export default function LoginModal({
  isOpen,
  onClose,
  initialRegister = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialRegister?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRecoverOpen, setIsRecoverOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(initialRegister);

  // Bloquear scroll del fondo cuando el modal esté abierto
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Cambiar entre login / registro según prop inicial
  useEffect(() => {
    if (isOpen) setShowRegister(initialRegister);
  }, [isOpen, initialRegister]);

  // Lógica simulada de login
  const handleLogin = async () => {
    try {
      if (email === "admin") {
        Swal.fire({
          title: "Bienvenido Administrador",
          icon: "success",
          confirmButtonColor: "#581517",
        });
        // 🔄 Limpiar campos
        setEmail("");
        setPassword("");
      } else if (email.includes("encargado")) {
        Swal.fire({
          title: "Bienvenido Encargado",
          icon: "success",
          confirmButtonColor: "#581517",
        });
        setEmail("");
        setPassword("");
      } else if (email.includes("@")) {
        Swal.fire({
          title: "Inicio de sesión correcto",
          icon: "success",
          confirmButtonColor: "#581517",
        });
        setEmail("");
        setPassword("");
      } else {
        throw new Error("Credenciales inválidas");
      }
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error.message || "Error al iniciar sesión",
        icon: "error",
        confirmButtonColor: "#581517",
      });
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
          {/* Contenedor del modal principal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 15 }}
            className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 w-[380px] md:w-[400px] max-h-[90vh] overflow-y-auto"
          >
            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#581517] hover:text-[#7a2022]"
            >
              <X size={22} />
            </button>

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image src={logo} alt="Logo" width={90} height={90} />
            </div>

            {/* Contenido animado: Login o Registro */}
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
                      <Mail
                        className="absolute left-3 top-3 text-[#bfa66b]"
                        size={20}
                      />
                      <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 pl-10 border border-[#bfa66b]/70 rounded-lg text-[#581517] placeholder-[#bfa66b]/80 focus:ring-2 focus:ring-[#581517]/60 transition"
                        required
                      />
                    </div>

                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-3 text-[#bfa66b]"
                        size={20}
                      />
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
                      className="w-full py-3 mt-2 rounded-lg text-white font-semibold shadow-md transition-transform transform hover:-translate-y-1 hover:shadow-lg"
                      style={{
                        background: "linear-gradient(to right, #581517, #7a2022)",
                      }}
                    >
                      Iniciar sesión
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
            onRecoverySent={(message) =>
              Swal.fire({
                title: "Éxito",
                text: message,
                icon: "success",
                confirmButtonColor: "#581517",
              })
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
