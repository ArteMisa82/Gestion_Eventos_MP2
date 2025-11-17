"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import { inscripcionesAPI } from "@/services/api";

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
  const [inscribiendo, setInscribiendo] = useState(false);

  const detalle = evento.detalle_eventos?.[0];
  const esDistancia = evento.mod_evt === 'VIRTUAL' || evento.mod_evt === 'A DISTANCIA';

  async function handleRegister() {
    // Verificar si hay sesión
    const token = localStorage.getItem('token');
    const usuarioStr = localStorage.getItem('usuario');

    if (!token || !usuarioStr) {
      Swal.fire({
        icon: "warning",
        title: "Necesitas una cuenta",
        text: "Para inscribirte debes iniciar sesión o registrarte.",
        showCancelButton: true,
        confirmButtonText: "Ir a registrarse",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#7f1d1d",
      }).then((r) => {
        if (r.isConfirmed) router.push("/login");
      });
      return;
    }

    try {
      const usuario = JSON.parse(usuarioStr);
      
      // Por ahora, asumimos que solo hay un registro_evento por detalle
      // En producción, deberías permitir al usuario elegir su nivel/carrera
      
      Swal.fire({
        icon: "info",
        title: "Inscripción",
        html: `
          <p>¿Deseas inscribirte a este curso?</p>
          <p><strong>${evento.nom_evt}</strong></p>
          <p style="color: #6b7280; font-size: 14px;">
            ${detalle?.hor_det || 0} horas · ${evento.tip_pub_evt}
          </p>
        `,
        showCancelButton: true,
        confirmButtonText: "Sí, inscribirme",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#7f1d1d",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await procesarInscripcion(token, usuario.id_usu);
        }
      });

    } catch (error) {
      console.error('Error al procesar registro:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al procesar tu solicitud. Por favor, inicia sesión nuevamente.",
        confirmButtonColor: "#7f1d1d",
      });
    }
  }

  async function procesarInscripcion(token: string, id_usu: number) {
    if (!detalle) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Este evento no tiene detalles configurados.",
        confirmButtonColor: "#7f1d1d",
      });
      return;
    }

    try {
      setInscribiendo(true);

      // TODO: En producción, deberías obtener el id_reg_evt correcto
      // basado en el nivel/carrera del usuario
      // Por ahora, usamos el id_det como placeholder
      const id_reg_evt = detalle.id_det;

      // Validar inscripción
      const validacion = await inscripcionesAPI.validar(token, {
        id_usu,
        id_reg_evt
      });

      if (!validacion.valido) {
        Swal.fire({
          icon: "warning",
          title: "No puedes inscribirte",
          text: validacion.mensaje || "No cumples los requisitos para este curso.",
          confirmButtonColor: "#7f1d1d",
        });
        return;
      }

      // Realizar inscripción
      await inscripcionesAPI.inscribir(token, {
        id_usu,
        id_reg_evt
      });

      Swal.fire({
        icon: "success",
        title: "¡Inscripción exitosa!",
        text: "Te has inscrito correctamente al curso. Recibirás más información en tu correo.",
        confirmButtonColor: "#7f1d1d",
      }).then(() => {
        router.push("/cursos");
      });

    } catch (error: any) {
      console.error('Error al inscribir:', error);
      Swal.fire({
        icon: "error",
        title: "Error al inscribirse",
        text: error.message || "No se pudo completar la inscripción. Intenta nuevamente.",
        confirmButtonColor: "#7f1d1d",
      });
    } finally {
      setInscribiendo(false);
    }
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

      {/* CTA */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 22 }}>
        <button
          onClick={handleRegister}
          disabled={inscribiendo || !detalle || detalle.est_evt_det !== 'INSCRIPCIONES'}
          style={{
            background: inscribiendo || !detalle || detalle.est_evt_det !== 'INSCRIPCIONES' ? "#9ca3af" : "#7f1d1d",
            color: "#fff",
            border: 0,
            borderRadius: 10,
            padding: "14px 22px",
            fontWeight: 700,
            letterSpacing: ".2px",
            boxShadow: "0 6px 18px rgba(127,29,29,.25)",
            cursor: inscribiendo || !detalle || detalle.est_evt_det !== 'INSCRIPCIONES' ? "not-allowed" : "pointer",
          }}
        >
          {inscribiendo ? "PROCESANDO..." : 
           !detalle ? "NO DISPONIBLE" :
           detalle.est_evt_det !== 'INSCRIPCIONES' ? "INSCRIPCIONES CERRADAS" :
           "REGISTRARME EN ESTE CURSO"}
        </button>
      </div>
    </>
  );
}



