/**
 * Servicio centralizado para comunicación con el backend
 * Base URL: http://localhost:3001/api
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Headers comunes para todas las peticiones
 * NOTA: El parámetro token se mantiene por compatibilidad pero no se usa
 * porque el sistema usa cookies de sesión (express-session)
 */
const getHeaders = (token?: string): HeadersInit => {
  return {
    'Content-Type': 'application/json',
  };
};

/**
 * Opciones de fetch con credentials para cookies de sesión
 */
const getFetchOptions = (method: string = 'GET', body?: any): RequestInit => {
  const options: RequestInit = {
    method,
    headers: getHeaders(),
    credentials: 'include', // ✅ IMPORTANTE: Incluir cookies de sesión
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  return options;
};

/**
 * Manejo de errores de la API
 */
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || data.error || `Error ${response.status}`);
  }
  
  // Si el backend devuelve { success, data }, devolvemos solo data
  // Si no tiene esa estructura, devolvemos todo
  return data.data || data;
};

// ==========================================
// 🔐 AUTENTICACIÓN
// ==========================================

export const authAPI = {
  /**
   * Iniciar sesión
   * POST /api/auth/login
   */
  login: async (cor_usu: string, password: string) => {
    // El backend espera { email, password } y usa sesiones.
    const response = await fetch(`${API_URL}/auth/login`, {
      ...getFetchOptions('POST', { email: cor_usu, password }),
      headers: getHeaders(),
      credentials: 'include',                // <- importante: enviar/recibir cookie de sesión
      body: JSON.stringify({ email: cor_usu, password }), // <- claves que el backend espera
    });
    return handleResponse(response);
  },

  /**
   * Registro de usuario
   * POST /api/auth/registro
   */
  register: async (userData: {
    cor_usu: string;
    pas_usu: string;
    nom_usu: string;
    ape_usu: string;
    tel_usu?: string;
    dir_usu?: string;
  }) => {
    const response = await fetch(`${API_URL}/auth/registro`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  /**
   * Verificar token
   * GET /api/auth/verificar
   */
  verifyToken: async (token: string) => {
    const response = await fetch(`${API_URL}/auth/verificar`, {
      headers: getHeaders(token),
      credentials: 'include',
    });
    return handleResponse(response);
  },
  
  /**
   * Solicitar recuperación de contraseña
   * POST /api/auth/forgot-password
   */
  forgotPassword: async (email: string) => {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ email }),
    });
    return handleResponse(response);
  },

  /**
   * Restablecer contraseña
   * POST /api/auth/reset-password
   */
  resetPassword: async (token: string, newPassword: string) => {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ token, newPassword }),
    });
    return handleResponse(response);
  },

  /**
   * Verificar token de reset
   * POST /api/auth/verify-reset-token
   */
  verifyResetToken: async (token: string) => {
    const response = await fetch(`${API_URL}/auth/verify-reset-token`, {
      method: 'POST',
      headers: getHeaders(),
      credentials: 'include',
      body: JSON.stringify({ token }),
    });
    return handleResponse(response);
  },

  /**
   * Enviar código de verificación por email (usa sesión/cookies)
   * POST /api/auth/send-verification
   */
  sendVerification: async (token?: string) => {
    const response = await fetch(`${API_URL}/auth/send-verification`, {
      method: 'POST',
      headers: getHeaders(token),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  /**
   * Verificar código de email (requiere sesión)
   * POST /api/auth/verify-email
   */
  verifyEmail: async (token?: string, code?: string) => {
    const response = await fetch(`${API_URL}/auth/verify-email`, {
      method: 'POST',
      headers: getHeaders(token),
      credentials: 'include',
      body: JSON.stringify({ code }),
    });
    return handleResponse(response);
  },

  /**
   * Logout (usa sesión/cookies)
   * POST /api/auth/logout
   */
  logout: async (token?: string) => {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: getHeaders(token),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  /**
   * Obtener perfil (usa sesión)
   * GET /api/auth/profile
   */
  getProfile: async (token?: string) => {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: getHeaders(token),
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

// ==========================================
// 📅 EVENTOS
// ==========================================

export const eventosAPI = {
  /**
   * Obtener todos los eventos (ADMIN)
   * GET /api/eventos
   */
  getAll: async (filters?: {
    estado?: string;
    busqueda?: string;
    tipo?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.busqueda) params.append('busqueda', filters.busqueda);
    if (filters?.tipo) params.append('tipo', filters.tipo);
    
    const response = await fetch(`${API_URL}/eventos?${params}`, getFetchOptions());
    return handleResponse(response);
  },

  /**
   * Obtener evento por ID
   * GET /api/eventos/:id
   */
  getById: async (id: string) => {
    const response = await fetch(`${API_URL}/eventos/${id}`, getFetchOptions());
    return handleResponse(response);
  },

  /**
   * Crear evento (ADMIN)
   * POST /api/eventos
   */
  create: async (eventoData: {
    nom_evt: string;
    fec_evt: string;
    lug_evt: string;
    des_evt: string;
    mod_evt?: string; // PRESENCIAL, VIRTUAL
    tip_pub_evt?: string; // GENERAL, ESTUDIANTES, ADMINISTRATIVOS
    cos_evt?: string; // GRATUITO, DE PAGO
    id_responsable: number;
    detalles?: any;
  }) => {
    const response = await fetch(`${API_URL}/eventos`, getFetchOptions('POST', eventoData));
    return handleResponse(response);
  },

  /**
   * Actualizar evento (ADMIN)
   * PUT /api/eventos/:id
   */
  update: async (id: string, eventoData: any) => {
    const response = await fetch(`${API_URL}/eventos/${id}`, getFetchOptions('PUT', eventoData));
    return handleResponse(response);
  },

  /**
   * Eliminar evento (ADMIN)
   * DELETE /api/eventos/:id
   */
  delete: async (id: string) => {
    const response = await fetch(`${API_URL}/eventos/${id}`, getFetchOptions('DELETE'));
    return handleResponse(response);
  },

  /**
   * Obtener eventos asignados a un responsable
   * GET /api/eventos/responsable/:id
   */
  getByResponsable: async (idResponsable: number) => {
    const response = await fetch(`${API_URL}/eventos/responsable/${idResponsable}`, getFetchOptions());
    return handleResponse(response);
  },

  /**
   * Obtener lista de usuarios administrativos (para asignar como responsables)
   * GET /api/eventos/usuarios/administrativos
   */
  getResponsables: async () => {
    const response = await fetch(`${API_URL}/eventos/usuarios/administrativos`, getFetchOptions());
    return handleResponse(response);
  },

  /**
   * Obtener eventos asignados al usuario autenticado (mis eventos)
   * GET /api/eventos/mis-eventos
   */
  getMisEventos: async () => {
    const response = await fetch(`${API_URL}/eventos/mis-eventos`, getFetchOptions());
    return handleResponse(response);
  },

  /**
   * Obtener usuarios que son responsables activos de algún curso
   * GET /api/eventos/usuarios/responsables-activos
   */
  getResponsablesActivos: async () => {
    const response = await fetch(`${API_URL}/eventos/usuarios/responsables-activos`, getFetchOptions());
    return handleResponse(response);
  },

  /**
   * Obtener eventos publicados (PÚBLICO - sin token)
   * GET /api/eventos/publicos
   */
  getPublicados: async (filters?: {
    mod_evt?: string;
    tip_pub_evt?: string;
    cos_evt?: string;
    busqueda?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.mod_evt) params.append('mod_evt', filters.mod_evt);
    if (filters?.tip_pub_evt) params.append('tip_pub_evt', filters.tip_pub_evt);
    if (filters?.cos_evt) params.append('cos_evt', filters.cos_evt);
    if (filters?.busqueda) params.append('busqueda', filters.busqueda);
    
    const response = await fetch(`${API_URL}/eventos/publicos?${params}`, {
      headers: getHeaders(), // Sin token - es público
    });
    return handleResponse(response);
  },
};

// ==========================================
// 📋 DETALLES DE EVENTOS
// ==========================================

export const detallesAPI = {
  /**
   * Obtener detalles de un evento
   * GET /api/detalles/:id_evt
   */
  getByEvento: async (id_evt: string, token?: string) => {
    const response = await fetch(`${API_URL}/detalles/${id_evt}`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * Crear detalle de evento
   * POST /api/detalles
   */
  create: async (token: string, detalleData: any) => {
    const response = await fetch(`${API_URL}/detalles`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(detalleData),
    });
    return handleResponse(response);
  },

  /**
   * Actualizar detalle de evento
   * PUT /api/detalles/:id
   */
  update: async (token: string, id: string, detalleData: any) => {
    const response = await fetch(`${API_URL}/detalles/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(detalleData),
    });
    return handleResponse(response);
  },

  /**
   * Cambiar estado del detalle
   * POST /api/detalles/:id/estado
   */
  cambiarEstado: async (token: string, id: string, nuevoEstado: string) => {
    const response = await fetch(`${API_URL}/detalles/${id}/estado`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify({ nuevoEstado }),
    });
    return handleResponse(response);
  },
};

// ==========================================
// 📝 REGISTRO DE EVENTOS (Cursos por nivel)
// ==========================================

export const registroEventoAPI = {
  /**
   * Obtener cursos para estudiante
   * GET /api/registro-evento/estudiante/:id_usu
   */
  getCursosEstudiante: async (token: string, id_usu: number) => {
    const response = await fetch(`${API_URL}/registro-evento/estudiante/${id_usu}`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * Obtener cursos filtrados (ADMIN/ENCARGADO)
   * GET /api/registro-evento/filtrados
   */
  getCursosFiltrados: async (token: string, filters?: {
    id_evt?: string;
    id_niv?: string;
    estado?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.id_evt) params.append('id_evt', filters.id_evt);
    if (filters?.id_niv) params.append('id_niv', filters.id_niv);
    if (filters?.estado) params.append('estado', filters.estado);
    
    const response = await fetch(`${API_URL}/registro-evento/filtrados?${params}`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * Crear registro de evento (vincular detalle con nivel)
   * POST /api/registro-evento
   */
  create: async (token: string, data: {
    id_evt_det: string;
    id_niv: string;
  }) => {
    const response = await fetch(`${API_URL}/registro-evento`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// ==========================================
// 👥 INSCRIPCIONES
// ==========================================

export const inscripcionesAPI = {
  /**
   * Inscribir usuario a un evento
   * POST /api/inscripciones
   */
  inscribir: async (token: string, data: {
    id_usu: number;
    id_reg_evt: string;
  }) => {
    const response = await fetch(`${API_URL}/inscripciones`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Validar si un usuario puede inscribirse
   * POST /api/inscripciones/validar
   */
  validar: async (token: string, data: {
    id_usu: number;
    id_reg_evt: string;
  }) => {
    const response = await fetch(`${API_URL}/inscripciones/validar`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Obtener inscripciones de un usuario
   * GET /api/inscripciones/usuario/:id
   */
  getByUsuario: async (token: string, id_usu: number) => {
    const response = await fetch(`${API_URL}/inscripciones/usuario/${id_usu}`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * Obtener inscripciones de un curso
   * GET /api/inscripciones/registro/:id
   */
  getByCurso: async (token: string, id_reg_evt: string) => {
    const response = await fetch(`${API_URL}/inscripciones/registro/${id_reg_evt}`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * Cancelar inscripción
   * DELETE /api/inscripciones/:id
   */
  cancelar: async (token: string, id: number) => {
    const response = await fetch(`${API_URL}/inscripciones/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * Obtener estadísticas de inscripciones
   * GET /api/inscripciones/estadisticas/:id_reg_evt
   */
  getEstadisticas: async (token: string, id_reg_evt: string) => {
    const response = await fetch(`${API_URL}/inscripciones/estadisticas/${id_reg_evt}`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },
};

// ==========================================
// 🎓 ESTUDIANTES
// ==========================================

export const estudiantesAPI = {
  /**
   * Asignar estudiante a un nivel
   * POST /api/estudiantes/asignar
   */
  asignarNivel: async (token: string, data: {
    id_usu: number;
    id_niv: string;
    fec_ingreso?: string;
  }) => {
    const response = await fetch(`${API_URL}/estudiantes/asignar`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Desactivar estudiante de un nivel
   * POST /api/estudiantes/desactivar
   */
  desactivarNivel: async (token: string, data: {
    id_usu: number;
    id_niv: string;
    fec_egreso?: string;
  }) => {
    const response = await fetch(`${API_URL}/estudiantes/desactivar`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Obtener estudiantes por nivel
   * GET /api/estudiantes/nivel/:id_niv
   */
  getByNivel: async (token: string, id_niv: string) => {
    const response = await fetch(`${API_URL}/estudiantes/nivel/${id_niv}`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * Obtener historial de un estudiante
   * GET /api/estudiantes/historial/:id_usu
   */
  getHistorial: async (token: string, id_usu: number) => {
    const response = await fetch(`${API_URL}/estudiantes/historial/${id_usu}`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },
};

// ==========================================
// 🏫 CARRERAS
// ==========================================

export const carrerasAPI = {
  /**
   * Obtener todas las carreras
   * GET /api/carreras
   */
  getAll: async (token?: string) => {
    const response = await fetch(`${API_URL}/carreras`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * Obtener carrera por ID
   * GET /api/carreras/:id
   */
  getById: async (id: string, token?: string) => {
    const response = await fetch(`${API_URL}/carreras/${id}`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * Crear carrera (ADMIN)
   * POST /api/carreras
   */
  create: async (token: string, data: {
    id_car: string;
    nom_car: string;
    des_car?: string;
  }) => {
    const response = await fetch(`${API_URL}/carreras`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Actualizar carrera (ADMIN)
   * PUT /api/carreras/:id
   */
  update: async (token: string, id: string, data: any) => {
    const response = await fetch(`${API_URL}/carreras/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Eliminar carrera (ADMIN)
   * DELETE /api/carreras/:id
   */
  delete: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/carreras/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * Obtener estadísticas
   * GET /api/carreras/estadisticas
   */
  getEstadisticas: async (token: string) => {
    const response = await fetch(`${API_URL}/carreras/estadisticas`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },
};

// ==========================================
// 📚 NIVELES
// ==========================================

export const nivelesAPI = {
  /**
   * Obtener todos los niveles
   * GET /api/niveles
   */
  getAll: async (token?: string) => {
    const response = await fetch(`${API_URL}/niveles`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * Obtener niveles por carrera
   * GET /api/niveles/carrera/:id_car
   */
  getByCarrera: async (id_car: string, token?: string) => {
    const response = await fetch(`${API_URL}/niveles/carrera/${id_car}`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * Obtener nivel por ID
   * GET /api/niveles/:id
   */
  getById: async (id: string, token?: string) => {
    const response = await fetch(`${API_URL}/niveles/${id}`, {
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },

  /**
   * Crear nivel (ADMIN)
   * POST /api/niveles
   */
  create: async (token: string, data: {
    id_niv: string;
    nom_niv: string;
    id_car: string;
    des_niv?: string;
  }) => {
    const response = await fetch(`${API_URL}/niveles`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Actualizar nivel (ADMIN)
   * PUT /api/niveles/:id
   */
  update: async (token: string, id: string, data: any) => {
    const response = await fetch(`${API_URL}/niveles/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  /**
   * Eliminar nivel (ADMIN)
   * DELETE /api/niveles/:id
   */
  delete: async (token: string, id: string) => {
    const response = await fetch(`${API_URL}/niveles/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(response);
  },
};

// ==========================================
// 👤 USUARIOS
// ==========================================

export const usuariosAPI = {
  /**
   * Obtener todos los usuarios del sistema
   * GET /api/users
   */
  getAll: async () => {
    const response = await fetch(`${API_URL}/users`, getFetchOptions());
    return handleResponse(response);
  },

  /**
   * Obtener usuario por cédula
   * GET /api/users/:ced
   */
  getByCedula: async (cedula: string) => {
    const response = await fetch(`${API_URL}/users/${cedula}`, getFetchOptions());
    return handleResponse(response);
  },
};

export default {
  auth: authAPI,
  eventos: eventosAPI,
  detalles: detallesAPI,
  registroEvento: registroEventoAPI,
  inscripciones: inscripcionesAPI,
  estudiantes: estudiantesAPI,
  carreras: carrerasAPI,
  niveles: nivelesAPI,
  usuarios: usuariosAPI,
};
