type Props = { params: { id: string } };

export default function DocenteCursoDetalle({ params }: Props) {
  return (
    <main style={{ padding: "24px 32px" }}>
      <h2>Panel del curso: {params.id}</h2>
      <p>Próximo paso: tablero con alumnos, calificaciones, materiales, asistencia, etc.</p>
    </main>
  );
}
