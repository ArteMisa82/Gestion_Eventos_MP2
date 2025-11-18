"use client";
import { useEffect, useState, useRef } from "react";
import ModalCambioContraseña from "@/components/perfil/ModalCambioContrasena";

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  // Refs para inputs ocultos
  const fileImgRef = useRef<HTMLInputElement>(null);
  const filePdfRef = useRef<HTMLInputElement>(null);

  // ==============================
  // CARGAR DATOS DEL USUARIO
  // ==============================
  useEffect(() => {
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
      setErrorMsg("El usuario guardado no tiene ID.");
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
      } catch (err) {
        console.error(err);
        setErrorMsg("Error al cargar datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // ==============================
  // SUBIR FOTO DE PERFIL
  // ==============================
  const handleUploadPhoto = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("foto", file);

    try {
      const res = await fetch(
        `http://localhost:3001/api/user/uploadPhoto/${usuario.id_usu}`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        alert("Error al subir la foto");
        return;
      }

      const data = await res.json();

      setUsuario({
        ...usuario,
        img_usu: data?.foto || data?.fotoPerfil || usuario.img_usu,
      });

      alert("Foto actualizada correctamente");
    } catch (err) {
      console.error(err);
      alert("Error subiendo imagen");
    }
  };

  // ==============================
  // SUBIR PDF
  // ==============================
  const handleUploadPDF = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch(
        `http://localhost:3001/api/user/uploadPDF/${usuario.id_usu}`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        alert("Error al subir el PDF");
        return;
      }

      const data = await res.json();

      setUsuario({
        ...usuario,
        pdf_ced_usu: data?.pdf || data?.ruta || usuario.pdf_ced_usu,
      });

      alert("PDF subido correctamente");
    } catch (err) {
      console.error(err);
      alert("Error subiendo PDF");
    }
  };

  // ==============================

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (errorMsg) return <p className="text-center mt-10 text-red-600">{errorMsg}</p>;
  if (!usuario) return <p className="text-center mt-10">No hay datos.</p>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-[#7b1113] mb-10">
        Mi Perfil
      </h1>

      {/* GRID PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* CARD FOTO PERFIL */}
        <div className="bg-white shadow-lg rounded-2xl p-6 flex flex-col items-center">
          {/* FOTO */}
          <div className="w-28 h-28 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {usuario.img_usu ? (
              <img
                src={usuario.img_usu}
                className="w-full h-full object-cover"
                alt="Foto perfil"
              />
            ) : (
              <span className="text-gray-500 text-4xl">👤</span>
            )}
          </div>

          <span className="bg-green-600 text-white px-4 py-1 mt-3 rounded-full text-sm">
            Activo
          </span>

          {/* Cambiar foto */}
          <button
            onClick={() => fileImgRef.current?.click()}
            className="mt-4 px-5 py-2 bg-[#7b1113] text-white rounded-lg hover:bg-[#5d0b0d] transition"
          >
            Cambiar Foto
          </button>

          <input
            type="file"
            ref={fileImgRef}
            className="hidden"
            accept="image/*"
            onChange={handleUploadPhoto}
          />

          {/* Info pequeña */}
          <div className="mt-8 w-full text-center">
            <p className="text-gray-600 font-semibold">Miembro desde</p>
            <p className="text-xl font-bold">{usuario.stu_usu ?? "2024"}</p>
          </div>

          <div className="mt-4 w-full text-center">
            <p className="text-gray-600 font-semibold">Documentos</p>
            <p className="text-xl font-bold">{usuario.pdf_ced_usu ? 1 : 0}</p>
          </div>
        </div>

        {/* INFO PERSONAL */}
        <div className="bg-white shadow-lg rounded-2xl p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-5 text-[#7b1113]">
            Información Personal
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <input className="border rounded-lg p-2 w-full" value={usuario.nom_usu || ""} readOnly />
            <input className="border rounded-lg p-2 w-full" value={usuario.ape_usu || ""} readOnly />
            <input className="border rounded-lg p-2 w-full col-span-2" value={usuario.cor_usu || ""} readOnly />
            <input type="password" className="border rounded-lg p-2 w-full col-span-2" value={usuario.pas_usu || ""} readOnly />
          </div>

          <button
            onClick={() => setMostrarModal(true)}
            className="mt-6 px-5 py-2 bg-[#7b1113] text-white rounded-lg hover:bg-[#5d0b0d] transition"
          >
            Cambiar Contraseña
          </button>
        </div>
      </div>

      {/* DOCUMENTOS */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mt-10">
        <h2 className="text-xl font-semibold mb-5 text-[#7b1113]">
          Documentos Personales
        </h2>

        <button
          onClick={() => filePdfRef.current?.click()}
          className="px-5 py-2 bg-[#7b1113] text-white rounded-lg hover:bg-[#5d0b0d] transition"
        >
          Subir PDF
        </button>

        <input
          type="file"
          ref={filePdfRef}
          className="hidden"
          accept="application/pdf"
          onChange={handleUploadPDF}
        />

        {usuario.pdf_ced_usu ? (
          <a
            href={usuario.pdf_ced_usu}
            target="_blank"
            className="block mt-4 text-blue-700 underline"
          >
            Ver Documento
          </a>
        ) : (
          <p className="text-gray-500 mt-5">No se ha subido ningún documento.</p>
        )}
      </div>

      {/* MODAL CAMBIO CONTRASEÑA */}
      <ModalCambioContraseña
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        usuario={usuario}
        setUsuario={setUsuario}
      />
    </div>
  );
}
