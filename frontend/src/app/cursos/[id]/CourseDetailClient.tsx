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
  const { user, token, isAuthenticated, logout, isLoading } = useAuth();
  const tabs = ["Información del evento"] as const;
  const [active, setActive] = useState<(typeof tabs)[number]>(tabs[0]);
  const [inscribiendo, setInscribiendo] = useState(false);

  const detalle = evento.detalle_eventos?.[0];

  // Debug del estado de autenticación
  console.log("=== ESTADO DE AUTENTICACIÓN EN COMPONENTE ===");
  console.log("isLoading:", isLoading);
  console.log("isAuthenticated:", isAuthenticated);
  console.log("user:", user);
  console.log("token available:", !!token);

  async function handleRegister() {
    console.log("=== HANDLE REGISTER - VERIFICACIÓN INICIAL ===");
    console.log("isLoading:", isLoading);
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user:", user);
    console.log("token:", !!token);
    
    // Si aún está cargando, esperar un momento
    if (isLoading) {
      console.log("Aún cargando datos de autenticación...");
      return;
    }
    
    // Verificación adicional: revisar localStorage directamente
    const localToken = localStorage.getItem('token');
    const localUser = localStorage.getItem('user');
    let parsedLocalUser = null;
    
    try {
      if (localUser) {
        const parsed = JSON.parse(localUser);
        // El usuario puede estar en parsed.data.usuario o directamente en parsed
        parsedLocalUser = parsed.data?.usuario || parsed.usuario || parsed;
        
        // Si parsedLocalUser tiene la estructura {success, data, message}, extraer el usuario correcto
        if (parsedLocalUser.success && parsedLocalUser.data) {
          parsedLocalUser = parsedLocalUser.data.usuario || parsedLocalUser.data;
        }
      }
    } catch (e) {
      console.error("Error parsing localStorage user:", e);
    }
    
    console.log("=== VERIFICACIÓN LOCALSTORAGE ===");
    console.log("Token en localStorage:", !!localToken);
    console.log("User en localStorage:", !!localUser);
    console.log("Parsed user:", parsedLocalUser);
    
    // Si hay datos en localStorage pero no en el context, usar los de localStorage
    const finalUser = user || parsedLocalUser;
    const finalToken = token || localToken;
    const finalIsAuthenticated = isAuthenticated || (!!finalToken && !!finalUser);
    
    console.log("=== DATOS FINALES PARA VALIDACIÓN ===");
    console.log("finalIsAuthenticated:", finalIsAuthenticated);
    console.log("finalUser:", finalUser);
    console.log("finalToken:", !!finalToken);
    
    // 1. VERIFICAR AUTENTICACIÓN BÁSICA
    if (!finalIsAuthenticated || !finalUser || !finalToken) {
      console.log("Usuario no autenticado - redirigiendo al login");
      
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
    
    // 2. VERIFICAR COMPLETITUD DEL PERFIL
    const perfilCompleto = finalUser.nom_usu && finalUser.ape_usu && finalUser.ced_usu;
    
    if (!perfilCompleto) {
      console.log("Perfil incompleto - redirigiendo a /perfil");
      console.log("Datos del perfil:", {
        nombre: !!finalUser.nom_usu,
        apellido: !!finalUser.ape_usu,
        cedula: !!finalUser.ced_usu
      });
      
      Swal.fire({
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
      console.log("=== DATOS DE AUTENTICACIÓN ===");
      console.log("Usuario:", finalUser);
      console.log("Token disponible:", !!finalToken);
      console.log("Autenticado:", finalIsAuthenticated);
      
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
          await procesarInscripcion(finalUser.id_usu, finalToken);
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

    // Verificar autenticación usando el token pasado
    if (!authToken) {
      Swal.fire({
        icon: "warning",
        title: "Sesión expirada",
        text: "Por favor, inicia sesión nuevamente.",
        confirmButtonColor: "#7f1d1d",
      });
      router.push('/');
      return;
    }

    try {
      setInscribiendo(true);

      console.log("=== INICIANDO PROCESO DE INSCRIPCIÓN ===");
      console.log("ID Usuario:", id_usu);
      console.log("ID Detalle:", detalle.id_det);
      console.log("Token disponible:", !!authToken);
      console.log("Token preview:", authToken ? authToken.substring(0, 20) + "..." : "null");
      
      // Test de validación de token antes de continuar
      console.log("=== Validando token con backend ===");
      try {
        // Usar el API service existente para validar el token
        const profileResponse = await authAPI.getProfile(authToken);
        console.log("Perfil obtenido exitosamente:", !!profileResponse);
      } catch (error: any) {
        console.error("Error validando token:", error);
        
        // Si es un error de autorización, el token está expirado
        if (error.message && (
          error.message.includes('401') || 
          error.message.includes('403') || 
          error.message.includes('Unauthorized') ||
          error.message.includes('token')
        )) {
          console.log("Token inválido o expirado - redirigiendo al login");
          Swal.fire({
            icon: "warning",
            title: "Sesión expirada", 
            text: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
            confirmButtonColor: "#7f1d1d",
          });
          logout(); // Usar la función del contexto para limpiar todo
          router.push('/');
          return;
        }
        // Si es otro tipo de error, continuar con el proceso normal
      }
      
      // PASO 1: Obtener registros de evento para este detalle (solo si es para ESTUDIANTES)
      Swal.fire({
        title: 'Obteniendo información del curso...',
        text: 'Verificando disponibilidad',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
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
            ${nivelInfo}
            Duración: ${detalle.hor_det} horas<br>
            Modalidad: ${evento.mod_evt}
          </p>
        `,
        showCancelButton: true,
        confirmButtonText: "Sí, inscribirme",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#7f1d1d",
      });

      if (!confirmResult.isConfirmed) {
        return;
      }

      // PASO 4: Realizar inscripción
      Swal.fire({
        title: 'Procesando inscripción...',
        text: 'Registrando tu participación',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
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
      
      // Personalizar mensajes de error según el tipo
      if (error.message) {
        if (error.message.includes('nivel')) {
          errorMessage = "No estás matriculado en el nivel requerido para este curso.";
        } else if (error.message.includes('cupo')) {
          errorMessage = "Lo sentimos, ya no hay cupos disponibles para este curso.";
        } else if (error.message.includes('inscrito')) {
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
          disabled={isLoading || inscribiendo || !detalle || detalle.est_evt_det !== 'INSCRIPCIONES'}
          style={{
            background: isLoading || inscribiendo || !detalle || detalle.est_evt_det !== 'INSCRIPCIONES' ? "#9ca3af" : "#7f1d1d",
            color: "#fff",
            border: 0,
            borderRadius: 10,
            padding: "14px 22px",
            fontWeight: 700,
            letterSpacing: ".2px",
            boxShadow: "0 6px 18px rgba(127,29,29,.25)",
            cursor: isLoading || inscribiendo || !detalle || detalle.est_evt_det !== 'INSCRIPCIONES' ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "CARGANDO..." :
           inscribiendo ? "PROCESANDO..." : 
           !detalle ? "NO DISPONIBLE" :
           detalle.est_evt_det !== 'INSCRIPCIONES' ? "INSCRIPCIONES CERRADAS" :
           "REGISTRARME EN ESTE EVENTO"}
        </button>
      </div>
    </>
  );
}

