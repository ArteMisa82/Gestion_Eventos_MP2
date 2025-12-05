/**
 * Tipos para las respuestas del backend
 */

// ==========================================
// USUARIOS Y AUTENTICACIÓN
// ==========================================

export interface Usuario {
  id_usu: number;
  cor_usu: string;
  nom_usu: string;
  nom_seg_usu?: string;
  ape_usu: string;
  ape_seg_usu?: string;
  tel_usu?: string;
  dir_usu?: string;
  fec_nac_usu?: string;
  gen_usu?: string;
  est_usu?: number;
  adm_usu?: number;
  stu_usu?: number;
  Administrador?: boolean;
  // Relaciónes opcionales (cargadas en el perfil para facilitar UI)
  eventos?: {
    id_evt: string;
    nom_evt: string;
    est_evt?: string;
  }[];

  detalle_instructores?: {
    id_det: string;
    rol_instructor?: string;
    usuarios?: {
      id_usu: number;
      nom_usu: string;
      ape_usu: string;
      cor_usu: string;
    };
  }[];
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface RegisterResponse {
  mensaje: string;
  usuario: Usuario;
}

// ==========================================
// EVENTOS
// ==========================================

export interface Evento {
  id_evt: string;
  nom_evt: string;
  fec_evt: string | Date;
  lug_evt: string;
  mod_evt: 'PRESENCIAL' | 'VIRTUAL';
  tip_pub_evt: 'GENERAL' | 'ESTUDIANTES' | 'ADMINISTRATIVOS';
  cos_evt: 'GRATUITO' | 'DE PAGO';
  des_evt: string;
  est_evt?: 'EDITANDO' | 'REVISION' | 'PUBLICADO';
  id_res_evt?: number;
  responsable?: {
    id_usu: number;
    nom_usu: string;
    ape_usu: string;
    cor_usu: string;
  };
}

export interface CreateEventoDTO {
  nom_evt: string;
  fec_evt: string;
  lug_evt: string;
  des_evt: string;
  mod_evt?: 'PRESENCIAL' | 'VIRTUAL';
  tip_pub_evt?: 'GENERAL' | 'ESTUDIANTES' | 'ADMINISTRATIVOS';
  cos_evt?: 'GRATUITO' | 'DE PAGO';
  id_responsable: number;
  detalles?: Partial<CreateDetalleDTO>;
}

// ==========================================
// DETALLES DE EVENTOS
// ==========================================

export interface DetalleEvento {
  id_evt_det: string;
  id_evt_per: string;
  cup_det: number;
  hor_det: number;
  are_det: string;
  cat_det: string;
  tip_evt: string;
  not_evt_det?: number;
  asi_evt_det?: number;
  cer_evt_det?: number;
  apr_evt_det?: number;
  est_evt_det: 'INSCRIPCIONES' | 'EN_CURSO' | 'FINALIZADO';
  instructores?: Instructor[];
  eventos?: Evento;
}

export interface Instructor {
  id_usu: number;
  rol_instructor: 'INSTRUCTOR' | 'COORDINADOR' | 'ASISTENTE' | 'CONFERENCISTA';
  usuarios: {
    id_usu: number;
    nom_usu: string;
    ape_usu: string;
    cor_usu: string;
  };
}

export interface CreateDetalleDTO {
  id_evt_per: string;
  instructores?: {
    id_usu: number;
    rol_instructor?: string;
  }[];
  cup_det: number;
  hor_det: number;
  are_det: string;
  cat_det: string;
  tip_evt: string;
  not_evt_det?: number;
  asi_evt_det?: number;
  cer_evt_det?: number;
  apr_evt_det?: number;
}

// ==========================================
// REGISTRO DE EVENTOS (Cursos por nivel)
// ==========================================

export interface RegistroEvento {
  id_reg_evt: string;
  id_evt_det: string;
  id_niv: string;
  detalle_eventos?: DetalleEvento;
  nivel?: Nivel;
  registro_personas?: InscripcionPersona[];
  inscritos_count?: number;
  cupo_disponible?: number;
}

// ==========================================
// INSCRIPCIONES
// ==========================================

export interface InscripcionPersona {
  id_reg_per: number;
  id_usu: number;
  id_reg_evt: string;
  fec_reg: Date;
  usuarios?: Usuario;
  registro_evento?: RegistroEvento;
}

export interface InscripcionResponse {
  mensaje: string;
  inscripcion: InscripcionPersona;
}

export interface EstadisticasInscripcion {
  total_inscritos: number;
  cupo_total: number;
  cupo_disponible: number;
  porcentaje_ocupacion: number;
  inscritos_por_fecha: {
    fecha: string;
    cantidad: number;
  }[];
}

// ==========================================
// ESTUDIANTES
// ==========================================

export interface Estudiante {
  id_est: number;
  id_usu: number;
  id_niv: string;
  fec_ingreso: Date;
  fec_egreso?: Date;
  est_activo: number;
  usuarios?: Usuario;
  nivel?: Nivel;
}

export interface EstudianteHistorial {
  usuario: Usuario;
  niveles: {
    id_niv: string;
    nom_niv: string;
    id_car: string;
    fec_ingreso: Date;
    fec_egreso?: Date;
    est_activo: number;
  }[];
}

// ==========================================
// CARRERAS Y NIVELES
// ==========================================

export interface Carrera {
  id_car: string;
  nom_car: string;
  des_car?: string;
  niveles?: Nivel[];
}

export interface Nivel {
  id_niv: string;
  nom_niv: string;
  id_car: string;
  des_niv?: string;
  carrera?: Carrera;
}

export interface EstadisticasCarrera {
  total_carreras: number;
  total_niveles: number;
  niveles_por_carrera: {
    id_car: string;
    nom_car: string;
    cantidad_niveles: number;
  }[];
}

// ==========================================
// FILTROS Y BÚSQUEDA
// ==========================================

export interface FiltrosEventos {
  estado?: 'EDITANDO' | 'REVISION' | 'PUBLICADO';
  busqueda?: string;
  tipo?: 'GENERAL' | 'ESTUDIANTES' | 'ADMINISTRATIVOS';
  responsable?: number;
}

export interface FiltrosCursos {
  id_evt?: string;
  id_niv?: string;
  estado?: 'INSCRIPCIONES' | 'EN_CURSO' | 'FINALIZADO';
}

// ==========================================
// RESPUESTAS GENÉRICAS
// ==========================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  mensaje?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
