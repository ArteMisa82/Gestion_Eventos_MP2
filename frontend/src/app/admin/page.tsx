"use client";
import React from "react";

const AdminDashboard: React.FC = () => {
  return (
    <div className="p-8 font-sans text-gray-800 min-h-screen bg-white">
      <h1 className="text-3xl font-semibold mb-4 tracking-tight text-center">
        Panel de Administración
      </h1>
      <p className="text-center text-gray-600 max-w-xl mx-auto">
        Bienvenido al panel de administración. 
        Utiliza el menú lateral para gestionar los eventos, validar solicitudes
        y administrar el contenido de la plataforma.
      </p>
    </div>
  );
};

export default AdminDashboard;
