"use client";

interface FotoPerfilProps {
  imagen: string | null;
  setImagen: (imagen: string | null) => void;
  documentoPDF: File | null;
}

export default function FotoPerfil({ imagen, setImagen, documentoPDF }: FotoPerfilProps) {
  const cargarImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecciona un archivo de imagen válido.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImagen(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      <div className="flex flex-col items-center">

        {/* FOTO */}
        <div className="relative group mb-4">
          <div className="
            w-32 h-32 rounded-full 
            bg-gray-100 overflow-hidden 
            shadow-md 
            transition-all duration-300 
            group-hover:scale-105
          ">
            {imagen ? (
              <img src={imagen} className="w-full h-full object-cover" alt="Foto de perfil" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* ESTADO */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 
                          bg-[#7A1C1C] text-white 
                          px-3 py-1 rounded-full 
                          text-xs font-semibold shadow-md">
            Activo
          </div>
        </div>

        {/* BOTÓN CAMBIAR FOTO */}
        <label className="
            cursor-pointer bg-[#7A1C1C] text-white 
            px-6 py-3 rounded-xl 
            font-semibold shadow-md 
            hover:bg-[#5e1313] 
            transition-all duration-300 hover:scale-105 
            flex items-center gap-2
          ">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Cambiar Foto
          <input type="file" className="hidden" accept="image/*" onChange={cargarImagen} />
        </label>

        {/* ESTADÍSTICAS */}
        <div className="mt-6 w-full space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-600">Miembro desde</span>
            <span className="text-sm font-semibold text-[#7A1C1C]">2024</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-600">Documentos</span>
            <span className="text-sm font-semibold text-[#7A1C1C]">
              {documentoPDF ? "1" : "0"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
