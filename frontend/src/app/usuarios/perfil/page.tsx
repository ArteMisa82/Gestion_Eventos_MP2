"use client";
import { useEffect, useState } from "react";

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) {
        setErrorMsg("No hay sesión activa.");
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(stored);

      const id = parsed?.id_usu;
      const token = parsed?.token;

      if (!id) {
        setErrorMsg("Error: el usuario guardado no tiene ID.");
        setLoading(false);
        return;
      }

      const fetchUser = async () => {
        try {
          const res = await fetch(`http://localhost:3001/api/user/id/${id}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });

          if (!res.ok) {
            setErrorMsg("No se pudo cargar el perfil.");
            setLoading(false);
            return;
          }

          const data = await res.json();
          setUsuario(data?.data || data);
        } catch (error) {
          console.error("Error:", error);
          setErrorMsg("Error al cargar datos.");
        } finally {
          setLoading(false);
        }
      };

      fetchUser();
    } catch (err) {
      console.error("Error localStorage", err);
      setErrorMsg("Error inesperado.");
      setLoading(false);
    }
  }, []);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (errorMsg) return <p className="text-center mt-10 text-red-600">{errorMsg}</p>;
  if (!usuario) return <p className="text-center mt-10">No hay datos.</p>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* --- TÍTULO --- */}
      <h1 className="text-3xl font-bold text-center text-[#7b1113] mb-10">
        Mi Perfil
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* --- TARJETA IZQUIERDA --- */}
        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center">
          <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl">
            👤
          </div>

          <span className="bg-green-600 text-white px-4 py-1 mt-3 rounded-full text-sm">
            Activo
          </span>

          <button className="mt-4 px-5 py-2 bg-[#7b1113] text-white rounded-lg hover:bg-[#5d0b0d] transition">
            Cambiar Foto
          </button>

          <div className="mt-8 w-full text-center">
            <p className="text-gray-600 font-semibold">Miembro desde</p>
            <p className="text-xl font-bold">2024</p>
          </div>

          <div className="mt-4 w-full text-center">
            <p className="text-gray-600 font-semibold">Documentos</p>
            <p className="text-xl font-bold">0</p>
          </div>
        </div>

        {/* --- INFORMACIÓN PERSONAL --- */}
        <div className="bg-white shadow-lg rounded-2xl p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-5 text-[#7b1113]">
            Información Personal
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <input
              className="border rounded-lg p-2 w-full"
              placeholder="Nombre"
              value={usuario.nom_usu || ""}
              readOnly
            />

            <input
              className="border rounded-lg p-2 w-full"
              placeholder="Apellido"
              value={usuario.ape_usu || ""}
              readOnly
            />

            <input
              className="border rounded-lg p-2 w-full col-span-2"
              placeholder="Correo"
              value={usuario.cor_usu || ""}
              readOnly
            />
          </div>

          <button className="mt-6 px-5 py-2 bg-[#7b1113] text-white rounded-lg hover:bg-[#5d0b0d] transition">
            Editar Información
          </button>
        </div>
      </div>

      {/* --- DOCUMENTOS PERSONALES --- */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mt-10">
        <h2 className="text-xl font-semibold mb-5 text-[#7b1113]">
          Documentos Personales
        </h2>

        <button className="px-5 py-2 bg-[#7b1113] text-white rounded-lg hover:bg-[#5d0b0d] transition">
          Subir PDF
        </button>

        <p className="text-gray-500 mt-5">
          No se ha subido ningún documento.
        </p>
      </div>
    </div>
  );
}
