/**
 * Constantes y tipos para eventos
 * Centralizados para mantener consistencia con la BD
 */

// ==========================================
// TIPO DE PÚBLICO DEL EVENTO
// ==========================================
export enum TipoPublicoEvento {
  GENERAL = 'GENERAL',
  ESTUDIANTES = 'ESTUDIANTES',
  ADMINISTRATIVOS = 'ADMINISTRATIVOS'
}

export const TIPOS_PUBLICO_PERMITIDOS = [
  TipoPublicoEvento.GENERAL,
  TipoPublicoEvento.ESTUDIANTES,
  TipoPublicoEvento.ADMINISTRATIVOS
] as const;

// ==========================================
// MODALIDAD DEL EVENTO
// ==========================================
export enum ModalidadEvento {
  PRESENCIAL = 'PRESENCIAL',
  VIRTUAL = 'VIRTUAL'
}

export const MODALIDADES_PERMITIDAS = [
  ModalidadEvento.PRESENCIAL,
  ModalidadEvento.VIRTUAL
] as const;

// ==========================================
// COSTO DEL EVENTO
// ==========================================
export enum CostoEvento {
  GRATUITO = 'GRATUITO',
  DE_PAGO = 'DE PAGO'
}

export const COSTOS_PERMITIDOS = [
  CostoEvento.GRATUITO,
  CostoEvento.DE_PAGO
] as const;

// ==========================================
// ESTADO DEL EVENTO
// ==========================================
export enum EstadoEvento {
  EDITANDO = 'EDITANDO',
  REVISION = 'REVISION',
  PUBLICADO = 'PUBLICADO'
}

export const ESTADOS_EVENTO_PERMITIDOS = [
  EstadoEvento.EDITANDO,
  EstadoEvento.REVISION,
  EstadoEvento.PUBLICADO
] as const;

// ==========================================
// HELPERS DE VALIDACIÓN
// ==========================================

/**
 * Valida si un tipo de público es válido
 */
export function esTipoPublicoValido(tipo: string): tipo is TipoPublicoEvento {
  return TIPOS_PUBLICO_PERMITIDOS.includes(tipo as TipoPublicoEvento);
}

/**
 * Valida si una modalidad es válida
 */
export function esModalidadValida(modalidad: string): modalidad is ModalidadEvento {
  return MODALIDADES_PERMITIDAS.includes(modalidad as ModalidadEvento);
}

/**
 * Valida si un costo es válido
 */
export function esCostoValido(costo: string): costo is CostoEvento {
  return COSTOS_PERMITIDOS.includes(costo as CostoEvento);
}

/**
 * Valida si un estado es válido
 */
export function esEstadoEventoValido(estado: string): estado is EstadoEvento {
  return ESTADOS_EVENTO_PERMITIDOS.includes(estado as EstadoEvento);
}
