import styles from "./home.module.css";
import HeroCarousel from "./HeroCarousel";
import ProgramsGrid from "./ProgramsGrid";

export default function HomePage() {
  const stats = [
    { value: "5,000+", label: "Estudiantes activos" },
    { value: "120+", label: "Eventos realizados" },
    { value: "85%", label: "Nivel de satisfacción" },
    { value: "40+", label: "Conferencistas invitados" },
  ];

  

  return (
    <main className={styles.main}>
      {/* HERO CAROUSEL */}
      <HeroCarousel />

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
      <ProgramsGrid />
    </main>
  );
}
