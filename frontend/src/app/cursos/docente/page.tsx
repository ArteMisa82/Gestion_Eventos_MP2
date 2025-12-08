// Server Component — listado de cursos del docente
import Link from "next/link";
import styles from "./docente.module.css";

type TeacherCourse = {
  id: string;
  titulo: string;
  estado: "ABIERTO" | "CERRADO";
  horas: number;
  portada: string;
};

async function getTeacherCourses(): Promise<TeacherCourse[]> {
  // Aquí luego cambiarás por tu fetch real a la API
  return [
    {
      id: "arduino",
      titulo: "Arduino desde cero: Electrónica, Programación y Automatización",
      estado: "ABIERTO",
      horas: 40,
      portada: "/home/arduino.jpg",
    },
    {
      id: "ia-rrhh",
      titulo: "Inteligencia Artificial para la Gestión de RR. HH.",
      estado: "ABIERTO",
      horas: 32,
      portada: "/home/RRHH.jpg",
    },
    {
      id: "Ley-datos",
      titulo: "La Ley de Protección de Datos en el Ecuador",
      estado: "ABIERTO",
      horas: 32,
      portada: "/home/datos.jpg",
    },
  ];
}

export default async function DocenteCursosPage() {
  const cursos = await getTeacherCourses();

  return (
    <section className={styles.wrapper}>
      {/* Barra superior interna */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <h2>Panel del docente</h2>
        </div>
      </div>

      {/* Contenedor para alinear títulos y grids con las tarjetas */}
      <div className={styles.container}>
        <h1 className={styles.sectionTitle}>CURSOS EN PROCESO</h1>

        {/* Grid de cursos */}
        <div className={styles.coursesGrid}>
          {cursos.map((c) => (
            <Link key={c.id} href={`/cursos/docente/${c.id}`} className={styles.card}>
              <div className={styles.thumb}>
                <img src={c.portada} alt={c.titulo} />
              </div>

              <div className={styles.metaRow}>
                <span className={styles.badge}>
                  <i className="bi bi-people"></i> {c.estado.toLowerCase()}
                </span>
                <span className={styles.badge}>
                  <i className="bi bi-clock-history"></i> {c.horas} horas
                </span>
              </div>

              <h3 className={styles.courseTitle}>{c.titulo}</h3>
            </Link>
          ))}
        </div>

        <h1 className={styles.sectionTitle}>EVENTOS</h1>

        <div className={styles.eventsGrid}>
          <Link href="/cursos/docente/eventos/evento-1" className={styles.eventCard}>
            <img src="/home/evento1.jpg" alt="Evento 1" />
            <h3>Congreso de Innovación Educativa</h3>
            <p>15 Febrero 2024</p>
          </Link>

          <Link href="/cursos/docente/eventos/evento-2" className={styles.eventCard}>
            <img src="/home/evento2.jpg" alt="Evento 2" />
            <h3>Taller de Transformación Digital</h3>
            <p>20 Febrero 2024</p>
          </Link>

          <Link href="/cursos/docente/eventos/evento-3" className={styles.eventCard}>
            <img src="/home/evento3.jpg" alt="Evento 3" />
            <h3>Seminario de IA en Educación</h3>
            <p>25 Febrero 2024</p>
          </Link>
        </div>
      </div>
    </section>
  );
}
 