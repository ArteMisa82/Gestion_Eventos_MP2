"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import type { Course } from "../courses.data";

type Audience = "GENERAL" | "ESTUDIANTES";
type Modality = "PRESENCIAL" | "VIRTUAL" | "HIBRIDA";
type PaymentKind = "GRATUITO" | "PAGO";
type CareerKey = "SOFTWARE" | "TI" | "ROBOTICA" | "TELECOM";

type ExtendedCourse = Course & {
  audience?: Audience;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  modality?: Modality;
  paymentKind?: PaymentKind;
  teacher?: string;
  careersTarget?: CareerKey[];
  semestersTarget?: number[];
  location?: string;
};

export default function CourseDetailClient({ course }: { course: Course }) {
  const router = useRouter();
  const ev = course as ExtendedCourse;

  // ✅ Título actualizado
  const tabs = ["Información del evento"] as const;
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

  // Helpers
  const fmtDate = (s?: string) => {
    if (!s) return "Por confirmar";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const audienceLabel: Record<Audience, string> = {
    GENERAL: "Público general",
    ESTUDIANTES: "Estudiantes",
  };

  const modalityLabel: Record<Modality, string> = {
    PRESENCIAL: "Presencial",
    VIRTUAL: "Virtual",
    HIBRIDA: "Híbrida",
  };

  const paymentLabel: Record<PaymentKind, string> = {
    GRATUITO: "Gratuito",
    PAGO: "De pago",
  };

  const careerLabel: Record<CareerKey, string> = {
    SOFTWARE: "Software",
    TI: "TI",
    ROBOTICA: "Robótica",
    TELECOM: "Telecomunicaciones",
  };

  const resolvedPayment: PaymentKind =
    ev.paymentKind ??
    ((course.type === "GRATIS" ? "GRATUITO" : "PAGO") as PaymentKind);

  return (
  <>
    {/* Contenedor centrado para tabs + contenido */}
    <div style={{ maxWidth: 900, width: "100%", margin: "28px auto 0" }}>
      {/* Tabs header */}
      <div
        style={{
      display: "flex",
      justifyContent: "center", // ✅ centra horizontalmente el título/tab
      borderBottom: "1px solid #e5e7eb",
      marginBottom: 0,
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

      {/* Contenido (tarjeta) */}
      <section
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderTop: "none",
          borderRadius: "0 0 12px 12px",
          padding: 20,
          boxShadow: "0 2px 6px rgba(0,0,0,.04)",
          margin: "0 auto",
        }}
      >
        {active === "Información del evento" && (
          <div style={{ lineHeight: 1.7 }}>
            <p><strong>Público objetivo:</strong> Por confirmar</p>
            <p><strong>Tipo de pago:</strong> De pago</p>
            <p><strong>Fecha de inicio:</strong> Por confirmar</p>
            <p><strong>Fecha de fin:</strong> Por confirmar</p>
            <p><strong>Duración (horas):</strong> {course.hours}</p>
            <p><strong>Modalidad:</strong> Por confirmar</p>
            <p><strong>Capacidad:</strong> Por confirmar</p>
            <p><strong>Docente asignado:</strong> Por confirmar</p>

            <div style={{ marginTop: 10 }}>
              <strong>Carreras dirigidas:</strong>
              <div style={{ marginTop: 8 }}>
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 10px",
                    border: "1px solid #e5e7eb",
                    borderRadius: 999,
                    fontSize: 12,
                    color: "#374151",
                    background: "#f9fafb",
                  }}
                >
                  {course.career.charAt(0) + course.career.slice(1).toLowerCase()}
                </span>
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <strong>Semestres dirigidos:</strong>
              <p style={{ color: "#6b7280", marginTop: 6 }}>Por confirmar</p>
            </div>
          </div>
        )}
      </section>
    </div>

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
        REGISTRARME EN ESTE EVENTO
      </button>
    </div>
  </>
);

}



