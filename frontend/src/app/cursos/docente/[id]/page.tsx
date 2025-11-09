import CursoDocentePanel from "@/components/docente/CursoDocentePanel";

type Props = { params: { id: string } };

export default async function DocenteCursoDetalle({ params }: Props) {
  // TODO: aquí puedes traer metadata del curso si necesitas (server-side)
  return <CursoDocentePanel courseId={params.id} />;
}

