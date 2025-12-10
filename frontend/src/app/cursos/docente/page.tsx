"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { eventosAPI } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import Swal from "sweetalert2";
import styles from "./docente.module.css";

type TeacherCourse = {
  id: string;
  titulo: string;
  estado: "ABIERTO" | "CERRADO" | "FINALIZADO";
  horas: number;
  portada: string;
  modalidad: string;
  idDetalle?: string;
};

export default function DocenteCursosPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [cursos, setCursos] = useState<TeacherCourse[]>([]);
  const [eventos, setEventos] = useState<TeacherCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Proteger la ruta - solo docentes autenticados
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      Swal.fire({
        icon: "warning",
        title: "Acceso denegado",
        text: "Debes iniciar sesión para acceder a esta sección",
        confirmButtonColor: "#581517",
      }).then(() => {
        router.push("/login");
      });
    }
    // Verificar si el usuario tiene eventos asignados como instructor/docente
    // La verificación real se hace en el backend al obtener mis-eventos
  }, [authLoading, isAuthenticated, router]);

  // Cargar cursos y eventos del docente
  useEffect(() => {
    if (!user) return;

    const fetchMisEventos = async () => {
      try {
        setIsLoading(true);
        const response = await eventosAPI.getMisEventos();
        
        if (!response.success || !Array.isArray(response.data)) {
          throw new Error("Formato de datos inválido");
        }

        // Separar cursos y eventos
        const todosCursos: TeacherCourse[] = [];
        const todosEventos: TeacherCourse[] = [];

        response.data.forEach((evento: any) => {
          const tipoEvento = evento.tip_evt?.toUpperCase() || "";
          const esCurso = ["CURSO", "TALLER", "CAPACITACION", "SEMINARIO"].includes(tipoEvento);
          
          const item: TeacherCourse = {
            id: evento.id_evt,
            titulo: evento.nom_evt,
            estado: evento.est_evt === "PUBLICADO" ? "ABIERTO" : 
                    evento.est_evt === "CERRADO" ? "CERRADO" : "FINALIZADO",
            horas: evento.hrs_evt || 0,
            portada: evento.ima_evt || "/Default_Image.png",
            modalidad: evento.mod_evt || "Presencial",
            idDetalle: evento.detalles?.[0]?.id_det || undefined,
          };

          if (esCurso) {
            todosCursos.push(item);
          } else {
            todosEventos.push(item);
          }
        });

        setCursos(todosCursos);
        setEventos(todosEventos);
      } catch (error: any) {
        console.error("Error al cargar eventos:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudieron cargar tus cursos asignados",
          confirmButtonColor: "#581517",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMisEventos();
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.topBar}>
          <div className={styles.topBarInner}>
            <h2>Panel del docente</h2>
          </div>
        </div>
        <div className={styles.container}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className={styles.wrapper}>
      {/* Barra superior interna */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <h2>Panel del docente</h2>
        </div>
      </div>

      {/* Contenedor para alinear títulos y grids con las tarjetas */}
      <div className={styles.container}>
        <h1 className={styles.sectionTitle}>CURSOS EN PROCESO</h1>

        {/* Grid de cursos */}
        {cursos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
            <p>No tienes cursos asignados actualmente</p>
          </div>
        ) : (
          <div className={styles.coursesGrid}>
            {cursos.map((c) => (
              <Link key={c.id} href={`/cursos/docente/${c.id}`} className={styles.card}>
                <div className={styles.thumb}>
                  <img src={c.portada} alt={c.titulo} />
                </div>

                <div className={styles.metaRow}>
                  <span className={styles.badge}>
                    <i className="bi bi-people"></i> {c.estado.toLowerCase()}
                  </span>
                  <span className={styles.badge}>
                    <i className="bi bi-clock-history"></i> {c.horas} horas
                  </span>
                  <span className={styles.badge}>
                    <i className="bi bi-display"></i> {c.modalidad}
                  </span>
                </div>

                <h3 className={styles.courseTitle}>{c.titulo}</h3>
              </Link>
            ))}
          </div>
        )}

        <h1 className={styles.sectionTitle}>EVENTOS</h1>

        {eventos.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
            <p>No tienes eventos asignados actualmente</p>
          </div>
        ) : (
          <div className={styles.eventsGrid}>
            {eventos.map((e) => (
              <Link key={e.id} href={`/cursos/docente/${e.id}`} className={styles.eventCard}>
                <img src={e.portada} alt={e.titulo} />
                <h3>{e.titulo}</h3>
                <p>{e.modalidad} • {e.horas} horas</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
 