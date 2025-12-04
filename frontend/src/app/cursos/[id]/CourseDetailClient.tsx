"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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

  const detalle = evento.detalle_eventos?.[0];
  const inscripcionesAbiertas =
    !!detalle && detalle.est_evt_det === "INSCRIPCIONES";
  const imagenCurso = evento.ima_evt || "/Default_Image.png";

  // Helper para fechas
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

  // ================= LÓGICA DE INSCRIPCIÓN (MISMA QUE TENÍAS) =================
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
          parsedLocalUser =
            parsedLocalUser.data.usuario || parsedLocalUser.data;
        }
      }
    } catch (e) {
      console.error("Error parsing localStorage user:", e);
    }

    const finalUser: any = user || parsedLocalUser;
    const finalToken = token || localToken;
    const finalIsAuthenticated = isAuthenticated || (!!finalToken && !!finalUser);

    // 1) Autenticación
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

    // 2) Perfil completo
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

      // Validar token
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
      
      // PASO 1: Obtener registros de evento para este detalle (solo si es para ESTUDIANTES)
      Swal.fire({
        title: "Obteniendo información del curso...",
        text: "Verificando disponibilidad",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Verificar si el evento requiere niveles/carreras (solo para ESTUDIANTES)
      const esParaEstudiantes = evento.tip_pub_evt === "ESTUDIANTES";
      
      let registroEvento;
      let id_reg_evt;
      
      if (esParaEstudiantes) {
        // Solo para eventos de ESTUDIANTES: verificar que haya registros de nivel
        const registrosResponse = await registroEventoAPI.getPorDetalle(authToken, detalle.id_det);
        console.log("Registros encontrados (estudiantes):", registrosResponse);
        
        if (!registrosResponse.success || !registrosResponse.data || registrosResponse.data.length === 0) {
          Swal.fire({
            icon: "info",
            title: "Curso en configuración",
            html: `
              <p>Este curso aún no está disponible para inscripciones.</p>
              <br>
              <p style="color: #6b7280; font-size: 14px;">
                El responsable del curso debe configurar las carreras y niveles académicos a los que está dirigido.
              </p>
              <p style="color: #6b7280; font-size: 14px;">
                Por favor, intenta más tarde o contacta al administrador.
              </p>
            `,
            confirmButtonColor: "#7f1d1d",
          });
          return;
        }
        
        // Para ESTUDIANTES: usar el primer registro encontrado
        registroEvento = registrosResponse.data[0];
        id_reg_evt = registroEvento.id_reg_evt;
        console.log("Usando registro de evento:", id_reg_evt);
        console.log("Nivel del curso:", registroEvento.nivel?.nom_niv);
      } else {
        // Para PÚBLICO GENERAL: no se requiere registro de nivel
        console.log("Evento para público general - sin validación de niveles");
        id_reg_evt = null;
      }

      console.log("🔹 ANTES de cerrar Swal inicial");
      // Cerrar el modal de "Obteniendo información del curso..."
      Swal.close();
      console.log("🔹 DESPUÉS de cerrar Swal inicial");
      
      // Pequeño delay para que SweetAlert2 termine de cerrar el modal anterior
      await new Promise(resolve => setTimeout(resolve, 100));

      // PASO 2: Validar si el usuario puede inscribirse (solo para ESTUDIANTES)
      if (esParaEstudiantes) {
        Swal.fire({
          title: 'Validando requisitos...',
          text: 'Verificando nivel académico y disponibilidad',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        const validacion = await inscripcionesAPI.validar(authToken, {
          id_usu,
          id_reg_evt
        });
        
        console.log("Resultado de validación:", validacion);

        if (!validacion.success || !validacion.data?.valido) {
          const mensaje = validacion.data?.mensaje || validacion.message || "No cumples con los requisitos para este curso.";
          
          Swal.fire({
            icon: "error",
            title: "No puedes inscribirte",
            text: mensaje,
            confirmButtonColor: "#7f1d1d",
          });
          return;
        }
        
        // Cerrar el modal de validación antes de mostrar la confirmación
        Swal.close();
        // Pequeño delay para que SweetAlert2 termine de cerrar el modal anterior
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log("🔹 LLEGANDO al PASO 3 - Confirmar inscripción");
      // PASO 3: Confirmar inscripción con el usuario
      const nivelInfo = esParaEstudiantes && registroEvento ? `Nivel: ${registroEvento.nivel?.nom_niv}<br>` : '';
      
      const confirmResult = await Swal.fire({
        icon: "question",
        title: "Confirmar inscripción",
        html: `
          ${esParaEstudiantes ? '<p><strong>✅ Validación exitosa</strong></p><br>' : ''}
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

      // Para público general, usar id_det directamente; para estudiantes, usar id_reg_evt
      const inscripcionData: any = {
        id_usu
      };
      
      if (esParaEstudiantes && id_reg_evt) {
        inscripcionData.id_reg_evt = id_reg_evt;
      } else {
        // Para público general, usar el id_det directamente
        inscripcionData.id_det = detalle.id_det;
      }
      
      console.log("=== DATOS DE INSCRIPCIÓN ===");
      console.log("inscripcionData:", inscripcionData);
      console.log("esParaEstudiantes:", esParaEstudiantes);
      
      const inscripcion = await inscripcionesAPI.inscribir(authToken, inscripcionData);
      
      console.log("Resultado de inscripción:", inscripcion);

      // Cerrar loading
      Swal.close();

      if (inscripcion.success) {
        // Verificar si el evento es de pago
        const esDePago = evento.cos_evt === "DE PAGO";
        
        if (esDePago) {
          // Si es de pago, mostrar opciones de pago
          const numRegPer = inscripcion.data?.num_reg_per;
          
          Swal.fire({
            icon: "success",
            title: "¡Pre-inscripción exitosa!",
            html: `
              <p>Te has pre-inscrito correctamente al evento.</p>
              <p><strong>${evento.nom_evt}</strong></p>
              <br>
              <p style="color: #d97706; font-size: 14px;">
                ⚠️ Este es un evento de pago.<br>
                Selecciona tu método de pago para completar tu inscripción.
              </p>
            `,
            showCancelButton: true,
            confirmButtonText: "💳 Pagar con Tarjeta",
            cancelButtonText: "🏦 Depósito/Transferencia",
            confirmButtonColor: "#7f1d1d",
            cancelButtonColor: "#4b5563",
            allowOutsideClick: false
          }).then(async (result) => {
            if (result.isConfirmed) {
              // Pago con tarjeta (simulado)
              await Swal.fire({
                icon: "info",
                title: "Procesando pago...",
                html: `
                  <p>Simulando pago con tarjeta</p>
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7f1d1d] mx-auto mt-4"></div>
                `,
                showConfirmButton: false,
                timer: 2000
              });
              
              Swal.fire({
                icon: "success",
                title: "¡Pago exitoso!",
                html: `
                  <p>Tu pago ha sido procesado correctamente.</p>
                  <p>Inscripción confirmada para:</p>
                  <p><strong>${evento.nom_evt}</strong></p>
                `,
                confirmButtonColor: "#7f1d1d",
              }).then(() => {
                router.push("/usuarios/cursos");
              });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
              // Depósito/Transferencia
              Swal.fire({
                icon: "info",
                title: "Depósito o Transferencia Bancaria",
                html: `
                  <div style="text-align: left; padding: 10px;">
                    <p style="margin-bottom: 10px;"><strong>Datos bancarios:</strong></p>
                    <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                      <p style="margin: 5px 0; font-size: 14px;"><strong>Banco:</strong> Banco Pichincha</p>
                      <p style="margin: 5px 0; font-size: 14px;"><strong>Tipo de cuenta:</strong> Ahorros</p>
                      <p style="margin: 5px 0; font-size: 14px;"><strong>Número de cuenta:</strong> 2100123456</p>
                      <p style="margin: 5px 0; font-size: 14px;"><strong>Beneficiario:</strong> Universidad Técnica de Ambato</p>
                      <p style="margin: 5px 0; font-size: 14px;"><strong>RUC:</strong> 1860001550001</p>
                    </div>
                    <p style="margin: 10px 0; font-size: 14px; color: #d97706;">
                      ⚠️ Sube tu comprobante de pago ahora o desde "Mis Cursos" para que tu inscripción sea validada.
                    </p>
                    <div style="margin-top: 15px;">
                      <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">
                        Subir Comprobante (Opcional)
                      </label>
                      <input 
                        type="file" 
                        id="comprobanteFile" 
                        accept=".pdf,.jpg,.jpeg,.png"
                        style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px;"
                      />
                    </div>
                  </div>
                `,
                showCancelButton: true,
                confirmButtonText: "📤 Subir Comprobante",
                cancelButtonText: "Subir más tarde",
                confirmButtonColor: "#7f1d1d",
                cancelButtonColor: "#6b7280",
                preConfirm: () => {
                  const fileInput = document.getElementById('comprobanteFile') as HTMLInputElement;
                  return fileInput.files?.[0] || null;
                }
              }).then(async (uploadResult) => {
                if (uploadResult.isConfirmed && uploadResult.value) {
                  // Usuario eligió subir comprobante
                  const file = uploadResult.value;
                  
                  // Validar tipo de archivo
                  const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
                  if (!validTypes.includes(file.type)) {
                    Swal.fire({
                      icon: "error",
                      title: "Formato inválido",
                      text: "Solo se permiten archivos PDF, JPG, JPEG o PNG",
                      confirmButtonColor: "#7f1d1d",
                    });
                    return;
                  }
                  
                  // Validar tamaño (max 5MB)
                  if (file.size > 5 * 1024 * 1024) {
                    Swal.fire({
                      icon: "error",
                      title: "Archivo muy grande",
                      text: "El comprobante no puede superar los 5MB",
                      confirmButtonColor: "#7f1d1d",
                    });
                    return;
                  }
                  
                  // Subir comprobante
                  Swal.fire({
                    title: 'Subiendo comprobante...',
                    text: 'Por favor espera',
                    allowOutsideClick: false,
                    didOpen: () => {
                      Swal.showLoading();
                    }
                  });
                  
                  try {
                    const formData = new FormData();
                    formData.append('comprobante', file);
                    
                    const response = await fetch(
                      `http://localhost:3001/api/pagos/subir-comprobante/${numRegPer}`,
                      {
                        method: 'POST',
                        headers: {
                          'Authorization': `Bearer ${authToken}`
                        },
                        body: formData
                      }
                    );
                    
                    if (!response.ok) {
                      throw new Error('Error al subir comprobante');
                    }
                    
                    Swal.fire({
                      icon: "success",
                      title: "¡Comprobante subido!",
                      html: `
                        <p>Tu comprobante ha sido recibido correctamente.</p>
                        <p>El administrador validará tu pago en las próximas 24 horas.</p>
                      `,
                      confirmButtonColor: "#7f1d1d",
                    }).then(() => {
                      router.push("/usuarios/cursos");
                    });
                  } catch (error) {
                    console.error('Error subiendo comprobante:', error);
                    Swal.fire({
                      icon: "error",
                      title: "Error al subir",
                      text: "No se pudo subir el comprobante. Puedes intentarlo más tarde desde Mis Cursos.",
                      confirmButtonColor: "#7f1d1d",
                    }).then(() => {
                      router.push("/usuarios/cursos");
                    });
                  }
                } else {
                  // Usuario eligió subir más tarde
                  router.push("/usuarios/cursos");
                }
              });
            }
          });
        } else {
          // Si es gratuito, confirmar inscripción y redirigir a mis cursos
          Swal.fire({
            icon: "success",
            title: "¡Inscripción exitosa!",
            html: `
              <p>Te has inscrito correctamente al evento.</p>
              <p><strong>${evento.nom_evt}</strong></p>
              <br>
              <p style="color: #6b7280; font-size: 14px;">
                Puedes ver tus cursos en la sección "Mis Cursos"
              </p>
            `,
            confirmButtonColor: "#7f1d1d",
          }).then(() => {
            router.push("/usuarios/cursos");
          });
        }
      } else {
        throw new Error(inscripcion.message || "Error al procesar inscripción");
      }
    } catch (error: any) {
      console.error('Error al inscribir:', error);
      
      // Cerrar cualquier modal de loading
      Swal.close();
      
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
        } else if (error.message.includes('instructor')) {
          errorMessage = "No puedes inscribirte en un curso donde eres instructor.";
        } else if (error.message.includes('responsable')) {
          errorMessage = "No puedes inscribirte en un evento donde eres responsable.";
        } else if (error.message.includes('timeout') || error.message.includes('network')) {
          errorMessage = "Error de conexión. Por favor, verifica que el servidor esté funcionando e intenta nuevamente.";
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

  // ================= UI (IGUAL AL MOCKUP) =================
  const InfoRow = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "34px 1fr",
        columnGap: 12,
        alignItems: "flex-start",
        marginBottom: 10,
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 999,
          background: "#fef2f2",
          border: "1px solid #fecaca",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          color: "#7f1d1d",
        }}
      >
        {icon ?? "●"}
      </div>
      <div style={{ fontSize: 14 }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div>{value}</div>
      </div>
    </div>
  );

  return (
    <div style={{ marginTop: 28 }}>
      {/* GRID PRINCIPAL: tarjeta info + columna imagen/requisitos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1.4fr)",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        {/* TARJETA INFORMACIÓN DEL EVENTO (IZQUIERDA) */}
        <section
          style={{
            background: "#7f1d1d",
            borderRadius: 18,
            padding: 18,
            boxShadow: "0 16px 40px rgba(0,0,0,.06)",
            border: "1px solid #ef7b7bff",
          }}
        >
          <h2
            style={{
              margin: 0,
              marginBottom: 8,
              fontSize: 20,
              fontWeight: 900,
              color: "#edeff3ff",
              textAlign: "center",
            }}
          >
            Información del evento
          </h2>

          <div
            style={{
              marginTop: 8,
              background: "#fff",
              borderRadius: 14,
              padding: 18,
              border: "1px solid #f3f4f6",
            }}
          >
            <InfoRow
              label="Público objetivo:"
              value={evento.tip_pub_evt || "Por confirmar"}
              icon="👥"
            />
            <InfoRow
              label="Tipo de pago:"
              value={evento.cos_evt || "Por confirmar"}
              icon="💰"
            />
            <InfoRow
              label="Fecha de inicio:"
              value={fmtDate(evento.fec_evt)}
              icon="📅"
            />
            <InfoRow
              label="Fecha de fin:"
              value={fmtDate(evento.fec_fin_evt)}
              icon="📅"
            />
            <InfoRow
              label="Duración (horas):"
              value={detalle?.hor_det || "Por confirmar"}
              icon="⏱️"
            />
            <InfoRow
              label="Modalidad:"
              value={evento.mod_evt || "Por confirmar"}
              icon="💻"
            />
            <InfoRow
              label="Capacidad:"
              value={detalle?.cup_det || "Por confirmar"}
              icon="👤"
            />
            <InfoRow
              label="Ubicación:"
              value={evento.lug_evt || "Por confirmar"}
              icon="📍"
            />

            <InfoRow
              label="Área:"
              value={
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: 999,
                    border: "1px solid #e5e7eb",
                    fontSize: 12,
                    background: "#f9fafb",
                  }}
                >
                  {detalle?.are_det || "General"}
                </span>
              }
              icon="🏷️"
            />

            <InfoRow
              label="Tipo de evento:"
              value={detalle?.tip_evt || "Por confirmar"}
              icon="📚"
            />
          </div>
        </section>

        {/* COLUMNA DERECHA: IMAGEN + REQUISITOS */}
        <aside
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Imagen del curso */}
          <div
            style={{
              width: "100%",
              height: 395,
              borderRadius: 18,
              overflow: "hidden",
              boxShadow: "0 18px 40px rgba(0,0,0,.2)",
            }}
          >
            <Image
              src={imagenCurso}
              alt={evento.nom_evt}
              width={720}
              height={420}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              priority
            />
          </div>

          {/* Tarjeta de requisitos (debajo de la imagen) */}
          <section
            style={{
              background: "#ffffff",
              borderRadius: 14,
              padding: 18,
              border: "1px solid #e5e7eb",
              boxShadow: "0 12px 30px rgba(0,0,0,.10)",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: 6,
                fontSize: 16,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Requisitos para inscribirse
            </h3>
            <p
              style={{
                marginTop: 0,
                marginBottom: 12,
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
                lineHeight: 1.6,
                marginBottom: 16,
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
                  marginBottom: 0,
                }}
              >
                Actualmente las inscripciones se encuentran cerradas para este
                evento.
              </p>
            )}
          </section>
        </aside>
      </div>

      {/* BOTÓN CENTRAL BAJO TODO */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 24,
          marginBottom: 12,
        }}
      >
        <button
          type="button"
          onClick={handleRegister}
          disabled={
            isLoading || inscribiendo || !inscripcionesAbiertas || !detalle
          }
          style={{
            borderRadius: 999,
            border: "none",
            padding: "12px 26px",
            background:
              isLoading || inscribiendo || !inscripcionesAbiertas || !detalle
                ? "#9ca3af"
                : "#7f1d1d",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor:
              isLoading || inscribiendo || !inscripcionesAbiertas || !detalle
                ? "not-allowed"
                : "pointer",
            boxShadow: "0 8px 20px rgba(127,29,29,.40)",
          }}
        >
          {isLoading
            ? "CARGANDO..."
            : inscribiendo
            ? "PROCESANDO..."
            : !inscripcionesAbiertas
            ? "INSCRIPCIONES CERRADAS"
            : "REGISTRARME EN ESTE EVENTO"}
        </button>
      </div>
    </div>
  );
}
