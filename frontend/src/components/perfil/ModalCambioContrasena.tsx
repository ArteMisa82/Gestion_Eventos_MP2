"use client";

import { useState } from "react";
import { Usuario } from "@/types/usuario";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario;
  setUsuario: React.Dispatch<React.SetStateAction<Usuario | null>>;
}

export default function ModalCambioContrasena({ isOpen, onClose, usuario, setUsuario }: Props) {
  const [form, setForm] = useState({ actual: "", nueva: "", confirmar: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.nueva !== form.confirmar) {
      return alert("Las contraseñas no coinciden");
    }

    if (form.actual !== usuario.pas_usu) {
      return alert("La contraseña actual no es correcta");
    }

    if (usuario.id_usu) {
      await fetch(`http://localhost:4000/user/id/${usuario.id_usu}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pas_usu: form.nueva }),
      });

      setUsuario(prev => prev ? { ...prev, pas_usu: form.nueva } : prev);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form className="bg-white p-6 rounded-2xl space-y-3" onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Actual"
          value={form.actual}
          onChange={e => setForm({ ...form, actual: e.target.value })}
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          placeholder="Nueva"
          value={form.nueva}
          onChange={e => setForm({ ...form, nueva: e.target.value })}
          required
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password"
          placeholder="Confirmar"
          value={form.confirmar}
          onChange={e => setForm({ ...form, confirmar: e.target.value })}
          required
          className="w-full border rounded px-3 py-2"
        />

        <div className="flex justify-end gap-3 mt-4">
          <button type="submit" className="bg-[#7A1C1C] text-white px-6 py-2 rounded-xl">
            Guardar
          </button>
          <button type="button" onClick={onClose} className="bg-gray-300 px-6 py-2 rounded-xl">
            Cerrar
          </button>
        </div>
      </form>
    </div>
  );
}
