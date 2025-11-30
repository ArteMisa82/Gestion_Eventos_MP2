"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { inscripcionesAPI, registroEventoAPI, authAPI } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";

interface EventoDetalle {
  id_evt: string;
  nom_evt: string;
  fec_evt: string;
  fec_fin_evt?: string | null;
  lug_evt: string;
  mod_evt: string;
  tip_pub_evt: string; // PUBLICO GENERAL / ESTUDIANTES
  cos_evt: string;     // GRATUITO / DE PAGO
  des_evt: string;
  ima_evt?: string | null;
  detalle_eventos?: Array<{
    id_det: string;
    hor_det: number;
    cup_det: number;
    are_det: string;
    cat_det: string;
    tip_evt: string;       // CURSO, CONFERENCIA, WEBINAR, etc
    est_evt_det: string;   // INSCRIPCIONES, PUBLICADO, etc
  }>;
}

export default function CourseDetailClient({ evento }: { evento: EventoDetalle }) {
  const router = useRouter();
  const { user, token, isAuthenticated, logout, isLoading } = useAuth();

  const [inscribiendo, setInscribiendo] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);

  const detalle = evento.detalle_eventos?.[0];

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

  // =============== LÓGICA DE INSCRIPCIÓN (igual que antes) ===============
  async function handleRegister() {
    if (isLoading) return;

    const localToken =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const localUserRaw =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    let parsedLocalUser: any = null;

    try {
      if (localUserRaw) {
        const parsed = JSON.parse(localUserRaw);
        parsedLocalUser = parsed.data?.usuario || parsed.usuario || parsed;
        if (parsedLocalUser?.success && parsedLocalUser.data) {
          parsedLocalUser = parsedLocalUser.data.usuario || parsedLocalUser.data;
        }
      }
    } catch (e) {
      console.error("Error parsing localStorage user:", e);
    }

    const finalUser: any = user || parsedLocalUser;
    const finalToken = token || localToken;
    const finalIsAuthenticated =
      isAuthenticated || (!!finalToken && !!finalUser);

    if (!finalIsAuthenticated || !finalUser || !finalToken) {
      await Swal.fire({
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

    const perfilCompleto =
      finalUser.nom_usu && finalUser.ape_usu && finalUser.ced_usu;

    if (!perfilCompleto) {
      await Swal.fire({
        icon: "info",
        title: "Completa tu perfil",
        text: "Para inscribirte en eventos, necesitas completar tu información personal.",
        showCancelButton: true,
        confirmButtonText: "Completar perfil",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#7f1d1d",
      }).then((r) => {
        if (r.isConfirmed) router.push("/usuarios/perfil");
      });
      return;
    }

    try {
      await Swal.fire({
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
          await procesarInscripcion(finalUser.id_usu, finalToken as string);
        }
      });
    } catch (error) {
      console.error("Error al procesar registro:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error. Por favor, inicia sesión nuevamente.",
        confirmButtonColor: "#7f1d1d",
      });
    }
  }

  async function procesarInscripcion(id_usu: number, authToken: string) {
    if (!detalle) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Este evento no tiene detalles configurados.",
        confirmButtonColor: "#7f1d1d",
      });
      return;
    }

    if (!authToken) {
      Swal.fire({
        icon: "warning",
        title: "Sesión expirada",
        text: "Por favor, inicia sesión nuevamente.",
        confirmButtonColor: "#7f1d1d",
      });
      router.push("/");
      return;
    }

    try {
      setInscribiendo(true);

      try {
        await authAPI.getProfile(authToken);
      } catch (error: any) {
        console.error("Error validando token:", error);
        if (
          error.message &&
          (error.message.includes("401") ||
            error.message.includes("403") ||
            error.message.includes("Unauthorized") ||
            error.message.includes("token"))
        ) {
          Swal.fire({
            icon: "warning",
            title: "Sesión expirada",
            text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
            confirmButtonColor: "#7f1d1d",
          });
          logout();
          router.push("/");
          return;
        }
      }

      Swal.fire({
        title: "Obteniendo información del curso...",
        text: "Verificando disponibilidad",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const registrosResponse = await registroEventoAPI.getPorDetalle(
        authToken,
        detalle.id_det
      );

      if (
        !registrosResponse.success ||
        !registrosResponse.data ||
        registrosResponse.data.length === 0
      ) {
        Swal.fire({
          icon: "error",
          title: "Curso no disponible",
          text: "Este curso no está disponible para inscripciones actualmente.",
          confirmButtonColor: "#7f1d1d",
        });
        return;
      }

      const registroEvento = registrosResponse.data[0];
      const id_reg_evt = registroEvento.id_reg_evt;

      Swal.fire({
        title: "Validando requisitos...",
        text: "Verificando nivel académico y disponibilidad",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const validacion = await inscripcionesAPI.validar(authToken, {
        id_usu,
        id_reg_evt,
      });

      if (!validacion.success || !validacion.data?.valido) {
        const mensaje =
          validacion.data?.mensaje ||
          validacion.message ||
          "No cumples con los requisitos para este curso.";

        Swal.fire({
          icon: "error",
          title: "No puedes inscribirte",
          text: mensaje,
          confirmButtonColor: "#7f1d1d",
        });
        return;
      }

      const confirmResult = await Swal.fire({
        icon: "question",
        title: "Confirmar inscripción",
        html: `
          <p><strong>✅ Validación exitosa</strong></p>
          <br>
          <p>¿Confirmas tu inscripción a:</p>
          <p><strong>${evento.nom_evt}</strong></p>
          <p style="color: #6b7280; font-size: 14px;">
            Nivel: ${registroEvento.nivel?.nom_niv || "-"}<br>
            Duración: ${detalle.hor_det} horas<br>
            Modalidad: ${evento.mod_evt}
          </p>
        `,
        showCancelButton: true,
        confirmButtonText: "Sí, inscribirme",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#7f1d1d",
      });

      if (!confirmResult.isConfirmed) return;

      Swal.fire({
        title: "Procesando inscripción...",
        text: "Registrando tu participación",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const inscripcion = await inscripcionesAPI.inscribir(authToken, {
        id_usu,
        id_reg_evt,
      });

      if (inscripcion.success) {
        Swal.fire({
          icon: "success",
          title: "¡Inscripción exitosa!",
          html: `
            <p>Te has inscrito correctamente al evento.</p>
            <p><strong>${evento.nom_evt}</strong></p>
            <br>
            <p style="color: #6b7280; font-size: 14px;">
              Puedes ver tus cursos en la sección "Mis Cursos".
            </p>
          `,
          confirmButtonColor: "#7f1d1d",
        }).then(() => {
          router.push("/usuarios/cursos");
        });
      } else {
        throw new Error(inscripcion.message || "Error al procesar inscripción");
      }
    } catch (error: any) {
      console.error("Error al inscribir:", error);

      let errorMessage = "No se pudo completar la inscripción.";

      if (error.message) {
        if (error.message.includes("nivel")) {
          errorMessage =
            "No estás matriculado en el nivel requerido para este curso.";
        } else if (error.message.includes("cupo")) {
          errorMessage =
            "Lo sentimos, ya no hay cupos disponibles para este curso.";
        } else if (error.message.includes("inscrito")) {
          errorMessage = "Ya estás inscrito en este curso.";
        } else if (error.message.includes("instructor")) {
          errorMessage =
            "No puedes inscribirte en un curso donde eres instructor.";
        } else if (error.message.includes("responsable")) {
          errorMessage =
            "No puedes inscribirte en un evento donde eres responsable.";
        } else {
          errorMessage = error.message;
        }
      }

      Swal.fire({
        icon: "error",
        title: "Error al inscribirse",
        text: errorMessage,
        confirmButtonColor: "#7f1d1d",
      });
    } finally {
      setInscribiendo(false);
    }
  }

  const inscripcionesAbiertas =
    !!detalle && detalle.est_evt_det === "INSCRIPCIONES";

  // =============== UI ===============
  return (
    <>
      {/* Tarjeta estilo mockup */}
      <div
        style={{
          background: "#fdf5f0",
          borderRadius: 16,
          padding: 14,
          boxShadow: "0 4px 12px rgba(0,0,0,.08)",
        }}
      >
        <div
          style={{
            background: "#ffffff",
            borderRadius: 12,
            padding: "18px 20px 16px",
            boxShadow: "0 2px 6px rgba(0,0,0,.05)",
          }}
        >
          {/* Cabecera: título + botón Ver requisitos */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Información del Curso
            </h2>

            <button
              type="button"
              onClick={() => setShowRequirements(true)}
              style={{
                borderRadius: 999,
                border: "1px solid #7f1d1d",
                padding: "6px 14px",
                background: "#fff",
                color: "#7f1d1d",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Ver requisitos
            </button>
          </div>

          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              paddingTop: 14,
            }}
          >
            {/* Filas con icono + texto */}
            {[
              {
                label: "Público objetivo",
                value: evento.tip_pub_evt,
                icon: "👥",
              },
              {
                label: "Tipo de pago",
                value: evento.cos_evt,
                icon: "💳",
              },
              {
                label: "Fecha de inicio",
                value: fmtDate(evento.fec_evt),
                icon: "📅",
              },
              {
                label: "Fecha de fin",
                value: fmtDate(evento.fec_fin_evt),
                icon: "📅",
              },
              {
                label: "Duración (horas)",
                value: detalle?.hor_det || "Por confirmar",
                icon: "⏱️",
              },
              {
                label: "Modalidad",
                value: evento.mod_evt,
                icon: "💻",
              },
              {
                label: "Capacidad",
                value: detalle?.cup_det || "Por confirmar",
                icon: "🧍",
              },
              {
                label: "Ubicación",
                value: evento.lug_evt,
                icon: "📍",
              },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "999px",
                    background: "#fef2f2",
                    border: "1px solid #fee2e2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 17,
                  }}
                >
                  {row.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 15,
                      color: "#111827",
                    }}
                  >
                    {row.label}:
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: "#111827",
                    }}
                  >
                    {row.value}
                  </div>
                </div>
              </div>
            ))}

            {/* Área */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 4,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "999px",
                  background: "#fef2f2",
                  border: "1px solid #fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 17,
                }}
              >
                🏷️
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: "#111827",
                  }}
                >
                  Área:
                </div>
                <div style={{ marginTop: 6 }}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: 999,
                      border: "1px solid #e5e7eb",
                      background: "#f9fafb",
                      fontSize: 12,
                      color: "#374151",
                    }}
                  >
                    {detalle?.are_det || "General"}
                  </span>
                </div>
              </div>
            </div>

            {/* Tipo de evento */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "999px",
                  background: "#fef2f2",
                  border: "1px solid #fee2e2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 17,
                }}
              >
                📚
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 15,
                    color: "#111827",
                  }}
                >
                  Tipo de evento:
                </div>
                <div
                  style={{
                    fontSize: 15,
                    color: "#6b7280",
                    marginTop: 4,
                  }}
                >
                  {detalle?.tip_evt || "Por confirmar"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE REQUISITOS */}
      {showRequirements && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              maxWidth: 520,
              width: "90%",
              boxShadow: "0 15px 40px rgba(0,0,0,.25)",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: 6,
                fontSize: 20,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Requisitos para inscribirse
            </h2>
            <p
              style={{
                marginTop: 0,
                marginBottom: 16,
                fontSize: 14,
                color: "#4b5563",
              }}
            >
              Para poder registrarte en este evento debes cumplir con las
              siguientes condiciones:
            </p>

            <ul
              style={{
                fontSize: 14,
                color: "#374151",
                paddingLeft: 18,
                lineHeight: 1.7,
                marginBottom: 20,
              }}
            >
              <li>Tener una cuenta activa en el sistema.</li>
              <li>Contar con el perfil completo (nombre, apellido y cédula).</li>
              <li>
                Cumplir con el nivel académico o requisitos internos del evento.
              </li>
              <li>No estar ya inscrito en este mismo evento.</li>
            </ul>

            {!inscripcionesAbiertas && (
              <p
                style={{
                  fontSize: 13,
                  color: "#b91c1c",
                  marginBottom: 20,
                }}
              >
                Actualmente las inscripciones se encuentran cerradas para este
                evento.
              </p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setShowRequirements(false)}
                style={{
                  borderRadius: 999,
                  border: "1px solid #d1d5db",
                  padding: "8px 16px",
                  background: "#fff",
                  color: "#111827",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Cerrar
              </button>

              {/* El botón de inscripción SOLO aparece aquí */}
              {inscripcionesAbiertas && (
                <button
                  type="button"
                  onClick={handleRegister}
                  disabled={isLoading || inscribiendo}
                  style={{
                    borderRadius: 999,
                    border: "none",
                    padding: "9px 18px",
                    background:
                      isLoading || inscribiendo ? "#9ca3af" : "#7f1d1d",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor:
                      isLoading || inscribiendo ? "not-allowed" : "pointer",
                    boxShadow: "0 6px 18px rgba(127,29,29,.25)",
                  }}
                >
                  {isLoading
                    ? "CARGANDO..."
                    : inscribiendo
                    ? "PROCESANDO..."
                    : "REGISTRARME EN ESTE EVENTO"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
