"use client";

import { motion } from "framer-motion";

interface Props {
  open: boolean;
  onClose: () => void;
  onPay?: () => void; // futura conexión backend
}

export default function ModalPago({ open, onClose, onPay }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white p-8 rounded-xl shadow-lg w-[90%] max-w-md"
      >
        <h2 className="text-xl font-bold mb-4 text-center">Confirmar Pago</h2>

        <p className="text-gray-600 mb-6 text-center">
          ¿Deseas proceder con el pago del curso?
        </p>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="w-1/2 border border-gray-400 rounded-lg py-3 font-semibold"
          >
            Cancelar
          </button>

          <button
            onClick={onPay}
            className="w-1/2 bg-green-600 text-white py-3 rounded-lg font-semibold"
          >
            Pagar
          </button>
        </div>
      </motion.div>
    </div>
  );
}
