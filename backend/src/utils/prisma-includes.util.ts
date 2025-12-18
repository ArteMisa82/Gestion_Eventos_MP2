/**
 * Selectores y includes reutilizables de Prisma
 * para evitar duplicación en las consultas
 */

export const USUARIO_SELECT = {
  id_usu: true,
  nom_usu: true,
  ape_usu: true,
  cor_usu: true,
  img_usu: true 
};

export const INSTRUCTOR_INCLUDE = {
  include: {
    usuarios: {
      select: USUARIO_SELECT
    }
  }
};

export const DETALLE_INCLUDES = {
  withInstructores: {
    detalle_instructores: INSTRUCTOR_INCLUDE,
    requisitos_evento: true // Incluir requisitos del detalle
  },
  full: {
    detalle_instructores: INSTRUCTOR_INCLUDE,
    requisitos_evento: true, // Incluir requisitos del detalle
    eventos: {
      include: {
        usuarios: { select: USUARIO_SELECT }
      }
    },
    registro_evento: true
  }
};

export const EVENTO_INCLUDES = {
  withUsuario: {
    usuarios: { select: USUARIO_SELECT }
  },
  withDetalles: {
    detalle_eventos: {
      include: DETALLE_INCLUDES.withInstructores
    }
  },
  full: {
    usuarios: { select: USUARIO_SELECT },
    detalle_eventos: {
      include: DETALLE_INCLUDES.withInstructores
    },
    tarifas_evento: true,
    requerimientos: true
  }
};
