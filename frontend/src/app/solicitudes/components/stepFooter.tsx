// frontend/src/app/solicitudes/components/StepFooter.tsx
import React from "react";

export default function StepFooter({ step, onNext, onPrev, showPrev=true, showNext=true }: {
  step: number,
  onNext: ()=>void,
  onPrev: ()=>void,
  showPrev?: boolean,
  showNext?: boolean
}) {
  return (
    <div className="mt-6 flex justify-between items-center">
      <div>
        {showPrev && (
          <button onClick={onPrev} className="px-4 py-2 rounded-lg border">Anterior</button>
        )}
      </div>

      <div className="text-sm text-gray-500">Paso {step} / 3</div>

      <div>
        {showNext && (
          <button onClick={onNext} className="px-4 py-2 rounded-lg bg-blue-600 text-white">Siguiente</button>
        )}
      </div>
    </div>
  );
}
