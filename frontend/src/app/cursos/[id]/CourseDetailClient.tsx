"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { inscripcionesAPI } from "@/services/api";

interface EventoDetalle {
  id_evt: string;
  nom_evt: string;
  fec_evt: string;
  fec_fin_evt?: string | null;
  lug_evt: string;
  mod_evt: string;
  tip_pub_evt: string;
  cos_evt: string;
  des_evt: string;
  ima_evt?: string | null;
  detalle_eventos?: Array<{
    id_det: string;
    hor_det: number;
    cup_det: number;
    are_det: string;
    cat_det: string;
    tip_evt: string;
    est_evt_det: string;
  }>;
}

export default function CourseDetailClient({ evento }: { evento: EventoDetalle }) {
  const router = useRouter();
  const tabs = ["Información del evento"] as const;
  const [active, setActive] = useState<(typeof tabs)[number]>(tabs[0]);
  const [inscribiendo, setInscribiendo] = useState(false);

  const detalle = evento.detalle_eventos?.[0];

  async function handleRegister() {
    // Verificar si hay sesión
    const usuarioStr = localStorage.getItem('user');

    if (!usuarioStr) {
      Swal.fire({
        icon: "warning",
        title: "Necesitas una cuenta",
        text: "Para inscribirte debes iniciar sesión o registrarte.",
        showCancelButton: true,
        confirmButtonText: "Ir a iniciar sesión",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#7f1d1d",
      }).then((r) => {
        if (r.isConfirmed) router.push("/");
      });
      return;
    }

    try {
      const usuario = JSON.parse(usuarioStr);
      
      Swal.fire({
        icon: "info",
        title: "Inscripción",
        html: `
          <p>¿Deseas inscribirte a este evento?</p>
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
          await procesarInscripcion(usuario.id_usu);
        }
      });

    } catch (error) {
      console.error('Error al procesar registro:', error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error. Por favor, inicia sesión nuevamente.",
        confirmButtonColor: "#7f1d1d",
      });
    }
  }

  async function procesarInscripcion(id_usu: number) {
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

      Swal.fire({
        icon: "success",
        title: "¡Inscripción exitosa!",
        text: "Te has inscrito correctamente al evento.",
        confirmButtonColor: "#7f1d1d",
      }).then(() => {
        router.push("/cursos");
      });

    } catch (error: any) {
      console.error('Error al inscribir:', error);
      Swal.fire({
        icon: "error",
        title: "Error al inscribirse",
        text: error.message || "No se pudo completar la inscripción.",
        confirmButtonColor: "#7f1d1d",
      });
    } finally {
      setInscribiendo(false);
    }
  }

  const fmtDate = (s?: string | null) => {
    if (!s) return "Por confirmar";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    return d.toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <>
      <div style={{ maxWidth: 900, width: "100%", margin: "28px auto 0" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
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
              <p><strong>Público objetivo:</strong> {evento.tip_pub_evt}</p>
              <p><strong>Tipo de pago:</strong> {evento.cos_evt}</p>
              <p><strong>Fecha de inicio:</strong> {fmtDate(evento.fec_evt)}</p>
              <p><strong>Fecha de fin:</strong> {fmtDate(evento.fec_fin_evt)}</p>
              <p><strong>Duración (horas):</strong> {detalle?.hor_det || 'Por confirmar'}</p>
              <p><strong>Modalidad:</strong> {evento.mod_evt}</p>
              <p><strong>Capacidad:</strong> {detalle?.cup_det || 'Por confirmar'}</p>
              <p><strong>Ubicación:</strong> {evento.lug_evt}</p>

              <div style={{ marginTop: 10 }}>
                <strong>Área:</strong>
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
                    {detalle?.are_det || 'General'}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <strong>Tipo de evento:</strong>
                <p style={{ color: "#6b7280", marginTop: 6 }}>{detalle?.tip_evt || 'Por confirmar'}</p>
              </div>
            </div>
          )}
        </section>
      </div>

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
           "REGISTRARME EN ESTE EVENTO"}
        </button>
      </div>
    </>
  );
}

