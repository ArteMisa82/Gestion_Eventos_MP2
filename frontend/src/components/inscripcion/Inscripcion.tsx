"use client";

import { useState } from "react";

interface Props {
  onSubmit?: (form: any) => void; // futura conexión con backend
}

export default function SeccionInscripcion({ onSubmit }: Props) {
  const [form, setForm] = useState({
    telefono: "",
    pais: "",
    ciudad: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    if (onSubmit) onSubmit(form);
  };

  return (
    <div className="w-full bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Inscripción del Usuario</h2>

      <div className="flex flex-col gap-4">
        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          className="border p-3 rounded-lg"
          value={form.telefono}
          onChange={handleChange}
        />

        <input
          type="text"
          name="pais"
          placeholder="País"
          className="border p-3 rounded-lg"
          value={form.pais}
          onChange={handleChange}
        />

        <input
          type="text"
          name="ciudad"
          placeholder="Ciudad"
          className="border p-3 rounded-lg"
          value={form.ciudad}
          onChange={handleChange}
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white py-3 rounded-lg font-semibold"
        >
          Guardar Datos
        </button>
      </div>
    </div>
  );
}
