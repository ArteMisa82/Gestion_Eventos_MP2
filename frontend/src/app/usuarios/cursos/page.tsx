"use client";

import NavbarUsuario from "../../../components/NavbarUsuarios";
import Link from "next/link";

export default function MisCursos() {
  return (
    <div className="min-h-screen bg-gray-100">
      <NavbarUsuario />

      <main className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mis Cursos</h1>

        <div className="space-y-4">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold text-xl">Curso: Liderazgo</h2>
            <p className="text-gray-600">Progreso: 70%</p>
            <button className="text-blue-600 underline">Continuar →</button>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h2 className="font-semibold text-xl">Curso: Marketing Digital</h2>
            <p className="text-gray-600">Progreso: 45%</p>
            <button className="text-blue-600 underline">Continuar →</button>
          </div>
        </div>
      </main>
    </div>
  );
}
