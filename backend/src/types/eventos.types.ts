// DTOs para eventos
export interface CreateEventoDto {
  nom_evt: string;
  fec_evt: string | Date;
  lug_evt: string;
  des_evt: string;
  mod_evt?: string; // Modalidad: Presencial, Virtual, Híbrido
  tip_pub_evt?: string; // Tipo público: Público, Privado, Restringido
  cos_evt?: string; // Costo: Gratuito, Pagado
  id_responsable?: number; // Responsable asignado (opcional en creación)
}

export interface UpdateEventoDto {
  nom_evt?: string;
  fec_evt?: string | Date;
  lug_evt?: string;
  mod_evt?: string;
  tip_pub_evt?: string;
  cos_evt?: string;
  des_evt?: string;
  est_evt?: string; // Estado: EDITANDO, PLANIFICADO, EN CURSO, FINALIZADO, CANCELADO
}

export interface AsignarResponsableDto {
  id_responsable: number;
}

// Respuesta de evento con información del responsable
export interface EventoResponse {
  id_evt: string;
  nom_evt: string;
  fec_evt: Date;
  lug_evt: string;
  mod_evt: string;
  tip_pub_evt: string;
  cos_evt: string;
  des_evt: string;
  est_evt: string | null;
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

export interface CreateDetalleEventoDto {
  id_evt_per: string; // ID del evento padre
  id_usu_doc?: number; // Instructor/Docente (opcional)
  cup_det: number; // Cupo
  hor_det: number; // Horas
  are_det: string; // Área
  cat_det: string; // Categoría
  tip_evt: string; // Tipo de evento
  not_evt_det?: number; // Nota mínima
  asi_evt_det?: number; // Asistencia mínima
  cer_evt_det?: number; // Certificado (0 o 1)
  apr_evt_det?: number; // Aprobado (0 o 1)
}

export interface UpdateDetalleEventoDto {
  id_usu_doc?: number;
  cup_det?: number;
  hor_det?: number;
  are_det?: string;
  cat_det?: string;
  tip_evt?: string;
  not_evt_det?: number;
  asi_evt_det?: number;
  cer_evt_det?: number;
  apr_evt_det?: number;
  est_evt_det?: string; // Estado: INSCRIPCIONES, EN CURSO, FINALIZADO, etc.
}
