"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";

interface RegisterFormProps {
  onClose: () => void;
}

export default function RegisterForm({ onClose }: RegisterFormProps) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar campos vacíos
    if (!nombre || !apellido || !email || !password || !confirmPassword) {
      Swal.fire({
        title: "Campos incompletos",
        text: "Por favor, completa todos los campos.",
        icon: "warning",
        confirmButtonColor: "#581517",
      });
      return;
    }

    // Validar contraseñas
    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    setPasswordError(""); // limpiar error si todo bien

    // Simular éxito
    Swal.fire({
      title: "Registro exitoso",
      text: `Bienvenido, ${nombre} ${apellido}!`,
      icon: "success",
      confirmButtonColor: "#581517",
    });

    console.log({
      nombre,
      apellido,
      email,
      password,
    });

    onClose();
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[#581517] mb-6">Crear Cuenta</h2>

      <form onSubmit={handleRegister} className="w-full flex flex-col gap-5">
        {/* Nombre */}
        <div className="relative">
          <User className="absolute left-3 top-3 text-[#bfa66b]" size={20} />
          <input
            type="text"
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-3 pl-10 border border-[#bfa66b]/70 rounded-lg bg-white text-[#581517] placeholder-[#bfa66b]/80 focus:ring-2 focus:ring-[#581517]/60 transition"
            required
          />
        </div>

        {/* Apellido */}
        <div className="relative">
          <User className="absolute left-3 top-3 text-[#bfa66b]" size={20} />
          <input
            type="text"
            placeholder="Apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            className="w-full p-3 pl-10 border border-[#bfa66b]/70 rounded-lg bg-white text-[#581517] placeholder-[#bfa66b]/80 focus:ring-2 focus:ring-[#581517]/60 transition"
            required
          />
        </div>

        {/* Correo */}
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

        {/* Contraseña */}
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

        {/* Confirmar contraseña */}
        <div className="relative">
          <Lock className="absolute left-3 top-3 text-[#bfa66b]" size={20} />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (passwordError && e.target.value === password)
                setPasswordError("");
            }}
            className={`w-full p-3 pl-10 pr-10 border rounded-lg bg-white text-[#581517] placeholder-[#bfa66b]/80 focus:ring-2 focus:ring-[#581517]/60 transition ${
              passwordError ? "border-red-500" : "border-[#bfa66b]/70"
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 text-[#bfa66b] hover:text-[#581517]"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>

          {/* Mensaje debajo del campo */}
          {passwordError && (
            <p className="text-red-600 text-sm mt-1 ml-2">
              {passwordError}
            </p>
          )}
        </div>

        {/* Botón de registro */}
        <button
          type="submit"
          className="w-full py-3 mt-2 rounded-lg text-white font-semibold text-base shadow-md transition-transform transform hover:-translate-y-1 hover:shadow-lg"
          style={{
            background: "linear-gradient(to right, #581517, #7a2022)",
          }}
        >
          Registrarse
        </button>

        {/* Volver */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-3 text-sm text-[#581517] font-medium hover:underline"
        >
          Volver al inicio de sesión
        </button>
      </form>
    </div>
  );
}
