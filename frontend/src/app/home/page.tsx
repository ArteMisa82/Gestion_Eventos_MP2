import Image from "next/image";
import styles from "./home.module.css";

export default function HomePage() {
  // Datos de ejemplo hasta conectar con backend
  const stats = [
    { value: "5,000+", label: "Estudiantes activos" },
    { value: "120+", label: "Eventos realizados" },
    { value: "85%", label: "Nivel de satisfacción" },
    { value: "40+", label: "Conferencistas invitados" },
  ];

  const programs = [
    { title: "Doctor of Physical Therapy (DPT)" },
    { title: "PhD Engineering Dual Degree" },
    { title: "Master of Public Health (MPH)" },
  ];

  return (
    <main className={styles.main}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.overlay}></div>
        <div className={styles.heroContent}>
          <h1>
            Incentivamos la investigación en los campos afines a sus áreas de trabajo
          </h1>
          <p>
            Participa en cursos, congresos y conferencias académicas organizadas por
            la Universidad Técnica de Ambato.
          </p>
        </div>
      </section>

      {/* STATS */}
      <section className={styles.stats}>
        <div className={styles.statsGrid}>
          {stats.map((item) => (
            <div key={item.label} className={styles.statCard}>
              <span className={styles.statValue}>{item.value}</span>
              <span className={styles.statLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* PROGRAMS */}
      <section className={styles.programs}>
        <div className={styles.header}>
          <span className={styles.badge}>Cursos</span>
          <h2>Nuestros Programas</h2>
          <a href="#" className={styles.link}>
            Ver más →
          </a>
        </div>

        <div className={styles.cards}>
          {programs.map((program) => (
            <article key={program.title} className={styles.card}>
              <div className={styles.cardImage}>
                <Image src="/file.svg" alt="" width={48} height={48} />
              </div>
              <h3>{program.title}</h3>
              <p>
                Conoce los programas de formación más destacados de nuestra universidad.
              </p>
              <a href="#" className={styles.cardLink}>
                Ver detalle
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
