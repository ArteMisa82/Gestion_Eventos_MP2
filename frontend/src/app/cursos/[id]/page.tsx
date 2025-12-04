"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { eventosAPI } from "@/services/api";
import CourseDetailClient from "./CourseDetailClient";

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

export default function CourseDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [evento, setEvento] = useState<EventoDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function cargarEvento() {
      try {
        setLoading(true);
        const response = await eventosAPI.getPublicados();
        const data = response.data || response;

        if (!Array.isArray(data)) {
          console.error("Los datos de eventos no son un array:", data);
          setError(true);
          return;
        }

        const eventoEncontrado = data.find(
          (e: EventoDetalle) => e.id_evt === id
        );

        if (eventoEncontrado) {
          setEvento(eventoEncontrado);
          setError(false);
        } else {
          setError(true);
        }
      } catch (error) {
        console.error("Error al cargar evento:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      cargarEvento();
    }
  }, [id]);

  if (loading) {
    return (
      <main style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ color: "#6b7280", fontSize: 18 }}>Cargando curso...</p>
        </div>
      </main>
    );
  }

  if (error || !evento) {
    return (
      <main style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>
        <Link href="/cursos" style={{ textDecoration: "none", color: "#111827" }}>
          ← Volver a cursos
        </Link>
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <h2 style={{ color: "#dc2626" }}>Curso no encontrado</h2>
          <p style={{ color: "#6b7280" }}>
            El curso que buscas no existe o no está disponible.
          </p>
        </div>
      </main>
    );
  }

  const detalle = evento.detalle_eventos?.[0];
  const horas = detalle?.hor_det || 0;
  const area = detalle?.are_det || "General";
  const esDistancia =
    evento.mod_evt === "VIRTUAL" || evento.mod_evt === "A DISTANCIA";

  return (
    <main style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>
      <Link href="/cursos" style={{ textDecoration: "none", color: "#111827" }}>
        ← Volver a cursos
      </Link>

      {/* Título y meta */}
      <div style={{ marginTop: 16 }}>
        <h1
          style={{
            margin: 0,
            fontWeight: 800,
            fontSize: "clamp(22px, 2.6vw, 34px)",
            lineHeight: 1.2,
          }}
        >
          {evento.nom_evt}
        </h1>

        <p style={{ color: "#6b7280", marginTop: 8 }}>
          {area} · {horas} horas
          {esDistancia ? " · A distancia" : ""}{" "}
          {detalle?.est_evt_det === "PUBLICADO" ? "· Abierto" : ""}
        </p>
      </div>

      {/* Layout del detalle del evento */}
      <CourseDetailClient evento={evento} />
    </main>
  );
}
