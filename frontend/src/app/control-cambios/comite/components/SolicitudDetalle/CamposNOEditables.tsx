interface Props {
  formData: any;
}

function DetailCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="mt-1 text-gray-700">{value || "No especificado"}</p>
    </div>
  );
}

export default function CamposNoEditables({ formData }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <DetailCard
        title="Impacto de NO implementar el cambio"
        value={formData.impactoNoImplementar}
      />
      <DetailCard
        title="Recursos necesarios"
        value={formData.recursosNecesarios}
      />
      <DetailCard
        title="Riesgos del cambio"
        value={formData.riesgos}
      />
    </div>
  );
}