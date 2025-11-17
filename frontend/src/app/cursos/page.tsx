"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import styles from "./cursos.module.css";
import { eventosAPI } from "@/services/api";

// Tipos para eventos del backend
interface EventoPublico {
  id_evt: string;
  nom_evt: string;
  fec_evt: string;
  lug_evt: string;
  mod_evt: 'PRESENCIAL' | 'VIRTUAL' | 'A DISTANCIA';
  tip_pub_evt: 'GENERAL' | 'ESTUDIANTES' | 'ADMINISTRATIVOS';
  cos_evt: 'GRATUITO' | 'DE PAGO';
  des_evt: string;
  est_evt?: string; // Estado del evento
  ima_evt?: string | null;
  detalle_eventos?: Array<{
    id_det: string;
    hor_det: number;
    tip_evt: string;
    cup_det: number;
    are_det: string;
    est_evt_det?: string; // Estado del detalle
  }>;
}

// Mapeo de modalidad a etiqueta de badge
const MODALIDAD_MAP: Record<string, { label: string; showBadge: boolean }> = {
  'PRESENCIAL': { label: 'PRESENCIAL', showBadge: false },
  'VIRTUAL': { label: 'A DISTANCIA', showBadge: true },
  'A DISTANCIA': { label: 'A DISTANCIA', showBadge: true },
};

const TIPOS_PUBLICO = [
  { key: "GENERAL", label: "GENERAL" },
  { key: "ESTUDIANTES", label: "ESTUDIANTES" },
  { key: "ADMINISTRATIVOS", label: "ADMINISTRATIVOS" },
] as const;

const TIPOS_COSTO = [
  { key: "GRATUITO", label: "GRATIS" },
  { key: "DE PAGO", label: "PAGO" },
] as const;

/** Asegúrate de que Course tenga la propiedad eventKind.
 *  Si ya lo agregaste en courses.data.ts, usa el tipo de ahí.
 *  Si no, descomenta esta línea y ajusta:
 *  type EventKind = "CURSO" | "CONFERENCIA" | "WEBINAR" | "CONGRESO" | "CASA_ABIERTA";
 */
type EventKind = Course extends { eventKind: infer K } ? Extract<K, string> : never;

const KINDS: { key: EventKind; label: string }[] = [
  { key: "CURSO" as EventKind,         label: "CURSO" },
  { key: "CONFERENCIA" as EventKind,   label: "CONFERENCIA" },
  { key: "WEBINAR" as EventKind,       label: "WEBINAR" },
  { key: "CONGRESO" as EventKind,      label: "CONGRESO" },
  { key: "CASA_ABIERTA" as EventKind,  label: "CASAS ABIERTAS" },
];

