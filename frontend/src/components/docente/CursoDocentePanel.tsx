"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import styles from "./docentePanel.module.css";
import Link from "next/link";

type Alumno = {
  id: string;
  nombre: string;
  nota?: number;
  asistencia?: boolean;
};

type Material = {
  id: string;
  nombre: string;
  visible: boolean;
};

type Tab = "material" | "notas" | "asistencia";

export default function CursoDocentePanel({ courseId }: { courseId: string }) {
  const [alumnos, setAlumnos] = useState<Alumno[]>([
    { id: "1", nombre: "Estudiante 1", nota: 6.5, asistencia: true },
    { id: "2", nombre: "Estudiante 2", nota: 9.2, asistencia: false },
    { id: "3", nombre: "Estudiante 3", asistencia: true },
  ]);

  const [materiales, setMateriales] = useState<Material[]>([
    { id: "m1", nombre: "Diapositiva clase 1.pdf", visible: false },
  ]);

  const [tab, setTab] = useState<Tab>("material");
  const [nuevoArchivo, setNuevoArchivo] = useState<File | null>(null);

  const [qNotas, setQNotas] = useState("");
  const [filtroNotas, setFiltroNotas] = useState<"Todos" | "Aprobado" | "Reprobado" | "En Progreso">("Todos");

  const [qAsistencia, setQAsistencia] = useState("");
  const [isFinished] = useState<boolean>(false);

  const estadoDe = (a: Alumno): "Aprobado" | "Reprobado" | "En Progreso" => {
    if (a.nota === undefined || Number.isNaN(a.nota)) return "En Progreso";
    return a.nota >= 7 ? "Aprobado" : "Reprobado";
  };

  const alumnosNotas = useMemo(() => {
    return alumnos.filter((a) => {
      const byName = a.nombre.toLowerCase().includes(qNotas.toLowerCase().trim());
      const est = estadoDe(a);
      const byFilter = filtroNotas === "Todos" ? true : est === filtroNotas;
      return byName && byFilter;
    });
  }, [alumnos, qNotas, filtroNotas]);

  const alumnosAsistencia = useMemo(() => {
    return alumnos.filter((a) => a.nombre.toLowerCase().includes(qAsistencia.toLowerCase().trim()));
  }, [alumnos, qAsistencia]);

  const subirMaterial = async () => {
    if (!nuevoArchivo) {
      Swal.fire("Atención", "Selecciona un archivo para subir", "warning");
      return;
    }
    const nuevo: Material = { id: Math.random().toString(36).slice(2, 9), nombre: nuevoArchivo.name, visible: true };
    setMateriales((prev) => [...prev, nuevo]);
    setNuevoArchivo(null);
    Swal.fire("Éxito", "Material subido correctamente", "success");
  };

  const toggleVisibilidad = async (id: string) => {
    setMateriales((prev) => prev.map((m) => (m.id === id ? { ...m, visible: !m.visible } : m)));
    Swal.fire("Actualizado", "Estado de visibilidad cambiado", "info");
  };

  const guardarNotas = async () => {
    if (isFinished) {
      Swal.fire("Curso finalizado", "No se pueden modificar las notas.", "info");
      return;
    }
    Swal.fire("Guardado", "Las notas fueron registradas correctamente", "success");
  };

  const guardarAsistencia = async () => {
    if (isFinished) {
      Swal.fire("Curso finalizado", "No se puede modificar la asistencia.", "info");
      return;
    }
    Swal.fire("Guardado", "La asistencia fue registrada correctamente", "success");
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.backRow}>
        <Link href="/cursos/docente" className={styles.backLink}>
          <span className={styles.backIcon}>←</span> Regresar
        </Link>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${tab === "material" ? styles.activeTabRed : ""}`} onClick={() => setTab("material")}>
          MATERIAL PEDAGÓGICO
        </button>
        <button className={`${styles.tab} ${tab === "notas" ? styles.activeTabBlue : ""}`} onClick={() => setTab("notas")}>
          NOTAS
        </button>
        <button className={`${styles.tab} ${tab === "asistencia" ? styles.activeTabBlue : ""}`} onClick={() => setTab("asistencia")}>
          ASISTENCIA
        </button>
      </div>

      {tab === "material" && (
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Archivo</th>
                <th>Visibilidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materiales.length ? (
                materiales.map((m) => (
                  <tr key={m.id}>
                    <td>{m.nombre}</td>
                    <td>{m.visible ? "Visible" : "No visible"}</td>
                    <td>
                      <button className={styles.btnLight} onClick={() => toggleVisibilidad(m.id)}>Cambiar</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className={styles.emptyCell}>No hay materiales aún.</td></tr>
              )}
            </tbody>
          </table>

          <div className={styles.uploadBar}>
            <div className={styles.fileBox}>
              <input id="fileInput" type="file" onChange={(e) => setNuevoArchivo(e.target.files?.[0] || null)} />
              <label htmlFor="fileInput" className={styles.btnOutline}>Seleccionar archivo</label>
              <span className={styles.fileName}>{nuevoArchivo ? nuevoArchivo.name : "Ningún archivo seleccionado"}</span>
            </div>
            <button className={styles.btnPrimary} onClick={subirMaterial}>SUBIR MATERIAL ⤴</button>
          </div>
        </div>
      )}

      {tab === "notas" && (
        <div className={styles.card}>
          <div className={styles.toolbarRow}>
            <input placeholder="Buscar estudiante..." value={qNotas} onChange={(e) => setQNotas(e.target.value)} disabled={isFinished} />
            <select value={filtroNotas} onChange={(e) => setFiltroNotas(e.target.value as any)} disabled={isFinished}>
              <option value="Todos">Todos</option>
              <option value="Aprobado">Aprobados</option>
              <option value="Reprobado">Reprobados</option>
              <option value="En Progreso">En progreso</option>
            </select>
            <button className={styles.btnLight} onClick={() => { setQNotas(""); setFiltroNotas("Todos"); }} disabled={isFinished}>Limpiar filtros</button>
            {isFinished && <span className={styles.muted}>Edición bloqueada (curso finalizado)</span>}
          </div>

          <table className={styles.table}>
            <thead><tr><th>Estudiante</th><th>Nota</th><th>Estado</th></tr></thead>
            <tbody>
              {alumnosNotas.length ? (
                alumnosNotas.map((a) => (
                  <tr key={a.id}>
                    <td>{a.nombre}</td>
                    <td>
                      <input
                        className={styles.notaInput}
                        type="number"
                        min={0} max={10} step={0.1}
                        value={a.nota ?? ""}
                        onChange={(e) => {
                          if (isFinished) return;
                          const raw = e.target.value;
                          setAlumnos(prev => prev.map(x => x.id === a.id ? { ...x, nota: raw === "" ? undefined : Number(raw) } : x));
                        }}
                        disabled={isFinished}
                      />
                    </td>
                    <td>{estadoDe(a)}</td>
                  </tr>
                ))
              ) : <tr><td colSpan={3} className={styles.emptyCell}>Sin resultados.</td></tr>}
            </tbody>
          </table>
          <button className={styles.btnDanger} onClick={guardarNotas} disabled={isFinished}>GUARDAR</button>
        </div>
      )}

      {tab === "asistencia" && (
        <div className={styles.card}>
          <div className={styles.toolbarRow}>
            <input placeholder="Buscar estudiante..." value={qAsistencia} onChange={(e) => setQAsistencia(e.target.value)} disabled={isFinished} />
            <button className={styles.btnLight} onClick={() => setQAsistencia("")} disabled={isFinished}>Limpiar búsqueda</button>
            {isFinished && <span className={styles.muted}>Edición bloqueada (curso finalizado)</span>}
          </div>

          <table className={styles.table}>
            <thead><tr><th>Estudiante</th><th>Asistencia</th></tr></thead>
            <tbody>
              {alumnosAsistencia.length ? (
                alumnosAsistencia.map((a) => (
                  <tr key={a.id} className={isFinished ? styles.disabledRow : ""}>
                    <td>{a.nombre}</td>
                    <td>
                      <label className={styles.switch}>
                        <input
                          type="checkbox"
                          checked={a.asistencia ?? false}
                          onChange={(e) => !isFinished && setAlumnos(prev => prev.map(x => x.id === a.id ? { ...x, asistencia: e.target.checked } : x))}
                          disabled={isFinished}
                        />
                        <span>{a.asistencia ? "Sí" : "No"}</span>
                      </label>
                    </td>
                  </tr>
                ))
              ) : <tr><td colSpan={2} className={styles.emptyCell}>Sin resultados.</td></tr>}
            </tbody>
          </table>
          <button className={styles.btnPrimary} onClick={guardarAsistencia} disabled={isFinished}>GUARDAR</button>
        </div>
      )}
    </section>
  );
}
