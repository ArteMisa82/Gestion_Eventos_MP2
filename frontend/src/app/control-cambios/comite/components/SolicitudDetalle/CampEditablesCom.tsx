import { FieldInput, FieldSelect } from "./FormFields";

interface Props {
  formData: any;
  setFormData: (data: any) => void;
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  onGuardarCambios: () => void;
}

export default function CamposEditablesComite({
  formData,
  setFormData,
  editMode,
  setEditMode,
  onGuardarCambios,
}: Props) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <p className="font-medium text-gray-900">Detalles del Comité</p>
        <button
          onClick={() => setEditMode(!editMode)}
          className="px-3 py-1 rounded-lg text-white text-sm transition"
          style={{ backgroundColor: "#6e1f3f" }}
        >
          {editMode ? "Cancelar" : "Editar"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FieldSelect
          label="Prioridad"
          disabled={!editMode}
          value={formData.prioridad}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFormData({ ...formData, prioridad: e.target.value })
           }
          options={["Alta", "Media", "Baja"]}
        />

        <FieldInput
          label="Impacto (días)"
          disabled={!editMode}
          type="number"
          value={formData.impactoDias}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, impactoDias: Number(e.target.value) })
        }
        />

        <FieldSelect
          label="Tipo de Cambio"
          disabled={!editMode}
          value={formData.tipoCambio}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setFormData({ ...formData, tipoCambio: e.target.value })
         }
          options={["Normal", "Estandar", "Emergencia"]}
        />
      </div>

      {editMode && (
        <button
          onClick={onGuardarCambios}
          className="mt-3 py-2 w-full text-white rounded-lg transition"
          style={{ backgroundColor: "#6e1f3f" }}
        >
          Guardar cambios
        </button>
      )}
    </div>
  );
}