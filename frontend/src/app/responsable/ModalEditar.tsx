"use client";
import React, { useRef, useState, useEffect } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import Swal from "sweetalert2";
import { eventosAPI } from "@/services/api";

interface Evento {
  id: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  modalidad: string;
  cupos: number;
  publico: string;
  horas: number;
  pago: string;
  precioEstudiantes?: number;
  precioGeneral?: number;
  requiereAsistencia: boolean; // si el evento requiere asistencia mínima
  asistenciaMinima?: number; // porcentaje o número mínimo de asistencias (según regla de negocio)
  nota?: number; // 0-10 (solo si tipo CURSO)
  cartaMotivacion?: boolean; // solo si tipo CURSO
  horario: string; // texto libre
  lugar: string; // input opcional
  carreras: string[];
  semestres: string[];
  tipoEvento: string;
  docente?: string; // id o nombre del docente seleccionado
  imagen?: string;
}

interface ModalEditarEventoProps {
  evento: Evento | null;
  onClose: () => void;
  onGuardar: (data: Evento) => void;
}

export default function ModalEditarEvento({ evento, onClose, onGuardar }: ModalEditarEventoProps) {
  if (!evento) return null;

  const hoy = new Date().toISOString().split("T")[0];
  const imageDefault = "/Default_Image.png"; // asume archivo en /public

  // Simulación de usuarios para el combobox de docentes
  const usuariosSimulados = [
    { id: "1", nombre: "Ana López" },
    { id: "2", nombre: "Carlos Ruiz" },
    { id: "3", nombre: "María Gómez" },
    { id: "4", nombre: "John Smith" },
  ];

  const [usuarios] = useState(usuariosSimulados);
  const [docFilter, setDocFilter] = useState("");
  const [docFiltered, setDocFiltered] = useState(usuariosSimulados);

  const [formData, setFormData] = useState<Evento>({
    ...evento,
    fechaInicio: evento.fechaInicio || "",
    fechaFin: evento.fechaFin || "",
    modalidad: evento.modalidad || "",
    cupos: evento.cupos ?? 0,
    publico: evento.publico || "",
    horas: evento.horas ?? 0,
    pago: evento.pago || "",
    precioEstudiantes: evento.precioEstudiantes ?? 0,
    precioGeneral: evento.precioGeneral ?? 0,
    requiereAsistencia: evento.requiereAsistencia ?? false,
    asistenciaMinima: evento.asistenciaMinima ?? 0,
    nota: evento.nota ?? 0,
    cartaMotivacion: evento.cartaMotivacion ?? false,
    horario: evento.horario || "",
    lugar: evento.lugar || "",
    carreras: evento.carreras || [],
    semestres: evento.semestres || [],
    tipoEvento: evento.tipoEvento || "",
    docente: evento.docente || "",
    imagen: evento.imagen || imageDefault,
  });

  useEffect(() => {
    const f = docFilter.trim().toLowerCase();
    if (!f) setDocFiltered(usuarios);
    else setDocFiltered(usuarios.filter((u) => (u.nombre + "").toLowerCase().includes(f)));
  }, [docFilter, usuarios]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const carrerasDisponibles = ["Software", "TI", "Telecomunicaciones", "Robótica"];
  const semestresDisponibles = [
    "1er semestre",
    "2do semestre",
    "3er semestre",
    "4to semestre",
    "5to semestre",
    "6to semestre",
    "7mo semestre",
    "8vo semestre",
    "9no semestre",
    "10mo semestre",
  ];
  const tiposEventos = ["CONFERENCIA", "CURSO", "WEBINAR", "CONGRESO", "CASAS ABIERTAS"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    if (type === "checkbox") return; // checkbox handled separately

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
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Formato no válido",
        text: "Solo se permiten archivos JPG, PNG o WEBP",
        confirmButtonColor: "#581517",
      });
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "Archivo muy grande",
        text: "El tamaño máximo permitido es 5MB",
        confirmButtonColor: "#581517",
      });
      return;
    }

    // Crear URL para previsualización
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        imagen: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSelectDocente = (id: string, nombre: string) => {
    setFormData((prev) => ({ ...prev, docente: nombre }));
    setDocFilter(nombre);
    setDocFiltered(usuarios);
  };

  const handleGuardar = async () => {
    // validaciones básicas
    if (!formData.fechaInicio || !formData.fechaFin) {
      Swal.fire({ icon: "warning", title: "Fechas requeridas", text: "Debes ingresar la fecha de inicio y de fin del evento.", confirmButtonColor: "#581517" });
      return;
    }
    if (formData.fechaFin < formData.fechaInicio) {
      Swal.fire({ icon: "error", title: "Fechas inválidas", text: "La fecha de fin no puede ser anterior a la de inicio.", confirmButtonColor: "#581517" });
      return;
    }

    // si es CURSO, validar nota (0-10)
    if (formData.tipoEvento === "CURSO") {
      if (formData.nota! < 0 || formData.nota! > 10) {
        Swal.fire({ icon: "warning", title: "Nota inválida", text: "La nota mínima debe estar entre 0 y 10.", confirmButtonColor: "#581517" });
        return;
      }
    }

    // si es pago, validar precios
    if (formData.pago === "Pago") {
      if ((formData.precioEstudiantes ?? 0) < 0 || (formData.precioGeneral ?? 0) < 0) {
        Swal.fire({ icon: "warning", title: "Precios inválidos", text: "Los precios no pueden ser negativos.", confirmButtonColor: "#581517" });
        return;
      }
    }

    try {
      // ✅ Enviar actualización al backend
      await eventosAPI.update(evento.id, {
        nom_evt: formData.nombre,
        fec_evt: formData.fechaInicio,
        lug_evt: formData.lugar || "Por definir",
        mod_evt: formData.modalidad,
        tip_pub_evt: formData.publico === "General" ? "GENERAL" : "ESTUDIANTES",
        cos_evt: formData.pago === "Gratuito" ? "GRATUITO" : "DE_PAGO",
        ima_evt: formData.imagen,
        detalles: {
          cup_det: formData.cupos,
          hor_det: formData.horas,
          cat_det: formData.tipoEvento,
          // Agregar más campos según necesites
        }
      });

      await Swal.fire({
        icon: "success",
        title: "Evento actualizado",
        text: "Los cambios se guardaron correctamente",
        confirmButtonColor: "#581517",
        timer: 2000,
        showConfirmButton: false
      });

      // Actualizar estado local y cerrar
      onGuardar({ ...formData, imagen: formData.imagen || imageDefault });
      onClose();
    } catch (error: any) {
      console.error("Error al guardar evento:", error);
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: error.message || "No se pudieron guardar los cambios",
        confirmButtonColor: "#581517",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-xl shadow-xl p-6 relative border border-gray-200 overflow-y-auto">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-[#581517]">Editar Evento</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><X size={24} className="text-gray-500 hover:text-[#581517]" /></button>
        </div>

        {/* Imagen */}
        <section className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Imagen del Evento</h3>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-lg overflow-hidden border border-gray-300 bg-gray-50 flex items-center justify-center">
              {formData.imagen ? <img src={formData.imagen} alt="Vista previa" className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-400 w-10 h-10" />}
            </div>
            <div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-[#581517] text-white rounded-lg text-sm font-medium hover:bg-[#6e1c1e] transition-colors"><Upload size={16} /> Subir Imagen</button>
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
                <input type="text" value={formData.nombre} disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-600 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de evento</label>
                <select name="tipoEvento" value={formData.tipoEvento} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517]">
                  <option value="">Seleccionar tipo</option>
                  {tiposEventos.map((t) => (<option key={t} value={t}>{t}</option>))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Público objetivo</label>
                <select name="publico" value={formData.publico} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517]">
                  <option value="">Seleccionar</option>
                  <option value="Estudiantes">Estudiantes</option>
                  <option value="General">Público General</option>
                </select>
              </div>
            </div>
          </section>

          {/* Fechas y horarios */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Fechas y Horario</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de inicio</label>
                <input type="date" name="fechaInicio" min={hoy} value={formData.fechaInicio} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de fin</label>
                <input type="date" name="fechaFin" min={formData.fechaInicio || hoy} value={formData.fechaFin} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duración (horas)</label>
                <input type="number" name="horas" value={formData.horas} onChange={(e) => handleNumberChange("horas" as keyof Evento, Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2" min={0} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horario (texto)</label>
                <input type="text" name="horario" value={formData.horario} onChange={handleInputChange} placeholder="LUNES-MARTES 7:00 - 10:00 AM" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lugar (opcional)</label>
                <input type="text" name="lugar" value={formData.lugar} onChange={handleInputChange} placeholder="Ej. Auditorio A" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
            </div>
          </section>

          {/* Configuración del evento */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Configuración del Evento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modalidad</label>
                <select name="modalidad" value={formData.modalidad} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517]">
                  <option value="">Seleccionar modalidad</option>
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="VIRTUAL">Virtual</option>
                  <option value="HIBRIDA">Híbrida</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cupos</label>
                <input type="number" name="cupos" value={formData.cupos} onChange={(e) => handleNumberChange("cupos" as keyof Evento, Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2" min={0} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de pago</label>
                <select name="pago" value={formData.pago} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#581517]">
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
                    <input type="number" name="precioEstudiantes" value={formData.precioEstudiantes} onChange={(e) => handleNumberChange("precioEstudiantes" as keyof Evento, Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2" min={0} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio Público General</label>
                    <input type="number" name="precioGeneral" value={formData.precioGeneral} onChange={(e) => handleNumberChange("precioGeneral" as keyof Evento, Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2" min={0} />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Docente Responsable</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar docente por nombre o apellido"
                    value={docFilter}
                    onChange={(e) => setDocFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />

                  {docFilter && docFiltered.length > 0 && (
                    <ul className="absolute z-20 bg-white border border-gray-200 w-full mt-1 rounded-md max-h-44 overflow-auto">
                      {docFiltered.map((u) => (
                        <li key={u.id} className="px-3 py-2 hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectDocente(u.id, u.nombre)}>
                          {u.nombre}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">Seleccionado: <strong>{formData.docente || "Ninguno"}</strong></p>
              </div>

              {/* Asistencia opcional */}
              <div className="md:col-span-2">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={formData.requiereAsistencia} onChange={() => handleToggle("requiereAsistencia" as keyof Evento)} />
                  <span className="text-sm text-gray-700">Requiere asistencia mínima</span>
                </label>

                {formData.requiereAsistencia && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Asistencia mínima (%)</label>
                      <input type="number" name="asistenciaMinima" value={formData.asistenciaMinima} onChange={(e) => handleNumberChange("asistenciaMinima" as keyof Evento, Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2" min={0} max={100} />
                    </div>
                  </div>
                )}
              </div>

              {/* Campos específicos para CURSO */}
              {formData.tipoEvento === "CURSO" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nota mínima (0-10)</label>
                    <input type="number" name="nota" value={formData.nota} onChange={(e) => handleNumberChange("nota" as keyof Evento, Number(e.target.value))} className="w-full border border-gray-300 rounded-lg px-3 py-2" min={0} max={10} step={0.1} />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" checked={!!formData.cartaMotivacion} onChange={() => handleToggle("cartaMotivacion" as keyof Evento)} />
                      <span className="text-sm text-gray-700">Requiere carta de motivación</span>
                    </label>
                  </div>

                  {/* Mostrar asistencia mínima adicional si tipo CURSO y requiereAsistencia true (ya cubierto arriba) */}
                </>
              )}
            </div>
          </section>

          {/* Público objetivo específico (solo si Estudiantes) */}
          {formData.publico === "Estudiantes" && (
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Público - Estudiantes</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Carreras dirigidas</label>
                  <div className="flex flex-wrap gap-2">
                    {carrerasDisponibles.map((carrera) => (
                      <button key={carrera} onClick={() => handleMultiSelect("carreras" as keyof Evento, carrera)} type="button" className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${formData.carreras.includes(carrera) ? "bg-[#581517] text-white border-[#581517] shadow-sm" : "border-gray-300 text-gray-700 hover:border-[#581517] hover:text-[#581517] bg-white"}`}>
                        {carrera}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Semestres dirigidos</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {semestresDisponibles.map((semestre) => (
                      <button key={semestre} onClick={() => handleMultiSelect("semestres" as keyof Evento, semestre)} type="button" className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${formData.semestres.includes(semestre) ? "bg-[#581517] text-white border-[#581517] shadow-sm" : "border-gray-300 text-gray-700 hover:border-[#581517] hover:text-[#581517] bg-white"}`}>
                        {semestre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
          <button onClick={onClose} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors">Cancelar</button>
          <button onClick={handleGuardar} className="px-6 py-2 rounded-lg bg-[#581517] text-white hover:bg-[#6e1c1e] font-medium transition-colors shadow-sm">Guardar Cambios</button>
        </div>
      </div>
    </div>
  );
}
