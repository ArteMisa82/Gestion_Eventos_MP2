"use client";
import React, { useRef, useState, useEffect } from "react";
import { X, Upload, Image as ImageIcon, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
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

interface RequisitoPersonalizado {
  id: string;
  tipo: "asistencia" | "nota" | "carta" | "documento" | "otro";
  valor?: string | number;      // Para nota y asistencia
  descripcion?: string;          // Para documentos/requisitos
  obligatorio?: boolean;         // Para requisitos_evento
  activo: boolean;
  destino?: "detalle" | "requisito";  // 🆕 Indicar dónde va el requisito
}

export default function ModalEditarEvento({ evento, onClose, onGuardar }: ModalEditarEventoProps) {
  if (!evento) return null;

  const hoy = new Date().toISOString().split("T")[0];
  const imageDefault = "/Default_Image.png";

  const { categorias } = useCategorias();
  const [requisitosCargados, setRequisitosCargados] = useState<string[]>([]);
  const [mostrarAgregarRequisito, setMostrarAgregarRequisito] = useState(false);
  const [nuevoRequisito, setNuevoRequisito] = useState<RequisitoPersonalizado>({
    id: '',
    tipo: 'otro',
    activo: true
  });
  const [requisitosPersonalizados, setRequisitosPersonalizados] = useState<RequisitoPersonalizado[]>([]);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [docFilter, setDocFilter] = useState("");
  const [docFiltered, setDocFiltered] = useState<Usuario[]>([]);
  const [isComboOpen, setIsComboOpen] = useState(false);
  const comboRef = useRef<HTMLDivElement>(null);

  // Función para convertir fecha a formato yyyy-MM-dd
  const formatDateForInput = (dateString: string | undefined): string => {
    if (!dateString) return "";
    
    try {
      // Si ya viene en formato ISO (yyyy-MM-ddT...), extraer solo la fecha
      if (dateString.includes('T')) {
        return dateString.split('T')[0];
      }
      
      // Si viene en formato dd/MM/yyyy, convertir a yyyy-MM-dd
      if (dateString.includes('/')) {
        const [day, month, year] = dateString.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
      
      // Si ya está en formato yyyy-MM-dd, retornar tal cual
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      // Último recurso: intentar parsear como fecha
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  const [formData, setFormData] = useState<Evento>({
    ...evento,
    id: evento.id || evento.id_evt || "",
    nombre: evento.nombre || evento.nom_evt || "",
    fechaInicio: formatDateForInput(evento.fec_evt || evento.fechaInicio),
    fechaFin: formatDateForInput(evento.fec_fin_evt || evento.fechaFin),
    modalidad: evento.modalidad || evento.mod_evt || "",
    cupos: evento.cupos ?? evento.capacidad ?? 0,
    capacidad: evento.capacidad ?? evento.cupos ?? 0,
    publico: evento.publico || evento.tip_pub_evt || "",
    horas: evento.horas ?? 0,
    pago: evento.pago || evento.cos_evt || "",
    precioEstudiantes: evento.precioEstudiantes ?? 0,
    precioGeneral: evento.precioGeneral ?? 0,
    requiereAsistencia: false,
    asistenciaMinima: 0,
    nota: 0,
    cartaMotivacion: false,
    horario: evento.horario || "",
    lugar: evento.lugar || evento.lug_evt || "",
    carreras: Array.isArray(evento.carreras) ? evento.carreras : [],
    semestres: Array.isArray(evento.semestres) ? evento.semestres : [],
    tipoEvento: evento.tipoEvento || evento.categoria || "CURSO",
    docentes: evento.docentes || (evento.docente ? [evento.docente] : []),
    imagen: evento.imagen || imageDefault,
    categoria: evento.categoria || "",
    requisitosCategoria: evento.requisitosCategoria || [],
  });

  // Actualizar formData cuando cambie el evento
  useEffect(() => {
    if (evento) {
      console.log("=== USEEFFECT: Actualizando formData desde evento ===");
      console.log("evento.modalidad:", evento.modalidad);
      console.log("evento.mod_evt:", evento.mod_evt);
      console.log("evento.cupos:", evento.cupos);
      console.log("evento.capacidad:", evento.capacidad);
      console.log("evento.pago:", evento.pago);
      console.log("evento.cos_evt:", evento.cos_evt);
      
      setFormData({
        ...evento,
        id: evento.id || evento.id_evt || "",
        nombre: evento.nombre || evento.nom_evt || "",
        fechaInicio: formatDateForInput(evento.fec_evt || evento.fechaInicio),
        fechaFin: formatDateForInput(evento.fec_fin_evt || evento.fechaFin),
        modalidad: evento.modalidad || evento.mod_evt || "",
        cupos: evento.cupos ?? evento.capacidad ?? 0,
        capacidad: evento.capacidad ?? evento.cupos ?? 0,
        publico: evento.publico || evento.tip_pub_evt || "",
        horas: evento.horas ?? 0,
        pago: evento.pago || evento.cos_evt || "",
        precioEstudiantes: evento.precioEstudiantes ?? 0,
        precioGeneral: evento.precioGeneral ?? 0,
        requiereAsistencia: false,
        asistenciaMinima: 0,
        nota: 0,
        cartaMotivacion: false,
        horario: evento.horario || "",
        lugar: evento.lugar || evento.lug_evt || "",
        carreras: Array.isArray(evento.carreras) ? evento.carreras : [],
        semestres: Array.isArray(evento.semestres) ? evento.semestres : [],
        tipoEvento: evento.tipoEvento || evento.categoria || "CURSO",
        docentes: evento.docentes || (evento.docente ? [evento.docente] : []),
        imagen: evento.imagen || imageDefault,
        categoria: evento.categoria || "",
        requisitosCategoria: evento.requisitosCategoria || [],
      });
      
      console.log("formData actualizado - modalidad:", evento.modalidad || evento.mod_evt);
      console.log("formData actualizado - cupos:", evento.cupos ?? evento.capacidad);
      console.log("formData actualizado - pago:", evento.pago || evento.cos_evt);
    }
  }, [evento]);

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

  // 🔥 Inicializar requisitos personalizados desde la BD
  useEffect(() => {
    const cargarRequisitosDesdeDB = async () => {
      const requisitosIniciales: RequisitoPersonalizado[] = [];
      
      console.log('🔍 Cargando requisitos desde BD para evento:', evento);

      // 1️⃣ Cargar requisitos desde detalle_eventos (asistencia y nota)
      const detalle = (evento as any).detalle_eventos?.[0];
      if (detalle) {
        console.log('📦 Detalle encontrado:', detalle);
        
        // Asistencia (campo asi_evt_det = 1 si es obligatoria)
        if (detalle.asi_evt_det === 1) {
          requisitosIniciales.push({
            id: 'asistencia-db',
            tipo: 'asistencia',
            valor: 1,
            activo: true,
            destino: "detalle"
          });
          console.log('✅ Asistencia cargada desde detalle_eventos');
        }

        // Nota mínima (campo not_min_evt)
        if (detalle.not_min_evt && detalle.not_min_evt > 0) {
          requisitosIniciales.push({
            id: 'nota-db',
            tipo: 'nota',
            valor: detalle.not_min_evt,
            activo: true,
            destino: "detalle"
          });
          console.log('✅ Nota mínima cargada:', detalle.not_min_evt);
        }

        // 2️⃣ Cargar requisitos desde requisitos_evento (documentos)
        if (detalle.requisitos_evento && Array.isArray(detalle.requisitos_evento)) {
          console.log('📄 Requisitos_evento encontrados:', detalle.requisitos_evento);
          
          detalle.requisitos_evento.forEach((req: any, index: number) => {
            // Determinar el tipo basado en tip_req
            let tipo: RequisitoPersonalizado['tipo'] = 'documento';
            
            if (req.tip_req === 'CARTA_MOTIVACION' || req.des_req?.toLowerCase().includes('carta')) {
              tipo = 'carta';
            } else if (req.tip_req === 'DOCUMENTO' || req.tip_req === 'CEDULA' || req.tip_req === 'TITULO') {
              tipo = 'documento';
            } else {
              tipo = 'otro';
            }

            requisitosIniciales.push({
              id: `requisito-db-${req.id_req || index}`,
              tipo: tipo,
              descripcion: req.des_req || req.tip_req,
              obligatorio: req.obligatorio ?? true,
              activo: true,
              destino: "requisito"
            });
            console.log(`✅ Requisito cargado: ${req.tip_req} - ${req.des_req}`);
          });
        }
      }

      // 3️⃣ Fallback: cargar desde campos antiguos del evento (compatibilidad)
      if (requisitosIniciales.length === 0) {
        console.log('⚠️ No se encontraron requisitos en BD, usando campos legacy');
        
        if (evento.requiereAsistencia && evento.asistenciaMinima) {
          requisitosIniciales.push({
            id: 'asistencia-legacy',
            tipo: 'asistencia',
            valor: evento.asistenciaMinima,
            activo: true,
            destino: "detalle"
          });
        }

        if (evento.nota && evento.nota > 0) {
          requisitosIniciales.push({
            id: 'nota-legacy',
            tipo: 'nota',
            valor: evento.nota,
            activo: true,
            destino: "detalle"
          });
        }

        if (evento.cartaMotivacion) {
          requisitosIniciales.push({
            id: 'carta-legacy',
            tipo: 'carta',
            activo: true,
            obligatorio: true,
            destino: "requisito"
          });
        }
      }

      console.log('📋 Requisitos finales cargados:', requisitosIniciales);
      setRequisitosPersonalizados(requisitosIniciales);
    };

    cargarRequisitosDesdeDB();
  }, [evento]);

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

  // Cargar requisitos cuando cambie el tipo de evento (categoría)
  useEffect(() => {
    if (formData.tipoEvento) {
      // Buscar si el tipo de evento seleccionado coincide con alguna categoría
      const categoriaEncontrada = categorias.find(cat => 
        cat.nombre.toLowerCase() === formData.tipoEvento.toLowerCase()
      );
      
      if (categoriaEncontrada) {
        setRequisitosCargados(categoriaEncontrada.requisitos);
        setFormData(prev => ({
          ...prev,
          categoria: categoriaEncontrada.nombre,
          requisitosCategoria: categoriaEncontrada.requisitos
        }));
      } else {
        // Si no es una categoría personalizada, limpiar los requisitos
        setRequisitosCargados([]);
        setFormData(prev => ({
          ...prev,
          categoria: "",
          requisitosCategoria: []
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
  }, [formData.tipoEvento, categorias]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tipos de evento base + categorías personalizadas
  const tiposEventosBase = ["CONFERENCIA", "CURSO", "WEBINAR", "CONGRESO", "CASAS ABIERTAS"];

  // Obtener tipos de requisitos disponibles (excluyendo los ya agregados)
  const tiposRequisitosDisponibles = (["asistencia", "nota", "carta", "documento", "otro"] as const).filter(
    tipo => !requisitosPersonalizados.some(req => req.tipo === tipo)
  );

  // Funciones para manejar requisitos personalizados
  const agregarRequisitoPersonalizado = () => {
    // Verificar si ya existe un requisito del mismo tipo
    if (requisitosPersonalizados.some(req => req.tipo === nuevoRequisito.tipo)) {
      Swal.fire({
        icon: "warning",
        title: "Requisito duplicado",
        text: "Ya existe un requisito de este tipo. No se pueden agregar requisitos duplicados.",
        confirmButtonColor: "#581517"
      });
      return;
    }

    // 🆕 Determinar el destino automáticamente según el tipo
    const destino: "detalle" | "requisito" = 
      ['nota', 'asistencia'].includes(nuevoRequisito.tipo) ? 'detalle' : 'requisito';

    const requisitoConId = {
      ...nuevoRequisito,
      id: Date.now().toString(),
      destino  // 🆕
    };

    setRequisitosPersonalizados(prev => [...prev, requisitoConId]);
    
    // Resetear el formulario
    setNuevoRequisito({
      id: '',
      tipo: tiposRequisitosDisponibles[0] || 'otro',
      activo: true
    });
    setMostrarAgregarRequisito(false);
  };

  const eliminarRequisitoPersonalizado = (id: string) => {
    setRequisitosPersonalizados(prev => prev.filter(req => req.id !== id));
  };

  const toggleRequisitoPersonalizado = (id: string) => {
    setRequisitosPersonalizados(prev =>
      prev.map(req =>
        req.id === id ? { ...req, activo: !req.activo } : req
      )
    );
  };

  const actualizarValorRequisito = (id: string, valor: string | number) => {
    setRequisitosPersonalizados(prev =>
      prev.map(req =>
        req.id === id ? { ...req, valor } : req
      )
    );
  };

  const getTextoRequisito = (requisito: RequisitoPersonalizado): string => {
    switch (requisito.tipo) {
      case 'asistencia':
        return `Asistencia mínima: ${requisito.valor || '0'}%`;
      case 'nota':
        return `Nota mínima: ${requisito.valor || '0'}/10`;
      case 'carta':
        return 'Carta de motivación requerida';
      case 'documento':
        return 'Documento específico requerido';
      case 'otro':
      default:
        return 'Otro requisito específico';
    }
  };

  const getNombreTipoRequisito = (tipo: string): string => {
    switch (tipo) {
      case 'asistencia': return 'Asistencia Mínima';
      case 'nota': return 'Nota Mínima';
      case 'carta': return 'Carta de Motivación';
      case 'documento': return 'Documento Específico';
      case 'otro': return 'Otro Requisito';
      default: return tipo;
    }
  };

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
    setFormData(prev => ({
      ...prev,
      docentes: (prev.docentes || []).filter(d => d !== nombreDocente)
    }));
  };

  const handleGuardar = async () => {
    console.log("=== INICIANDO handleGuardar ===");
    console.log("Tipo de evento seleccionado:", formData.tipoEvento);
    console.log("Categoría asociada:", formData.categoria);
    console.log("Requisitos cargados:", formData.requisitosCategoria);
    console.log("Requisitos personalizados:", requisitosPersonalizados);
    console.log("formData al inicio:", JSON.stringify(formData, null, 2));
    
    // LOGS ADICIONALES PARA DEPURACIÓN
    console.log("=== VALORES CRÍTICOS ANTES DE ENVIAR ===");
    console.log("modalidad:", formData.modalidad);
    console.log("cupos:", formData.cupos, "tipo:", typeof formData.cupos);
    console.log("pago:", formData.pago);
    
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

      // Validar requisitos de nota
      const requisitoNota = requisitosPersonalizados.find(req => req.tipo === 'nota' && req.activo);
      if (requisitoNota && requisitoNota.valor && (Number(requisitoNota.valor) < 0 || Number(requisitoNota.valor) > 10)) {
        Swal.fire({ 
          icon: "warning", 
          title: "Nota inválida", 
          text: "La nota mínima debe estar entre 0 y 10.", 
          confirmButtonColor: "#581517" 
        });
        return;
      }

      // Validación de asistencia removida (ahora es solo 1 o 0)

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
      
      // Mapeo robusto para pago (manejar tanto "Gratis" como "Gratuito")
      const costoEvento = (formData.pago === "Gratis" || formData.pago === "Gratuito" || formData.pago === "GRATUITO") 
        ? "GRATUITO" 
        : "DE PAGO";
      
      // Mapeo robusto para modalidad (ya viene en mayúsculas desde el select)
      let modalidadEvento = "PRESENCIAL"; // valor por defecto
      if (formData.modalidad) {
        const modalidadUpper = formData.modalidad.toUpperCase();
        if (modalidadUpper === "PRESENCIAL" || modalidadUpper.includes("PRESENCIAL")) {
          modalidadEvento = "PRESENCIAL";
        } else if (modalidadUpper === "VIRTUAL" || modalidadUpper.includes("VIRTUAL")) {
          modalidadEvento = "VIRTUAL";
        } else if (modalidadUpper === "HIBRIDA" || modalidadUpper.includes("HIBRID")) {
          modalidadEvento = "VIRTUAL"; // En BD solo existen PRESENCIAL y VIRTUAL
        }
      }
      
      const publicoEvento = formData.publico === "General" ? "GENERAL" : 
                           formData.publico === "Estudiantes" ? "ESTUDIANTES" : "ADMINISTRATIVOS";

      // Verificar si el tipo de evento es una categoría personalizada
      const esCategoriaPersonalizada = categorias.some(cat => 
        cat.nombre.toLowerCase() === formData.tipoEvento.toLowerCase()
      );

      const mapearTipoEvento = (tipo: string): string => {
        // Si es una categoría personalizada, usar el nombre directamente
        if (esCategoriaPersonalizada) {
          return tipo.toUpperCase();
        }
        
        // Mapeo para tipos base
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
      console.log("Es categoría personalizada:", esCategoriaPersonalizada);
      console.log("Tipo mapeado:", tipoEventoMapeado);
      
      const tiposValidos = ['CURSO', 'CONGRESO', 'WEBINAR', 'CONFERENCIAS', 'SOCIALIZACIONES', 'CASAS ABIERTAS', 'SEMINARIOS', 'OTROS'];
      // Para categorías personalizadas, permitir cualquier valor
      if (!esCategoriaPersonalizada && !tiposValidos.includes(tipoEventoMapeado)) {
        console.error("❌ Error: Tipo de evento no válido después del mapeo:", tipoEventoMapeado);
        throw new Error(`Tipo de evento no válido: ${formData.tipoEvento} → ${tipoEventoMapeado}`);
      }

      // Combinar requisitos de categoría con requisitos personalizados
      const todosLosRequisitos = [
        ...(formData.requisitosCategoria || []),
        ...requisitosPersonalizados
          .filter(req => req.activo)
          .map(req => getTextoRequisito(req))
      ];

      console.log("=== VALIDANDO FECHAS ===");
      console.log("formData.fechaInicio:", formData.fechaInicio, "tipo:", typeof formData.fechaInicio);
      console.log("formData.fechaFin:", formData.fechaFin, "tipo:", typeof formData.fechaFin);

      // Convertir fechas a formato ISO con hora local (evita problemas de zona horaria)
      const convertirFechaLocal = (fechaString: string): string => {
        if (!fechaString) return "";
        // Si ya está en formato yyyy-MM-dd, agregar hora local
        const [year, month, day] = fechaString.split('-');
        const fecha = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0); // Mediodía local
        return fecha.toISOString();
      };

      // 🆕 SEPARAR REQUISITOS EN DOS TIPOS
      // Requisitos que van a detalle_eventos (nota y asistencia)
      const requisitoDetalle = {
        not_min_evt: requisitosPersonalizados
          .find(r => r.tipo === 'nota' && r.activo)?.valor || 0,
        asi_evt_det: requisitosPersonalizados
          .find(r => r.tipo === 'asistencia' && r.activo)?.valor || 0
      };

      // Requisitos que van a requisitos_evento (documentos específicos)
      const requisitoEventos = requisitosPersonalizados
        .filter(r => ['carta', 'documento', 'otro'].includes(r.tipo) && r.activo)
        .map(r => ({
          tip_req: r.tipo === 'carta' ? 'Carta de Motivación' : 
                   r.tipo === 'documento' ? (r.descripcion || 'Documento') : 
                   r.descripcion || 'Otro requisito',
          des_req: r.descripcion || '',
          obligatorio: r.obligatorio !== false
        }));

      console.log('🆕 SEPARACIÓN DE REQUISITOS:');
      console.log('   Requisitos para detalle_eventos:', requisitoDetalle);
      console.log('   Requisitos para requisitos_evento:', requisitoEventos);

      const eventoData = {
        nom_evt: formData.nombre.trim(),
        fec_evt: convertirFechaLocal(formData.fechaInicio),
        fec_fin_evt: convertirFechaLocal(formData.fechaFin),
        lug_evt: formData.lugar ? formData.lugar.trim() : "",
        mod_evt: modalidadEvento,
        tip_pub_evt: publicoEvento,
        cos_evt: costoEvento,
        ima_evt: formData.imagen || imageDefault,
        carreras: formData.carreras || [],
        semestres: formData.semestres || [],
        docentes: formData.docentes || [],
        categoria: formData.categoria || "",
        requisitosCategoria: todosLosRequisitos,
        detalles: {
          cup_det: Number(formData.cupos ?? formData.capacidad ?? 30),
          hor_det: Number(formData.horas || 40),
          cat_det: tipoEventoMapeado,
          not_min_evt: Number(requisitoDetalle.not_min_evt) || 0,  // 🆕 Desde requisitos
          asi_evt_det: Number(requisitoDetalle.asi_evt_det) || 0,  // 🆕 Desde requisitos
          are_det: "TECNOLOGIA E INGENIERIA"
        },
        requisitos: requisitoEventos  // 🆕 Nuevos requisitos específicos del evento
      };

      console.log("=== DATOS A ENVIAR ===");
      console.log("eventoData completo:", JSON.stringify(eventoData, null, 2));
      console.log("mod_evt (modalidad):", eventoData.mod_evt);
      console.log("cos_evt (pago):", eventoData.cos_evt);
      console.log("cup_det (cupos):", eventoData.detalles.cup_det);
      console.log("eventoData.fec_evt:", eventoData.fec_evt);
      console.log("eventoData.fec_fin_evt:", eventoData.fec_fin_evt);

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
      
      console.log("🚀 === ENVIANDO PETICIÓN AL BACKEND ===");
      console.log("URL:", `http://localhost:3001/api/eventos/${evento.id}`);
      console.log("Payload completo que se enviará:");
      console.log(JSON.stringify(eventoData, null, 2));

      const response = await eventosAPI.update(evento.id, eventoData);
      
      console.log("✅ === RESPUESTA DEL BACKEND ===");
      console.log("Response completa:", JSON.stringify(response, null, 2));

      if (response && response.success) {
        // Actualizar tarifas si el evento es de pago
        if (formData.pago === "Pago") {
          try {
            // Actualizar tarifa para estudiantes
            await fetch('http://localhost:3001/api/tarifas-evento', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                id_evt: evento.id,
                tip_par: 'ESTUDIANTE',
                val_evt: Number(formData.precioEstudiantes || 0)
              })
            });

            // Actualizar tarifa para público general
            await fetch('http://localhost:3001/api/tarifas-evento', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                id_evt: evento.id,
                tip_par: 'PERSONA',
                val_evt: Number(formData.precioGeneral || 0)
              })
            });
            console.log("✅ Tarifas actualizadas correctamente");
          } catch (tarifaError) {
            console.error("Error al actualizar tarifas:", tarifaError);
            // No lanzamos error porque el evento ya se actualizó
          }
        }

        // 🆕 RECARGAR EL EVENTO DESDE LA BD PARA OBTENER DATOS FRESCOS (especialmente requisitos)
        try {
          console.log("📥 Recargando evento desde la BD para obtener datos frescos...");
          const eventoRecargado = await eventosAPI.getById(evento.id);
          console.log("✅ Evento recargado exitosamente:", eventoRecargado);
          
          // Pasar el evento completo recargado desde la BD
          onGuardar(eventoRecargado);
        } catch (reloadError) {
          console.error("❌ Error recargando evento:", reloadError);
          // Fallback: pasar los datos del formulario si no se puede recargar
          onGuardar({ ...formData, imagen: formData.imagen || imageDefault });
        }

        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: response.message || "El evento ha sido actualizado correctamente",
          confirmButtonColor: "#581517"
        });
        
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de evento
                </label>
                <select 
                  name="tipoEvento" 
                  value={formData.tipoEvento} 
                  onChange={handleInputChange} 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517]"
                >
                  <option value="">Seleccionar tipo</option>
                  
                  {/* Tipos de evento base */}
                  <optgroup label="Tipos base">
                    {tiposEventosBase.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </optgroup>
                  
                  {/* Categorías personalizadas */}
                  {categorias.length > 0 && (
                    <optgroup label="Categorías personalizadas">
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.nombre.toUpperCase()}>
                          {categoria.nombre}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Las categorías personalizadas se cargan automáticamente con sus requisitos
                </p>
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

              {/* Mostrar requisitos de la categoría seleccionada */}
              {requisitosCargados.length > 0 && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requisitos de "{formData.tipoEvento}"
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
            </div>
          </section>

          {/* Requisitos personalizados - MODIFICADO */}
          <section>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Requisitos del Evento</h3>
              <button
                type="button"
                onClick={() => setMostrarAgregarRequisito(true)}
                disabled={tiposRequisitosDisponibles.length === 0}
                className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                Agregar Requisito
              </button>
            </div>

            {/* Mensaje cuando no hay más tipos disponibles */}
            {tiposRequisitosDisponibles.length === 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700 text-center">
                  Todos los tipos de requisitos han sido agregados. No hay más opciones disponibles.
                </p>
              </div>
            )}

            {/* Formulario para agregar requisito - MODIFICADO */}
            {mostrarAgregarRequisito && tiposRequisitosDisponibles.length > 0 && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-md font-medium text-gray-700 mb-3">Agregar Nuevo Requisito</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de requisito</label>
                    <select
                      value={nuevoRequisito.tipo}
                      onChange={(e) => setNuevoRequisito(prev => ({
                        ...prev,
                        tipo: e.target.value as RequisitoPersonalizado['tipo']
                      }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517]"
                    >
                      {tiposRequisitosDisponibles.map(tipo => (
                        <option key={tipo} value={tipo}>
                          {getNombreTipoRequisito(tipo)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Solo se muestran tipos que no han sido agregados
                    </p>
                  </div>

                  {/* Campos de valor para tipos específicos */}
                  {nuevoRequisito.tipo === 'nota' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nota mínima (0-10)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={nuevoRequisito.valor as number || 0}
                          onChange={(e) => setNuevoRequisito(prev => ({
                            ...prev,
                            valor: Number(e.target.value)
                          }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                          placeholder="0-10"
                        />
                        <span className="text-sm text-gray-500 whitespace-nowrap">/10</span>
                      </div>
                    </div>
                  )}

                  {/* Checkbox para asistencia (ahora solo 1 o 0) */}
                  {nuevoRequisito.tipo === 'asistencia' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ¿Requiere control de asistencia?
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={nuevoRequisito.valor === 1}
                          onChange={(e) => setNuevoRequisito(prev => ({
                            ...prev,
                            valor: e.target.checked ? 1 : 0
                          }))}
                          className="w-5 h-5 border-gray-300 rounded cursor-pointer accent-[#581517]"
                        />
                        <span className="text-sm text-gray-600">
                          {nuevoRequisito.valor === 1 ? '✅ Sí, se controlará asistencia' : '❌ No se controlará asistencia'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setMostrarAgregarRequisito(false)}
                    className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={agregarRequisitoPersonalizado}
                    className="px-3 py-2 bg-[#581517] text-white rounded-lg hover:bg-[#6e1c1e] transition-colors text-sm"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}

            {/* Lista de requisitos personalizados - MODIFICADO */}
            {requisitosPersonalizados.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-700">Requisitos personalizados:</h4>
                {requisitosPersonalizados.map((requisito) => (
                  <div key={requisito.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex items-center h-5 mt-0.5">
                          <input
                            type="checkbox"
                            checked={requisito.activo}
                            onChange={() => toggleRequisitoPersonalizado(requisito.id)}
                            className="w-4 h-4 text-[#581517] focus:ring-[#581517] border-gray-300 rounded"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-sm font-medium ${requisito.activo ? 'text-gray-800' : 'text-gray-400'}`}>
                              {getTextoRequisito(requisito)}
                            </span>
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              {getNombreTipoRequisito(requisito.tipo)}
                            </span>
                          </div>
                          
                          {/* Mostrar campo de valor solo para nota cuando está activo */}
                          {requisito.tipo === 'nota' && requisito.activo && (
                            <div className="mt-2">
                              <label className="block text-xs text-gray-600 mb-1">
                                Nota mínima (0-10)
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={requisito.valor as number || 0}
                                  onChange={(e) => actualizarValorRequisito(requisito.id, Number(e.target.value))}
                                  className="w-24 border border-gray-300 rounded px-2 py-1 text-sm"
                                />
                                <span className="text-xs text-gray-500">/10</span>
                              </div>
                            </div>
                          )}

                          {/* Mostrar checkbox para asistencia cuando está activo */}
                          {requisito.tipo === 'asistencia' && requisito.activo && (
                            <div className="mt-2">
                              <label className="block text-xs text-gray-600 mb-1">
                                Control de asistencia
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={requisito.valor === 1}
                                  onChange={(e) => actualizarValorRequisito(requisito.id, e.target.checked ? 1 : 0)}
                                  className="w-4 h-4 border-gray-300 rounded cursor-pointer accent-[#581517]"
                                />
                                <span className="text-xs text-gray-600">
                                  {requisito.valor === 1 ? '✅ Habilitado' : '❌ Deshabilitado'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => eliminarRequisitoPersonalizado(requisito.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors mt-0.5"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {/* Estado del requisito */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${requisito.activo ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-xs ${requisito.activo ? 'text-green-600' : 'text-gray-500'}`}>
                        {requisito.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {requisitosPersonalizados.length === 0 && !mostrarAgregarRequisito && (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                <p>No hay requisitos personalizados agregados</p>
                <p className="text-sm mt-1">Haz clic en "Agregar Requisito" para crear uno</p>
              </div>
            )}
          </section>
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