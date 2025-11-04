"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import styles from "./cursos.module.css";

type Course = {
  id: string;
  title: string;
  career: "SOFTWARE" | "TI" | "ROBOTICA" | "TELECOM";
  type: "GRATIS" | "PAGO" | "GENERAL" | "ESTUDIANTES";
  hours: number;
  cover: string;     // ruta en /public/home
  open: boolean;     // “ABIERTO”
  distance?: boolean;// “A Distancia”
};

// Datos de ejemplo (cambia las imágenes a las tuyas en /public/home)
const COURSES: Course[] = [
  {
    id: "c1",
    title: "Arduino desde cero: Electrónica, Programación y Automatización",
    career: "SOFTWARE",
    type: "GENERAL",
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
    hours: 24,
    cover: "/home/RRHH.jpg",
    open: true,
  },
  {
    id: "c3",
    title: "La Ley de Protección de Datos en el Ecuador",
    career: "SOFTWARE",
    type: "GRATIS",
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
    hours: 18,
    cover: "/home/robotica.jpg",
    open: true,
  },
  {
    id: "c5",
    title: "Redes y Telecom: Fundamentos de Switching",
    career: "TELECOM",
    type: "GENERAL",
    hours: 16,
    cover: "/home/redes.jpg",
    open: true,
  },
  // NUEVO
  {
    id: "c6",
    title: "Ciberseguridad de Redes: Fundamentos y Buenas Prácticas",
    career: "TI",
    type: "GENERAL",
    hours: 22,
    cover: "/home/ciberedes.jpg",
    open: true,
  },
];


const CAREERS = [
  { key: "SOFTWARE", label: "SOFTWARE" },
  { key: "TI", label: "TI" },
  { key: "ROBOTICA", label: "ROBOTICA" },
  { key: "TELECOM", label: "TELECOMUNICACIONES" },
] as const;

const TYPES = [
  { key: "GRATIS", label: "GRATIS" },
  { key: "PAGO", label: "PAGO" },
  { key: "GENERAL", label: "GENERAL" },
  { key: "ESTUDIANTES", label: "ESTUDIANTES" },
] as const;

export default function CursosPage() {
  const [career, setCareer] = useState<null | Course["career"]>(null);
  const [selectedTypes, setSelectedTypes] = useState<Course["type"][]>([]);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return COURSES.filter((c) => {
      const byCareer = career ? c.career === career : true;
      const byTypes =
        selectedTypes.length > 0 ? selectedTypes.includes(c.type) : true;
      const bySearch = q
        ? c.title.toLowerCase().includes(q.trim().toLowerCase())
        : true;
      return byCareer && byTypes && bySearch;
    });
  }, [career, selectedTypes, q]);

  function toggleType(t: Course["type"]) {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function clearAll() {
    setCareer(null);
    setSelectedTypes([]);
    setQ("");
  }

  return (
    <main className={styles.main}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarSection}>
          <div className={styles.sidebarTitle}>FILTRO</div>

          <div className={styles.group}>
            <div className={styles.groupLabel}>CARRERA</div>
            <div className={styles.pills}>
              {CAREERS.map((c) => (
                <button
                  key={c.key}
                  className={`${styles.pill} ${
                    career === c.key ? styles.pillActive : ""
                  }`}
                  onClick={() =>
                    setCareer((prev) => (prev === c.key ? null : c.key))
                  }
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <div className={styles.groupLabel}>ESTADO/COBERTURA</div>
            <div className={styles.checks}>
              {TYPES.map((t) => (
                <label key={t.key} className={styles.checkItem}>
                  <input
                    type="checkbox"
                    checked={selectedTypes.includes(t.key as Course["type"])}
                    onChange={() => toggleType(t.key as Course["type"])}
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <div className={styles.groupLabel}>BUSCAR</div>
            <input
              className={styles.search}
              placeholder="Nombre del curso…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <button className={styles.clearBtn} onClick={clearAll}>
            Limpiar filtros
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <section className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>Cursos</h1>
          <span className={styles.count}>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        </header>

        <div className={styles.grid}>
          {filtered.map((c) => (
            <article key={c.id} className={styles.card}>
              <div className={styles.coverWrap}>
                <Image
                  src={c.cover}
                  alt={c.title}
                  width={520}
                  height={300}
                  className={styles.cover}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  priority
                />
                <div className={styles.badges}>
                  {c.open && <span className={styles.badgeOpen}>ABIERTO</span>}
                  {c.distance && (
                    <span className={styles.badgeDistance}>A DISTANCIA</span>
                  )}
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.metaRow}>
                  <span className={styles.metaDot} />
                  <span className={styles.metaText}>
                    {c.career} · {c.hours} horas
                  </span>
                </div>

                <h3 className={styles.cardTitle}>{c.title}</h3>

                <div className={styles.tagsRow}>
                  <span
                    className={`${styles.typeTag} ${
                      styles["type_" + c.type.toLowerCase()]
                    }`}
                  >
                    {c.type}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
