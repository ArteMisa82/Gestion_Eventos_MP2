"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

// Define tipos para los datos
interface Usuario {
  nombre: string;
  apellido: string;
  correo: string;
  documentos: Record<string, boolean>;
}

interface Curso {
  id: string;
  nombre: string;
  tipo: "gratis" | "pago";
  documentosRequeridos: string[];
}

// Modal de pago
function ModalPago({ 
  isOpen, 
  onClose, 
  metodoPago, 
  setMetodoPago, 
  comprobante, 
  setComprobante,
  generarOrdenPago,
  subirComprobante,
  pagarConTarjetaSimulado 
}: {
  isOpen: boolean;
  onClose: () => void;
  metodoPago: string;
  setMetodoPago: (metodo: string) => void;
  comprobante: File | null;
  setComprobante: (file: File | null) => void;
  generarOrdenPago: () => void;
  subirComprobante: () => void;
  pagarConTarjetaSimulado: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Método de Pago</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="p-6">
          {/* Selector de método de pago */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <button
              onClick={() => setMetodoPago("deposito")}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200 text-left
                ${metodoPago === "deposito"
                  ? "border-[#581517] bg-gray-50 shadow-sm"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
                }
              `}
            >
              <span className="text-2xl mb-2 block">🏦</span>
              <h3 className="font-semibold text-gray-800">Depósito Bancario</h3>
              <p className="text-sm text-gray-600 mt-1">Transferencia o depósito directo</p>
            </button>

            <button
              onClick={() => setMetodoPago("tarjeta")}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200 text-left
                ${metodoPago === "tarjeta"
                  ? "border-[#581517] bg-gray-50 shadow-sm"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
                }
              `}
            >
              <span className="text-2xl mb-2 block">💳</span>
              <h3 className="font-semibold text-gray-800">Tarjeta de Crédito</h3>
              <p className="text-sm text-gray-600 mt-1">Pago seguro en línea</p>
            </button>
          </div>

          {/* Formulario de depósito */}
          {metodoPago === "deposito" && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-gray-600 text-xl">📄</span>
                <h3 className="text-lg font-semibold text-gray-800">Generar Orden de Pago</h3>
              </div>
              
              <button
                className="w-full bg-[#581517] hover:bg-[#7a1c1c] text-white font-medium py-3 px-6 rounded-md mb-4 transition-all duration-200 shadow-md"
                onClick={generarOrdenPago}
              >
                📥 Descargar Orden de Pago (PDF)
              </button>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Subir Comprobante de Pago</h4>
                <input
                  type="file"
                  className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg mb-4 hover:border-gray-400 transition-colors text-sm text-gray-700"
                  accept="image/*,application/pdf"
                  onChange={(e) => setComprobante(e.target.files?.[0] || null)}
                />
                <button
                  className="w-full bg-[#581517] hover:bg-[#7a1c1c] text-white font-medium py-3 px-6 rounded-md transition-all duration-200 shadow-md"
                  onClick={subirComprobante}
                >
                  📤 Subir Comprobante
                </button>
              </div>
            </div>
          )}

          {/* Formulario de tarjeta */}
          {metodoPago === "tarjeta" && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-gray-600 text-xl">🔒</span>
                <h3 className="text-lg font-semibold text-gray-800">Pago con Tarjeta</h3>
              </div>
              
              <div className="space-y-4">
                <input
                  placeholder="Número de tarjeta"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#581517] text-sm text-gray-700 placeholder-gray-400"
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    placeholder="MM/YY"
                    className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#581517] text-sm text-gray-700 placeholder-gray-400"
                  />
                  <input
                    placeholder="CVV"
                    className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#581517] text-sm text-gray-700 placeholder-gray-400"
                  />
                </div>
                <button
                  className="w-full bg-[#581517] hover:bg-[#7a1c1c] text-white font-medium py-3 px-6 rounded-md transition-all duration-200 shadow-md"
                  onClick={pagarConTarjetaSimulado}
                >
                  💳 Pagar Ahora
                </button>
              </div>
            </div>
          )}

          {/* Botón para cerrar */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InscripcionCurso({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [curso, setCurso] = useState<Curso | null>(null);
  const [documentosFaltantes, setDocumentosFaltantes] = useState<string[]>([]);
  const [metodoPago, setMetodoPago] = useState("");
  const [comprobante, setComprobante] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalPagoOpen, setModalPagoOpen] = useState(false);

  // Cargar usuario y curso (SIMULADO)
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulación de datos de usuario
      const usuarioSimulado: Usuario = {
        nombre: "Juan",
        apellido: "Pérez",
        correo: "juan@uta.edu.ec",
        documentos: {
          cedula: true,
          certificadoEstudios: false,
          foto: true,
        },
      };

      // Simulación de curso
      const cursoSimulado: Curso = {
        id,
        nombre: `Curso de Especialización ${id}`,
        tipo: id === "1" ? "gratis" : "pago",
        documentosRequeridos: ["cedula", "certificadoEstudios"],
      };

      setUsuario(usuarioSimulado);
      setCurso(cursoSimulado);

      // Calcular documentos faltantes
      const faltantes = cursoSimulado.documentosRequeridos.filter(
        (doc) => !usuarioSimulado.documentos[doc]
      );
      setDocumentosFaltantes(faltantes);
      setLoading(false);
    };

    cargarDatos();
  }, [id]);

  // Función para manejar inscripción gratis
  const handleInscripcionGratis = () => {
    Swal.fire({
      title: "¡Inscripción Exitosa!",
      text: "Tu inscripción fue registrada correctamente.",
      icon: "success",
      confirmButtonColor: "#581517",
      confirmButtonText: "Continuar"
    });
  };

  const generarOrdenPago = () => {
    Swal.fire({
      title: "Orden Generada",
      text: "Se descargó la orden de pago correctamente.",
      icon: "success",
      confirmButtonColor: "#581517"
    });
  };

  const subirComprobante = () => {
    if (!comprobante) {
      Swal.fire("Error", "Por favor selecciona un comprobante", "warning");
      return;
    }
    Swal.fire({
      title: "Comprobante Subido",
      text: "El administrador validará tu pago en las próximas 24 horas.",
      icon: "success",
      confirmButtonColor: "#581517"
    });
    setModalPagoOpen(false);
  };

  const pagarConTarjetaSimulado = () => {
    Swal.fire({
      title: "¡Pago Exitoso!",
      text: "Tu pago ha sido aprobado correctamente.",
      icon: "success",
      confirmButtonColor: "#581517"
    });
    setModalPagoOpen(false);
  };

  const handlePagarCurso = () => {
    setModalPagoOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#581517] mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (!usuario || !curso) return null;

  return (
    <div className="min-h-screen bg-white py-8 font-sans">
      <div className="max-w-4xl mx-auto px-4">
        {/* Flecha para volver */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-700 hover:text-[#581517] mb-6 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-medium">Volver al curso</span>
        </button>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-semibold text-gray-800 mb-2 tracking-tight">
            Inscripción al Curso
          </h1>
          <p className="text-xl text-[#581517] font-semibold">{curso.nombre}</p>
          <div className="w-24 h-1 bg-[#581517] mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* DATOS DEL USUARIO */}
            <section className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-lg">👤</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Datos del Usuario</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 font-medium">Nombre</p>
                  <p className="text-gray-800 font-medium">{usuario.nombre}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 font-medium">Apellido</p>
                  <p className="text-gray-800 font-medium">{usuario.apellido}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 md:col-span-2">
                  <p className="text-sm text-gray-600 font-medium">Correo Electrónico</p>
                  <p className="text-gray-800 font-medium">{usuario.correo}</p>
                </div>
              </div>
            </section>

            {/* DOCUMENTOS REQUERIDOS */}
            <section className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 text-lg">📋</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Documentos Requeridos</h2>
              </div>

              {documentosFaltantes.length > 0 ? (
                <div className="bg-white border border-gray-300 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-red-500 text-2xl">⚠️</span>
                    <h3 className="text-lg font-semibold text-red-600">Documentos Faltantes</h3>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {documentosFaltantes.map((doc) => (
                      <li key={doc} className="flex items-center gap-3 text-gray-700">
                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                        {doc.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => router.push("/usuarios/perfil")}
                    className="w-full bg-[#581517] hover:bg-[#7a1c1c] text-white font-medium py-3 px-6 rounded-md transition-all duration-200 shadow-md"
                  >
                    📎 Completar Documentos en Mi Perfil
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <span className="text-green-500 text-4xl mb-3 block">✅</span>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    ¡Todos los documentos están completos!
                  </h3>
                  <p className="text-gray-600">Puedes continuar con tu inscripción</p>
                </div>
              )}
            </section>

            {/* SECCIÓN DE INSCRIPCIÓN */}
            <section className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-gray-600 text-2xl">
                    {curso.tipo === "gratis" ? "🎯" : "💳"}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  {curso.tipo === "gratis" ? "Inscripción Gratuita" : "Inscripción de Pago"}
                </h2>
                
                {curso.tipo === "gratis" ? (
                  <button
                    disabled={documentosFaltantes.length > 0}
                    onClick={handleInscripcionGratis}
                    className={`
                      w-full py-4 px-6 rounded-md font-semibold text-lg transition-all duration-200 shadow-md
                      ${documentosFaltantes.length > 0
                        ? "bg-gray-400 cursor-not-allowed text-gray-600"
                        : "bg-[#581517] hover:bg-[#7a1c1c] text-white"
                      }
                    `}
                  >
                    {documentosFaltantes.length > 0 
                      ? "Completa los documentos para inscribirte" 
                      : "✅ Confirmar Inscripción Gratuita"
                    }
                  </button>
                ) : (
                  <button
                    disabled={documentosFaltantes.length > 0}
                    onClick={handlePagarCurso}
                    className={`
                      w-full py-4 px-6 rounded-md font-semibold text-lg transition-all duration-200 shadow-md
                      ${documentosFaltantes.length > 0
                        ? "bg-gray-400 cursor-not-allowed text-gray-600"
                        : "bg-[#581517] hover:bg-[#7a1c1c] text-white"
                      }
                    `}
                  >
                    {documentosFaltantes.length > 0 
                      ? "Completa los documentos para pagar" 
                      : "💳 Proceder al Pago"
                    }
                  </button>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar de resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen de Inscripción</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Curso:</span>
                  <span className="font-medium text-gray-800">{curso.nombre}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Modalidad:</span>
                  <span className="font-medium text-gray-800">{curso.tipo === "gratis" ? "Gratuita" : "De Pago"}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Documentos:</span>
                  <span className={`font-medium ${documentosFaltantes.length > 0 ? "text-red-600" : "text-green-600"}`}>
                    {documentosFaltantes.length > 0 ? `${documentosFaltantes.length} pendientes` : "Completos"}
                  </span>
                </div>
                
                {curso.tipo === "pago" && metodoPago && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                    <span className="text-gray-600">Método:</span>
                    <span className="font-medium text-gray-800 capitalize">{metodoPago}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 text-center">
                  💡 <strong>Recuerda:</strong> Tu inscripción será confirmada una vez completes todos los requisitos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de pago */}
      <ModalPago
        isOpen={modalPagoOpen}
        onClose={() => setModalPagoOpen(false)}
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
        comprobante={comprobante}
        setComprobante={setComprobante}
        generarOrdenPago={generarOrdenPago}
        subirComprobante={subirComprobante}
        pagarConTarjetaSimulado={pagarConTarjetaSimulado}
      />
    </div>
  );
}