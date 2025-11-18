"use client";

import { useState, useEffect } from "react";
import FotoPerfil from "@/components/perfil/FotoPerfil";
import InfoPersonal from "@/components/perfil/InfoPersonal";
import DocumentosPersonales from "@/components/perfil/DocumentosPersonales";
import ModalCambioContraseña from "@/components/perfil/ModalCambioContraseña";

// Tipo unificado para todo el perfil
export type Usuario = {
  id_usu?: number;
  cor_usu: string;
  pas_usu: string;
  ced_usu: string;
  nom_usu: string;
  nom_seg_usu?: string | null;
  ape_usu: string;
  ape_seg_usu?: string | null;
  tel_usu?: string | null;
  img_usu?: string | null;
  pdf_ced_usu?: string | null;
  stu_usu?: number;
  niv_usu?: string | null;
  adm_usu?: number;
  Administrador?: boolean;
};

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const userId = 1; // Cambiar según el usuario logueado

  useEffect(() => {
    fetch(`/api/user/${userId}`)
      .then(res => res.json())
      .then((data: Usuario) => setUsuario(data))
      .catch(err => console.error(err));
  }, []);

  if (!usuario) return <p>Cargando...</p>;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">
      <h1 className="text-3xl font-bold text-[#7A1C1C] text-center mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <FotoPerfil usuario={usuario} setUsuario={setUsuario} />

        <div className="lg:col-span-2 space-y-8">
          <InfoPersonal usuario={usuario} setUsuario={setUsuario} setMostrarModal={setMostrarModal} />
          <DocumentosPersonales usuario={usuario} setUsuario={setUsuario} />
        </div>
      </div>

      <ModalCambioContraseña isOpen={mostrarModal} onClose={() => setMostrarModal(false)} usuario={usuario} setUsuario={setUsuario} />
    </div>
  );
}
