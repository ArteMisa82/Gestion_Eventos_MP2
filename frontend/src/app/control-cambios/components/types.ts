export type Solicitud = {
  id: number;
  titulo: string;
  descripcion: string;
  justificacion?: string;
  impactoNoImplementar?: string;
  recursosNecesarios?: string[];
  riesgos?: string;
  modulos?: string[];
  tipoCambio?: string;
  clasificacion?: string;
  impactoDias?: number | null;
  estado: "Pendiente" | "En revisión" | "Aprobado" | "Rechazado";
  fecha: string;
  solicitante: string;
  contacto?: string;
  telefono?: string;
  referencia?: string;
  prioridad: "Alta" | "Media" | "Baja";
};

export const MOCK: Solicitud[] = [
  {
    id: 1,
    titulo: "Actualización del módulo de facturación",
    descripcion: "Se requiere agregar validación automática de impuestos.",
    justificacion: "Evitar errores manuales del departamento contable.",
    impactoNoImplementar: "Errores en cálculos fiscales y retrasos en reportes.",
    recursosNecesarios: ["1 Desarrollador Backend", "1 QA"],
    riesgos: "Fallos en cálculos si no se valida bien.",
    modulos: ["Facturación", "Contabilidad"],
    tipoCambio: "Normal",
    clasificacion: "Funcional",
    impactoDias: 3,
    estado: "Pendiente",
    fecha: "2025-02-10",
    solicitante: "Carlos López",
    contacto: "cattelo.lopez@campia.com",
    telefono: "904264.1122",
    prioridad: "Alta",
  },
  {
    id: 2,
    titulo: "Actualizar módulo de inventario",
    descripcion: "Optimizar consultas masivas que ralentizan las búsquedas.",
    justificacion: "Los usuarios reportan lentitud en operaciones críticas que afecta reportes.",
    impactoNoImplementar: "Continuarán las quejas de usuarios y pérdida de productividad en procesos de inventario.",
    recursosNecesarios: ["1 Desarrollador Backend", "1 DBA"],
    riesgos: "Posible afectación en consultas existentes si no se optimiza correctamente.",
    modulos: ["Administrador", "Usuario logueado"],
    tipoCambio: "Normal",
    clasificacion: "Técnico",
    impactoDias: 2,
    estado: "Pendiente",
    fecha: "2025-11-20",
    solicitante: "Carlos López",
    contacto: "carlos.lopez@campia.com",
    telefono: "904265.3344",
    prioridad: "Alta",
  },
  {
    id: 3,
    titulo: "Bug en login",
    descripcion: "Algunos usuarios no pueden iniciar sesión si usan SSO.",
    justificacion: "Impide acceso a perfiles docentes en horario crítico.",
    impactoNoImplementar: "Usuarios no podrán acceder al sistema, afectando operaciones académicas.",
    recursosNecesarios: ["1 Desarrollador Fullstack", "1 QA"],
    riesgos: "Posible bloqueo masivo de usuarios si no se corrige adecuadamente.",
    modulos: ["Usuario logueado", "Estudiante"],
    tipoCambio: "Emergencia",
    clasificacion: "Crítico",
    impactoDias: 0,
    estado: "En revisión",
    fecha: "2025-11-19",
    solicitante: "María Fernández",
    contacto: "maria.fernandez@campia.com",
    telefono: "904266.5566",
    prioridad: "Media",
  },
  {
    id: 4,
    titulo: "Mejorar exportes CSV",
    descripcion: "Exportes tardan mucho con datasets grandes.",
    justificacion: "Necesario para auditorías mensuales.",
    impactoNoImplementar: "Auditorías se retrasarán y equipo de finanzas tendrá que hacer procesos manuales.",
    recursosNecesarios: ["1 Desarrollador Backend"],
    riesgos: "Posible timeout en exportes muy grandes.",
    modulos: ["Administrador"],
    tipoCambio: "Normal",
    clasificacion: "Funcional",
    impactoDias: 1,
    estado: "Aprobado",
    fecha: "2025-10-28",
    solicitante: "Equipo QA",
    contacto: "qa.team@campia.com",
    telefono: "904267.7788",
    prioridad: "Baja",
  },
  {
    id: 5,
    titulo: "Integración con sistema de nómina",
    descripcion: "Conectar módulo de RRHH con sistema externo de nómina.",
    justificacion: "Automatizar proceso de transferencia de datos de nómina.",
    impactoNoImplementar: "Procesos manuales continuarán, con riesgo de errores en pagos.",
    recursosNecesarios: ["1 Desarrollador Backend", "1 Analista de Negocio"],
    riesgos: "Posibles discrepancias en datos si la integración no es robusta.",
    modulos: ["RRHH", "Finanzas"],
    tipoCambio: "Normal",
    clasificacion: "Integración",
    impactoDias: 5,
    estado: "Pendiente",
    fecha: "2025-02-12",
    solicitante: "Laura Martínez",
    contacto: "laura.martinez@campia.com",
    telefono: "904268.9900",
    prioridad: "Alta",
  },
  {
    id: 6,
    titulo: "Dashboard de métricas de ventas",
    descripcion: "Crear dashboard interactivo para seguimiento de ventas en tiempo real.",
    justificacion: "Mejorar visibilidad del desempeño comercial.",
    impactoNoImplementar: "Equipo comercial no tendrá visibilidad en tiempo real de métricas clave.",
    recursosNecesarios: ["1 Desarrollador Frontend", "1 Data Analyst"],
    riesgos: "Posible lentitud si no se optimizan las consultas a la base de datos.",
    modulos: ["Ventas", "Reportes"],
    tipoCambio: "Normal",
    clasificacion: "Analítica",
    impactoDias: 4,
    estado: "En revisión",
    fecha: "2025-02-08",
    solicitante: "Roberto Sánchez",
    contacto: "roberto.sanchez@campia.com",
    telefono: "904269.1122",
    prioridad: "Media",
  },
  {
    id: 7,
    titulo: "Migración a nueva versión de base de datos",
    descripcion: "Actualizar de PostgreSQL 12 a PostgreSQL 15.",
    justificacion: "Mantener compatibilidad y aprovechar nuevas características de performance.",
    impactoNoImplementar: "Posibles problemas de seguridad y falta de soporte técnico.",
    recursosNecesarios: ["2 DBAs", "1 Desarrollador Backend"],
    riesgos: "Posible downtime durante la migración y riesgo de incompatibilidad.",
    modulos: ["Infraestructura", "Todos los módulos"],
    tipoCambio: "Normal",
    clasificacion: "Infraestructura",
    impactoDias: 3,
    estado: "Aprobado",
    fecha: "2025-01-25",
    solicitante: "Departamento de TI",
    contacto: "ti@campia.com",
    telefono: "904260.3344",
    prioridad: "Alta",
  },
  {
    id: 8,
    titulo: "Sistema de notificaciones push",
    descripcion: "Implementar sistema de notificaciones en tiempo real para usuarios.",
    justificacion: "Mejorar engagement y respuesta rápida a eventos importantes.",
    impactoNoImplementar: "Usuarios perderán notificaciones críticas y engagement disminuirá.",
    recursosNecesarios: ["1 Desarrollador Backend", "1 Desarrollador Mobile"],
    riesgos: "Posible alto consumo de recursos si no se escala correctamente.",
    modulos: ["Notificaciones", "Usuario logueado"],
    tipoCambio: "Normal",
    clasificacion: "Funcional",
    impactoDias: 6,
    estado: "Rechazado",
    fecha: "2025-01-20",
    solicitante: "Ana García",
    contacto: "ana.garcia@campia.com",
    telefono: "904261.5566",
    prioridad: "Media",
  }
];

// Helpers
export const WINE = "#6e1f3f";

export function getEstadoClasses(estado: string) {
  switch (estado) {
    case "Pendiente":
      return { pill: "bg-gray-100 text-gray-700", side: "#D1D5DB" };
    case "En revisión":
      return { pill: "", side: WINE };
    case "Aprobado":
      return { pill: "bg-green-100 text-green-700", side: "#16A34A" };
    case "Rechazado":
      return { pill: "bg-red-100 text-red-700", side: "#DC2626" };
    default:
      return { pill: "bg-gray-100 text-gray-700", side: "#D1D5DB" };
  }
}