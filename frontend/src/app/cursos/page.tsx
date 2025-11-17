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

const TIPOS_EVENTO = [
  { key: "CURSO", label: "CURSO" },
  { key: "CONFERENCIA", label: "CONFERENCIA" },
  { key: "WEBINAR", label: "WEBINAR" },
  { key: "CONGRESO", label: "CONGRESO" },
  { key: "CASAS ABIERTAS", label: "CASAS ABIERTAS" },
] as const;

export default function CursosPage() {
  const [modalidad, setModalidad] = useState<null | string>(null);
  const [selectedPublico, setSelectedPublico] = useState<string[]>([]);
  const [selectedCosto, setSelectedCosto] = useState<string[]>([]);
  const [selectedKinds, setSelectedKinds] = useState<string[]>([]);
  const [eventos, setEventos] = useState<EventoPublico[]>([]);
  const [loading, setLoading] = useState(true);
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
    return eventos.filter((evento) => {
      // Filtrar por tipo de evento (desde detalle_eventos)
      if (selectedKinds.length > 0) {
        const tipoEvento = evento.detalle_eventos?.[0]?.tip_evt;
        if (!tipoEvento || !selectedKinds.includes(tipoEvento)) return false;
      }
      return true;
    });
  }, [eventos, selectedKinds]);

  function togglePublico(tipo: string) {
    setSelectedPublico((prev) => 
      prev.includes(tipo) ? prev.filter((x) => x !== tipo) : [...prev, tipo]
    );
  }

  function toggleCosto(tipo: string) {
    setSelectedCosto((prev) => 
      prev.includes(tipo) ? prev.filter((x) => x !== tipo) : [...prev, tipo]
    );
  }

  function toggleKind(k: string) {
    setSelectedKinds((prev) => 
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
  }

  function clearAll() {
    setModalidad(null);
    setSelectedPublico([]);
    setSelectedCosto([]);
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

          {/* TIPO DE EVENTO */}
          <div className={styles.group}>
            <div className={styles.groupLabel}>TIPO DE EVENTO</div>
            <div className={styles.checks}>
              {TIPOS_EVENTO.map((k) => (
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
          {filtered.map((evento) => {
            const detalle = evento.detalle_eventos?.[0];
            const modalidadInfo = MODALIDAD_MAP[evento.mod_evt] || { label: evento.mod_evt, showBadge: false };
            
            return (
              <Link
                key={evento.id_evt}
                href={`/cursos/${evento.id_evt}`}
                className={styles.card}
                aria-label={`Abrir evento: ${evento.nom_evt}`}
              >
                <div className={styles.coverWrap}>
                  {evento.ima_evt ? (
                    <Image
                      src={evento.ima_evt}
                      alt={evento.nom_evt}
                      width={520}
                      height={300}
                      className={styles.cover}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      priority
                    />
                  ) : (
                    <div className={styles.cover} style={{ background: '#581517' }} />
                  )}
                  <div className={styles.badges}>
                    {evento.est_evt === 'PUBLICADO' && <span className={styles.badgeOpen}>ABIERTO</span>}
                    {modalidadInfo.showBadge && <span className={styles.badgeDistance}>{modalidadInfo.label}</span>}
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.metaRow}>
                    <span className={styles.metaDot} />
                    <span className={styles.metaText}>
                      {detalle?.are_det || 'General'} · {detalle?.hor_det || 0} horas
                    </span>
                  </div>

                  <h3 className={styles.cardTitle}>{evento.nom_evt}</h3>

                  <div className={styles.tagsRow}>
                    {detalle?.tip_evt && (
                      <span className={`${styles.kindTag}`}>
                        {detalle.tip_evt}
                      </span>
                    )}
                    <span className={`${styles.typeTag}`}>
                      {evento.cos_evt}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}



