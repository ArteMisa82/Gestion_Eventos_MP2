"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
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
  const tabs = [
    "Información del curso",
    "Requisitos y detalles",
    "Materiales y equipos",
    "Contenidos",
  ] as const;
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
              <strong>Descripción:</strong> {evento.des_evt}
            </p>
            <p>
              <strong>Fechas:</strong>{" "}
              {new Date(evento.fec_evt).toLocaleDateString('es-EC')}
              {evento.fec_fin_evt && ` al ${new Date(evento.fec_fin_evt).toLocaleDateString('es-EC')}`}
            </p>
            {detalle && (
              <>
                <p>
                  <strong>Cupo:</strong> {detalle.cup_det} participantes
                </p>
                <p>
                  <strong>Horas:</strong> {detalle.hor_det} horas académicas
                </p>
                <p>
                  <strong>Área:</strong> {detalle.are_det}
                </p>
                <p>
                  <strong>Categoría:</strong> {detalle.cat_det}
                </p>
              </>
            )}
            <p>
              <strong>Lugar:</strong> {evento.lug_evt}
            </p>
            <p>
              <strong>Modalidad:</strong> {esDistancia ? "A distancia / Virtual" : "Presencial"}
            </p>
            <p>
              <strong>Dirigido a:</strong> {evento.tip_pub_evt}
            </p>
            <p>
              <strong>Costo:</strong> {evento.cos_evt === 'GRATUITO' ? 'Gratuito' : 'De pago'}
            </p>
          </div>
        )}

        {active === "Requisitos y detalles" && (
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
            <li>Conocimientos previos básicos del área {detalle?.are_det || ''}</li>
            <li>Asistencia mínima del 80%</li>
            <li>Evaluaciones o proyectos según el curso</li>
            <li>Certificado digital de asistencia y aprobación</li>
            {evento.tip_pub_evt === 'ESTUDIANTES' && (
              <li>Estar matriculado como estudiante activo</li>
            )}
          </ul>
        )}

        {active === "Materiales y equipos" && (
          <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
            <li>Portátil con navegador actualizado</li>
            {esDistancia && <li>Acceso a Internet estable</li>}
            <li>Software/herramientas: especificar según el curso (IDE, librerías, plataformas)</li>
            <li>Material de apoyo (PDFs, guías, datasets, etc.)</li>
          </ul>
        )}

        {active === "Contenidos" && (
          <div style={{ lineHeight: 1.9 }}>
            <p>
              <strong>Tipo de evento:</strong> {detalle?.tip_evt || 'Curso'}
            </p>
            <p>Los contenidos específicos serán proporcionados por el instructor al inicio del curso.</p>
            <p>
              <strong>Clase 1:</strong> Introducción al tema principal
            </p>
            <p>
              <strong>Clase 2:</strong> Fundamentos y conceptos clave
            </p>
            <p>
              <strong>Clase 3:</strong> Taller práctico / laboratorio
            </p>
            <p>
              <strong>Clase 4:</strong> Mejores prácticas y casos reales
            </p>
            <p>
              <strong>Clase 5:</strong> Proyecto integrador y evaluación
            </p>
          </div>
        )}
      </section>

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
