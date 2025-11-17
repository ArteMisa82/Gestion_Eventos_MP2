interface InfoPersonalProps {
  setMostrarModal: (value: boolean) => void;
}

export default function InfoPersonal({ setMostrarModal }: InfoPersonalProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-semibold mb-6 text-[#7A1C1C]">
        Información Personal
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre */}
        <input
          className="p-3 border border-gray-300 rounded-xl
                     focus:ring-2 focus:ring-[#7A1C1C] focus:border-transparent
                     transition-all duration-200 text-gray-700"
          placeholder="Nombre"
        />

        {/* Apellido */}
        <input
          className="p-3 border border-gray-300 rounded-xl
                     focus:ring-2 focus:ring-[#7A1C1C] focus:border-transparent
                     transition-all duration-200 text-gray-700"
          placeholder="Apellido"
        />

        {/* Segundo Nombre */}
        <input
          className="p-3 border border-gray-300 rounded-xl
                     focus:ring-2 focus:ring-[#7A1C1C] focus:border-transparent
                     transition-all duration-200 text-gray-700"
          placeholder="Segundo Nombre"
        />

        {/* Segundo Apellido */}
        <input
          className="p-3 border border-gray-300 rounded-xl
                     focus:ring-2 focus:ring-[#7A1C1C] focus:border-transparent
                     transition-all duration-200 text-gray-700"
          placeholder="Segundo Apellido"
        />

        {/* Correo */}
        <input
          className="p-3 border border-gray-300 bg-gray-100 rounded-xl 
                     text-gray-600 cursor-not-allowed"
          disabled
          value="correo@ejemplo.com"
        />

        {/* Contraseña */}
        <div className="flex gap-2">
          <input
            type="password"
            className="p-3 border border-gray-300 bg-gray-100 rounded-xl 
                       flex-1 text-gray-600 cursor-not-allowed"
            disabled
            value="••••••••"
          />

          <button
            className="bg-gradient-to-r from-[#7A1C1C] to-[#8B1E1E]
                       text-white px-4 rounded-xl font-semibold shadow-md 
                       hover:shadow-lg transition-all duration-300 hover:scale-105"
            onClick={() => setMostrarModal(true)}
          >
            Cambiar
          </button>
        </div>
      </div>
    </div>
  );
}
