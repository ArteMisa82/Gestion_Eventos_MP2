import CourseDetail from "./CourseDetail";

const COURSES_DATA = {
  c1: {
    title: "Arduino desde cero: Electrónica, Programación y Automatización",
    image: "/home/curso_arduino.jpg",
    info: {
      inscriptionDates: "Del 19 de mayo al 04 de junio de 2025",
      quota: "Mínimo 15, máximo 25 participantes",
      location: "Laboratorio asignado - FISEI",
      courseDates: "Del 07 al 30 de junio de 2025",
      schedule: "8:00 - 14:00 (Sábados)",
      prices: [
        "40 USD Estudiantes UTA (Último período)",
        "50 USD Graduados, Docentes y Administrativos UTA",
        "60 USD Público en general",
      ],
      certification:
        "Certificado digital de asistencia y aprobación con validación QR",
      duration: "40 horas (24 presenciales, 16 trabajo autónomo)",
      beneficiaries:
        "Estudiantes, graduados, docentes y público en general",
      modality: "Presencial",
      prerequisites: "Ninguno",
    },
  },
  c2: {
    title: "Inteligencia Artificial para la Gestión de RRHH",
    image: "/home/curso_ia_rrhh.jpg",
    info: {
      inscriptionDates: "Del 20 de mayo al 05 de junio de 2025",
      quota: "Mínimo 20, máximo 30 participantes",
      location: "Sala de Innovación FISEI",
      courseDates: "Del 10 al 30 de junio de 2025",
      schedule: "18:00 - 21:00 (Lunes y Miércoles)",
      prices: [
        "50 USD Estudiantes UTA",
        "60 USD Público general",
      ],
      certification: "Certificado digital de participación con QR",
      duration: "30 horas",
      beneficiaries: "Estudiantes y profesionales de RRHH",
      modality: "Virtual sincrónica",
      prerequisites: "Conocimientos básicos en informática",
    },
  },
  // Puedes agregar más cursos aquí usando el mismo formato
};

export default function CoursePage({ params }: { params: { id: string } }) {
  const course = COURSES_DATA[params.id as keyof typeof COURSES_DATA];

  if (!course) {
    return <div style={{ padding: "40px" }}>Curso no encontrado.</div>;
  }

  return <CourseDetail {...course} />;
}
