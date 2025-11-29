"use client";
import React, { useRef, useState, useEffect } from "react";
import { X, Upload, Image as ImageIcon, ChevronDown, ChevronUp, Plus } from "lucide-react";
import Swal from "sweetalert2";
import { eventosAPI, usuariosAPI } from "@/services/api";
import { useCategorias } from "@/contexts/CategoriasContext";

interface Evento {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  modalidad: string;
  cupos?: number;
  capacidad?: number;
  publico: string;
  horas: number;
  pago: string;
  precioEstudiantes?: number;
  precioGeneral?: number;
  requiereAsistencia?: boolean;
  asistenciaMinima?: number;
  nota?: number;
  cartaMotivacion?: boolean;
  horario?: string;
  lugar?: string;
  carreras: string[];
  semestres: string[];
  tipoEvento: string;
  docentes?: string[];
  docente?: string;
  imagen?: string;
  categoria?: string;
  requisitosCategoria?: string[];
  id_evt?: string;
  nom_evt?: string;
  fec_evt?: string;
  fec_fin_evt?: string;
  lug_evt?: string;
  mod_evt?: string;
  tip_pub_evt?: string;
  cos_evt?: string;
  des_evt?: string;
  est_evt?: string;
  estado?: string;
  camposExtra?: Record<string, string>;
}

interface ModalEditarEventoProps {
  evento: Evento | null;
  onClose: () => void;
  onGuardar: (data: Evento) => void;
}

interface Usuario {
  id_usu: string;
  nom_usu: string;
  ape_usu: string;
}

