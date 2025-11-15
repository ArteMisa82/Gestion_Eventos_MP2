"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import styles from "./docentePanel.module.css"; // reutilizamos el mismo CSS de cursos

type Attendee = { id: string; nombre: string; asistencia?: boolean };
type Tab = "asistencia" | "material";

type Evento = {
  id: string;
  nombre: string;
  tipo: string;
  inicio: string; // ISO
  fin: string;    // ISO
  materiales: { id: string; nombre: string; visible: boolean }[];
  asistentes: Attendee[];
};

function mockEvento(id: string): Evento {
  // Simula: evento 1 ya finalizado, los otros activos
  const now = new Date();
  const finPasado = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
  const finFuturo = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

  const base = {
    id,
    nombre:
      id === "evento-1"
        ? "Congreso de Innovación Educativa"
        : id === "evento-2"
        ? "Taller de Transformación Digital"
        : "Seminario de IA en Educación",
    tipo: "Académico",
    inicio: new Date().toISOString(),
    fin: id === "evento-1" ? finPasado : finFuturo,
    materiales: [{ id: "m1", nombre: "Agenda del evento.pdf", visible: true }],
    asistentes: [
      { id: "1", nombre: "Estudiante 1", asistencia: true },
      { id: "2", nombre: "Estudiante 2", asistencia: false },
      { id: "3", nombre: "Estudiante 3", asistencia: true },
    ],
  };
  return base;
}

export default function EventPanel({ eventId }: { eventId: string }) {
  const [tab, setTab] = useState<Tab>("asistencia");
  const [evento, setEvento] = useState<Evento>(() => mockEvento(eventId));
  const [q, setQ] = useState("");
  const [nuevoArchivo, setNuevoArchivo] = useState<File | null>(null);

  const isFinished = useMemo(() => new Date(evento.fin).getTime() < Date.now(), [evento.fin]);

  const asistentesFiltrados = useMemo(
    () => evento.asistentes.filter(a => a.nombre.toLowerCase().includes(q.toLowerCase().trim())),
    [evento.asistentes, q]
  );

  const saveAsistencia = async () => {
    if (isFinished) {
      await Swal.fire("Evento finalizado", "No se puede editar la asistencia.", "info");
      return;
    }
    // TODO: POST asistencia a backend
    await Swal.fire("Guardado", "Asistencia registrada correctamente.", "success");
  };

  const changeAsistencia = (id: string, value: boolean) => {
    if (isFinished) return; // bloqueo duro en UI
    setEvento(prev => ({
      ...prev,
      asistentes: prev.asistentes.map(a => (a.id === id ? { ...a, asistencia: value } : a)),
    }));
  };

  const subirMaterial = async () => {
    if (!nuevoArchivo) {
      await Swal.fire("Atención", "Selecciona un archivo para subir.", "warning");
      return;
    }
    // Material es opcional, por eso no bloqueamos por isFinished
    setEvento(prev => ({
      ...prev,
      materiales: [
        ...prev.materiales,
        { id: Math.random().toString(36).slice(2, 9), nombre: nuevoArchivo.name, visible: true },
      ],
    }));
    setNuevoArchivo(null);
    await Swal.fire("Éxito", "Material subido correctamente.", "success");
  };

  const toggleVis = async (id: string) => {
    setEvento(prev => ({
      ...prev,
      materiales: prev.materiales.map(m => (m.id === id ? { ...m, visible: !m.visible } : m)),
    }));
    await Swal.fire("Actualizado", "Visibilidad cambiada.", "info");
  };

  const rango = useMemo(() => {
    const f = new Date(evento.fin);
    const i = new Date(evento.inicio);
    const fmt = (d: Date) =>
      d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) +
      " " +
      d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
    return `${fmt(i)} — ${fmt(f)}`;
  }, [evento.inicio, evento.fin]);

  return (
    <section className={styles.wrapper}>
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <h2>Panel del docente</h2>
        </div>
      </div>

      <div className={styles.container}>
        {/* Encabezado del evento */}
        <div className={styles.eventHeader}>
          <div>
            <div className={styles.eventName}>{evento.nombre}</div>
            <div className={styles.muted}>Tipo de evento: {evento.tipo}</div>
            <div className={styles.muted}>Horario: {rango}</div>
          </div>
          <div>
            {isFinished ? (
              <span className={styles.lockBadge} title="El evento ya finalizó">
                Evento finalizado
              </span>
            ) : (
              <span className={styles.openBadge}>Evento activo</span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === "asistencia" ? styles.activeTabRed : ""}`}
            onClick={() => setTab("asistencia")}
          >
            ASISTENCIA
          </button>
          <button
            className={`${styles.tab} ${tab === "material" ? styles.activeTabBlue : ""}`}
            onClick={() => setTab("material")}
          >
            MATERIAL PEDAGÓGICO
          </button>
        </div>

        {/* ASISTENCIA (obligatoria, bloqueada si finalizó) */}
        {tab === "asistencia" && (
          <div className={styles.card}>
            <div className={styles.toolbarRow}>
              <div className={styles.searchBox}>
                <input
                  placeholder="Buscar estudiante..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <div className={styles.filterGroup}>
                {isFinished && <span className={styles.muted}>Edición bloqueada</span>}
              </div>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {asistentesFiltrados.map((a) => (
                  <tr key={a.id} className={isFinished ? styles.disabledRow : ""}>
                    <td>{a.nombre}</td>
                    <td>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          disabled={isFinished}
                          checked={a.asistencia ?? false}
                          onChange={(e) => changeAsistencia(a.id, e.target.checked)}
                        />
                        <span>{a.asistencia ? "Sí" : "No"}</span>
                      </label>
                    </td>
                  </tr>
                ))}
                {asistentesFiltrados.length === 0 && (
                  <tr><td colSpan={2} className={styles.emptyCell}>Sin resultados.</td></tr>
                )}
              </tbody>
            </table>

            <button className={styles.btnPrimary} onClick={saveAsistencia} disabled={isFinished}>
              GUARDAR
            </button>
          </div>
        )}

        {/* MATERIAL (opcional) */}
        {tab === "material" && (
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Materiales disponibles</h3>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Archivo</th>
                  <th>Visibilidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {evento.materiales.map((m) => (
                  <tr key={m.id}>
                    <td>{m.nombre}</td>
                    <td>{m.visible ? "Visible" : "No visible"}</td>
                    <td>
                      <button className={styles.btnLight} onClick={() => toggleVis(m.id)}>
                        Cambiar
                      </button>
                    </td>
                  </tr>
                ))}
                {evento.materiales.length === 0 && (
                  <tr><td colSpan={3} className={styles.emptyCell}>No hay materiales aún.</td></tr>
                )}
              </tbody>
            </table>

            <div className={styles.uploadBar}>
              <div className={styles.fileBox}>
                <input
                  id="fileInput"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                  onChange={(e) => setNuevoArchivo(e.target.files?.[0] || null)}
                />
                <label htmlFor="fileInput" className={styles.btnOutline}>
                  Seleccionar archivo
                </label>
                <span className={styles.fileName}>
                  {nuevoArchivo ? nuevoArchivo.name : "Ningún archivo seleccionado"}
                </span>
                <small className={styles.fileHelp}>
                  Se permiten: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT (máx. 10&nbsp;MB).
                </small>
              </div>

              <button className={styles.btnPrimary} onClick={subirMaterial}>
                SUBIR MATERIAL ⤴
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
