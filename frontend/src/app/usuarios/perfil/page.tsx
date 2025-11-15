"use client";

import { useState } from "react";

import ModalCambioContraseña from "@/components/perfil/ModalCambioContraseña";
import FotoPerfil from "@/components/perfil/FotoPerfil";
import InfoPersonal from "@/components/perfil/InfoPersonal";
import DocumentosPersonales from "@/components/perfil/DocumentosPersonales";

export default function PerfilPage() {
  const [imagen, setImagen] = useState<string | null>(null);
  const [documentoPDF, setDocumentoPDF] = useState<File | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8">

      <h1 className="text-3xl font-bold text-[#7A1C1C] text-center mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <FotoPerfil
          imagen={imagen}
          setImagen={setImagen}
          documentoPDF={documentoPDF}
        />

        <div className="lg:col-span-2 space-y-8">
          <InfoPersonal setMostrarModal={setMostrarModal} />
          <DocumentosPersonales 
            documentoPDF={documentoPDF} 
            setDocumentoPDF={setDocumentoPDF} 
          />
        </div>
      </div>

      <ModalCambioContraseña
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onPasswordChange={(datos) => {
          console.log("Cambiar contraseña:", datos);
          // Aquí iría tu lógica para cambiar la contraseña
          // Por ejemplo:
          // await cambiarContraseña(datos.actual, datos.nueva);
        }}
      />
    </div>
  );
}