export default function ModalEditarEvento({ evento, onClose, onGuardar }: ModalEditarEventoProps) {
  if (!evento) return null;

  const hoy = new Date().toISOString().split("T")[0];
  const imageDefault = "/Default_Image.png";

  const { categorias } = useCategorias();
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("");
  const [requisitosCargados, setRequisitosCargados] = useState<string[]>([]);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [docFilter, setDocFilter] = useState("");
  const [docFiltered, setDocFiltered] = useState<Usuario[]>([]);
  const [isComboOpen, setIsComboOpen] = useState(false);
  const comboRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<Evento>({
    ...evento,
    fechaInicio: evento.fechaInicio || evento.fec_evt || "",
    fechaFin: evento.fechaFin || evento.fec_fin_evt || "",
    modalidad: evento.modalidad || evento.mod_evt || "",
    cupos: evento.cupos ?? evento.capacidad ?? 0,
    capacidad: evento.capacidad ?? evento.cupos ?? 0,
    publico: evento.publico || evento.tip_pub_evt || "",
    horas: evento.horas ?? 0,
    pago: evento.pago || evento.cos_evt || "",
    precioEstudiantes: evento.precioEstudiantes ?? 0,
    precioGeneral: evento.precioGeneral ?? 0,
    requiereAsistencia: evento.requiereAsistencia ?? false,
    asistenciaMinima: evento.asistenciaMinima ?? 0,
    nota: evento.nota ?? 0,
    cartaMotivacion: evento.cartaMotivacion ?? false,
    horario: evento.horario || "",
    lugar: evento.lugar || evento.lug_evt || "",
    carreras: evento.carreras || [],
    semestres: evento.semestres || [],
    tipoEvento: evento.tipoEvento || "",
    docentes: evento.docentes || (evento.docente ? [evento.docente] : []),
    imagen: evento.imagen || imageDefault,
    categoria: evento.categoria || "",
    requisitosCategoria: evento.requisitosCategoria || [],
  });

  // Cargar usuarios desde el backend
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await usuariosAPI.getAll();
        if (response && Array.isArray(response)) {
          setUsuarios(response);
          setDocFiltered(response);
        }
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los usuarios",
          confirmButtonColor: "#581517"
        });
      }
    };
    fetchUsuarios();
  }, []);

  // Filtrar docentes basado en el texto ingresado
  useEffect(() => {
    const filterText = docFilter.trim().toLowerCase();
    if (!filterText) {
      setDocFiltered(usuarios);
    } else {
      const filtered = usuarios.filter((u) => 
        `${u.nom_usu} ${u.ape_usu}`.toLowerCase().includes(filterText)
      );
      setDocFiltered(filtered);
    }
  }, [docFilter, usuarios]);

  // Cerrar el combo box cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboRef.current && !comboRef.current.contains(event.target as Node)) {
        setIsComboOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cargar categoría y requisitos cuando cambie la selección
  useEffect(() => {
    if (categoriaSeleccionada) {
      const categoriaEncontrada = categorias.find(cat => cat.id === categoriaSeleccionada);
      if (categoriaEncontrada) {
        setRequisitosCargados(categoriaEncontrada.requisitos);
        setFormData(prev => ({
          ...prev,
          categoria: categoriaEncontrada.nombre,
          requisitosCategoria: categoriaEncontrada.requisitos
        }));
      }
    } else {
      setRequisitosCargados([]);
      setFormData(prev => ({
        ...prev,
        categoria: "",
        requisitosCategoria: []
      }));
    }
  }, [categoriaSeleccionada, categorias]);

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoriaId = e.target.value;
    setCategoriaSeleccionada(categoriaId);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  
  const tiposEventos = ["CONFERENCIA", "CURSO", "WEBINAR", "CONGRESO", "CASAS ABIERTAS"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") return;

    setFormData((prev) => ({ ...prev, [name]: type === "number" ? Number(value) : value }));
  };

  const handleNumberChange = (name: keyof Evento, value: number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name: keyof Evento) => {
    setFormData((prev) => ({ ...prev, [name]: !(prev as any)[name] }));
  };

  const handleMultiSelect = (name: keyof Evento, value: string) => {
    setFormData((prev) => {
      const lista = (prev[name] as unknown as string[]) || [];
      return {
        ...prev,
        [name]: lista.includes(value) ? lista.filter((v) => v !== value) : [...lista, value],
      } as Evento;
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imagen: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectDocente = (docente: Usuario) => {
    const nombreCompleto = `${docente.nom_usu} ${docente.ape_usu}`;
    const docentesActuales = formData.docentes || [];
    
    if (docentesActuales.includes(nombreCompleto)) {
      setFormData((prev) => ({ 
        ...prev, 
        docentes: docentesActuales.filter(d => d !== nombreCompleto) 
      }));
    } else {
      if (docentesActuales.length < 2) {
        setFormData((prev) => ({ 
          ...prev, 
          docentes: [...docentesActuales, nombreCompleto] 
        }));
      } else {
        Swal.fire({
          icon: "warning",
          title: "Límite alcanzado",
          text: "Solo puedes seleccionar hasta 2 docentes",
          confirmButtonColor: "#581517"
        });
      }
    }
    setDocFilter("");
  };

  const handleInputDocenteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDocFilter(value);
    
    if (!isComboOpen) {
      setIsComboOpen(true);
    }
  };

  const handleToggleCombo = () => {
    setIsComboOpen(!isComboOpen);
    if (!isComboOpen && !docFilter) {
      setDocFiltered(usuarios);
    }
  };

  const handleRemoveDocente = (nombreDocente: string) => {
    setFormData((prev) => ({
      ...prev,
      docentes: (prev.docentes || []).filter(d => d !== nombreDocente)
    }));
  };

  const handleGuardar = async () => {
    console.log("=== INICIANDO handleGuardar ===");
    console.log("Categoría seleccionada:", formData.categoria);
    console.log("Requisitos cargados:", formData.requisitosCategoria);
    console.log("formData al inicio:", JSON.stringify(formData, null, 2));
    
    try {
      if (!formData.nombre || formData.nombre.trim() === "") {
        console.error("❌ Error: Nombre requerido - formData.nombre:", formData.nombre);
        Swal.fire({ 
          icon: "warning", 
          title: "Nombre requerido", 
          text: "El nombre del evento es obligatorio.", 
          confirmButtonColor: "#581517" 
        });
        return;
      }

      if (!formData.fechaInicio || !formData.fechaFin) {
        console.error("❌ Error: Fechas requeridas - fechaInicio:", formData.fechaInicio, "fechaFin:", formData.fechaFin);
        Swal.fire({ 
          icon: "warning", 
          title: "Fechas requeridas", 
          text: "Debes ingresar la fecha de inicio y de fin del evento.", 
          confirmButtonColor: "#581517" 
        });
        return;
      }

      if (!formData.tipoEvento || formData.tipoEvento === "") {
        console.error("❌ Error: Tipo evento requerido - formData.tipoEvento:", formData.tipoEvento);
        Swal.fire({ 
          icon: "warning", 
          title: "Tipo de evento requerido", 
          text: "Debes seleccionar un tipo de evento.", 
          confirmButtonColor: "#581517" 
        });
        return;
      }

      if (!formData.horas || formData.horas <= 0) {
        Swal.fire({ 
          icon: "warning", 
          title: "Duración requerida", 
          text: "El número de horas debe ser mayor a 0.", 
          confirmButtonColor: "#581517" 
        });
        return;
      }

      const horasNum = Number(formData.horas);
      if (isNaN(horasNum) || horasNum <= 0 || !Number.isInteger(horasNum)) {
        Swal.fire({ 
          icon: "error", 
          title: "Duración inválida", 
          text: `La duración debe ser un número entero positivo (ej: 2, 4, 8). Valor actual: "${formData.horas}"`, 
          confirmButtonColor: "#581517" 
        });
        return;
      }

      if (!formData.cupos || formData.cupos <= 0) {
        Swal.fire({ 
          icon: "warning", 
          title: "Cupos requeridos", 
          text: "El número de cupos debe ser mayor a 0.", 
          confirmButtonColor: "#581517" 
        });
        return;
      }

      const cuposNum = Number(formData.cupos);
      if (isNaN(cuposNum) || cuposNum <= 0 || !Number.isInteger(cuposNum)) {
        Swal.fire({ 
          icon: "error", 
          title: "Cupos inválidos", 
          text: `Los cupos deben ser un número entero positivo (ej: 10, 25, 50). Valor actual: "${formData.cupos}"`, 
          confirmButtonColor: "#581517" 
        });
        return;
      }

      if (formData.fechaFin < formData.fechaInicio) {
        Swal.fire({ 
          icon: "error", 
          title: "Fechas inválidas", 
          text: "La fecha de fin no puede ser anterior a la de inicio.", 
          confirmButtonColor: "#581517" 
        });
        return;
      }

      if (formData.tipoEvento === "CURSO") {
        if (formData.nota! < 0 || formData.nota! > 10) {
          Swal.fire({ 
            icon: "warning", 
            title: "Nota inválida", 
            text: "La nota mínima debe estar entre 0 y 10.", 
            confirmButtonColor: "#581517" 
          });
          return;
        }
      }

      if (formData.pago === "Pago") {
        if ((formData.precioEstudiantes ?? 0) < 0 || (formData.precioGeneral ?? 0) < 0) {
          Swal.fire({ 
            icon: "warning", 
            title: "Precios inválidos", 
            text: "Los precios no pueden ser negativos.", 
            confirmButtonColor: "#581517" 
          });
          return;
        }
      }
    } catch (validationError: any) {
      console.error("Error en validaciones:", validationError);
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: validationError.message || "Error al validar los datos",
        confirmButtonColor: "#581517"
      });
      return;
    }

    try {
      console.log("=== Iniciando actualización de evento ===");
      console.log("FormData completo:", JSON.parse(JSON.stringify(formData)));
      console.log("Evento original:", JSON.parse(JSON.stringify(evento)));
      
      const costoEvento = formData.pago === "Gratuito" ? "GRATUITO" : "DE PAGO";
      const modalidadEvento = formData.modalidad === "Presencial" ? "PRESENCIAL" : "VIRTUAL";
      const publicoEvento = formData.publico === "General" ? "GENERAL" : 
                           formData.publico === "Estudiantes" ? "ESTUDIANTES" : "ADMINISTRATIVOS";

      const mapearTipoEvento = (tipo: string): string => {
        const mapeo: { [key: string]: string } = {
          "CONFERENCIA": "CONFERENCIAS",
          "CURSO": "CURSO",
          "WEBINAR": "WEBINAR", 
          "CONGRESO": "CONGRESO",
          "CASAS ABIERTAS": "CASAS ABIERTAS"
        };
        return mapeo[tipo] || tipo;
      };

      const tipoEventoMapeado = mapearTipoEvento(formData.tipoEvento);
      
      console.log("=== MAPEO DE TIPO DE EVENTO ===");
      console.log("Tipo original:", formData.tipoEvento);
      console.log("Tipo mapeado:", tipoEventoMapeado);
      
      const tiposValidos = ['CURSO', 'CONGRESO', 'WEBINAR', 'CONFERENCIAS', 'SOCIALIZACIONES', 'CASAS ABIERTAS', 'SEMINARIOS', 'OTROS'];
      if (!tiposValidos.includes(tipoEventoMapeado)) {
        console.error("❌ Error: Tipo de evento no válido después del mapeo:", tipoEventoMapeado);
        throw new Error(`Tipo de evento no válido: ${formData.tipoEvento} → ${tipoEventoMapeado}`);
      }

      const eventoData = {
        nom_evt: formData.nombre.trim(),
        fec_evt: formData.fechaInicio,
        fec_fin_evt: formData.fechaFin,
        lug_evt: formData.lugar ? formData.lugar.trim() : "",
        mod_evt: modalidadEvento,
        tip_pub_evt: publicoEvento,
        cos_evt: costoEvento,
        ima_evt: formData.imagen || imageDefault,
        carreras: formData.carreras || [],
        semestres: formData.semestres || [],
        categoria: formData.categoria || "", // Incluir categoría
        requisitosCategoria: formData.requisitosCategoria || [], // Incluir requisitos
        detalles: {
          cup_det: Number(formData.cupos ?? formData.capacidad ?? 30),
          hor_det: Number(formData.horas || 40),
          cat_det: tipoEventoMapeado,
          asi_evt_det: Number(formData.asistenciaMinima || 0),
          not_min_evt: Number(formData.nota || 0),
          are_det: "TECNOLOGIA E INGENIERIA"
        }
      };

      console.log("=== VALIDANDO CONVERSIONES NUMÉRICAS ===");
      console.log("formData.cupos original:", formData.cupos, "tipo:", typeof formData.cupos);
      console.log("formData.horas original:", formData.horas, "tipo:", typeof formData.horas);
      
      if (isNaN(eventoData.detalles.cup_det) || eventoData.detalles.cup_det <= 0) {
        console.error("Error en conversión de cupos:", formData.cupos, "->", eventoData.detalles.cup_det);
        throw new Error(`El número de cupos debe ser un número válido mayor a 0. Valor recibido: "${formData.cupos}"`);
      }
      if (isNaN(eventoData.detalles.hor_det) || eventoData.detalles.hor_det <= 0) {
        console.error("Error en conversión de horas:", formData.horas, "->", eventoData.detalles.hor_det);
        throw new Error(`Las horas de duración deben ser un número válido mayor a 0. Valor recibido: "${formData.horas}"`);
      }
      
      console.log("Cupos convertido:", eventoData.detalles.cup_det);
      console.log("Horas convertido:", eventoData.detalles.hor_det);

      console.log("Datos transformados a enviar:", JSON.parse(JSON.stringify(eventoData)));
      console.log("ID del evento a actualizar:", evento.id);

      const response = await eventosAPI.update(evento.id, eventoData);
      
      console.log("Respuesta del servidor:", response);

      if (response && response.success) {
        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: response.message || "El evento ha sido actualizado correctamente",
          confirmButtonColor: "#581517"
        });
        onGuardar({ ...formData, imagen: formData.imagen || imageDefault });
        onClose();
      } else {
        throw new Error(response?.message || "Error al actualizar el evento");
      }
    } catch (error: any) {
      console.error("=== Error completo al guardar evento ===");
      console.error("Error object:", error);
      console.error("FormData que causó el error:", JSON.parse(JSON.stringify(formData)));
      
      if (error && typeof error === 'object') {
        if (error.stack) console.error("Stack:", error.stack);
        if (error.message) console.error("Message:", error.message);
        if (error.response) console.error("Response:", error.response);
      }
      
      let errorMessage = "No se pudo actualizar el evento. Por favor, intenta de nuevo.";
      
      if (error && typeof error === 'object') {
        if (error.message && typeof error.message === 'string') {
          if (error.message.includes('cup_det')) {
            errorMessage = "Error en el número de cupos. Debe ser un número válido mayor a 0.";
          } else if (error.message.includes('hor_det')) {
            errorMessage = "Error en las horas de duración. Debe ser un número válido mayor a 0.";
          } else if (error.message.includes('cat_det')) {
            errorMessage = "Error en el tipo de evento. Selecciona un tipo válido.";
          } else if (error.message.includes('tip_pub_evt')) {
            errorMessage = "Error en el tipo de público. Selecciona una opción válida.";
          } else if (error.message.includes('mod_evt')) {
            errorMessage = "Error en la modalidad. Selecciona una modalidad válida.";
          } else if (error.message.includes('fec_evt')) {
            errorMessage = "Error en las fechas. Verifica que las fechas sean válidas.";
          } else if (error.message.includes('validation') || error.message.includes('constraint')) {
            errorMessage = "Error de validación: " + error.message;
          } else {
            errorMessage = error.message;
          }
        } else if (error.response && error.response.message) {
          errorMessage = `Error del servidor: ${error.response.message}`;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
      }

      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: errorMessage,
        confirmButtonColor: "#581517",
        footer: '<small>Revisa los datos ingresados. Si el problema persiste, contacta al administrador.</small>'
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-xl p-6 relative border border-gray-200 overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#581517]">Editar Evento</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500 hover:text-[#581517]" />
          </button>
        </div>

        {/* Imagen */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Imagen del Evento</h3>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-300 bg-gray-50 flex items-center justify-center">
              {formData.imagen ? (
                <img src={formData.imagen} alt="Vista previa" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="text-gray-400 w-10 h-10" />
              )}
            </div>
            <div>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()} 
                className="flex items-center gap-2 px-4 py-2 bg-[#581517] text-white rounded-lg text-sm font-medium hover:bg-[#6e1c1e] transition-colors"
              >
                <Upload size={16} /> Subir Imagen
              </button>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
              <p className="text-xs text-gray-500 mt-2">Formatos permitidos: JPG, PNG, WEBP. Máx 5MB.</p>
            </div>
          </div>
        </section>

        {/* Formulario */}
        <div className="space-y-6">
          {/* Información básica */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del evento</label>
                <input 
                  type="text" 
                  name="nombre"
                  value={formData.nombre} 
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517]" 
                  placeholder="Ingrese el nombre del evento"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de evento</label>
                <select 
                  name="tipoEvento" 
                  value={formData.tipoEvento} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517]"
                >
                  <option value="">Seleccionar tipo</option>
                  {tiposEventos.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Público objetivo</label>
                <select 
                  name="publico" 
                  value={formData.publico} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517]"
                >
                  <option value="">Seleccionar</option>
                  <option value="Estudiantes">Estudiantes</option>
                  <option value="General">Público General</option>
                </select>
              </div>

              {/* Selector de Categoría - CORREGIDO */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría del Evento
                </label>
                <div className="flex gap-3">
                  <select 
                    value={categoriaSeleccionada}
                    onChange={handleCategoriaChange}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517]"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => window.open('/admin/categorias', '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <Plus size={16} />
                    Nueva Categoría
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Selecciona una categoría para cargar automáticamente sus requisitos
                </p>
              </div>

              {/* Mostrar requisitos de la categoría seleccionada */}
              {requisitosCargados.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requisitos de la categoría "{formData.categoria}"
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <ul className="space-y-2">
                      {requisitosCargados.map((requisito, index) => (
                        <li key={index} className="flex items-center gap-3 text-sm text-gray-700">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {requisito}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-blue-600 mt-3 font-medium">
                      ✓ Estos requisitos se aplicarán automáticamente al evento
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Fechas y horarios */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Fechas y Horario</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de inicio</label>
                <input 
                  type="date" 
                  name="fechaInicio" 
                  min={hoy} 
                  value={formData.fechaInicio} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de fin</label>
                <input 
                  type="date" 
                  name="fechaFin" 
                  min={formData.fechaInicio || hoy} 
                  value={formData.fechaFin} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duración (horas)</label>
                <input 
                  type="number" 
                  name="horas" 
                  value={formData.horas} 
                  onChange={(e) => handleNumberChange("horas" as keyof Evento, Number(e.target.value))} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                  min={0} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horario (texto)</label>
                <input 
                  type="text" 
                  name="horario" 
                  value={formData.horario} 
                  onChange={handleInputChange} 
                  placeholder="LUNES-MARTES 7:00 - 10:00 AM" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lugar (opcional)</label>
                <input 
                  type="text" 
                  name="lugar" 
                  value={formData.lugar} 
                  onChange={handleInputChange} 
                  placeholder="Ej. Auditorio A" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                />
              </div>
            </div>
          </section>

          {/* Configuración del evento */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Configuración del Evento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modalidad</label>
                <select 
                  name="modalidad" 
                  value={formData.modalidad} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517]"
                >
                  <option value="">Seleccionar modalidad</option>
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="VIRTUAL">Virtual</option>
                  <option value="HIBRIDA">Híbrida</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cupos</label>
                <input 
                  type="number" 
                  name="cupos" 
                  value={formData.cupos} 
                  onChange={(e) => handleNumberChange("cupos" as keyof Evento, Number(e.target.value))} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                  min={0} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de pago</label>
                <select 
                  name="pago" 
                  value={formData.pago} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517]"
                >
                  <option value="">Seleccionar</option>
                  <option value="Gratis">Gratuito</option>
                  <option value="Pago">De Pago</option>
                </select>
              </div>

              {/* Precios si es pago */}
              {formData.pago === "Pago" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio Estudiantes</label>
                    <input 
                      type="number" 
                      name="precioEstudiantes" 
                      value={formData.precioEstudiantes} 
                      onChange={(e) => handleNumberChange("precioEstudiantes" as keyof Evento, Number(e.target.value))} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      min={0} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio Público General</label>
                    <input 
                      type="number" 
                      name="precioGeneral" 
                      value={formData.precioGeneral} 
                      onChange={(e) => handleNumberChange("precioGeneral" as keyof Evento, Number(e.target.value))} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      min={0} 
                    />
                  </div>
                </>
              )}

              {/* Combo Box Mejorado para Docentes (hasta 2) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Docentes Responsables (máximo 2)
                </label>
                
                {/* Mostrar docentes seleccionados */}
                {formData.docentes && formData.docentes.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.docentes.map((docente, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-2 bg-[#581517] text-white px-3 py-1 rounded-full text-sm"
                      >
                        <span>{docente}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocente(docente)}
                          className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative" ref={comboRef}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={formData.docentes?.length === 2 ? "Límite alcanzado (2 docentes)" : "Buscar usuario..."}
                      value={docFilter}
                      onChange={handleInputDocenteChange}
                      onFocus={() => setIsComboOpen(true)}
                      disabled={formData.docentes?.length === 2}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-[#581517] focus:border-[#581517] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={handleToggleCombo}
                      disabled={formData.docentes?.length === 2}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      {isComboOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {isComboOpen && formData.docentes?.length !== 2 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {docFiltered.length > 0 ? (
                        <ul className="py-1">
                          {docFiltered.map((usuario) => {
                            const nombreCompleto = `${usuario.nom_usu} ${usuario.ape_usu}`;
                            const yaSeleccionado = formData.docentes?.includes(nombreCompleto);
                            
                            return (
                              <li
                                key={usuario.id_usu}
                                className={`px-3 py-2 cursor-pointer transition-colors flex items-center justify-between ${
                                  yaSeleccionado 
                                    ? 'bg-[#581517] text-white hover:bg-[#6a1919]' 
                                    : 'hover:bg-gray-50'
                                }`}
                                onClick={() => handleSelectDocente(usuario)}
                              >
                                <span>{nombreCompleto}</span>
                                {yaSeleccionado && <span className="text-xs">✓ Seleccionado</span>}
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="px-3 py-2 text-gray-500 text-sm">
                          No se encontraron docentes{docFilter ? ` con "${docFilter}"` : ''}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Seleccionados: <strong>{formData.docentes?.length || 0} de 2</strong>
                </p>
              </div>

              {/* Asistencia opcional */}
              <div className="md:col-span-2">
                <label className="inline-flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    checked={formData.requiereAsistencia} 
                    onChange={() => handleToggle("requiereAsistencia" as keyof Evento)} 
                  />
                  <span className="text-sm text-gray-700">Requiere asistencia mínima</span>
                </label>

                {formData.requiereAsistencia && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Asistencia mínima (%)</label>
                      <input 
                        type="number" 
                        name="asistenciaMinima" 
                        value={formData.asistenciaMinima} 
                        onChange={(e) => handleNumberChange("asistenciaMinima" as keyof Evento, Number(e.target.value))} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                        min={0} 
                        max={100} 
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Campos específicos para CURSO */}
              {formData.tipoEvento === "CURSO" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nota mínima (0-10)</label>
                    <input 
                      type="number" 
                      name="nota" 
                      value={formData.nota} 
                      onChange={(e) => handleNumberChange("nota" as keyof Evento, Number(e.target.value))} 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" 
                      min={0} 
                      max={10} 
                      step={0.1} 
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={!!formData.cartaMotivacion} 
                        onChange={() => handleToggle("cartaMotivacion" as keyof Evento)} 
                      />
                      <span className="text-sm text-gray-700">Requiere carta de motivación</span>
                    </label>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Público objetivo específico (solo si Estudiantes) */}
          
          
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <button 
            onClick={onClose} 
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleGuardar} 
            className="px-6 py-2 rounded-lg bg-[#581517] text-white hover:bg-[#6e1c1e] font-medium transition-colors shadow-sm"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}