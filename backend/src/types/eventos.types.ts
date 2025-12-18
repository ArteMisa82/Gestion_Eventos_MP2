// DTOs para eventos
export interface CreateEventoDto {
  nom_evt: string;
  fec_evt: string | Date;
  fec_fin_evt?: string | Date; // Fecha de finalización
  lug_evt: string;
  des_evt: string;
  mod_evt?: string; // Modalidad: PRESENCIAL, VIRTUAL
  tip_pub_evt?: string; // Tipo público: GENERAL, ESTUDIANTES, ADMINISTRATIVOS
  cos_evt?: string; // Costo: GRATUITO, DE PAGO
  ima_evt?: string; // URL de imagen o Base64
  id_responsable: number; // Responsable asignado (OBLIGATORIO - todo evento debe tener responsable)
  // Detalles opcionales para crear en la misma petición (solo ADMIN)
  detalles?: Omit<CreateDetalleEventoDto, 'id_evt_per'>;
}

export interface UpdateEventoDto {
  nom_evt?: string;
  fec_evt?: string | Date;
  fec_fin_evt?: string | Date; // Fecha de finalización
  lug_evt?: string;
  mod_evt?: string;
  tip_pub_evt?: string;
  cos_evt?: string;
  des_evt?: string;
  est_evt?: string; // Estado: EDITANDO, PLANIFICADO, EN CURSO, FINALIZADO, CANCELADO
  ima_evt?: string; // URL de imagen o Base64
  id_responsable?: number; // Solo ADMIN puede cambiar el responsable
  carreras?: string[]; // Carreras objetivo del evento
  semestres?: string[]; // Semestres objetivo del evento
  docentes?: string[]; // Docentes/Instructores del evento
  categoria?: string; // Categoría personalizada del evento
  requisitosCategoria?: string[]; // Requisitos basados en categoría
  detalles?: {
    cup_det?: number;
    hor_det?: number;
    cat_det?: string;  // Usar cat_det en lugar de tip_evt
    are_det?: string;
    not_min_evt?: number;  // 🆕 Nota mínima (0-10)
    asi_evt_det?: number;  // 🆕 Asistencia mínima (0-100%)
  };
  requisitos?: Array<{  // 🆕 Requisitos específicos del evento
    tip_req: string;    // Tipo de requisito (ej: "Carta de Motivación", "Diploma")
    des_req?: string;   // Descripción del requisito
    obligatorio?: boolean;  // Si es obligatorio
  }>;
}

export interface AsignarResponsableDto {
  id_responsable: number;
}

// Respuesta de evento con información del responsable
export interface EventoResponse {
  id_evt: string;
  nom_evt: string;
  fec_evt: Date;
  fec_fin_evt?: Date | null; // Fecha de finalización
  lug_evt: string;
  mod_evt: string;
  tip_pub_evt: string;
  cos_evt: string;
  des_evt: string;
  est_evt: string | null;
  ima_evt: string | null;
  id_res_evt: number | null;
  responsable?: {
    id_usu: number;
    nom_usu: string;
    ape_usu: string;
    cor_usu: string;
  };
}

// Usuario administrativo (para listar responsables)
export interface UsuarioAdministrativoDto {
  id_usu: number;
  nom_usu: string;
  ape_usu: string;
  cor_usu: string;
}

// ==========================================
// DTOs para DETALLE_EVENTOS
// ==========================================

// DTO para crear instructor
export interface InstructorDto {
  id_usu: number; // ID del instructor (debe tener adm_usu = 1)
  rol_instructor?: string; // INSTRUCTOR | COORDINADOR | ASISTENTE | CONFERENCISTA
}

export interface CreateDetalleEventoDto {
  id_evt_per: string; // ID del evento padre
  instructores?: InstructorDto[]; // Array de instructores (opcional, uno o varios)
  cup_det: number; // Cupo
  hor_det: number; // Horas
  are_det: string; // Área
  cat_det: string; // Categoría
  tip_evt: string; // Tipo de evento
  not_min_evt?: number; // Nota mínima (antes not_evt_det)
  not_fin_evt?: number; // Nota final (NUEVO)
  asi_evt_det?: number; // Porcentaje de asistencia 0-100 (antes era decimal)
  cer_evt_det?: number; // Certificado (0 o 1)
  apr_evt_det?: number; // Aprobado (0 o 1)
}

export interface UpdateDetalleEventoDto {
  instructores?: InstructorDto[]; // Array de instructores para actualizar
  cup_det?: number;
  hor_det?: number;
  are_det?: string;
  cat_det?: string;
  tip_evt?: string;
  not_min_evt?: number; // Nota mínima (antes not_evt_det)
  not_fin_evt?: number; // Nota final (NUEVO)
  asi_evt_det?: number; // Porcentaje de asistencia 0-100 (antes era decimal)
  cer_evt_det?: number;
  apr_evt_det?: number;
  est_evt_det?: string; // Estado: INSCRIPCIONES, EN CURSO, FINALIZADO, etc.
}
