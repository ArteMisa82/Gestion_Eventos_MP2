"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import type { Course } from "../courses.data";

export default function CourseDetailClient({ course }: { course: Course }) {
  const router = useRouter();

  // Solo un tab por ahora (pero dejamos la estructura lista por si luego agregas más)
  const tabs = ["Información del curso"] as const;
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

  // 🔸 Contenedor central para que TODO quede en el medio
  const centerWrap: React.CSSProperties = {
    maxWidth: 860,            // ancho cómodo para leer
    margin: "24px auto 0",   // centrado horizontal + separación superior
  };

  return (
    <>
      {/* Tabs header centrado */}
      <div style={{ ...centerWrap, marginTop: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 0,
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
                  fontWeight: 700,
                  fontSize: 16,
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
      </div>

      {/* Contenido del tab centrado */}
      <section
        style={{
          ...centerWrap,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderTop: "none",
          borderRadius: "0 0 12px 12px",
          padding: 20,
          boxShadow: "0 2px 6px rgba(0,0,0,.04)",
        }}
      >
        {active === "Información del curso" && (
          <div style={{ lineHeight: 1.75, fontSize: 16, color: "#1f2937" }}>
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
      </section>

      {/* CTA centrado */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
        <button
          onClick={handleRegister}
          style={{
            background: "#7f1d1d",
            color: "#fff",
            border: 0,
            borderRadius: 10,
            padding: "14px 22px",
            fontWeight: 800,
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

