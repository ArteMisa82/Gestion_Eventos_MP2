// ==========================================
// ðŸ’¸ TARIFAS DE EVENTO
// ==========================================

export const tarifasAPI = {
  /**
   * Crear o actualizar tarifa de evento
   * POST /api/tarifas-evento
   */
  createOrUpdate: async (tarifaData: {
    id_evt: string;
    tip_par: 'ESTUDIANTE' | 'PERSONA';
    val_evt: number;
  }) => {
    const response = await fetch(`${API_URL}/tarifas-evento`, getFetchOptions('POST', tarifaData));
    return handleResponse(response);
  },
};
/**
 * Servicio centralizado para comunicaciÃ³n con el backend
 * Base URL: http://localhost:3001/api
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Headers comunes para todas las peticiones
 * Incluye el token JWT si estÃ¡ disponible
 */
const getHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Intentar obtener token del localStorage si no se proporciona uno
  if (!token && typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      token = storedToken;
    }
  }
  
  // Agregar Authorization header si hay token
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Opciones de fetch con credentials para cookies de sesiÃ³n
 */
const getFetchOptions = (method: string = 'GET', body?: any): RequestInit => {
  const options: RequestInit = {
    method,
    headers: getHeaders(),
    credentials: 'include', // âœ… IMPORTANTE: Incluir cookies de sesiÃ³n
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
  let data;
  
  try {
    data = await response.json();
  } catch (e) {
    throw new Error(`Error al parsear la respuesta JSON: ${response.statusText}`);
  }
  
  if (!response.ok) {
    const errorMessage = data?.message || data?.error || `Error ${response.status}: ${response.statusText}`;
    throw new Error(errorMessage);
  }
  
  // El backend siempre devuelve { success: true/false, data?: any, message?: string }
  if (data.success === false) {
    throw new Error(data.message || 'Error desconocido del servidor');
  }
  
  // Devolver la respuesta completa para que el frontend pueda manejar success y data
  return data;
};

// ==========================================
// ðŸ” AUTENTICACIÃ“N
// ==========================================

export const authAPI = {
  /**
   * Iniciar sesiÃ³n
   * POST /api/auth/login
   */
  login: async (cor_usu: string, password: string) => {
    // El backend espera { email, password } y usa sesiones.
    const response = await fetch(`${API_URL}/auth/login`, {
      ...getFetchOptions('POST', { email: cor_usu, password }),
      headers: getHeaders(),
      credentials: 'include',                // <- importante: enviar/recibir cookie de sesiÃ³n
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
   * Solicitar recuperaciÃ³n de contraseÃ±a
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
   * Restablecer contraseÃ±a
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
   * Enviar cÃ³digo de verificaciÃ³n por email (usa sesiÃ³n/cookies)
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
   * Verificar cÃ³digo de email (requiere sesiÃ³n)
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
   * Logout (usa sesiÃ³n/cookies)
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
   * Obtener perfil (usa sesiÃ³n)
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
// ðŸ“… EVENTOS
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
   * Obtener evento por ID (endpoint pÃºblico)
   * GET /api/eventos/publico/:id
   */
  getById: async (id: string) => {
    // Intentar primero el endpoint pÃºblico (sin autenticaciÃ³n)
    try {
      const response = await fetch(`${API_URL}/eventos/publico/${id}`);
      if (response.ok) {
        return handleResponse(response);
      }
    } catch (error) {
      console.log('Error en endpoint pÃºblico, intentando con autenticaciÃ³n:', error);
    }
    
    // Fallback: endpoint con autenticaciÃ³n
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
   * Obtener detalles de un evento
   * GET /api/eventos/:id/detalles
   */
  getDetallesPorEvento: async (idEvento: string) => {
    const response = await fetch(`${API_URL}/eventos/${idEvento}/detalles`, getFetchOptions());
    return handleResponse(response);
  },

  /**
<<<<<<< HEAD
   * Obtener inscritos con datos de evaluación para un evento
   * Nota: el backend expone calificaciones por id_det (detalle), no por id_evt.
   * Aquí intentamos obtener el detalle del evento y luego llamar al endpoint
   * de calificaciones correspondiente.
   */
  getInscritosConEvaluacion: async (id_evt: string) => {
    // obtener detalles del evento
    const detallesResp = await fetch(`${API_URL}/detalles/${id_evt}`, getFetchOptions());
    const detalles = await handleResponse(detallesResp);

    // handleResponse devuelve { success, data }
    const detallesData = detalles.data || detalles;
    if (!Array.isArray(detallesData) || detallesData.length === 0) {
      return { success: true, data: [] };
    }

    // Elegimos el primer detalle (se puede mejorar la lógica si se necesita otro criterio)
    const detalle = detallesData[0];
    const id_det = detalle.id_det;

    // Llamar a calificaciones para ese detalle
    const resp = await fetch(`${API_URL}/calificaciones/${id_det}`, getFetchOptions());
    return handleResponse(resp);
  },

  /**
   * Guardar (actualizar) asistencia / notas para múltiples inscritos
   * Mapea los datos a la estructura que espera el backend y usa asignar-lote
   */
  guardarAsistencia: async (id_evt: string, datos: any[]) => {
    // obtener detalle asociado al evento
    const detallesResp = await fetch(`${API_URL}/detalles/${id_evt}`, getFetchOptions());
    const detalles = await handleResponse(detallesResp);
    const detallesData = detalles.data || detalles;
    if (!Array.isArray(detallesData) || detallesData.length === 0) {
      throw new Error('No se encontró detalle para el evento');
    }

    const id_det = detallesData[0].id_det;

    // preparar payload: backend acepta { calificaciones: AsignarNotaDTO[] }
    const calificacionesPayload = datos.map(d => ({
      id_reg_per: d.id || d.id_reg_per,
      not_fin_evt: d.nota === undefined ? undefined : d.nota,
      asi_evt_det: d.asistio === undefined ? undefined : (typeof d.asistio === 'boolean' ? (d.asistio ? 100 : 0) : d.asistio)
    }));

    const response = await fetch(`${API_URL}/calificaciones/${id_det}/asignar-lote`, getFetchOptions('PUT', { calificaciones: calificacionesPayload }));
    return handleResponse(response);
  },

  /**
   * Marcar evaluación como completada. El backend no tiene un endpoint específico
   * para esto en el proyecto actual, así que por ahora lo registramos localmente
   * devolviendo éxito para que la UI pueda actualizar el estado sin crash.
   * (Si más adelante se agrega un endpoint, cambiar la implementación para persistir)
   */
  marcarEvaluacionCompleta: async (id_evt: string) => {
    // Intentamos localizar el detalle para posible futura persistencia
    try {
      const detallesResp = await fetch(`${API_URL}/detalles/${id_evt}`, getFetchOptions());
      const detalles = await handleResponse(detallesResp);
      const detallesData = detalles.data || detalles;

      if (Array.isArray(detallesData) && detallesData.length > 0) {
        // no-op on server for now; return success shape
        return { success: true, message: 'Marcado localmente (pendiente persistencia en backend)' };
      }
      return { success: true, message: 'Marcado localmente (sin detalle asociado)' };
    } catch (err: any) {
      // No queremos romper la UI si el backend no soporta persistencia
      return { success: true, message: 'Marcado localmente' };
    }
  },

  /**
   * Obtener usuarios que son responsables activos de algún curso
=======
   * Obtener usuarios que son responsables activos de algÃºn curso
>>>>>>> 1c12c3f45b1a24c507403e2343ef7cabeeb949d8
   * GET /api/eventos/usuarios/responsables-activos
   */
  getResponsablesActivos: async () => {
    const response = await fetch(`${API_URL}/eventos/usuarios/responsables-activos`, getFetchOptions());
    return handleResponse(response);
  },

  /**
   * Obtener eventos publicados (PÃšBLICO - sin token)
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
      headers: getHeaders(), // Sin token - es pÃºblico
    });
    return handleResponse(response);
  },
};

// ==========================================
// ðŸ“‹ DETALLES DE EVENTOS
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
// ðŸ“ REGISTRO DE EVENTOS (Cursos por nivel)
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
   * Obtener registros por detalle de evento
   * GET /api/registro-evento/detalle/:id_det
   */
  getPorDetalle: async (token: string, id_det: string) => {
    const response = await fetch(`${API_URL}/registro-evento/detalle/${id_det}`, {
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
// ðŸ‘¥ INSCRIPCIONES
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
   * Cancelar inscripciÃ³n
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
   * Obtener estadÃ­sticas de inscripciones
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
// ðŸŽ“ ESTUDIANTES
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
// ðŸ« CARRERAS
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
   * Obtener estadÃ­sticas
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
// ðŸ“š NIVELES
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
// ðŸ‘¤ USUARIOS
// ==========================================

export const usuariosAPI = {
  /**
   * Obtener todos los usuarios del sistema
   * GET /api/user
   */
  getAll: async () => {
    const response = await fetch(`${API_URL}/user`, getFetchOptions());
    return handleResponse(response);
  },

  /**
   * Obtener usuario por cÃ©dula
   * GET /api/user/ced/:ced
   */
  getByCedula: async (cedula: string) => {
    const response = await fetch(`${API_URL}/user/ced/${cedula}`, getFetchOptions());
    return handleResponse(response);
  },

  /**
   * Obtener usuario por ID
   * GET /api/user/id/:id
   */
  getById: async (id: number) => {
    const response = await fetch(`${API_URL}/user/id/${id}`, getFetchOptions());
    return handleResponse(response);
  },

  /**
   * Actualizar usuario por ID
   * PUT /api/user/:id
   */
  updateById: async (id: number, data: any) => {
    const response = await fetch(`${API_URL}/user/${id}`, {
      ...getFetchOptions('PUT', data),
    });
    return handleResponse(response);
  },
};


/* ==========================================
   ⭐ FAVORITOS (EVENTOS)
   ========================================== */
export const favoritesAPI = {
  /**
   * Obtener lista pública de eventos favoritos
   * GET /api/eventos/favoritos/list
   */
  getList: async () => {
    const response = await fetch(`${API_URL}/eventos/favoritos/list`, getFetchOptions());
    return handleResponse(response);
  },

  /**
   * Marcar / desmarcar favorito (ADMIN)
   * PATCH /api/eventos/:id_evt/favorito
   * Body: { favorito: boolean }
   */
  toggle: async (id_evt: string, favorito: boolean) => {
    const response = await fetch(`${API_URL}/eventos/${id_evt}/favorito`, getFetchOptions('PATCH', { favorito }));
    return handleResponse(response);
  },
};


/* ==========================================
   ðŸ“Š DASHBOARD (ADMIN)
   ========================================== */
export const dashboardAPI = {
  /**
   * Obtener resumen del dashboard (ADMIN)
   * GET /api/admin/dashboard/summary
   * Devuelve { success, data: DashboardSummary, message }
   */
  getSummary: async () => {
    const response = await fetch(`${API_URL}/admin/dashboard/summary`, getFetchOptions());
    return handleResponse(response);
  },
};

/* ==========================================
   ðŸ"� CALIFICACIONES
   ========================================== */
export const calificacionesAPI = {
  /**
   * Obtener calificaciones de un evento
   * GET /api/calificaciones/:idDetalle
   */
  obtenerCalificaciones: async (idDetalle: string) => {
    const response = await fetch(`${API_URL}/calificaciones/${idDetalle}`, getFetchOptions());
    return handleResponse(response);
  },

  /**
   * Asignar calificación a un participante
   * PUT /api/calificaciones/:idDetalle/asignar
   */
  asignarCalificacion: async (idDetalle: string, data: {
    id_reg_per: string;
    not_fin_evt?: number;
    asi_evt_det?: number;
  }) => {
    const response = await fetch(`${API_URL}/calificaciones/${idDetalle}/asignar`, getFetchOptions('PUT', data));
    return handleResponse(response);
  },

  /**
   * Asignar calificaciones en lote
   * PUT /api/calificaciones/:idDetalle/asignar-lote
   */
  asignarCalificacionesLote: async (idDetalle: string, calificaciones: Array<{
    id_reg_per: string;
    not_fin_evt?: number;
    asi_evt_det?: number;
  }>) => {
    const response = await fetch(`${API_URL}/calificaciones/${idDetalle}/asignar-lote`, getFetchOptions('PUT', { calificaciones }));
    return handleResponse(response);
  },
};

/* ==========================================
   📚 MATERIALES
   ========================================== */
export const materialesAPI = {
  /**
   * Obtener todos los materiales de un detalle (profesor)
   * GET /api/materiales/:idDetalle/todos
   */
  obtenerTodos: async (idDetalle: string) => {
    const response = await fetch(`${API_URL}/materiales/${idDetalle}/todos`, getFetchOptions());
    return handleResponse(response);
  },

  /**
   * Obtener materiales visibles (estudiantes)
   * GET /api/materiales/:idDetalle/visibles
   */
  obtenerVisibles: async (idDetalle: string) => {
    const response = await fetch(`${API_URL}/materiales/${idDetalle}/visibles`, getFetchOptions());
    return handleResponse(response);
  },

  /**
   * Subir nuevo material
   * POST /api/materiales
   */
  subir: async (data: {
    id_det: string;
    nom_mat: string;
    des_mat?: string;
    mat_det: string;
    tip_mat?: string;
    tam_mat?: number;
    vis_est_mat?: boolean;
  }) => {
    const response = await fetch(`${API_URL}/materiales`, getFetchOptions('POST', data));
    return handleResponse(response);
  },

  /**
   * Cambiar visibilidad de un material
   * PATCH /api/materiales/:idMaterial/visibilidad
   */
  cambiarVisibilidad: async (idMaterial: string, visible: boolean) => {
    const response = await fetch(`${API_URL}/materiales/${idMaterial}/visibilidad`, getFetchOptions('PATCH', { visible }));
    return handleResponse(response);
  },

  /**
   * Eliminar material
   * DELETE /api/materiales/:idMaterial
   */
  eliminar: async (idMaterial: string) => {
    const response = await fetch(`${API_URL}/materiales/${idMaterial}`, getFetchOptions('DELETE'));
    return handleResponse(response);
  },
};

/* ==========================================
   📋 REQUISITOS
   ========================================== */

export const requisitosAPI = {
  /**
   * Obtener requisitos por detalle de evento
   * GET /api/requisitos/detalle/:idDetalle
   */
  obtenerPorDetalle: async (idDetalle: string) => {
    const response = await fetch(`${API_URL}/requisitos/detalle/${idDetalle}`, getFetchOptions('GET'));
    return handleResponse(response);
  },

  /**
   * Crear un requisito
   * POST /api/requisitos
   */
  crear: async (data: {
    id_det: string;
    tip_req: string;
    des_req?: string;
    obligatorio?: boolean;
  }) => {
    const response = await fetch(`${API_URL}/requisitos`, getFetchOptions('POST', data));
    return handleResponse(response);
  },

  /**
   * Completar un requisito (estudiante)
   * POST /api/requisitos/completar
   */
  completar: async (data: {
    num_reg_per: number;
    id_req: number;
    val_req?: string;
  }) => {
    const response = await fetch(`${API_URL}/requisitos/completar`, getFetchOptions('POST', data));
    return handleResponse(response);
  },

  /**
   * Verificar si todos los requisitos están completos
   * GET /api/requisitos/verificar/:numRegPer/:idDetalle
   */
  verificarCompletos: async (numRegPer: number, idDetalle: string) => {
    const response = await fetch(
      `${API_URL}/requisitos/verificar/${numRegPer}/${idDetalle}`,
      getFetchOptions('GET')
    );
    return handleResponse(response);
  },

  /**
   * Obtener requisitos completados por un estudiante
   * GET /api/requisitos/completados/:numRegPer
   */
  obtenerCompletados: async (numRegPer: number) => {
    const response = await fetch(
      `${API_URL}/requisitos/completados/${numRegPer}`,
      getFetchOptions('GET')
    );
    return handleResponse(response);
  },

  /**
   * Eliminar un requisito
   * DELETE /api/requisitos/:idRequisito
   */
  eliminar: async (idRequisito: number) => {
    const response = await fetch(`${API_URL}/requisitos/${idRequisito}`, getFetchOptions('DELETE'));
    return handleResponse(response);
  },
};

/* ==========================================
   â­ FAVORITOS (EVENTOS)
   ========================================== */

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
  tarifas: tarifasAPI,
  dashboard: dashboardAPI,
  favorites: favoritesAPI,
  calificaciones: calificacionesAPI,
  materiales: materialesAPI,
  requisitos: requisitosAPI,
};
