/**
 * Tipos para el sistema de registros e inscripciones
 */

// ============= REGISTRO EVENTO =============
export interface CrearRegistroEventoDTO {
  id_det: string;
  id_niv: string;
}

export interface ActualizarRegistroEventoDTO {
  id_det?: string;
  id_niv?: string;
}

export interface RegistroEventoResponse {
  id_reg_evt: string;
  id_det: string;
  id_niv: string;
  detalle?: any;
  nivel?: any;
  cantidadInscritos?: number;
}

// ============= INSCRIPCIONES (registro_personas) =============
export interface CrearInscripcionDTO {
  id_usu: number;
  id_reg_evt?: string;  // Para eventos de ESTUDIANTES
  id_det?: string;      // Para eventos de PÚBLICO GENERAL
}

export interface InscripcionResponse {
  num_reg_per: number;
  id_usu: number;
  id_reg_evt: string;
  fec_reg_per: Date;
  usuario?: any;
  registro_evento?: any;
}

export interface ValidarInscripcionResult {
  valido: boolean;
  mensaje?: string;
  detalles?: {
    cupoDisponible: boolean;
    yaInscrito: boolean;
    estadoDetalle?: string;
  };
}
