"use client";

import { useMemo, useState } from "react";
import Swal from "sweetalert2";
import styles from "./docentePanel.module.css";

type Alumno = {
  id: string;
  nombres: string;
  apellidos: string;
  estado: "Aprobado" | "Reprobado" | "En Progreso";
  nota?: number;        // 0-10
  asistencia?: boolean; // presente/ausente
  materialUrl?: string; // último material subido (si aplica)
};

type Props = { courseId: string };
type Tab = "material" | "notas" | "asistencia";

export default function CursoDocentePanel({ courseId }: Props) {
  // MOCK: cámbialo por fetch a tu API
  const alumnosBase: Alumno[] = useMemo(
    () => [
      { id: "1", nombres: "Andrea", apellidos: "Lema", estado: "En Progreso", nota: 8.6, asistencia: true },
      { id: "2", nombres: "Bryan", apellidos: "Paredes", estado: "Aprobado", nota: 9.2, asistencia: true },
      { id: "3", nombres: "Carlos", apellidos: "Ortiz", estado: "Reprobado", nota: 4.1, asistencia: false },
      { id: "4", nombres: "Diana", apellidos: "Ríos", estado: "En Progreso", nota: 7.1, asistencia: true },
      { id: "5", nombres: "Evelyn", apellidos: "Cardenas", estado: "En Progreso", nota: 0, asistencia: false },
    ],
    []
  );

  const [tab, setTab] = useState<Tab>("material");
  const [query, setQuery] = useState("");
  const [estado, setEstado] = useState<"Todos" | Alumno["estado"]>("Todos");
  const [alumnos, setAlumnos] = useState<Alumno[]>(alumnosBase);
  const [subiendo, setSubiendo] = useState<string | null>(null); // id alumno mientras sube

  const filtrados = useMemo(() => {
    return alumnos.filter(a => {
      const coincideTexto =
        (a.nombres + " " + a.apellidos).toLowerCase().includes(query.toLowerCase().trim());
      const coincideEstado = estado === "Todos" ? true : a.estado === estado;
      return coincideTexto && coincideEstado;
    });
  }, [alumnos, query, estado]);

  // Handlers comunes
  const onGuardarNotas = async () => {
    // TODO: POST a tu backend con { courseId, notas: alumnos.map({id, nota}) }
    await Swal.fire({
      icon: "success",
      title: "Notas guardadas",
      text: "Se registraron las calificaciones correctamente.",
      confirmButtonText: "OK",
    });
  };

  const onGuardarAsistencia = async () => {
    // TODO: POST a tu backend con { courseId, asistencia: alumnos.map({id, asistencia}) }
    await Swal.fire({
      icon: "success",
      title: "Asistencia guardada",
      text: "Se registró la asistencia correctamente.",
      confirmButtonText: "OK",
    });
  };

  const onSubirMaterial = async (alumnoId: string, file?: File | null) => {
    if (!file) {
      await Swal.fire({ icon: "warning", title: "Selecciona un archivo", timer: 1400, showConfirmButton: false });
      return;
    }
    setSubiendo(alumnoId);
    try {
      // TODO: subir a tu API + storage. Ejemplo:
      // const form = new FormData();
      // form.append("file", file);
      // await fetch(`${API}/docente/cursos/${courseId}/material/${alumnoId}`, { method:"POST", body: form });

      // MOCK: “subida”
      await new Promise(r => setTimeout(r, 900));
      setAlumnos(prev =>
        prev.map(a => (a.id === alumnoId ? { ...a, materialUrl: file.name } : a))
      );

      await Swal.fire({
        icon: "success",
        title: "Material subido",
        text: `Se guardó "${file.name}" para el estudiante.`,
        confirmButtonText: "OK",
      });
    } catch {
      await Swal.fire({ icon: "error", title: "Error al subir material" });
    } finally {
      setSubiendo(null);
    }
  };

  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>CURSOS DE JAVA</h1>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === "material" ? styles.activeTab : ""}`}
          onClick={() => setTab("material")}
        >
          MATERIAL PEDAGÓGICO
        </button>
        <button
          className={`${styles.tab} ${tab === "notas" ? styles.activeTabRed : ""}`}
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

      {/* Filtros / barra */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <label>Buscar por nombre:</label>
          <input
            placeholder="Escribe el nombre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Por estado</span>
          <select value={estado} onChange={(e) => setEstado(e.target.value as any)}>
            <option value="Todos">Todos los estados</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Reprobado">Reprobado</option>
            <option value="En Progreso">En Progreso</option>
          </select>
          <button className={styles.btnLight} onClick={() => { setQuery(""); setEstado("Todos"); }}>
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className={styles.table}>
        <div className={`${styles.row} ${styles.header}`}>
          <div>Curso / Estudiante</div>
          <div className={styles.colAction}>
            {tab === "material" ? "Subir material" : tab === "notas" ? "Nota" : "Asistencia"}
          </div>
        </div>

        {filtrados.map((a) => (
          <div key={a.id} className={styles.row}>
            <div className={styles.cellInfo}>
              <div className={styles.courseName}>Desarrollo Web Full Stack</div>
              <div className={styles.studentName}>{a.apellidos}, {a.nombres}</div>
              <div className={styles.courseMeta}>Finalizado: 14/3/2024 • Estado: {a.estado}</div>
            </div>

            {/* Columna de acción variable */}
            <div className={styles.colAction}>
              {tab === "material" && (
                <MaterialCell
                  disabled={subiendo === a.id}
                  onUpload={(file) => onSubirMaterial(a.id, file)}
                  value={a.materialUrl}
                />
              )}

              {tab === "notas" && (
                <NotaCell
                  value={a.nota ?? 0}
                  onChange={(val) =>
                    setAlumnos(prev => prev.map(x => x.id === a.id ? { ...x, nota: val } : x))
                  }
                />
              )}

              {tab === "asistencia" && (
                <AsistenciaCell
                  value={!!a.asistencia}
                  onChange={(val) =>
                    setAlumnos(prev => prev.map(x => x.id === a.id ? { ...x, asistencia: val } : x))
                  }
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Botón guardar por tab */}
      <div className={styles.footerBar}>
        {tab === "material" && (
          <span className={styles.hint}>Sube material por estudiante o general del curso.</span>
        )}
        {tab === "notas" && (
          <button className={styles.btnDanger} onClick={onGuardarNotas}>GUARDAR</button>
        )}
        {tab === "asistencia" && (
          <button className={styles.btnPrimary} onClick={onGuardarAsistencia}>GUARDAR</button>
        )}
      </div>
    </section>
  );
}

/* ------- Subcomponentes ------- */

function MaterialCell({
  disabled,
  onUpload,
  value,
}: {
  disabled?: boolean;
  value?: string;
  onUpload: (file?: File | null) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className={styles.materialCell}>
      <label className={styles.btnLight}>
        SUBIR MATERIAL
        <input
          type="file"
          hidden
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </label>
      <button
        className={styles.iconBtn}
        disabled={disabled}
        title="Cargar"
        onClick={() => onUpload(file)}
      >
        ⤴
      </button>
      {value && <span className={styles.fileTag} title={value}>{value}</span>}
    </div>
  );
}

function NotaCell({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <input
      type="number"
      min={0}
      max={10}
      step={0.1}
      className={styles.notaInput}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => {
        const v = parseFloat(e.target.value);
        if (v >= 0 && v <= 10) onChange(v);
      }}
    />
  );
}

function AsistenciaCell({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={styles.switch}>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span> {value ? "Sí" : "No"} </span>
    </label>
  );
}
