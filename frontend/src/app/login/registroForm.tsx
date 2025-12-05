"use client";
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/services/api";

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
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre || !apellido || !email || !password || !confirmPassword) {
      Swal.fire({
        title: "Campos incompletos",
        text: "Por favor, completa todos los campos.",
        icon: "warning",
        confirmButtonColor: "#581517",
      });
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    setPasswordError("");
    try {
      const response = await authAPI.register({
        cor_usu: email,
        pas_usu: password,
        nom_usu: nombre,
        ape_usu: apellido,
      });

      // If backend returns token & usuario, store and redirect similar to login
      const { token, usuario } = response as any;
      if (token && usuario) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(usuario));

        let ruta = "/home";
        if (usuario.adm_usu === 1 || usuario.Administrador === true) ruta = "/admin";
        else if (usuario.stu_usu === 1) ruta = "/cursos";

        await Swal.fire({ title: `Registro exitoso. Bienvenido ${usuario.nom_usu}!`, icon: "success", confirmButtonColor: "#581517", timer: 1800, showConfirmButton: false });
        
        // Si email no está verificado, mostrar modal de verificación
        if (usuario.email_verified === false) {
          // Abrir modal de verificación — lo haremos en parent component
          // Por ahora solo mostrar un mensaje
          await Swal.fire({ 
            title: "Verifica tu email", 
            text: "Se abrirá un modal para verificar tu correo",
            icon: "info", 
            confirmButtonColor: "#581517" 
          });
        }
        
        onClose();
        router.push(ruta);
        return;
      }

      // Fallback success
      Swal.fire({ title: "Registro exitoso", text: `Bienvenido, ${nombre} ${apellido}!`, icon: "success", confirmButtonColor: "#581517" });
      onClose();
    } catch (err: any) {
      Swal.fire({ title: "Error", text: err.message || "No se pudo registrar", icon: "error", confirmButtonColor: "#581517" });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full max-h-[90vh] overflow-hidden">
      <h2 className="text-2xl font-bold text-[#581517] mb-6">Crear Cuenta</h2>

      <form
        onSubmit={handleRegister}
        className="w-full flex flex-col gap-5 overflow-hidden px-2"
      >
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
            maxLength={100}
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

          {passwordError && (
            <p className="text-red-600 text-sm mt-1 ml-2">{passwordError}</p>
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
