/**
 * Estados permitidos para detalles de eventos
 */
export enum EstadoDetalleEvento {
  INSCRIPCIONES = 'INSCRIPCIONES',
  EN_CURSO = 'EN_CURSO',
  FINALIZADO = 'FINALIZADO'
}

/**
 * Información que se muestra según el estado del detalle
 */
export interface DetalleConEstado {
  // Datos básicos (siempre visibles)
  id_det: string;
  id_evt_per: string;
  cup_det: number;
  hor_det: number;
  are_det: string;
  cat_det: string;
  tip_evt: string;
  est_evt_det: string;
  
  // Datos según estado
  not_evt_det?: number | null;     // Solo FINALIZADO
  asi_evt_det?: number | null;     // Solo EN_CURSO y FINALIZADO
  cer_evt_det?: number;            // Solo FINALIZADO
  apr_evt_det?: number;            // Solo FINALIZADO
  
  // Datos calculados (solo FINALIZADO)
  estado_estudiante?: 'APROBADO' | 'REPROBADO' | null;
  tiene_certificado?: boolean;
  
  // Relaciones
  instructores?: any[];
  evento?: any;
  registros?: any[];               // Solo EN_CURSO y FINALIZADO
}

/**
 * Filtra los campos que deben mostrarse según el estado
 */
export function filtrarCamposPorEstado(detalle: any): DetalleConEstado {
  const estado = detalle.est_evt_det as EstadoDetalleEvento;
  
  // Datos básicos siempre visibles
  const datosBasicos = {
    id_det: detalle.id_det,
    id_evt_per: detalle.id_evt_per,
    cup_det: detalle.cup_det,
    hor_det: detalle.hor_det,
    are_det: detalle.are_det,
    cat_det: detalle.cat_det,
    tip_evt: detalle.tip_evt,
    est_evt_det: detalle.est_evt_det,
    eventos: detalle.eventos,
    detalle_instructores: detalle.detalle_instructores
  };

  switch (estado) {
    case EstadoDetalleEvento.INSCRIPCIONES:
      // INSCRIPCIONES: Solo datos básicos del curso
      return {
        ...datosBasicos,
        // Ocultar notas, asistencia, certificados, aprobados
        not_evt_det: null,
        asi_evt_det: null,
        cer_evt_det: 0,
        apr_evt_det: 0
      };

    case EstadoDetalleEvento.EN_CURSO:
      // EN_CURSO: Datos básicos + asistencia (proceso)
      return {
        ...datosBasicos,
        asi_evt_det: detalle.asi_evt_det,
        registros: detalle.registro_evento, // Mostrar estudiantes registrados
        // Ocultar notas, certificados, aprobados
        not_evt_det: null,
        cer_evt_det: 0,
        apr_evt_det: 0
      };

    case EstadoDetalleEvento.FINALIZADO:
      // FINALIZADO: Todos los datos + campos calculados
      const aprobado = (detalle.not_evt_det && detalle.not_evt_det >= 7) ? 'APROBADO' : 'REPROBADO';
      const tieneCertificado = detalle.cer_evt_det === 1;
      
      return {
        ...datosBasicos,
        not_evt_det: detalle.not_evt_det,
        asi_evt_det: detalle.asi_evt_det,
        cer_evt_det: detalle.cer_evt_det,
        apr_evt_det: detalle.apr_evt_det,
        registros: detalle.registro_evento,
        // Campos calculados
        estado_estudiante: aprobado,
        tiene_certificado: tieneCertificado
      };

    default:
      return datosBasicos;
  }
}

/**
 * Valida que la transición de estado sea válida
 */
export function validarTransicionEstado(
  estadoActual: EstadoDetalleEvento,
  nuevoEstado: EstadoDetalleEvento
): { valido: boolean; mensaje?: string } {
  // Transiciones permitidas
  const transicionesPermitidas: Record<EstadoDetalleEvento, EstadoDetalleEvento[]> = {
    [EstadoDetalleEvento.INSCRIPCIONES]: [EstadoDetalleEvento.EN_CURSO],
    [EstadoDetalleEvento.EN_CURSO]: [EstadoDetalleEvento.FINALIZADO],
    [EstadoDetalleEvento.FINALIZADO]: [] // No se puede cambiar desde FINALIZADO
  };

  const permitidas = transicionesPermitidas[estadoActual] || [];
  
  if (!permitidas.includes(nuevoEstado)) {
    return {
      valido: false,
      mensaje: `No se puede cambiar de estado ${estadoActual} a ${nuevoEstado}. Transiciones permitidas: ${permitidas.join(', ') || 'ninguna'}`
    };
  }

  return { valido: true };
}

/**
 * Valida que los campos requeridos estén presentes según el nuevo estado
 */
export function validarCamposRequeridos(
  nuevoEstado: EstadoDetalleEvento,
  datos: any
): { valido: boolean; mensaje?: string } {
  switch (nuevoEstado) {
    case EstadoDetalleEvento.EN_CURSO:
      // Para pasar a EN_CURSO, debe tener estudiantes registrados
      if (!datos.tiene_registros) {
        return {
          valido: false,
          mensaje: 'No se puede iniciar el curso sin estudiantes registrados'
        };
      }
      break;

    case EstadoDetalleEvento.FINALIZADO:
      // Para FINALIZAR, debe tener asistencia registrada
      if (datos.asi_evt_det === null || datos.asi_evt_det === undefined) {
        return {
          valido: false,
          mensaje: 'Debe registrar la asistencia antes de finalizar el curso'
        };
      }
      break;
  }

  return { valido: true };
}
