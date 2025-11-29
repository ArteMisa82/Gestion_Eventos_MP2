"use client";
import { useState } from "react";
import Swal from "sweetalert2";
import { authAPI } from "@/services/api";

interface VerifyEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VerifyEmailModal({ isOpen, onClose }: VerifyEmailModalProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') || undefined : undefined;

  const handleSend = async () => {
    setSending(true);
    try {
      const res = await authAPI.sendVerification(token);
      const message = res && (res.message || res.data || res) || 'Código enviado al correo';
      Swal.fire({ title: 'Enviado', text: typeof message === 'string' ? message : JSON.stringify(message), icon: 'success', confirmButtonColor: '#581517' });
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err?.message || 'No se pudo enviar el código', icon: 'error', confirmButtonColor: '#581517' });
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authAPI.verifyEmail(token, code);
      const message = res && (res.message || res.data || res) || 'Correo verificado';
      Swal.fire({ title: 'Verificado', text: typeof message === 'string' ? message : JSON.stringify(message), icon: 'success', confirmButtonColor: '#581517' });
      setCode('');
      onClose();
    } catch (err: any) {
      Swal.fire({ title: 'Error', text: err?.message || 'Código inválido', icon: 'error', confirmButtonColor: '#581517' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-[#581517]">Verificación de correo</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-[#581517] text-2xl font-bold transition">&times;</button>
          </div>

          <p className="text-sm text-gray-600 mb-4">Puedes enviar un código a tu correo y luego introducirlo aquí para verificar tu cuenta.</p>

          <div className="flex gap-3 mb-4">
            <button onClick={handleSend} disabled={sending} className="flex-1 py-2 rounded-lg bg-[#581517] text-white font-semibold">{sending ? 'Enviando...' : 'Enviar código'}</button>
          </div>

          <form onSubmit={handleVerify} className="flex flex-col gap-3">
            <input value={code} onChange={(e) => setCode(e.target.value)} type="text" placeholder="Código de verificación" className="w-full p-3 border rounded-lg" required />
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-2 border rounded-lg">Cancelar</button>
              <button type="submit" disabled={isLoading} className="flex-1 py-2 bg-[#581517] text-white rounded-lg">{isLoading ? 'Verificando...' : 'Verificar'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
