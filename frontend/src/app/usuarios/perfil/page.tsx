"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Usuario } from "@/types/usuario";

import ModalCambioContraseña from "@/components/perfil/ModalCambioContrasena";
import FotoPerfil from "@/components/perfil/FotoPerfil";
import InfoPersonal from "@/components/perfil/InfoPersonal";
import DocumentosPersonales from "@/components/perfil/DocumentosPersonales";

export default function PerfilPage() {
  const { user } = useAuth();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    if (user) {
      setUsuario(user as Usuario);
    }
  }, [user]);

  if (!usuario) {
    return (
      <div className="max-w-5xl mx-auto py-10 px-4">
        <p className="text-center text-gray-600">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">

      <h1 className="text-3xl font-bold text-[#7A1C1C] text-center mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <FotoPerfil
          usuario={usuario}
          setUsuario={setUsuario}
        />

        <div className="lg:col-span-2 space-y-8">
          <InfoPersonal setMostrarModal={setMostrarModal} />
          <DocumentosPersonales 
            usuario={usuario}
            setUsuario={setUsuario}
          />
        </div>
      </div>

      <ModalCambioContraseña
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        usuario={usuario}
        setUsuario={setUsuario}
      />
    </div>
  );
}