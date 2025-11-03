"use client";
import { useState } from "react";
import { Eye, EyeOff, Mail, User, Lock } from "lucide-react";
import Swal from "sweetalert2";

export default function RegisterForm({ onClose }: { onClose: () => void }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      Swal.fire({
        title: "Error",
        text: "Las contraseñas no coinciden",
        icon: "error",
        confirmButtonColor: "#581517",
      });
      return;
    }

    Swal.fire({
      title: "Registro exitoso",
      text: `Bienvenido ${nombre}`,
      icon: "success",
      confirmButtonColor: "#581517",
    });

    setNombre("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    onClose();
  };

  return (
    <div className="h-full flex flex-col justify-center">
      <h2 className="text-2xl font-bold text-[#581517] mb-6 text-center">
        Crear Cuenta
      </h2>

      <form onSubmit={handleRegister} className="flex flex-col gap-4">
        <div className="relative">
          <User className="absolute left-3 top-3 text-[#bfa66b]" size={20} />
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-3 pl-10 border border-[#bfa66b]/70 rounded-lg bg-white text-[#581517] placeholder-[#bfa66b]/80 focus:outline-none focus:ring-2 focus:ring-[#581517]/60 transition"
            required
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-3 text-[#bfa66b]" size={20} />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 pl-10 border border-[#bfa66b]/70 rounded-lg bg-white text-[#581517] placeholder-[#bfa66b]/80 focus:outline-none focus:ring-2 focus:ring-[#581517]/60 transition"
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
            className="w-full p-3 pl-10 pr-10 border border-[#bfa66b]/70 rounded-lg bg-white text-[#581517] placeholder-[#bfa66b]/80 focus:outline-none focus:ring-2 focus:ring-[#581517]/60 transition"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-[#bfa66b] hover:text-[#581517] transition"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-3 text-[#bfa66b]" size={20} />
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 pl-10 pr-10 border border-[#bfa66b]/70 rounded-lg bg-white text-[#581517] placeholder-[#bfa66b]/80 focus:outline-none focus:ring-2 focus:ring-[#581517]/60 transition"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-[#bfa66b] hover:text-[#581517] transition"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button
          type="submit"
          className="w-full py-3 mt-2 rounded-lg text-white font-semibold text-lg shadow-md transition-transform transform hover:-translate-y-1 hover:shadow-lg"
          style={{
            background: "linear-gradient(to right, #581517, #7a2022)",
          }}
        >
          Registrarse
        </button>
      </form>
    </div>
  );
}
