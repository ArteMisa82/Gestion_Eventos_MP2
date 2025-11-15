"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import styles from "./cursos.module.css";
import { COURSES, type Course } from "./courses.data";

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
      {/* FILTRO / SIDEBAR */}
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

      {/* CONTENIDO */}
      <section className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.title}>Cursos</h1>
          <span className={styles.count}>
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        </header>

        <p className={styles.subtitle}>
          Explora los cursos de la Facultad de Ingeniería en Sistemas, Electrónica e Industrial:
          programas diseñados para potenciar tu desarrollo profesional.
        </p>


        <div className={styles.grid}>
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/cursos/${c.id}`}
              className={styles.card}
              aria-label={`Abrir curso: ${c.title}`}
            >
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
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}


