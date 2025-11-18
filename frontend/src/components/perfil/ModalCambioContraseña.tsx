"use client";

import { useState } from "react";

type Usuario = { id_usu?: number; pas_usu: string };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  usuario: Usuario;
  setUsuario: (usuario: Usuario) => void;
}

export default function ModalCambioContraseña({ isOpen, onClose, usuario, setUsuario }: Props) {
  const [form, setForm] = useState({ actual: "", nueva: "", confirmar: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.nueva !== form.confirmar) return alert("Las contraseñas no coinciden");

    await fetch(`/api/user/${usuario.id_usu}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pas_usu: form.nueva }),
    });

    setUsuario({ ...usuario, pas_usu: form.nueva });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form className="bg-white p-6 rounded-2xl" onSubmit={handleSubmit}>
        <input type="password" placeholder="Actual" value={form.actual} onChange={e => setForm({ ...form, actual: e.target.value })} required />
        <input type="password" placeholder="Nueva" value={form.nueva} onChange={e => setForm({ ...form, nueva: e.target.value })} required />
        <input type="password" placeholder="Confirmar" value={form.confirmar} onChange={e => setForm({ ...form, confirmar: e.target.value })} required />
        <button type="submit">Guardar</button>
        <button type="button" onClick={onClose}>Cerrar</button>
      </form>
    </div>
  );
}
