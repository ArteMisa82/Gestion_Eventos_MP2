import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COURSES } from "../courses.data";
import CourseDetailClient from "./CourseDetailClient";

// (Opcional) Pre-render estático de cada curso
export function generateStaticParams() {
  return COURSES.map((c) => ({ id: c.id }));
}

// Si ves caching raro durante desarrollo, puedes forzar dinámico:
// export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function CourseDetailPage({ params }: { params: Params }) {
  // En tu runtime actual (Next 16 "stale") params puede venir como Promise
  const { id } = await params;
  const decoded = decodeURIComponent(id);

  const course = COURSES.find((c) => c.id === decoded);
  if (!course) return notFound();

  return (
    <main style={{ maxWidth: 1100, margin: "24px auto", padding: "0 16px" }}>
      <Link href="/cursos" style={{ textDecoration: "none", color: "#111827" }}>
        ← Volver a cursos
      </Link>

      <header
        style={{
          display: "flex",
          gap: 24,
          alignItems: "flex-start",
          marginTop: 16,
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
  style={{
    margin: 0,
    fontSize: 28,       // súbelo a 30–32 si lo quieres aún más grande (Aqui modifique "<h1 style={{ margin: 0 }}>{course.title}</h1>")
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#111827",
    letterSpacing: ".2px",
  }}
>
  {course.title}
</h1>
          <p style={{ color: "#6b7280", marginTop: 8 }}>
            {course.career} · {course.hours} horas
            {course.distance ? " · A distancia" : " · Presencial"}
            {course.open ? " · Abierto" : ""}
          </p>
        </div>

        <div
          style={{
            width: 360,
            height: 220,
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          <Image
            src={course.cover}
            alt={course.title}
            width={720}
            height={440}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            priority
          />
        </div>
      </header>

      {/* Cliente: tabs + botón "Registrarme" con SweetAlert2 */}
      <CourseDetailClient course={course} />
    </main>
  );
}









