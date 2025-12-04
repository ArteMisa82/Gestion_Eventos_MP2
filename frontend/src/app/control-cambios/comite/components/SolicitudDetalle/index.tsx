"use client";

import React, { useState, useEffect } from "react";
import { Solicitud } from "../types";
import HeaderDetalle from "./HeaderDetalle";
import InformacionSolicitante from "./InformacionSolicitante";
import CamposNoEditables from "./CamposNOEditables";
import CamposEditablesComite from "./CampEditablesCom";
import BotonesAccionITIL from "./BotonesAccionITIL";
import TimelineITIL from "./TimelineITIL";

// ✅ Definir el tipo para performAction
type PerformActionType = (id: number, accion: string, extraData?: any) => void;

interface Props {
  selected: Solicitud | null;
  setSelected: (s: Solicitud | null) => void;
  performAction: PerformActionType;
  isComite?: boolean;
}

export default function SolicitudDetalle({
  selected,
  setSelected,
  performAction,
  isComite = true,
}: Props) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<any | null>(null);

  useEffect(() => {
    if (selected) {
      setEditMode(false);
      setFormData({
        prioridad: selected.prioridad,
        impactoDias: selected.impactoDias || 0,
        tipoCambio: selected.tipoCambio,
        impactoNoImplementar: selected.impactoNoImplementar || "",
        recursosNecesarios: selected.recursosNecesarios || "",
        riesgos: selected.riesgos || "",
      });
    }
  }, [selected]);

  if (!selected || !formData) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400 text-lg">
        Selecciona una solicitud para ver los detalles
      </div>
    );
  }

  const handleGuardarCambios = () => {
    performAction(selected.id, "ActualizarCamposComite", {
      prioridad: formData.prioridad,
      impactoDias: formData.impactoDias,
      tipoCambio: formData.tipoCambio,
    });
    setEditMode(false);
  };

  return (
    <div className="lg:col-span-2 border border-gray-200 rounded-2xl p-6 shadow-sm bg-white">
      <HeaderDetalle 
        selected={selected} 
        setSelected={setSelected} 
      />
      
      <div className="mt-6 text-gray-700 space-y-6">
        <InformacionSolicitante selected={selected} />
        
        <CamposNoEditables formData={formData} />
        
        {isComite && (
          <CamposEditablesComite
            formData={formData}
            setFormData={setFormData}
            editMode={editMode}
            setEditMode={setEditMode}
            onGuardarCambios={handleGuardarCambios}
          />
        )}
        
        <BotonesAccionITIL
          selected={selected}
          performAction={performAction}
        />
        
        <TimelineITIL 
          acciones={selected.acciones} 
          estadoActual={selected.estado} 
        />
      </div>
    </div>
  );
}