"use client";
import React, { useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import logo from "../../../public/logo_UTA.png";
import RecuperarModal from "./RecuperarModal";
import { motion, AnimatePresence } from "framer-motion";
import RegisterForm from "./registroForm";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRecoverOpen, setIsRecoverOpen] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = async () => {
    try {
      if (email === "admin") {
        Swal.fire({
          title: "Bienvenido Administrador",
          icon: "success",
          confirmButtonColor: "#581517",
        });
      } else if (email.includes("encargado")) {
        Swal.fire({
          title: "Bienvenido Encargado",
          icon: "success",
          confirmButtonColor: "#581517",
        });
      } else if (email.includes("@")) {
        Swal.fire({
          title: "Inicio de sesión correcto",
          icon: "success",
          confirmButtonColor: "#581517",
        });
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
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#faf7f7] via-[#f5f0f0] to-[#e7e3e3] relative">
      {/* Contenedor principal */}
      <div className="flex items-center justify-center gap-8 relative">
        {/* LOGIN CARD */}
        <motion.div
          layout
          transition={{ layout: { duration: 0.4, type: "spring" } }}
          className="w-[380px] bg-white rounded-2xl shadow-xl border border-gray-200 p-8 relative z-10"
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image src={logo} alt="Logo" width={90} height={90} />
          </div>

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
                className="w-full p-3 pl-10 border border-[#bfa66b]/70 rounded-lg bg-white text-[#581517] placeholder-[#bfa66b]/80 focus:ring-2 focus:ring-[#581517]/60 transition"
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
                className="w-full p-3 pl-10 pr-10 border border-[#bfa66b]/70 rounded-lg bg-white text-[#581517] placeholder-[#bfa66b]/80 focus:ring-2 focus:ring-[#581517]/60 transition"
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
              className="w-full py-3 mt-2 rounded-lg text-white font-semibold text-base shadow-md transition-transform transform hover:-translate-y-1 hover:shadow-lg"
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

        {/* PANEL DE REGISTRO */}
        <AnimatePresence>
          {showRegister && (
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 70, damping: 15 }}
              className="w-[400px] bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 relative"
            >
              <RegisterForm onClose={() => setShowRegister(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL DE RECUPERAR */}
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
    </main>
  );
}
