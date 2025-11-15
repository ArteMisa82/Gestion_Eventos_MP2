"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import type { Course } from "../courses.data";

export default function CourseDetailClient({ course }: { course: Course }) {
  const router = useRouter();
  const tabs = [
    "Información del curso",
    "Requisitos y detalles",
    "Materiales y equipos",
    "Contenidos",
  ] as const;
  const [active, setActive] = useState<(typeof tabs)[number]>(tabs[0]);

  function handleRegister() {
    Swal.fire({
      icon: "warning",
      title: "Necesitas una cuenta",
      text: "Para inscribirte debes iniciar sesión o registrarte.",
      showCancelButton: true,
      confirmButtonText: "Ir a registrarse",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#7f1d1d",
    }).then((r) => {
      if (r.isConfirmed) router.push("/registro");
    });
  }

  return (
    <>
      {/* Tabs header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, max-content) 1fr",
          gap: 0,
          marginTop: 24,
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        {tabs.map((t) => {
          const isActive = t === active;
          return (
            <button
              key={t}
              onClick={() => setActive(t)}
              style={{
                border: "none",
                background: "transparent",
                padding: "14px 20px",
                cursor: "pointer",
                fontWeight: 600,
                color: isActive ? "#111827" : "#6b7280",
                borderBottom: isActive ? "3px solid #7f1d1d" : "3px solid transparent",
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
              }}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <section
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderTop: "none",
          borderRadius: "0 0 12px 12px",
          padding: 20,
          boxShadow: "0 2px 6px rgba(0,0,0,.04)",
        }}
      >
        {active === "Información del curso" && (
          <div style={{ lineHeight: 1.7 }}>
            <p>
              <strong>Fechas de inscripciones:</strong> Personaliza aquí las fechas.
            </p>
            <p>
              <strong>Cupo:</strong> Define el mínimo y máximo de participantes.
            </p>
            <p>
              <strong>Lugar:</strong> Laboratorio o aula asignada — FISEI.
            </p>
            <p>
              <strong>Modalidad:</strong> {course.distance ? "A distancia" : "Presencial"}
            </p>
            <p>
              <strong>Dirigido a:</strong> Estudiantes, graduados, docentes y público en general.
            </p>
          </div>
        )}

        {active === "Requisitos y detalles" && (
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
            <li>Conocimientos previos básicos del área.</li>
            <li>Asistencia mínima del 80%.</li>
            <li>Evaluaciones o proyectos según el curso.</li>
            <li>Certificado digital de asistencia y aprobación.</li>
          </ul>
        )}

        {active === "Materiales y equipos" && (
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
            <li>Portátil con navegador actualizado.</li>
            <li>Acceso a Internet estable.</li>
            <li>
              Software/herramientas: especificar según el curso (IDE, librerías, plataformas).
            </li>
            <li>Material de apoyo (PDFs, guías, datasets, etc.).</li>
          </ul>
        )}

        {active === "Contenidos" && (
          <div style={{ lineHeight: 1.9 }}>
            <p>
              <strong>Clase 1:</strong> Introducción al tema principal.
            </p>
            <p>
              <strong>Clase 2:</strong> Fundamentos y conceptos clave.
            </p>
            <p>
              <strong>Clase 3:</strong> Taller práctico / laboratorio.
            </p>
            <p>
              <strong>Clase 4:</strong> Mejores prácticas y casos reales.
            </p>
            <p>
              <strong>Clase 5:</strong> Proyecto integrador y evaluación.
            </p>
          </div>
        )}
      </section>

      {/* CTA */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
        <button
          onClick={handleRegister}
          style={{
            background: "#7f1d1d",
            color: "#fff",
            border: 0,
            borderRadius: 10,
            padding: "14px 22px",
            fontWeight: 700,
            letterSpacing: ".2px",
            boxShadow: "0 6px 18px rgba(127,29,29,.25)",
            cursor: "pointer",
          }}
        >
          REGISTRARME EN ESTE CURSO
        </button>
      </div>
    </>
  );
}
