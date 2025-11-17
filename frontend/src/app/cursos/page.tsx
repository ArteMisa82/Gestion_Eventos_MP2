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

export default function CursosPage() {
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
    return eventos.filter((evento) => {
      // Filtro por modalidad
      const byModalidad = modalidad ? evento.mod_evt === modalidad : true;
      
      // Filtro por público (DIRIGIDO A)
      const byPublico =
        selectedPublico.length > 0 
          ? selectedPublico.includes(evento.tip_pub_evt) 
          : true;
      
      // Filtro por costo
      const byCosto =
        selectedCosto.length > 0 
          ? selectedCosto.includes(evento.cos_evt) 
          : true;
      
      // Filtro por búsqueda de texto
      const bySearch = q
        ? evento.nom_evt.toLowerCase().includes(q.trim().toLowerCase()) ||
          evento.des_evt.toLowerCase().includes(q.trim().toLowerCase())
        : true;
      
      return byModalidad && byPublico && byCosto && bySearch;
    });
  }, [eventos, modalidad, selectedPublico, selectedCosto, q]);

  function togglePublico(t: string) {
    setSelectedPublico((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function toggleCosto(t: string) {
    setSelectedCosto((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  }

  function clearAll() {
    setModalidad(null);
    setSelectedPublico([]);
    setSelectedCosto([]);
    setQ("");
  }

  return (
    <main className={styles.main}>
      {/* FILTRO / SIDEBAR */}
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
            {loading ? "Cargando..." : `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""}`}
          </span>
        </header>

        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Cargando eventos...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No se encontraron eventos publicados
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((evento) => {
              const detalle = evento.detalle_eventos?.[0];
              const horas = detalle?.hor_det || 0;
              const area = detalle?.are_det || 'General';
              const estadoDetalle = detalle?.est_evt_det || 'EDITANDO';
              const imagenCurso = evento.ima_evt || '/Default_Image.png';
              const modalidadInfo = MODALIDAD_MAP[evento.mod_evt] || { label: evento.mod_evt, showBadge: false };
              
              // Determinar si está abierto a inscripciones
              const estaAbierto = estadoDetalle === 'INSCRIPCIONES';
              
              return (
                <Link
                  key={evento.id_evt}
                  href={`/cursos/${evento.id_evt}`}
                  className={styles.card}
                  aria-label={`Abrir curso: ${evento.nom_evt}`}
                >
                  <div className={styles.coverWrap}>
                    <Image
                      src={imagenCurso}
                      alt={evento.nom_evt}
                      width={520}
                      height={300}
                      className={styles.cover}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      priority
                    />
                    <div className={styles.badges}>
                      {estaAbierto ? (
                        <span className={styles.badgeOpen}>ABIERTO</span>
                      ) : (
                        <span className={styles.badgeClosed}>
                          {estadoDetalle === 'EN CURSO' ? 'EN CURSO' : 
                           estadoDetalle === 'FINALIZADO' ? 'FINALIZADO' : 
                           'CERRADO'}
                        </span>
                      )}
                      {modalidadInfo.showBadge && (
                        <span className={styles.badgeDistance}>{modalidadInfo.label}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.metaRow}>
                      <span className={styles.metaDot} />
                      <span className={styles.metaText}>
                        {area} · {horas} horas
                      </span>
                    </div>

                    <h3 className={styles.cardTitle}>{evento.nom_evt}</h3>

                    <div className={styles.tagsRow}>
                      <span
                        className={`${styles.typeTag} ${
                          styles["type_" + evento.cos_evt.toLowerCase().replace(' ', '_')]
                        }`}
                      >
                        {evento.cos_evt === 'GRATUITO' ? 'GRATIS' : 'PAGO'}
                      </span>
                      <span className={styles.typeTag}>
                        {evento.tip_pub_evt}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
