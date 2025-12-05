"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import styles from "./docentePanel.module.css";
import Link from "next/link";
import { eventosAPI, calificacionesAPI, materialesAPI } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

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
  des_mat?: string;
  mat_det?: string;
  tip_mat?: string;
};

type Tab = "material" | "notas" | "asistencia";

export default function CursoDocentePanel({ courseId }: { courseId: string }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [tab, setTab] = useState<Tab>("material");
  const [nuevoArchivo, setNuevoArchivo] = useState<File | null>(null);
  const [idDetalle, setIdDetalle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [eventoNombre, setEventoNombre] = useState<string>("");

  const [qNotas, setQNotas] = useState("");
  const [filtroNotas, setFiltroNotas] = useState<"Todos" | "Aprobado" | "Reprobado" | "En Progreso">("Todos");
  const [qAsistencia, setQAsistencia] = useState("");
  const [isFinished] = useState<boolean>(false);

  // Cargar datos del evento
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    const cargarDatos = async () => {
      try {
        setIsLoading(true);

        // Obtener detalles del evento
        const responseDetalles = await eventosAPI.getDetallesPorEvento(courseId);
        const detalles = responseDetalles.data || [];

        if (detalles.length === 0) {
          throw new Error("No se encontraron detalles para este curso");
        }

        const detalle = detalles[0];
        setIdDetalle(detalle.id_det);
        setEventoNombre(detalle.eventos?.nom_evt || "Curso");

        // Cargar alumnos con calificaciones
        await cargarAlumnos(detalle.id_det);

        // Cargar materiales
        await cargarMateriales(detalle.id_det);
      } catch (error: any) {
        console.error("Error al cargar datos:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudieron cargar los datos del curso",
          confirmButtonColor: "#581517",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && isAuthenticated) {
      cargarDatos();
    }
  }, [courseId, authLoading, isAuthenticated, router]);

  const cargarAlumnos = async (detalle: string) => {
    try {
      const response = await calificacionesAPI.obtenerCalificaciones(detalle);
      const datosCalificaciones = response.data || [];

      const alumnosData: Alumno[] = datosCalificaciones.map((cal: any) => ({
        id: cal.id_reg_per?.toString() || cal.id,
        nombre: `${cal.nombre} ${cal.apellido}`,
        nota: cal.not_fin_evt !== undefined && cal.not_fin_evt !== null ? Number(cal.not_fin_evt) / 10 : undefined, // Convertir de 0-100 a 0-10
        asistencia: cal.asi_evt_det !== undefined ? cal.asi_evt_det > 0 : undefined,
      }));

      setAlumnos(alumnosData);
    } catch (error) {
      console.error("Error al cargar alumnos:", error);
    }
  };

  const cargarMateriales = async (detalle: string) => {
    try {
      const response = await materialesAPI.obtenerTodos(detalle);
      const datosMateriales = response.data || [];

      const materialesData: Material[] = datosMateriales.map((mat: any) => ({
        id: mat.id_mat,
        nombre: mat.nom_mat,
        visible: mat.vis_est_mat === 1 || mat.vis_est_mat === true,
        des_mat: mat.des_mat,
        mat_det: mat.mat_det,
        tip_mat: mat.tip_mat,
      }));

      setMateriales(materialesData);
    } catch (error) {
      console.error("Error al cargar materiales:", error);
    }
  };

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

    if (!idDetalle) {
      Swal.fire("Error", "No se pudo obtener el ID del detalle", "error");
      return;
    }

    try {
      // Convertir archivo a base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;

          await materialesAPI.subir({
            id_det: idDetalle,
            nom_mat: nuevoArchivo.name,
            des_mat: `Material subido por el docente`,
            mat_det: base64,
            tip_mat: nuevoArchivo.type,
            tam_mat: nuevoArchivo.size,
            vis_est_mat: true,
          });

          await cargarMateriales(idDetalle);
          setNuevoArchivo(null);
          Swal.fire("Éxito", "Material subido correctamente", "success");
        } catch (error: any) {
          console.error("Error al subir material:", error);
          Swal.fire("Error", error.message || "No se pudo subir el material", "error");
        }
      };
      reader.readAsDataURL(nuevoArchivo);
    } catch (error: any) {
      Swal.fire("Error", "No se pudo procesar el archivo", "error");
    }
  };

  const toggleVisibilidad = async (id: string) => {
    try {
      const material = materiales.find(m => m.id === id);
      if (!material) return;

      await materialesAPI.cambiarVisibilidad(id, !material.visible);
      setMateriales((prev) => prev.map((m) => (m.id === id ? { ...m, visible: !m.visible } : m)));
      Swal.fire("Actualizado", "Estado de visibilidad cambiado", "info");
    } catch (error: any) {
      Swal.fire("Error", error.message || "No se pudo cambiar la visibilidad", "error");
    }
  };

  const guardarNotas = async () => {
    if (isFinished) {
      Swal.fire("Curso finalizado", "No se pueden modificar las notas.", "info");
      return;
    }

    if (!idDetalle) {
      Swal.fire("Error", "No se pudo obtener el ID del detalle", "error");
      return;
    }

    try {
      // Preparar calificaciones (convertir de 0-10 a 0-100)
      const calificaciones = alumnos
        .filter(a => a.nota !== undefined && a.nota !== null)
        .map(a => ({
          id_reg_per: a.id,
          not_fin_evt: Math.round((a.nota || 0) * 10), // Convertir de 0-10 a 0-100
        }));

      if (calificaciones.length === 0) {
        Swal.fire("Sin cambios", "No hay notas para guardar", "info");
        return;
      }

      await calificacionesAPI.asignarCalificacionesLote(idDetalle, calificaciones);
      Swal.fire("Guardado", `${calificaciones.length} nota(s) registrada(s) correctamente`, "success");
    } catch (error: any) {
      console.error("Error al guardar notas:", error);
      Swal.fire("Error", error.message || "No se pudieron guardar las notas", "error");
    }
  };

  const guardarAsistencia = async () => {
    if (isFinished) {
      Swal.fire("Curso finalizado", "No se puede modificar la asistencia.", "info");
      return;
    }

    if (!idDetalle) {
      Swal.fire("Error", "No se pudo obtener el ID del detalle", "error");
      return;
    }

    try {
      // Preparar asistencias
      const calificaciones = alumnos
        .filter(a => a.asistencia !== undefined)
        .map(a => ({
          id_reg_per: a.id,
          asi_evt_det: a.asistencia ? 100 : 0,
        }));

      if (calificaciones.length === 0) {
        Swal.fire("Sin cambios", "No hay asistencias para guardar", "info");
        return;
      }

      await calificacionesAPI.asignarCalificacionesLote(idDetalle, calificaciones);
      Swal.fire("Guardado", `${calificaciones.length} asistencia(s) registrada(s) correctamente`, "success");
    } catch (error: any) {
      console.error("Error al guardar asistencia:", error);
      Swal.fire("Error", error.message || "No se pudo guardar la asistencia", "error");
    }
  };

  if (isLoading) {
    return (
      <section className={styles.wrapper}>
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <p>Cargando datos del curso...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.backRow}>
        <Link href="/cursos/docente" className={styles.backLink}>
          <span className={styles.backIcon}>←</span> Regresar
        </Link>
      </div>

      {eventoNombre && (
        <div style={{ padding: "1rem 2rem" }}>
          <h1 style={{ color: "#581517", marginBottom: "0.5rem" }}>{eventoNombre}</h1>
          <p style={{ color: "#666", fontSize: "0.9rem" }}>
            {alumnos.length} estudiante(s) inscritos • {materiales.length} material(es)
          </p>
        </div>
      )}

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
