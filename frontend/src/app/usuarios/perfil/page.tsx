"use client";

import { useEffect, useState, useRef } from "react";
import ModalCambioContrasena from "@/components/perfil/ModalCambioContrasena";
import FotoPerfil from "@/components/perfil/FotoPerfil";
import DocumentosPersonales from "@/components/perfil/DocumentosPersonales";

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  const fileImgRef = useRef<HTMLInputElement>(null);
  const filePdfRef = useRef<HTMLInputElement>(null);

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
      <h1 className="text-3xl font-bold text-center text-[#7b1113] mb-10">
        Mi Perfil
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* FOTO DE PERFIL COMPONENTE */}
        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center">
          <FotoPerfil usuario={usuario} setUsuario={setUsuario} />

          <span className="bg-green-600 text-white px-4 py-1 mt-4 rounded-full text-sm">
            Activo
          </span>

          <div className="mt-8 w-full text-center">
            <p className="text-gray-600 font-semibold">Miembro desde</p>
            <p className="text-xl font-bold">{usuario.stu_usu ?? "2024"}</p>
          </div>

          <div className="mt-4 w-full text-center">
            <p className="text-gray-600 font-semibold">Documentos</p>
            <p className="text-xl font-bold">{usuario.pdf_ced_usu ? 1 : 0}</p>
          </div>
        </div>

        
        {/* INFORMACIÓN PERSONAL */}
        <div className="bg-white shadow-lg rounded-2xl p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-5 text-[#7b1113]">
            Información Personal
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <input
              className="border rounded-lg p-2 w-full"
              value={usuario.nom_usu || ""}
              readOnly
            />

            <input
              className="border rounded-lg p-2 w-full"
              value={usuario.ape_usu || ""}
              readOnly
            />

            <input
              className="border rounded-lg p-2 w-full col-span-2"
              value={usuario.cor_usu || ""}
              readOnly
            />

            <input
              type="password"
              className="border rounded-lg p-2 w-full col-span-2"
              value={usuario.pas_usu || ""}
              readOnly
            />
          </div>

          <button
            onClick={() => setMostrarModal(true)}
            className="mt-6 px-5 py-2 bg-[#7b1113] text-white rounded-lg hover:bg-[#5d0b0d] transition"
          >
            Cambiar Contraseña
          </button>
        </div>
      </div>

      {/* DOCUMENTOS PERSONALES COMPONENTE */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mt-10">
        <h2 className="text-xl font-semibold mb-5 text-[#7b1113]">
          Documentos Personales
        </h2>

        <DocumentosPersonales usuario={usuario} setUsuario={setUsuario} />
      </div>

      <ModalCambioContrasena
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        usuario={usuario}
        setUsuario={setUsuario}
      />
    </div>
  );
}