export default function CursosPage() {
  const [career, setCareer] = useState<null | Course["career"]>(null);
  const [selectedTypes, setSelectedTypes] = useState<Course["type"][]>([]);
  const [selectedKinds, setSelectedKinds] = useState<EventKind[]>([]);
  const [eventos, setEventos] = useState<EventoPublico[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalidad, setModalidad] = useState<null | string>(null);
  const [selectedPublico, setSelectedPublico] = useState<string[]>([]);
  const [selectedCosto, setSelectedCosto] = useState<string[]>([]);
  const [q, setQ] = useState("");

  // Cargar eventos publicados del backend
  useEffect(() => {
    async function cargarEventos() {
      try {
        setLoading(true);
        
        // Construir filtros para el backend
        const filters: any = {};
        if (modalidad) filters.mod_evt = modalidad;
        if (selectedPublico.length > 0) filters.tip_pub_evt = selectedPublico.join(',');
        if (selectedCosto.length > 0) filters.cos_evt = selectedCosto.join(',');
        if (q.trim()) filters.busqueda = q.trim();
        
        const data = await eventosAPI.getPublicados(filters);
        setEventos(data);
      } catch (error) {
        console.error('Error al cargar eventos:', error);
        setEventos([]);
      } finally {
        setLoading(false);
      }
    }
    cargarEventos();
  }, [modalidad, selectedPublico, selectedCosto, q]); // Recargar cuando cambien los filtros

  const filtered = useMemo(() => {
    return COURSES.filter((c) => {
      const byCareer = career ? c.career === career : true;
      const byTypes = selectedTypes.length > 0 ? selectedTypes.includes(c.type) : true;
      const byKinds = selectedKinds.length > 0 ? selectedKinds.includes(c.eventKind as EventKind) : true;
      const bySearch = q ? c.title.toLowerCase().includes(q.trim().toLowerCase()) : true;
      return byCareer && byTypes && byKinds && bySearch;
    });
  }, [career, selectedTypes, selectedKinds, q]);

  function toggleType(t: Course["type"]) {
    setSelectedTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function toggleKind(k: EventKind) {
    setSelectedKinds((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  }

  function clearAll() {
    setCareer(null);
    setSelectedTypes([]);
    setSelectedKinds([]);
    setQ("");
  }

  return (
    <main className={styles.main}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarSection}>
          <div className={styles.sidebarTitle}>FILTRO</div>

          <div className={styles.group}>
            <div className={styles.groupLabel}>MODALIDAD</div>
            <div className={styles.pills}>
              {CAREERS.map((c) => (
                <button
                  key={c.key}
                  className={`${styles.pill} ${career === c.key ? styles.pillActive : ""}`}
                  onClick={() => setCareer((prev) => (prev === c.key ? null : (c.key as Course["career"])))}
                >
                  {c.label}
                </button>
              <button
                className={`${styles.pill} ${
                  modalidad === 'PRESENCIAL' ? styles.pillActive : ""
                }`}
                onClick={() =>
                  setModalidad((prev) => (prev === 'PRESENCIAL' ? null : 'PRESENCIAL'))
                }
              >
                PRESENCIAL
              </button>
              <button
                className={`${styles.pill} ${
                  modalidad === 'VIRTUAL' ? styles.pillActive : ""
                }`}
                onClick={() =>
                  setModalidad((prev) => (prev === 'VIRTUAL' ? null : 'VIRTUAL'))
                }
              >
                VIRTUAL
              </button>
              <button
                className={`${styles.pill} ${
                  modalidad === 'A DISTANCIA' ? styles.pillActive : ""
                }`}
                onClick={() =>
                  setModalidad((prev) => (prev === 'A DISTANCIA' ? null : 'A DISTANCIA'))
                }
              >
                A DISTANCIA
              </button>
            </div>
          </div>

          <div className={styles.group}>
            <div className={styles.groupLabel}>DIRIGIDO A</div>
            <div className={styles.checks}>
              {TIPOS_PUBLICO.map((t) => (
                <label key={t.key} className={styles.checkItem}>
                  <input
                    type="checkbox"
                    checked={selectedPublico.includes(t.key)}
                    onChange={() => togglePublico(t.key)}
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <div className={styles.groupLabel}>COSTO</div>
            <div className={styles.checks}>
              {TIPOS_COSTO.map((t) => (
                <label key={t.key} className={styles.checkItem}>
                  <input
                    type="checkbox"
                    checked={selectedCosto.includes(t.key)}
                    onChange={() => toggleCosto(t.key)}
                  />
                  <span>{t.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* NUEVO: TIPO DE EVENTO */}
          <div className={styles.group}>
            <div className={styles.groupLabel}>TIPO DE EVENTO</div>
            <div className={styles.checks}>
              {KINDS.map((k) => (
                <label key={k.key} className={styles.checkItem}>
                  <input
                    type="checkbox"
                    checked={selectedKinds.includes(k.key)}
                    onChange={() => toggleKind(k.key)}
                  />
                  <span>{k.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.group}>
            <div className={styles.groupLabel}>BUSCAR</div>
            <input
              className={styles.search}
              placeholder="Nombre del evento…"
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
          <h1 className={styles.title}>Eventos</h1>
          <span className={styles.count}>
            {loading ? "Cargando..." : `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""}`}
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
                  {c.distance && <span className={styles.badgeDistance}>A DISTANCIA</span>}
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
                  {/* NUEVO: etiqueta de tipo de evento */}
                  {"eventKind" in c && (
                    <span
                      className={`${styles.kindTag} ${
                        styles["kind_" + String(c.eventKind).toLowerCase()]
                      }`}
                    >
                      {String(c.eventKind).replace("_", " ")}
                    </span>
                  )}

                  {/* etiqueta existente de cobertura */}
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



