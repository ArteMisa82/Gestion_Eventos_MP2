"use client";

interface DocumentosPersonalesProps {
  documentoPDF: File | null;
  setDocumentoPDF: (file: File | null) => void;
}

export default function DocumentosPersonales({ documentoPDF, setDocumentoPDF }: DocumentosPersonalesProps) {
  const cargar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Solo se permiten archivos PDF.");
      return;
    }

    setDocumentoPDF(file);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-[#7f1d1d]">Documentos Personales</h2>

      {/* BOTÓN SUBIR PDF */}
      <label className="bg-[#a3161f] text-white px-6 py-3 rounded-xl cursor-pointer inline-flex items-center gap-2 font-semibold shadow-md hover:bg-[#8e1118] transition-all duration-300 hover:scale-105">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Subir PDF
        <input type="file" className="hidden" accept="application/pdf" onChange={cargar} />
      </label>

      {/* SI EXISTE UN PDF */}
      {documentoPDF ? (
        <div className="mt-5 p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#7f1d1d22] rounded-lg flex items-center justify-center">
              <svg className="w-7 h-7 text-[#7f1d1d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>

            <div>
              <p className="font-semibold text-gray-800">{documentoPDF.name}</p>
              <p className="text-sm text-gray-500">
                {(documentoPDF.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          {/* Botón Ver PDF */}
          <a
            href={URL.createObjectURL(documentoPDF)}
            target="_blank"
            className="text-[#7f1d1d] font-semibold hover:text-[#5e1414] transition-colors duration-200 flex items-center gap-1"
          >
            Ver PDF
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      ) : (
        /* SI NO HAY PDF */
        <div className="mt-4 text-center py-5 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p>No se ha subido ningún documento.</p>
        </div>
      )}
    </div>
  );
}
