"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function PerfilUsuario() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    segundoNombre: "",
    segundoApellido: "",
    documento1: null,
    documento2: null,
    foto: "",
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("usuarioLogueado"));
    if (!storedUser) {
      router.push("/login");
      return;
    }
    setUser(storedUser);
    setFormData({
      segundoNombre: storedUser.segundoNombre || "",
      segundoApellido: storedUser.segundoApellido || "",
      documento1: null,
      documento2: null,
      foto: storedUser.foto || "",
    });
  }, [router]);

  if (!user) return null;

  // Maneja cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Maneja subida de archivos
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files[0] }));
  };

  // Maneja subida de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, foto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Guardar cambios (simula backend)
  const handleSave = () => {
    const updatedUser = {
      ...user,
      ...formData,
    };
    localStorage.setItem("usuarioLogueado", JSON.stringify(updatedUser));

    Swal.fire({
      icon: "success",
      title: "Perfil actualizado",
      text: "Tus datos se han guardado correctamente.",
      confirmButtonColor: "#2563eb",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-12">
      {/* 🔹 Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.push("/usuarios/cursos")}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="mr-1" /> Volver a mis cursos
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">Mi Perfil</h1>
      </div>

      {/* 🔹 Contenedor del perfil */}
      <div className="max-w-3xl mx-auto bg-white shadow rounded-2xl p-6 md:p-10 border">
        <div className="flex flex-col items-center gap-4 mb-6">
          {/* Imagen de perfil */}
          <div className="relative">
            <Image
              src={formData.foto || "/default-avatar.png"}
              alt="Foto de perfil"
              width={120}
              height={120}
              className="rounded-full border shadow"
            />
            <label className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded-full cursor-pointer">
              Cambiar
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <h2 className="text-xl font-bold">
            {user.nombre} {user.apellido}
          </h2>
          <p className="text-gray-500">{user.correo}</p>
        </div>

        {/* 🔹 Formulario de datos */}
        <form className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-gray-700 mb-1 text-sm font-medium">
                Segundo nombre
              </label>
              <input
                type="text"
                name="segundoNombre"
                value={formData.segundoNombre}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                placeholder="Ingresa tu segundo nombre"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1 text-sm font-medium">
                Segundo apellido
              </label>
              <input
                type="text"
                name="segundoApellido"
                value={formData.segundoApellido}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                placeholder="Ingresa tu segundo apellido"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1 text-sm font-medium">
              Contraseña (solo lectura)
            </label>
            <input
              type="password"
              value={user.contraseña || "********"}
              disabled
              className="w-full p-2 border rounded-lg bg-gray-100"
            />
          </div>

          {/* Subida de documentos */}
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-gray-700 mb-1 text-sm font-medium">
                Documento 1 (PDF)
              </label>
              <input
                type="file"
                name="documento1"
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-1 text-sm font-medium">
                Documento 2 (PDF)
              </label>
              <input
                type="file"
                name="documento2"
                accept="application/pdf"
                onChange={handleFileChange}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleSave}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
