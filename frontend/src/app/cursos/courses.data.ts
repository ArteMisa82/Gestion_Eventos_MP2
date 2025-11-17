// src/app/cursos/courses.data.ts
export type Course = {
  id: string;
  title: string;
  career: "SOFTWARE" | "TI" | "ROBOTICA" | "TELECOM";
  /** Cobertura / acceso */
  type: "GRATIS" | "PAGO" | "GENERAL" | "ESTUDIANTES";
  /** Tipo de evento */
  eventKind: "CURSO" | "CONFERENCIA" | "WEBINAR" | "CONGRESO" | "CASA_ABIERTA";
  hours: number;
  cover: string;
  open: boolean;
  distance?: boolean;
};

export const COURSES: Course[] = [
  {
    id: "c1",
    title: "Arduino desde cero: Electrónica, Programación y Automatización",
    career: "SOFTWARE",
    type: "GENERAL",
    eventKind: "CURSO",
    hours: 20,
    cover: "/home/arduino.jpg",
    open: true,
    distance: true,
  },
  {
    id: "c2",
    title: "Inteligencia Artificial para la Gestión de RRHH",
    career: "TI",
    type: "PAGO",
    eventKind: "CONFERENCIA",
    hours: 24,
    cover: "/home/RRHH.jpg",
    open: true,
  },
  {
    id: "c3",
    title: "La Ley de Protección de Datos en el Ecuador",
    career: "SOFTWARE",
    type: "GRATIS",
    eventKind: "WEBINAR",
    hours: 12,
    cover: "/home/proteccion.jpg",
    open: true,
    distance: true,
  },
  {
    id: "c4",
    title: "Robótica educativa con MicroPython",
    career: "ROBOTICA",
    type: "ESTUDIANTES",
    eventKind: "CASA_ABIERTA",
    hours: 18,
    cover: "/home/robotica.jpg",
    open: true,
  },
  {
    id: "c5",
    title: "Redes y Telecom: Fundamentos de Switching",
    career: "TELECOM",
    type: "GENERAL",
    eventKind: "CURSO",
    hours: 16,
    cover: "/home/redes.jpg",
    open: true,
  },
  {
    id: "c6",
    title: "Ciberseguridad de Redes: Fundamentos y Buenas Prácticas",
    career: "TI",
    type: "GENERAL",
    eventKind: "CONGRESO",
    hours: 22,
    cover: "/home/ciberedes.jpg",
    open: true,
  },
];
