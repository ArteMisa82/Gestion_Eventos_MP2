// Server Component — listado de cursos del docente
import Link from "next/link";
import styles from "./docente.module.css";

type TeacherCourse = {
  id: string;
  titulo: string;
  estado: "ABIERTO" | "CERRADO";
  horas: number;
  portada: string;   // url de imagen
};

async function getTeacherCourses(): Promise<TeacherCourse[]> {
  // 🔧 TODO: reemplazar por fetch a tu API (no-store para datos vivos)
  // const res = await fetch(`${process.env.NEXT_PUBLIC_API}/docente/cursos`, { cache: "no-store" });
  // return await res.json();

  // Mock para diseño:
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
      id: "ley-datos",
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

        {/* 3 tarjetas por fila (igual que eventos) */}
        <div className={styles.coursesGrid}>
          {cursos.map((c) => (
            <Link key={c.id} href={`/cursos/docente/${c.id}`} className={styles.card}>
              <div className={styles.thumb}>
                {/* Usa <img> para no tocar tu configuración de <Image/> */}
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
          <div className={styles.eventCard}>
            <img src="/images/evento1.jpg" alt="Evento 1" />
            <h3>Congreso de Innovación Educativa</h3>
            <p>15 Febrero 2024</p>
          </div>

          <div className={styles.eventCard}>
            <img src="/images/evento2.jpg" alt="Evento 2" />
            <h3>Taller de Transformación Digital</h3>
            <p>20 Febrero 2024</p>
          </div>

          <div className={styles.eventCard}>
            <img src="/images/evento3.jpg" alt="Evento 3" />
            <h3>Seminario de IA en Educación</h3>
            <p>25 Febrero 2024</p>
          </div>
        </div>
      </div>
    </section>
  );
}

