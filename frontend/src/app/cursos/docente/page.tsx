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
      <h1 className={styles.title}>CURSOS EN PROCESO</h1>

      <div className={styles.grid}>
        {cursos.map((c) => (
          <Link
            key={c.id}
            href={`/cursos/docente/${c.id}`}
            className={styles.card}
          >
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
    </section>
  );
}
