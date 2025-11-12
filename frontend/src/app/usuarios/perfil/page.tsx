"use client";
import { useState, useEffect } from "react";

export default function PerfilUsuario() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({
    segundoNombre: "",
    segundoApellido: "",
    documentos: null as File | null,
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    setUser(userData);
  }, []);

  const handleFileChange = (e: any) => {
    setForm({ ...form, documentos: e.target.files[0] });
  };

  const handleSave = () => {
    // 🔹 Futuro: enviar a backend
    console.log("Datos guardados:", form);
    alert("Datos del perfil guardados (simulado)");
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-lg p-6 rounded-xl mt-6">
      <h2 className="text-2xl font-semibold mb-4">Perfil del Usuario</h2>

      <div className="flex items-center mb-6 gap-4">
        <img
          src={user.foto || "/default-avatar.png"}
          alt="Foto de perfil"
          className="w-20 h-20 rounded-full border"
        />
        <div>
          <p><strong>Nombre:</strong> {user.nombre} {user.apellido}</p>
          <p><strong>Correo:</strong> {user.email}</p>
        </div>
      </div>

      <label className="block mb-2">Segundo nombre</label>
      <input
        type="text"
        value={form.segundoNombre}
        onChange={(e) => setForm({ ...form, segundoNombre: e.target.value })}
        className="w-full border rounded p-2 mb-4"
      />

      <label className="block mb-2">Segundo apellido</label>
      <input
        type="text"
        value={form.segundoApellido}
        onChange={(e) => setForm({ ...form, segundoApellido: e.target.value })}
        className="w-full border rounded p-2 mb-4"
      />

      <label className="block mb-2">Subir documentos (PDF)</label>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />

      <button
        onClick={handleSave}
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Guardar cambios
      </button>
    </div>
  );
}
