"use client";
import { useState } from "react";

export default function LoginForm() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulación temporal hasta conectar al backend
    if (correo === "admin") {
      setMensaje("Bienvenido Administrador 👑");
    } else if (correo.includes("encargado")) {
      setMensaje("Bienvenido Encargado 🧰");
    } else if (correo.includes("@") && password.length > 0) {
      setMensaje("Inicio de sesión exitoso ✅");
    } else {
      setMensaje("Correo o contraseña incorrectos ❌");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Correo electrónico
        </label>
        <input
          type="email"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 outline-none"
          placeholder="ejemplo@correo.com"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 outline-none"
          placeholder="********"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-amber-700 text-white py-3 rounded-lg font-semibold hover:bg-amber-800 transition"
      >
        Iniciar sesión
      </button>

      {mensaje && (
        <p className="text-center mt-3 text-sm text-gray-700">{mensaje}</p>
      )}
    </form>
  );
}
