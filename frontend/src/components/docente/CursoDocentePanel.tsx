"use client";

import { useState, useMemo } from "react";
import Swal from "sweetalert2";
import styles from "./docentePanel.module.css";

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
  // 🧩 Datos simulados (sustituye luego con tu fetch al backend)
  const alumnosMock: Alumno[] = [
    { id: "1", nombre: "Estudiante 1", nota: 8.5, asistencia: true },
    { id: "2", nombre: "Estudiante 2", nota: 9.2, asistencia: false },
    { id: "3", nombre: "Estudiante 3", nota: 6.0, asistencia: true },
  ];

  const materialesMock: Material[] = [
    { id: "m1", nombre: "Diapositiva clase 1.pdf", visible: true },
  ];

  const [tab, setTab] = useState<Tab>("material");
  const [alumnos, setAlumnos] = useState<Alumno[]>(alumnosMock);
  const [materiales, setMateriales] = useState<Material[]>(materialesMock);

  const [nuevoArchivo, setNuevoArchivo] = useState<File | null>(null);

  // 🔹 Resumen de notas
  const resumen = useMemo(() => {
    const total = alumnos.length;
    const aprobados = alumnos.filter((a) => (a.nota ?? 0) >= 7).length;
    const reprobados = alumnos.filter((a) => (a.nota ?? 0) < 7 && a.nota !== undefined).length;
    const progreso = total - aprobados - reprobados;
    return { total, aprobados, reprobados, progreso };
  }, [alumnos]);

  // 📤 Subir material
  const subirMaterial = async () => {
    if (!nuevoArchivo) {
      Swal.fire("Atención", "Selecciona un archivo para subir", "warning");
      return;
    }
    const nuevo: Material = {
      id: Math.random().toString(36).substring(2, 9),
      nombre: nuevoArchivo.name,
      visible: true,
    };
    setMateriales([...materiales, nuevo]);
    setNuevoArchivo(null);
    Swal.fire("Éxito", "Material subido correctamente", "success");
  };

  // 👁️ Cambiar visibilidad de material
  const toggleVisibilidad = async (id: string) => {
    setMateriales((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, visible: !m.visible } : m
      )
    );
    Swal.fire("Actualizado", "Estado de visibilidad cambiado", "info");
  };

  // 💾 Guardar notas
  const guardarNotas = async () => {
    Swal.fire("Guardado", "Las notas fueron registradas correctamente", "success");
  };

  // 💾 Guardar asistencia
  const guardarAsistencia = async () => {
    Swal.fire("Guardado", "La asistencia fue registrada correctamente", "success");
  };

  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>CURSOS DE JAVA</h1>

      {/* --- Tabs --- */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "material" ? styles.activeTabRed : ""}`}
          onClick={() => setTab("material")}
        >
          MATERIAL PEDAGÓGICO
        </button>
        <button
          className={`${styles.tab} ${tab === "notas" ? styles.activeTabBlue : ""}`}
          onClick={() => setTab("notas")}
        >
          NOTAS
        </button>
        <button
          className={`${styles.tab} ${tab === "asistencia" ? styles.activeTabBlue : ""}`}
          onClick={() => setTab("asistencia")}
        >
          ASISTENCIA
        </button>
      </div>

      {/* --- MATERIAL --- */}
      {tab === "material" && (
        <div className={styles.card}>
          <h3>Subir nuevo material</h3>
          <div className={styles.materialUpload}>
            <input
              type="file"
              onChange={(e) => setNuevoArchivo(e.target.files?.[0] || null)}
            />
            <button onClick={subirMaterial}>SUBIR MATERIAL</button>
          </div>

          <h4>Materiales disponibles</h4>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Archivo</th>
                <th>Visibilidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map((m) => (
                <tr key={m.id}>
                  <td>{m.nombre}</td>
                  <td>{m.visible ? "Visible" : "No visible"}</td>
                  <td>
                    <button onClick={() => toggleVisibilidad(m.id)}>
                      Cambiar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- NOTAS --- */}
      {tab === "notas" && (
        <div className={styles.card}>
          <div className={styles.resumenNotas}>
            <span>Total: {resumen.total}</span>
            <span className={styles.aprobado}>Aprobados: {resumen.aprobados}</span>
            <span className={styles.reprobado}>Reprobados: {resumen.reprobados}</span>
            <span className={styles.progreso}>En progreso: {resumen.progreso}</span>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Nota</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((a) => (
                <tr key={a.id}>
                  <td>{a.nombre}</td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.1}
                      value={a.nota ?? ""}
                      onChange={(e) =>
                        setAlumnos((prev) =>
                          prev.map((x) =>
                            x.id === a.id
                              ? { ...x, nota: parseFloat(e.target.value) }
                              : x
                          )
                        )
                      }
                    />
                  </td>
                  <td>
                    {a.nota === undefined
                      ? "En progreso"
                      : a.nota >= 7
                      ? "Aprobado"
                      : "Reprobado"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className={styles.btnGuardar} onClick={guardarNotas}>
            GUARDAR
          </button>
        </div>
      )}

      {/* --- ASISTENCIA --- */}
      {tab === "asistencia" && (
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Asistencia</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((a) => (
                <tr key={a.id}>
                  <td>{a.nombre}</td>
                  <td>
                    <label>
                      <input
                        type="checkbox"
                        checked={a.asistencia ?? false}
                        onChange={(e) =>
                          setAlumnos((prev) =>
                            prev.map((x) =>
                              x.id === a.id
                                ? { ...x, asistencia: e.target.checked }
                                : x
                            )
                          )
                        }
                      />
                      {a.asistencia ? "Sí" : "No"}
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className={styles.btnGuardar} onClick={guardarAsistencia}>
            GUARDAR
          </button>
        </div>
      )}
    </section>
  );
}
