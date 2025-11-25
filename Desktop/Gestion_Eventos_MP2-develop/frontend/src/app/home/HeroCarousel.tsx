"use client";

import { useEffect, useState } from "react";
import styles from "./home.module.css";

type Slide = {
  src: string;
  align: "left" | "right" | "center";
  kicker: string;
  headline: string;
  cta: { label: string; href: string };
};

const slides: Slide[] = [
  {
    src: "/home/hero1.jpg",
    align: "right",
    kicker: "CURSOS VIRTUALES Y PRESENCIALES",
    headline:
      "Incentivar la investigación en los campos afines a sus áreas de trabajo.",
    cta: { label: "Ver más", href: "/cursos" },
  },
  {
    src: "/home/hero2.jpg",
    align: "left",
    kicker: "CONGRESOS · CONFERENCIAS",
    headline:
      "Participa en eventos con expertos invitados y certificación institucional.",
    cta: { label: "Convocatorias", href: "/convocatorias" },
  },
  {
    src: "/home/hero3.jpg",
    align: "center",
    kicker: "COMUNIDAD UTA",
    headline: "Colabora, comparte y mejora tus proyectos académicos.",
    cta: { label: "Nosotros", href: "/nosotros" },
  },
];

const AUTOPLAY_MS = 5000;

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // autoplay con pausa al hover
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [paused]);

  const current = slides[index];

  // Solo estilos que cambian por slide (sin margin/border shorthands)
  const bgPos =
    current.align === "right"
      ? "center right"
      : current.align === "left"
      ? "center left"
      : "center";

  const contentAlignClass =
    current.align === "right"
      ? styles.alignRight
      : current.align === "center"
      ? styles.alignCenter
      : styles.alignLeft;

  return (
    <section
      className={styles.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {/* SLIDE */}
      <div
        key={index} // fuerza refresco del fondo en cada cambio
        className={styles.slide}
        style={{
          backgroundImage: `url(${current.src})`,
          backgroundPosition: bgPos,
        }}
      >
        <div className={styles.overlay} />

        <div className={`${styles.slideContent} ${contentAlignClass}`}>
          <span className={styles.kicker}>{current.kicker}</span>
          <h1 className={styles.headline}>{current.headline}</h1>
          <a className={styles.cta} href={current.cta.href}>
            {current.cta.label}
          </a>
        </div>
      </div>

      {/* DOTS */}
      <div className={styles.dots} role="tablist" aria-label="Slides">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Ir al slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
          />
        ))}
      </div>
    </section>
  );
}


