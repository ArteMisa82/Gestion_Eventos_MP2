"use client";
import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, UserCheck } from 'lucide-react';

interface Inscrito {
  id: string;
  nombre: string;
  email: string;
  carrera?: string;
  semestre?: string;
  asistio?: boolean;
  nota?: number;
  observaciones?: string;
  asistenciaModificadaPor?: "docente" | "responsable";
  notaModificadaPor?: "docente" | "responsable";
  fechaModificacion?: string;
}

interface Evento {
  id: string;
  nombre: string;
  estado: string;
  requiereAsistencia: boolean;
  requiereNota: boolean;
  evaluacionCompletada: boolean;
}

interface ModalAsistenciaNotasProps {
  evento: Evento;
  inscritos: Inscrito[];
  isLoading: boolean;
  onClose: () => void;
  onGuardar: (datos: any[]) => void;
}

export default function ModalAsistenciaNotas({
  evento,
  inscritos,
  isLoading,
  onClose,
  onGuardar
}: ModalAsistenciaNotasProps) {
  const [datosAsistencia, setDatosAsistencia] = useState<Inscrito[]>([]);

  // 🆕 Inicializar datosAsistencia cuando inscritos cambie
  useEffect(() => {
    if (inscritos && Array.isArray(inscritos)) {
      setDatosAsistencia(inscritos);
    } else {
      setDatosAsistencia([]);
    }
  }, [inscritos]);

  const [isSaving, setIsSaving] = useState(false);

  const handleAsistenciaChange = (id: string, asistio: boolean) => {
    setDatosAsistencia(prev =>
      prev.map(inscrito =>
        inscrito.id === id ? { 
          ...inscrito, 
          asistio,
          asistenciaModificadaPor: 'responsable'
        } : inscrito
      )
    );
  };

  const handleNotaChange = (id: string, nota: number) => {
    setDatosAsistencia(prev =>
      prev.map(inscrito =>
        inscrito.id === id ? { 
          ...inscrito, 
          nota: nota === 0 ? undefined : nota,
          notaModificadaPor: 'responsable'
        } : inscrito
      )
    );
  };

  const handleObservacionesChange = (id: string, observaciones: string) => {
    setDatosAsistencia(prev =>
      prev.map(inscrito =>
        inscrito.id === id ? { ...inscrito, observaciones } : inscrito
      )
    );
  };

  const handleGuardar = async () => {
    setIsSaving(true);
    try {
      await onGuardar(datosAsistencia);
    } finally {
      setIsSaving(false);
    }
  };

  // 🆕 Validar que datosAsistencia sea un array antes de usar filter
  const totalAsistentes = datosAsistencia?.filter(i => i.asistio)?.length || 0;
  const notasValidas = datosAsistencia?.filter(i => i.nota !== undefined && i.nota !== null) || [];
  const promedioNotas = notasValidas.length > 0 
    ? notasValidas.reduce((acc, curr) => acc + (curr.nota || 0), 0) / notasValidas.length 
    : 0;

  const getModificadoPorBadge = (inscrito: Inscrito) => {
    if (inscrito.asistenciaModificadaPor === 'docente' || inscrito.notaModificadaPor === 'docente') {
      return <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Docente</span>;
    }
    if (inscrito.asistenciaModificadaPor === 'responsable' || inscrito.notaModificadaPor === 'responsable') {
      return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Tú</span>;
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Gestión de {evento.requiereAsistencia && evento.requiereNota 
                ? "Asistencia y Notas" 
                : evento.requiereAsistencia 
                ? "Asistencia" 
                : "Notas"}
            </h2>
            <p className="text-gray-600 mt-1">{evento.nombre}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Estadísticas */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <UserCheck size={16} className="text-gray-500" />
              <span><strong>Total inscritos:</strong> {datosAsistencia?.length || 0}</span>
            </div>
            {evento.requiereAsistencia && (
              <div>
                <span className="font-medium">Asistentes:</span> {totalAsistentes} ({datosAsistencia?.length ? Math.round((totalAsistentes / datosAsistencia.length) * 100) : 0}%)
              </div>
            )}
            {evento.requiereNota && (
              <div>
                <span className="font-medium">Promedio notas:</span> {promedioNotas ? promedioNotas.toFixed(1) : 'N/A'}
              </div>
            )}
            <div>
              <span className="font-medium">Con datos:</span> {datosAsistencia?.filter(i => i.asistio !== undefined || i.nota !== undefined)?.length || 0}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="overflow-auto max-h-[60vh]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin text-[#581517]" />
              <span className="ml-2 text-gray-600">Cargando participantes...</span>
            </div>
          ) : !datosAsistencia || datosAsistencia.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <UserCheck size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No hay participantes inscritos
                </h3>
                <p className="text-gray-500">
                  No se encontraron participantes para este evento.
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Información
                  </th>
                  {evento.requiereAsistencia && (
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asistió
                    </th>
                  )}
                  {evento.requiereNota && (
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nota (0-100)
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Observaciones
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {datosAsistencia.map((inscrito) => (
                  <tr key={inscrito.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {inscrito.nombre}
                        </div>
                        <div className="text-sm text-gray-500">{inscrito.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {inscrito.carrera || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {inscrito.semestre || 'N/A'}
                      </div>
                    </td>
                    {evento.requiereAsistencia && (
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input
                          type="checkbox"
                          checked={inscrito.asistio || false}
                          onChange={(e) => handleAsistenciaChange(inscrito.id, e.target.checked)}
                          className="h-4 w-4 text-[#581517] focus:ring-[#581517] border-gray-300 rounded"
                        />
                      </td>
                    )}
                    {evento.requiereNota && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={inscrito.nota || ''}
                          onChange={(e) => handleNotaChange(inscrito.id, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#581517] focus:border-transparent"
                          placeholder="0-100"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <textarea
                        value={inscrito.observaciones || ''}
                        onChange={(e) => handleObservacionesChange(inscrito.id, e.target.value)}
                        rows={2}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#581517] focus:border-transparent"
                        placeholder="Observaciones..."
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getModificadoPorBadge(inscrito)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {evento.requiereAsistencia && evento.requiereNota 
              ? "Puedes editar tanto la asistencia como las notas" 
              : evento.requiereAsistencia 
              ? "Puedes editar la asistencia de los participantes"
              : "Puedes editar las notas de los participantes"}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              disabled={isSaving || !datosAsistencia || datosAsistencia.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[#581517] text-white rounded-md hover:bg-[#7a1c1c] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}