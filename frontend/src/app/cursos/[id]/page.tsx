// src/app/cursos/[id]/page.tsx
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COURSES } from "../courses.data";
import CourseDetailClient from "./CourseDetailClient";

// (opcional) si ves cosas raras de caché, descomenta:
// export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function CourseDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const course = COURSES.find((c) => c.id === decoded);
  if (!course) return notFound();

  return (
    <main style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>
      <Link href="/cursos" style={{ textDecoration: "none" }}>
        ← Volver a cursos
      </Link>

      {/* Cabecera: título + meta + imagen */}
      <header
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 24,
          alignItems: "start",
          marginTop: 16,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontWeight: 800,
              fontSize: "clamp(22px, 2.6vw, 34px)",
              lineHeight: 1.2,
            }}
          >
            {course.title}
          </h1>

          <p style={{ color: "#6b7280", marginTop: 8 }}>
            {course.career} · {course.hours} horas
            {course.distance ? " · A distancia" : ""}{" "}
            {course.open ? "· Abierto" : ""}
          </p>
        </div>

        <div
          style={{
            width: "100%",
            height: 230,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <Image
            src={course.cover}
            alt={course.title}
            width={760}
            height={460}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            priority
          />
        </div>
      </header>

      {/* 👇 Aquí sí renderizamos todo lo del cliente (tabs y contenido centrado) */}
      <CourseDetailClient course={course} />
    </main>
  );
}










